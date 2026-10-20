import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseFullScreenAdReturn {
  isReady: boolean;
  show: (handlers?: { onReward?: () => void; onClose?: () => void }) => void;
}

function isAdSupported(): boolean {
  try {
    return loadFullScreenAd.isSupported();
  } catch {
    return false;
  }
}

// 전면·보상형 광고를 미리 불러오고, 닫히면 다음 광고를 다시 불러와요.
// 참고: https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa/interstitial-rewarded-ad.md
export function useFullScreenAd(adGroupId: string): UseFullScreenAdReturn {
  const [isReady, setIsReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isShowingRef = useRef(false);

  const load = useCallback(() => {
    setIsReady(false);
    if (!isAdSupported()) return;
    try {
      cleanupRef.current?.();
      cleanupRef.current = loadFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === "loaded") setIsReady(true);
        },
        onError: () => setIsReady(false),
      });
    } catch {
      setIsReady(false);
    }
  }, [adGroupId]);

  useEffect(() => {
    load();
    return () => cleanupRef.current?.();
  }, [load]);

  const show: UseFullScreenAdReturn["show"] = useCallback(
    (handlers = {}) => {
      // 빠르게 두 번 눌러도 광고와 보상이 한 번만 나가게 막아요.
      if (isShowingRef.current) return;
      if (!isReady) {
        handlers.onClose?.();
        return;
      }
      isShowingRef.current = true;
      setIsReady(false);
      const finish = () => {
        isShowingRef.current = false;
        handlers.onClose?.();
        load();
      };
      try {
        showFullScreenAd({
          options: { adGroupId },
          onEvent: (event) => {
            if (event.type === "userEarnedReward") handlers.onReward?.();
            if (event.type === "dismissed" || event.type === "failedToShow") finish();
          },
          onError: finish,
        });
      } catch {
        finish();
      }
    },
    [adGroupId, isReady, load],
  );

  return { isReady, show };
}
