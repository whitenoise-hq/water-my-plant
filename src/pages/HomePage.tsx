import { Button } from "@toss/tds-mobile";
import { CalendarClock, CircleCheck, Flame, Plus, Settings, Sprout } from "lucide-react";
import type { ReactNode } from "react";

import { BannerAd } from "../components/BannerAd";
import { BottomActions } from "../components/BottomActions";
import { PlantCard } from "../components/PlantCard";
import type { DateKey } from "../domain/date";
import { formatMonthDay } from "../domain/format";
import {
  type AppState,
  careOn,
  careStreak,
  type CareStatus,
  checkedCount,
  isDayComplete,
  isDue,
  lastWateredDate,
} from "../domain/plants";

interface HomePageProps {
  state: AppState;
  today: DateKey;
  canRecoverYesterday: boolean;
  // 광고 없이 바로 어제 기록을 열 수 있는지 (광고를 이미 봤거나 보상형 광고가 없을 때)
  isYesterdayUnlocked: boolean;
  reminderPrompt?: ReactNode;
  onAdd: () => void;
  onOpenPlant: (id: string) => void;
  onOpenSettings: () => void;
  onCare: (id: string, status: CareStatus | null) => void;
  onSkipRest: () => void;
  onRecoverYesterday: () => void;
}

function HomeHeader({ today, onAdd, onOpenSettings }: Pick<HomePageProps, "today" | "onAdd" | "onOpenSettings">) {
  return (
    <header className="home-header">
      <div>
        <p className="home-date">{formatMonthDay(today)}</p>
        <h1>오늘 물 줬나요?</h1>
      </div>
      <div className="home-header-actions">
        <button type="button" className="icon-button" aria-label="식물 추가" onClick={onAdd}>
          <Plus size={22} strokeWidth={2.2} />
        </button>
        <button type="button" className="icon-button" aria-label="설정" onClick={onOpenSettings}>
          <Settings size={21} strokeWidth={2.1} />
        </button>
      </div>
    </header>
  );
}

// 식물이 없을 때: 바텀시트 대신 화면 안에서 첫 식물 등록을 안내해요.
function EmptyHome({ onAdd }: { onAdd: () => void }) {
  return (
    <>
      <section className="empty-home">
        <span className="empty-icon">
          <Sprout size={40} strokeWidth={1.8} />
        </span>
        <h2>키우는 식물을 등록해 볼까요?</h2>
        <p>
          식물마다 매일 물 줬는지 체크하면
          <br />
          마지막으로 물 준 날을 잊지 않아요.
        </p>
      </section>
      <BottomActions>
        <Button display="block" size="large" onClick={onAdd}>
          첫 식물 등록하기
        </Button>
      </BottomActions>
    </>
  );
}

export function HomePage(props: HomePageProps) {
  const { state, today, onAdd, onOpenSettings } = props;
  const plants = state.plants;

  if (plants.length === 0) {
    return (
      <div className="page home">
        <BannerAd />
        <HomeHeader today={today} onAdd={onAdd} onOpenSettings={onOpenSettings} />
        <EmptyHome onAdd={onAdd} />
      </div>
    );
  }

  const streak = careStreak(state, today);
  const checked = checkedCount(state, today);
  const complete = isDayComplete(state, today);
  const progress = Math.round((checked / plants.length) * 100);

  return (
    <div className="page home">
      {/* 배너는 정책상 화면 위·아래에만 둘 수 있어서 맨 위에 둬요 */}
      <BannerAd />
      <HomeHeader today={today} onAdd={onAdd} onOpenSettings={onOpenSettings} />

      <section className={`summary-card${complete ? " complete" : ""}`}>
        <div className="summary-top">
          <span className="streak">
            <Flame size={16} strokeWidth={2.4} />
            {streak > 0 ? `식물 돌본 지 ${streak}일째` : "오늘부터 시작해요"}
          </span>
          <span className="summary-count">
            {checked}/{plants.length}
          </span>
        </div>
        <strong className="summary-title">
          {complete ? "오늘 식물 돌보기 완료" : `${plants.length - checked}개 식물을 아직 체크하지 않았어요`}
        </strong>
        <div className="progress">
          <div style={{ width: `${progress}%` }} />
        </div>
      </section>

      {complete && props.reminderPrompt}

      <h2 className="section-title">
        내 식물 <span>{plants.length}</span>
      </h2>
      <ul className="plant-list">
        {plants.map((plant) => (
          <li key={plant.id}>
            <PlantCard
              plant={plant}
              today={today}
              status={careOn(state, plant.id, today)}
              lastWatered={lastWateredDate(state, plant.id, today)}
              due={isDue(state, plant, today)}
              onCare={(status) => props.onCare(plant.id, status)}
              onOpen={() => props.onOpenPlant(plant.id)}
            />
          </li>
        ))}
      </ul>

      {!complete && checked < plants.length && (
        <button type="button" className="text-button" onClick={props.onSkipRest}>
          <CircleCheck size={16} strokeWidth={2.2} />
          나머지는 오늘 안 줘요
        </button>
      )}

      {props.canRecoverYesterday && (
        <section className="recover-card">
          <span className="soft-icon">
            <CalendarClock size={20} strokeWidth={2.2} />
          </span>
          <div>
            <strong>어제 기록을 깜빡했나요?</strong>
            <span>식물마다 물 줬는지 골라서 남길 수 있어요</span>
          </div>
          <Button size="small" variant="weak" onClick={props.onRecoverYesterday}>
            {props.isYesterdayUnlocked ? "기록하기" : "광고 보고 기록하기"}
          </Button>
        </section>
      )}
    </div>
  );
}
