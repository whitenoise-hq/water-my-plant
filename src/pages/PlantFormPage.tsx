import { Button } from "@toss/tds-mobile";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { BackBar } from "../components/BackBar";
import { BottomActions } from "../components/BottomActions";
import { PageHeader } from "../components/PageHeader";
import { PLANT_KIND_OPTIONS } from "../components/plantKinds";
import {
  INTERVAL_MAX_DAYS,
  NAME_MAX_LENGTH,
  type Plant,
  type PlantInput,
  type PlantKind,
  validatePlantName,
} from "../domain/plants";

const PRESET_INTERVALS = [3, 7, 14] as const;

type IntervalChoice = "none" | "custom" | (typeof PRESET_INTERVALS)[number];

function initialChoice(plant?: Plant): IntervalChoice {
  if (!plant || plant.intervalDays === null) return "none";
  return (PRESET_INTERVALS as readonly number[]).includes(plant.intervalDays)
    ? (plant.intervalDays as IntervalChoice)
    : "custom";
}

interface PlantFormPageProps {
  plant?: Plant;
  onSubmit: (input: PlantInput) => void;
  onDelete?: () => void;
  onBack: () => void;
}

export function PlantFormPage({
  plant,
  onSubmit,
  onDelete,
  onBack,
}: PlantFormPageProps) {
  const [name, setName] = useState(plant?.name ?? "");
  const [kind, setKind] = useState<PlantKind>(plant?.kind ?? "leaf");
  const [choice, setChoice] = useState<IntervalChoice>(initialChoice(plant));
  const [customDays, setCustomDays] = useState(
    choice === "custom" && plant?.intervalDays
      ? String(plant.intervalDays)
      : "",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const validName = validatePlantName(name);
  const customValue = Number(customDays);
  const isCustomValid =
    Number.isInteger(customValue) &&
    customValue >= 1 &&
    customValue <= INTERVAL_MAX_DAYS;
  const intervalDays =
    choice === "none" ? null : choice === "custom" ? customValue : choice;
  const canSubmit =
    validName !== null && (choice !== "custom" || isCustomValid);

  return (
    <>
      <div className="page">
        <BackBar label="뒤로" onBack={onBack} />
        <PageHeader title={plant ? "식물 정보 수정" : "식물 등록하기"} />

        <div className="form-card">
          <section className="form-section">
            <label className="form-label" htmlFor="plant-name">
              이름
            </label>
            <input
              id="plant-name"
              className="text-input"
              placeholder="예: 거실 몬스테라"
              value={name}
              maxLength={NAME_MAX_LENGTH}
              onChange={(event) => setName(event.target.value)}
            />
            <p className="field-counter">
              {name.trim().length}/{NAME_MAX_LENGTH}
            </p>
          </section>

          <section className="form-section">
            <p className="form-label">종류</p>
            <div className="chips">
              {PLANT_KIND_OPTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`chip with-icon${kind === id ? " selected" : ""}`}
                  aria-pressed={kind === id}
                  onClick={() => setKind(id)}
                >
                  <Icon size={16} strokeWidth={2.2} />
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="form-section">
            <p className="form-label">물 주는 주기 (선택)</p>
            <div className="chips">
              <button
                type="button"
                className={`chip${choice === "none" ? " selected" : ""}`}
                onClick={() => setChoice("none")}
              >
                정하지 않음
              </button>
              {PRESET_INTERVALS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`chip${choice === days ? " selected" : ""}`}
                  onClick={() => setChoice(days)}
                >
                  {days}일마다
                </button>
              ))}
              <button
                type="button"
                className={`chip${choice === "custom" ? " selected" : ""}`}
                onClick={() => setChoice("custom")}
              >
                직접 입력
              </button>
            </div>
            {choice === "custom" && (
              <div className="custom-interval">
                <input
                  className="text-input"
                  inputMode="numeric"
                  placeholder="며칠마다"
                  value={customDays}
                  onChange={(event) =>
                    setCustomDays(
                      event.target.value.replace(/\D/g, "").slice(0, 2),
                    )
                  }
                />
                <span>일마다</span>
              </div>
            )}
            <p className="form-hint">
              주기를 정하면 그만큼 지났을 때 '물 줄 차례'로 알려드려요.
              {choice === "custom" &&
                customDays !== "" &&
                !isCustomValid &&
                ` 1~${INTERVAL_MAX_DAYS}일로 입력해 주세요.`}
            </p>
          </section>
        </div>

        {onDelete && (
          <button
            type="button"
            className="text-button danger"
            onClick={() =>
              confirmDelete ? onDelete() : setConfirmDelete(true)
            }
          >
            <Trash2 size={16} strokeWidth={2.2} />
            {confirmDelete
              ? "한 번 더 누르면 기록까지 모두 지워져요"
              : "이 식물 삭제하기"}
          </button>
        )}
      </div>
      <BottomActions>
        <Button
          display="block"
          size="large"
          disabled={!canSubmit}
          onClick={() =>
            validName && onSubmit({ name: validName, kind, intervalDays })
          }
        >
          {plant ? "저장하기" : "등록하기"}
        </Button>
      </BottomActions>
    </>
  );
}
