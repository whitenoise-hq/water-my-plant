import { Notification } from "@apps-in-toss/web-framework";

import { REMINDER_TEMPLATE_CODE } from "../config/notification";
import { isInToss } from "./env";

export type ReminderAgreementResult = "agreed" | "rejected" | "unavailable";

// 토스 알림 동의 화면을 띄우고 결과를 Promise로 돌려줘요.
// 토스 앱 밖이거나 템플릿 코드가 아직 없으면 "unavailable"이에요.
export function requestReminderAgreement(): Promise<ReminderAgreementResult> {
  if (!isInToss() || REMINDER_TEMPLATE_CODE === "") return Promise.resolve("unavailable");

  return new Promise((resolve) => {
    let cleanup: (() => void) | undefined;
    const finish = (result: ReminderAgreementResult) => {
      cleanup?.();
      resolve(result);
    };
    try {
      if (!Notification.requestAgreement.isSupported()) {
        resolve("unavailable");
        return;
      }
      cleanup = Notification.requestAgreement({
        options: { templateCode: REMINDER_TEMPLATE_CODE },
        onEvent: ({ type }) => finish(type === "agreementRejected" ? "rejected" : "agreed"),
        onError: () => finish("unavailable"),
      });
    } catch {
      finish("unavailable");
    }
  });
}
