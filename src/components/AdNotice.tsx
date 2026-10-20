import { Clapperboard } from "lucide-react";

// 광고가 나오기 전에 미리 알려줘요. (검수 기준: 예상하기 어려운 시점에 광고를 띄우지 않기)
export function AdNotice() {
  return (
    <span className="ad-notice">
      <Clapperboard size={14} strokeWidth={2.2} aria-hidden />
      기록하면 짧은 광고가 나온 뒤 결과를 보여드려요
    </span>
  );
}
