import { Storage } from "@apps-in-toss/web-framework";

import { isInToss } from "./env";

const STATE_KEY = "water-my-plant:state";

// 토스 앱에서는 SDK 저장소만 써요. 읽기에 실패하면 빈 상태로 덮어쓰지 않도록 에러를 그대로 올려요.
// 일반 브라우저(개발 중)에서만 localStorage를 써요.
export async function loadStateRaw(): Promise<string | null> {
  if (isInToss()) return Storage.getItem(STATE_KEY);
  return window.localStorage.getItem(STATE_KEY);
}

export async function saveStateRaw(value: string): Promise<void> {
  if (isInToss()) return Storage.setItem(STATE_KEY, value);
  window.localStorage.setItem(STATE_KEY, value);
}
