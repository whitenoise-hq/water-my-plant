import { ChevronLeft, ChevronRight } from "lucide-react";

import { type MonthKey, shiftMonth } from "../domain/date";
import { formatMonthTitle } from "../domain/format";

interface MonthNavProps {
  month: MonthKey;
  // 이 달보다 뒤(미래)로는 넘어가지 않아요.
  maxMonth: MonthKey;
  onChange: (month: MonthKey) => void;
}

export function MonthNav({ month, maxMonth, onChange }: MonthNavProps) {
  return (
    <div className="month-nav">
      <button type="button" className="icon-button" aria-label="이전 달" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeft size={20} />
      </button>
      <strong>{formatMonthTitle(month)}</strong>
      <button
        type="button"
        className="icon-button"
        aria-label="다음 달"
        disabled={month >= maxMonth}
        onClick={() => onChange(shiftMonth(month, 1))}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
