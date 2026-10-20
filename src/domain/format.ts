import type { DateKey, MonthKey } from "./date";
import { daysBetween } from "./date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function formatMonthDay(key: DateKey): string {
  const [year, month, day] = key.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 ${weekday}요일`;
}

export function formatMonthTitle(month: MonthKey): string {
  const [year, monthIndex] = month.split("-").map(Number);
  return `${year}년 ${monthIndex}월`;
}

// "오늘", "어제", "5일 전"
export function formatAgo(date: DateKey, today: DateKey): string {
  const days = daysBetween(date, today);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  return `${days}일 전`;
}
