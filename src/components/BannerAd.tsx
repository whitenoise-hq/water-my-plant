import { TossAds } from "@apps-in-toss/web-framework";
import { useEffect, useRef } from "react";

import { AD_GROUP_IDS } from "../config/ads";

let initPromise: Promise<boolean> | null = null;

// SDK 초기화가 끝난 뒤에만 배너를 붙여요. 실패하면 다음에 다시 시도할 수 있게 비워 둬요.
function initializeAds(): Promise<boolean> {
  if (initPromise) return initPromise;
  initPromise = new Promise<boolean>((resolve) => {
    try {
      if (!TossAds.initialize.isSupported()) {
        resolve(false);
        return;
      }
      TossAds.initialize({
        callbacks: {
          onInitialized: () => resolve(true),
          onInitializationFailed: () => resolve(false),
        },
      });
    } catch {
      resolve(false);
    }
  }).then((ok) => {
    if (!ok) initPromise = null;
    return ok;
  });
  return initPromise;
}

// 배너는 노출 기준으로 수익이 생겨요. 버튼과 떨어진 화면 아래쪽에만 둬요.
export function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroy: (() => void) | undefined;
    let cancelled = false;
    initializeAds().then((ok) => {
      const container = containerRef.current;
      if (!ok || cancelled || !container) return;
      try {
        destroy = TossAds.attachBanner(AD_GROUP_IDS.banner, container, { theme: "auto" }).destroy;
      } catch {
        destroy = undefined;
      }
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return <div ref={containerRef} className="banner-slot" />;
}
