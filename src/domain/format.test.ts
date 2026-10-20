import { describe, expect, it } from "vitest";

import { formatAgo, formatMonthDay, formatMonthTitle } from "./format";

describe("format", () => {
  it("날짜를 월 일 요일로 보여줘요", () => {
    expect(formatMonthDay("2026-10-20")).toBe("10월 20일 화요일");
  });

  it("달 제목을 보여줘요", () => {
    expect(formatMonthTitle("2026-10")).toBe("2026년 10월");
  });

  it("며칠 전인지 말로 보여줘요", () => {
    expect(formatAgo("2026-10-20", "2026-10-20")).toBe("오늘");
    expect(formatAgo("2026-10-19", "2026-10-20")).toBe("어제");
    expect(formatAgo("2026-10-15", "2026-10-20")).toBe("5일 전");
  });
});
