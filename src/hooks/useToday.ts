import { useEffect, useState } from "react";

import { type DateKey, todayKey } from "../domain/date";

// 앱을 켜 둔 채 자정이 지나도 다시 열면 오늘 날짜로 바뀌어요.
export function useToday(): DateKey {
  const [today, setToday] = useState(todayKey);

  useEffect(() => {
    const refresh = () => setToday(todayKey());
    document.addEventListener("visibilitychange", refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(timer);
    };
  }, []);

  return today;
}
