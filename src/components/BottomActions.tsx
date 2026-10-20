import type { ReactNode } from "react";

// 화면 맨 아래에 붙는 버튼 영역이에요.
export function BottomActions({ children }: { children: ReactNode }) {
  return <div className="bottom-actions">{children}</div>;
}
