// 매일 아침 식물 체크 알림. 문구와 발송 시간은 앱인토스 콘솔(푸시알림)에서 관리해요.
// 21~08시는 토스 방해 금지 시간이라 그 뒤에 보내요.
//   제목: 물 줄 시간
//   본문: 오늘 식물들 물 챙기셨나요?
//   발송: 토스에게 발송 요청 → 매일 08:30, 종료일 없음
// 콘솔 푸시 캠페인의 발송 코드예요. 출시 검토가 끝난 뒤 콘솔에서 만들고 여기에 넣어요.
export const REMINDER_TEMPLATE_CODE: string = "";

export const REMINDER_TIME_LABEL = "오전 8시 30분";

// 템플릿 코드가 없으면 알림 안내를 숨겨요.
export const IS_REMINDER_READY = REMINDER_TEMPLATE_CODE !== "";
