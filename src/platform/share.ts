import { Share } from "@apps-in-toss/web-framework";

import { isInToss } from "./env";

function isUserCancel(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

// 공유 시트를 닫은 경우는 실패로 보지 않아요.
export async function shareText(message: string): Promise<void> {
  try {
    if (isInToss()) {
      await Share.sendMessage({ message });
    } else if (navigator.share) {
      await navigator.share({ text: message });
    } else {
      await navigator.clipboard.writeText(message);
    }
  } catch (error) {
    if (isUserCancel(error)) return;
    throw error;
  }
}
