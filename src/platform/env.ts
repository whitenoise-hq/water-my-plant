import { getOperationalEnvironment } from "@apps-in-toss/web-framework";

let cached: boolean | undefined;

// 토스 앱(또는 샌드박스) 안에서 실행 중인지 확인해요. 일반 브라우저에서는 false예요.
export function isInToss(): boolean {
  if (cached === undefined) {
    try {
      const environment = getOperationalEnvironment();
      cached = environment === "toss" || environment === "sandbox";
    } catch {
      cached = false;
    }
  }
  return cached;
}
