import { describe, expect, it } from "vitest";

import {
  addDays,
  buildMonthGrid,
  daysBetween,
  daysInMonth,
  isValidDateKey,
  monthKeyOf,
  shiftMonth,
  toDateKey,
} from "./date";

describe("toDateKey", () => {
  it("로컬 날짜를 YYYY-MM-DD로 바꿔요", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toDateKey(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});

describe("isValidDateKey", () => {
  it("올바른 형식과 실제 날짜만 통과시켜요", () => {
    expect(isValidDateKey("2026-02-28")).toBe(true);
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("2026-2-1")).toBe(false);
    expect(isValidDateKey("hello")).toBe(false);
  });
});

describe("addDays", () => {
  it("월과 연도를 넘어가도 계산해요", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
  });
});

describe("monthKeyOf / shiftMonth / daysInMonth", () => {
  it("월 키를 다뤄요", () => {
    expect(monthKeyOf("2026-10-15")).toBe("2026-10");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(daysInMonth("2024-02")).toBe(29);
    expect(daysInMonth("2026-04")).toBe(30);
  });
});

describe("buildMonthGrid", () => {
  it("일요일 시작 달력 칸을 만들고 빈칸은 null로 채워요", () => {
    // 2026-10-01은 목요일
    const grid = buildMonthGrid("2026-10");
    expect(grid.slice(0, 4)).toEqual([null, null, null, null]);
    expect(grid[4]).toBe("2026-10-01");
    expect(grid.filter(Boolean)).toHaveLength(31);
    expect(grid.length % 7).toBe(0);
  });
});

describe("daysBetween", () => {
  it("두 날짜 사이의 일 수를 세요", () => {
    expect(daysBetween("2026-10-20", "2026-10-20")).toBe(0);
    expect(daysBetween("2026-10-15", "2026-10-20")).toBe(5);
    expect(daysBetween("2026-02-27", "2026-03-02")).toBe(3);
  });
});
