import { z } from "zod";

import { addDays, type DateKey, daysBetween, isValidDateKey } from "./date";

export const PLANT_KINDS = ["leaf", "succulent", "flower", "herb", "tree"] as const;
export type PlantKind = (typeof PLANT_KINDS)[number];

// 그날 식물을 어떻게 돌봤는지: 물 줬어요 / 오늘은 안 줘요
export type CareStatus = "watered" | "skipped";

export interface Plant {
  id: string;
  name: string;
  kind: PlantKind;
  // 물 주는 주기(일). 정하지 않으면 null이고 '물 줄 차례' 표시를 하지 않아요.
  intervalDays: number | null;
  createdAt: DateKey;
}

export type PlantInput = Pick<Plant, "name" | "kind" | "intervalDays">;

type CareLog = Readonly<Record<DateKey, CareStatus>>;

export interface AppState {
  version: 1;
  plants: readonly Plant[];
  // 식물 id → 날짜 → 기록
  logs: Readonly<Record<string, CareLog>>;
  reminder: { asked: boolean; agreed: boolean };
}

export const DEFAULT_STATE: AppState = {
  version: 1,
  plants: [],
  logs: {},
  reminder: { asked: false, agreed: false },
};

export const NAME_MAX_LENGTH = 12;
export const INTERVAL_MAX_DAYS = 60;

// 이름은 앞뒤 공백을 빼고 1~12글자예요. 맞지 않으면 null이에요.
export function validatePlantName(raw: string): string | null {
  const name = raw.trim();
  return name.length >= 1 && name.length <= NAME_MAX_LENGTH ? name : null;
}

const dateKeySchema = z.string().refine(isValidDateKey);

const stateSchema = z.object({
  version: z.literal(1),
  plants: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1).max(NAME_MAX_LENGTH),
      kind: z.enum(PLANT_KINDS),
      intervalDays: z.number().int().min(1).max(INTERVAL_MAX_DAYS).nullable(),
      createdAt: dateKeySchema,
    }),
  ),
  logs: z.record(z.string(), z.record(dateKeySchema, z.enum(["watered", "skipped"]))),
  reminder: z.object({ asked: z.boolean(), agreed: z.boolean() }),
});

// 저장된 값이 없으면 기본 상태, 깨져 있으면 에러를 내서 빈 상태로 덮어쓰지 않게 해요.
export function parseState(raw: string | null): AppState {
  if (raw === null) return DEFAULT_STATE;
  return stateSchema.parse(JSON.parse(raw));
}

export function serializeState(state: AppState): string {
  return JSON.stringify(state);
}

export function addPlant(state: AppState, input: PlantInput, id: string, today: DateKey): AppState {
  return { ...state, plants: [...state.plants, { ...input, id, createdAt: today }] };
}

export function updatePlant(state: AppState, id: string, input: PlantInput): AppState {
  return {
    ...state,
    plants: state.plants.map((plant) => (plant.id === id ? { ...plant, ...input } : plant)),
  };
}

function omitKey<T>(record: Readonly<Record<string, T>>, key: string): Record<string, T> {
  return Object.fromEntries(Object.entries(record).filter(([entryKey]) => entryKey !== key));
}

export function removePlant(state: AppState, id: string): AppState {
  return { ...state, plants: state.plants.filter((plant) => plant.id !== id), logs: omitKey(state.logs, id) };
}

// status가 null이면 그날 기록을 지워요.
export function setCare(state: AppState, plantId: string, date: DateKey, status: CareStatus | null): AppState {
  const rest = omitKey(state.logs[plantId] ?? {}, date);
  const log = status === null ? rest : { ...rest, [date]: status };
  return { ...state, logs: { ...state.logs, [plantId]: log } };
}

// 그날 기준으로 이미 등록되어 있던 식물만 그날 체크 대상이에요.
function plantsOn(state: AppState, date: DateKey): readonly Plant[] {
  return state.plants.filter((plant) => plant.createdAt <= date);
}

export function careOn(state: AppState, plantId: string, date: DateKey): CareStatus | undefined {
  return state.logs[plantId]?.[date];
}

export function checkedCount(state: AppState, date: DateKey): number {
  return plantsOn(state, date).filter((plant) => careOn(state, plant.id, date) !== undefined).length;
}

export function isDayComplete(state: AppState, date: DateKey): boolean {
  const plants = plantsOn(state, date);
  return plants.length > 0 && checkedCount(state, date) === plants.length;
}

export function skipRemaining(state: AppState, date: DateKey): AppState {
  return plantsOn(state, date)
    .filter((plant) => careOn(state, plant.id, date) === undefined)
    .reduce((next, plant) => setCare(next, plant.id, date, "skipped"), state);
}

function wateredDates(state: AppState, plantId: string): DateKey[] {
  return Object.entries(state.logs[plantId] ?? {})
    .filter(([, status]) => status === "watered")
    .map(([date]) => date)
    .sort();
}

export function lastWateredDate(state: AppState, plantId: string, onOrBefore: DateKey): DateKey | null {
  const dates = wateredDates(state, plantId).filter((date) => date <= onOrBefore);
  return dates.length > 0 ? dates[dates.length - 1] : null;
}

// 실제로 물 준 간격의 평균(반올림). 물 준 날이 2번 미만이면 null이에요.
export function averageWateringInterval(state: AppState, plantId: string): number | null {
  const dates = wateredDates(state, plantId);
  if (dates.length < 2) return null;
  return Math.round(daysBetween(dates[0], dates[dates.length - 1]) / (dates.length - 1));
}

// 주기를 정한 식물이 마지막으로 물 준 뒤 주기만큼 지났으면 물 줄 차례예요.
export function isDue(state: AppState, plant: Plant, today: DateKey): boolean {
  if (plant.intervalDays === null) return false;
  const last = lastWateredDate(state, plant.id, today);
  if (last === null) return true;
  return daysBetween(last, today) >= plant.intervalDays;
}

// 오늘 아직 다 체크하지 않았어도 어제까지 이어졌으면 연속 기록이 살아 있어요.
export function careStreak(state: AppState, today: DateKey): number {
  let day = isDayComplete(state, today) ? today : addDays(today, -1);
  let count = 0;
  while (isDayComplete(state, day)) {
    count += 1;
    day = addDays(day, -1);
  }
  return count;
}

export function needsYesterdayRecord(state: AppState, today: DateKey): boolean {
  const yesterday = addDays(today, -1);
  return plantsOn(state, yesterday).length > 0 && !isDayComplete(state, yesterday);
}
