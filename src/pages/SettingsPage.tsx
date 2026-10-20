import { Button } from "@toss/tds-mobile";
import { BellRing } from "lucide-react";

import { BackBar } from "../components/BackBar";
import { PageHeader } from "../components/PageHeader";
import { REMINDER_TIME_LABEL } from "../config/notification";

interface SettingsPageProps {
  showReminder: boolean;
  reminderAgreed: boolean;
  plantCount: number;
  onRequestReminder: () => void;
  onBack: () => void;
}

export function SettingsPage({ showReminder, reminderAgreed, plantCount, onRequestReminder, onBack }: SettingsPageProps) {
  return (
    <div className="page">
      <BackBar label="오늘" onBack={onBack} />
      <PageHeader title="설정" />

      {showReminder && (
        <section className="card setting-row">
          <span className="soft-icon">
            <BellRing size={20} strokeWidth={2.2} />
          </span>
          <div>
            <strong>매일 식물 체크 알림</strong>
            <span>
              {reminderAgreed
                ? "알림을 받고 있어요. 끄려면 토스 앱 알림 설정에서 바꿀 수 있어요."
                : `매일 ${REMINDER_TIME_LABEL}에 알려드려요`}
            </span>
          </div>
          {!reminderAgreed && (
            <Button size="small" variant="weak" onClick={onRequestReminder}>
              알림 받기
            </Button>
          )}
        </section>
      )}

      {/* 누를 수 있는 항목처럼 보이지 않게 카드 없이 아래쪽 안내로 둬요 */}
      <p className="app-info">
        오늘 물 줬나요 v{__APP_VERSION__}
        <br />
        등록한 식물 {plantCount}개 · 기록은 이 기기에만 저장돼요
      </p>
    </div>
  );
}
