import { describe, expect, it } from "vitest";

import {
  addPlant,
  averageWateringInterval,
  careStreak,
  checkedCount,
  DEFAULT_STATE,
  isDayComplete,
  isDue,
  lastWateredDate,
  needsYesterdayRecord,
  parseState,
  type PlantInput,
  removePlant,
  serializeState,
  setCare,
  skipRemaining,
  updatePlant,
  validatePlantName,
} from "./plants";

const monstera: PlantInput = { name: "몬스테라", kind: "leaf", intervalDays: 7 };
const cactus: PlantInput = { name: "선인장", kind: "succulent", intervalDays: null };

function withTwoPlants() {
  const a = addPlant(DEFAULT_STATE, monstera, "p1", "2026-10-10");
  return addPlant(a, cactus, "p2", "2026-10-10");
}

describe("식물 등록·수정·삭제", () => {
  it("식물을 순서대로 추가해요", () => {
    const state = withTwoPlants();
    expect(state.plants.map((p) => p.name)).toEqual(["몬스테라", "선인장"]);
    expect(state.plants[0]).toMatchObject({ id: "p1", kind: "leaf", intervalDays: 7, createdAt: "2026-10-10" });
    expect(DEFAULT_STATE.plants).toEqual([]);
  });

  it("이름과 주기를 고칠 수 있어요", () => {
    const state = updatePlant(withTwoPlants(), "p1", { name: "거실 몬스테라", kind: "leaf", intervalDays: 5 });
    expect(state.plants[0]).toMatchObject({ name: "거실 몬스테라", intervalDays: 5, createdAt: "2026-10-10" });
  });

  it("식물을 지우면 그 식물의 기록도 지워요", () => {
    const state = removePlant(setCare(withTwoPlants(), "p1", "2026-10-11", "watered"), "p1");
    expect(state.plants.map((p) => p.id)).toEqual(["p2"]);
    expect(state.logs.p1).toBeUndefined();
  });

  it("이름은 앞뒤 공백을 빼고 1~12글자예요", () => {
    expect(validatePlantName("  몬스테라 ")).toBe("몬스테라");
    expect(validatePlantName("   ")).toBeNull();
    expect(validatePlantName("가".repeat(13))).toBeNull();
  });
});

describe("오늘 기록", () => {
  it("식물마다 물 줬는지, 안 주는 날인지 기록해요", () => {
    const state = setCare(withTwoPlants(), "p1", "2026-10-12", "watered");
    expect(state.logs.p1["2026-10-12"]).toBe("watered");
    expect(checkedCount(state, "2026-10-12")).toBe(1);
    expect(isDayComplete(state, "2026-10-12")).toBe(false);
  });

  it("같은 날 다시 누르면 바꿔 기록하고, null이면 지워요", () => {
    const once = setCare(withTwoPlants(), "p1", "2026-10-12", "watered");
    expect(setCare(once, "p1", "2026-10-12", "skipped").logs.p1["2026-10-12"]).toBe("skipped");
    expect(setCare(once, "p1", "2026-10-12", null).logs.p1["2026-10-12"]).toBeUndefined();
  });

  it("나머지 식물을 한 번에 안 주는 날로 기록해요", () => {
    const state = skipRemaining(setCare(withTwoPlants(), "p1", "2026-10-12", "watered"), "2026-10-12");
    expect(state.logs.p1["2026-10-12"]).toBe("watered");
    expect(state.logs.p2["2026-10-12"]).toBe("skipped");
    expect(isDayComplete(state, "2026-10-12")).toBe(true);
  });

  it("그날 이후에 등록한 식물은 그날 완료 여부에 넣지 않아요", () => {
    const state = addPlant(setCare(addPlant(DEFAULT_STATE, monstera, "p1", "2026-10-10"), "p1", "2026-10-11", "watered"), cactus, "p2", "2026-10-12");
    expect(isDayComplete(state, "2026-10-11")).toBe(true);
  });

  it("식물이 없으면 완료가 아니에요", () => {
    expect(isDayComplete(DEFAULT_STATE, "2026-10-12")).toBe(false);
  });
});

