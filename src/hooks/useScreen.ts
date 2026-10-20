import { useCallback, useEffect, useState } from "react";

export type Screen =
  | { name: "home" }
  | { name: "add" }
  | { name: "edit"; plantId: string }
  | { name: "detail"; plantId: string }
  | { name: "settings" };

const HOME: Screen = { name: "home" };

function isScreen(value: unknown): value is Screen {
  return typeof value === "object" && value !== null && "name" in value;
}

// 화면 이동을 브라우저 기록에 남겨서, 토스의 뒤로가기(제스처·버튼)로 돌아오게 해요.
export function useScreen() {
  const [screen, setScreen] = useState<Screen>(HOME);

  useEffect(() => {
    const handlePop = (event: PopStateEvent) => {
      const saved: unknown = event.state?.screen;
      setScreen(isScreen(saved) ? saved : HOME);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const open = useCallback((next: Screen) => {
    window.history.pushState({ ...window.history.state, screen: next }, "");
    setScreen(next);
    window.scrollTo({ top: 0 });
  }, []);

  // 쌓인 기록이 없으면(주소로 바로 들어온 경우 등) 홈으로 바꿔 줘요.
  const goBack = useCallback(() => {
    if (window.history.state?.screen) {
      window.history.back();
      return;
    }
    setScreen(HOME);
    window.scrollTo({ top: 0 });
  }, []);

  // 저장·삭제 뒤처럼 홈까지 한 번에 돌아가야 할 때는 기록을 홈으로 맞춰요.
  const goHome = useCallback(() => {
    window.history.replaceState({ ...window.history.state, screen: HOME }, "");
    setScreen(HOME);
    window.scrollTo({ top: 0 });
  }, []);

  return { screen, open, goBack, goHome };
}
