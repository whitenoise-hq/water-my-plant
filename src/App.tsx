import { Button, useToast } from "@toss/tds-mobile";
import { useState } from "react";

import "./App.css";
import { ReminderPrompt } from "./components/ReminderPrompt";
import { YesterdaySheet } from "./components/YesterdaySheet";
import { AD_GROUP_IDS, IS_REWARDED_READY } from "./config/ads";
import { IS_REMINDER_READY, REMINDER_TIME_LABEL } from "./config/notification";
import { addDays, type DateKey } from "./domain/date";
import { careOn, needsYesterdayRecord } from "./domain/plants";
import { useAppState } from "./hooks/useAppState";
import { useFullScreenAd } from "./hooks/useFullScreenAd";
import { useScreen } from "./hooks/useScreen";
import { useToday } from "./hooks/useToday";
import { HomePage } from "./pages/HomePage";
import { PlantDetailPage } from "./pages/PlantDetailPage";
import { PlantFormPage } from "./pages/PlantFormPage";
import { SettingsPage } from "./pages/SettingsPage";
import { isInToss } from "./platform/env";
import { requestReminderAgreement } from "./platform/notification";

// 알림 발송 코드가 생기기 전에는 알림 안내를 숨겨요. 개발 중에는 화면을 확인할 수 있게 보여줘요.
const SHOW_REMINDER = IS_REMINDER_READY || import.meta.env.DEV;

function App() {
  const app = useAppState();
  const { state } = app;
  const today = useToday();
  const { screen, open, goBack, goHome } = useScreen();
  const rewarded = useFullScreenAd(AD_GROUP_IDS.rewarded);
  // 광고를 끝까지 본 날짜(어제)를 기억해서, 시트를 닫았다가 다시 열어도 광고를 또 보지 않게 해요.
  const [unlockedYesterday, setUnlockedYesterday] = useState<DateKey | null>(null);
  const [isYesterdayOpen, setYesterdayOpen] = useState(false);
  const toast = useToast();
  const notify = (message: string) => toast.openToast(message, { type: "top", gap: 16 });

  if (app.loadStatus === "loading") return <div className="loading">불러오는 중이에요</div>;
  if (app.loadStatus === "error") {
    return (
      <div className="loading">
        <p>기록을 불러오지 못했어요.</p>
        <Button size="medium" variant="weak" onClick={app.retryLoad}>
          다시 시도
        </Button>
      </div>
    );
  }

  const yesterday = addDays(today, -1);
  // 보상형 광고가 없거나(콘솔에서 아직 못 만듦) 개발 중이면 광고 없이 열어요.
  const needsAd = IS_REWARDED_READY && import.meta.env.PROD && isInToss() && unlockedYesterday !== yesterday;
  const canRecoverYesterday = needsYesterdayRecord(state, today) && (!needsAd || rewarded.isReady);
  const yesterdayPlants = state.plants.filter(
    (plant) => plant.createdAt <= yesterday && careOn(state, plant.id, yesterday) === undefined,
  );

  const handleRecoverYesterday = () => {
    if (!needsAd) {
      setYesterdayOpen(true);
      return;
    }
    rewarded.show({
      onReward: () => {
        setUnlockedYesterday(yesterday);
        setYesterdayOpen(true);
      },
    });
  };

  const handleRequestReminder = () => {
    app.markReminderAsked();
    requestReminderAgreement().then((result) => {
      if (result === "agreed") {
        app.markReminderAgreed();
        notify(`매일 ${REMINDER_TIME_LABEL}에 알려드릴게요`);
      } else if (result === "unavailable") {
        notify("토스 앱에서만 알림을 설정할 수 있어요");
      }
    });
  };

  const editingPlant =
    screen.name === "edit" || screen.name === "detail"
      ? state.plants.find((plant) => plant.id === screen.plantId)
      : undefined;

  return (
    <div className="app">
      {app.saveError && <div className="save-error">기록을 저장하지 못했어요. 앱을 다시 열어 주세요.</div>}

      {screen.name === "home" && (
        <HomePage
          state={state}
          today={today}
          canRecoverYesterday={canRecoverYesterday}
          isYesterdayUnlocked={!needsAd}
          reminderPrompt={
            SHOW_REMINDER && !state.reminder.agreed && !state.reminder.asked ? (
              <ReminderPrompt onRequest={handleRequestReminder} onDismiss={app.markReminderAsked} />
            ) : undefined
          }
          onAdd={() => open({ name: "add" })}
          onOpenPlant={(plantId) => open({ name: "detail", plantId })}
          onOpenSettings={() => open({ name: "settings" })}
          onCare={(id, status) => app.care(id, today, status)}
          onSkipRest={() => app.skipRest(today)}
          onRecoverYesterday={handleRecoverYesterday}
        />
      )}

      {screen.name === "add" && (
        <PlantFormPage
          onBack={goBack}
          onSubmit={(input) => {
            app.add(input, today);
            notify(`${input.name}을(를) 등록했어요`);
            goHome();
          }}
        />
      )}

      {screen.name === "edit" && editingPlant && (
        <PlantFormPage
          plant={editingPlant}
          onBack={goBack}
          onSubmit={(input) => {
            app.update(editingPlant.id, input);
            notify("저장했어요");
            goBack();
          }}
          onDelete={() => {
            app.remove(editingPlant.id);
            notify("식물을 삭제했어요");
            goHome();
          }}
        />
      )}

      {screen.name === "detail" && editingPlant && (
        <PlantDetailPage
          state={state}
          plant={editingPlant}
          today={today}
          onEdit={() => open({ name: "edit", plantId: editingPlant.id })}
          onBack={goBack}
        />
      )}

      {screen.name === "settings" && (
        <SettingsPage
          showReminder={SHOW_REMINDER}
          reminderAgreed={state.reminder.agreed}
          plantCount={state.plants.length}
          onRequestReminder={handleRequestReminder}
          onBack={goBack}
        />
      )}

      <YesterdaySheet
        open={isYesterdayOpen}
        date={yesterday}
        plants={yesterdayPlants}
        onClose={() => setYesterdayOpen(false)}
        onSubmit={(choices) => {
          app.careMany(yesterday, choices);
          setYesterdayOpen(false);
          notify("어제 기록을 남겼어요");
        }}
      />
    </div>
  );
}

export default App;