describe("물 준 날", () => {
  const watered = ["2026-10-01", "2026-10-07", "2026-10-15"].reduce(
    (state, date) => setCare(state, "p1", date, "watered"),
    setCare(withTwoPlants(), "p1", "2026-10-16", "skipped"),
  );

  it("마지막으로 물 준 날을 찾아요", () => {
    expect(lastWateredDate(watered, "p1", "2026-10-20")).toBe("2026-10-15");
    expect(lastWateredDate(watered, "p1", "2026-10-10")).toBe("2026-10-07");
    expect(lastWateredDate(watered, "p2", "2026-10-20")).toBeNull();
  });

  it("실제로 물 준 간격의 평균을 반올림해요", () => {
    expect(averageWateringInterval(watered, "p1")).toBe(7);
    expect(averageWateringInterval(watered, "p2")).toBeNull();
  });

  it("주기를 정했고 그만큼 지났으면 물 줄 차례예요", () => {
    const plant = watered.plants[0];
    expect(isDue(watered, plant, "2026-10-21")).toBe(false);
    expect(isDue(watered, plant, "2026-10-22")).toBe(true);
  });

  it("주기를 정했는데 한 번도 안 줬으면 물 줄 차례예요", () => {
    expect(isDue(withTwoPlants(), withTwoPlants().plants[0], "2026-10-12")).toBe(true);
  });

  it("주기를 정하지 않았으면 차례 표시를 하지 않아요", () => {
    const state = withTwoPlants();
    expect(isDue(state, state.plants[1], "2026-10-30")).toBe(false);
  });
});

describe("연속 기록", () => {
  const complete = (state: ReturnType<typeof withTwoPlants>, date: string) => skipRemaining(state, date);

  it("모든 식물을 체크한 날이 이어진 만큼 세요", () => {
    const state = ["2026-10-11", "2026-10-12", "2026-10-13"].reduce(complete, withTwoPlants());
    expect(careStreak(state, "2026-10-13")).toBe(3);
  });

  it("오늘 아직 다 체크하지 않았으면 어제까지 세요", () => {
    const state = setCare(["2026-10-11", "2026-10-12"].reduce(complete, withTwoPlants()), "p1", "2026-10-13", "watered");
    expect(careStreak(state, "2026-10-13")).toBe(2);
  });

  it("어제 빠뜨렸으면 0이에요", () => {
    const state = complete(withTwoPlants(), "2026-10-11");
    expect(careStreak(state, "2026-10-13")).toBe(0);
  });
});

describe("어제 기록 복구", () => {
  it("어제 식물이 있었고 다 체크하지 않았으면 복구할 수 있어요", () => {
    expect(needsYesterdayRecord(withTwoPlants(), "2026-10-12")).toBe(true);
  });

  it("어제 다 체크했거나 오늘 처음 등록했으면 필요 없어요", () => {
    expect(needsYesterdayRecord(skipRemaining(withTwoPlants(), "2026-10-11"), "2026-10-12")).toBe(false);
    expect(needsYesterdayRecord(withTwoPlants(), "2026-10-10")).toBe(false);
  });
});

describe("저장", () => {
  it("저장한 상태를 그대로 다시 읽어요", () => {
    const state = setCare(withTwoPlants(), "p1", "2026-10-12", "watered");
    expect(parseState(serializeState(state))).toEqual(state);
  });

  it("저장된 값이 없으면 기본 상태예요", () => {
    expect(parseState(null)).toEqual(DEFAULT_STATE);
  });

  it("형식이 깨진 값이면 에러를 내서 덮어쓰지 않게 해요", () => {
    expect(() => parseState("{broken")).toThrow();
  });
});
