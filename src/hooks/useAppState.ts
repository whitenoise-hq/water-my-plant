import { useCallback, useEffect, useRef, useState } from "react";

import type { DateKey } from "../domain/date";
import {
  addPlant,
  type AppState,
  type CareStatus,
  DEFAULT_STATE,
  parseState,
  type PlantInput,
  removePlant,
  serializeState,
  setCare,
  skipRemaining,
  updatePlant,
} from "../domain/plants";
import { loadStateRaw, saveStateRaw } from "../platform/storage";

type LoadStatus = "loading" | "ready" | "error";

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [saveError, setSaveError] = useState(false);
  const stateRef = useRef(state);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

  const load = useCallback(() => {
    setLoadStatus("loading");
    loadStateRaw()
      .then((raw) => {
        const loaded = parseState(raw);
        stateRef.current = loaded;
        setState(loaded);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  }, []);

  useEffect(load, [load]);

  // 저장 요청을 순서대로 처리해서 오래된 상태가 나중에 덮어쓰지 않게 해요.
  const commit = useCallback((update: (current: AppState) => AppState) => {
    const next = update(stateRef.current);
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
    const serialized = serializeState(next);
    saveChainRef.current = saveChainRef.current
      .then(() => saveStateRaw(serialized))
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, []);

  return {
    state,
    loadStatus,
    saveError,
    retryLoad: load,
    add: useCallback((input: PlantInput, today: DateKey) => commit((s) => addPlant(s, input, newId(), today)), [commit]),
    update: useCallback((id: string, input: PlantInput) => commit((s) => updatePlant(s, id, input)), [commit]),
    remove: useCallback((id: string) => commit((s) => removePlant(s, id)), [commit]),
    care: useCallback(
      (id: string, date: DateKey, status: CareStatus | null) => commit((s) => setCare(s, id, date, status)),
      [commit],
    ),
    careMany: useCallback(
      (date: DateKey, choices: Readonly<Record<string, CareStatus>>) =>
        commit((s) => Object.entries(choices).reduce((next, [id, status]) => setCare(next, id, date, status), s)),
      [commit],
    ),
    skipRest: useCallback((date: DateKey) => commit((s) => skipRemaining(s, date)), [commit]),
    markReminderAsked: useCallback(() => commit((s) => ({ ...s, reminder: { ...s.reminder, asked: true } })), [commit]),
    markReminderAgreed: useCallback(() => commit((s) => ({ ...s, reminder: { asked: true, agreed: true } })), [commit]),
  };
}
