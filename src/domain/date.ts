// 날짜는 기기 로컬 시간 기준 "YYYY-MM-DD" 문자열 키로 다뤄요.
export type DateKey = string;
export type MonthKey = string;

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parseDateKey(key: DateKey): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

export function isValidDateKey(key: string): boolean {
  if (!DATE_KEY_PATTERN.test(key)) return false;
  return toDateKey(parseDateKey(key)) === key;
}

export function addDays(key: DateKey, amount: number): DateKey {
  const date = parseDateKey(key);
  return toDateKey(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount),
  );
}

export function monthKeyOf(key: DateKey): MonthKey {
  return key.slice(0, 7);
}

export function shiftMonth(month: MonthKey, amount: number): MonthKey {
  const [year, monthIndex] = month.split("-").map(Number);
  const shifted = new Date(year, monthIndex - 1 + amount, 1);
  return `${shifted.getFullYear()}-${pad(shifted.getMonth() + 1)}`;
}

export function daysInMonth(month: MonthKey): number {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex, 0).getDate();
}

// 일요일 시작 달력. 앞뒤 빈칸은 null이고 전체 길이는 7의 배수예요.
export function buildMonthGrid(month: MonthKey): Array<DateKey | null> {
  const firstWeekday = parseDateKey(`${month}-01`).getDay();
  const days = Array.from(
    { length: daysInMonth(month) },
    (_, index) => `${month}-${pad(index + 1)}`,
  );
  const leading = Array<null>(firstWeekday).fill(null);
  const filled = [...leading, ...days];
  const trailing = Array<null>((7 - (filled.length % 7)) % 7).fill(null);
  return [...filled, ...trailing];
}

// from에서 to까지 며칠 지났는지 (같은 날이면 0)
export function daysBetween(from: DateKey, to: DateKey): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / MS_PER_DAY);
}
