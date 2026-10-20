import { BottomSheet, Button } from "@toss/tds-mobile";
import { useState } from "react";

import type { DateKey } from "../domain/date";
import { formatMonthDay } from "../domain/format";
import type { CareStatus, Plant } from "../domain/plants";
import { PlantIcon } from "./PlantIcon";

interface YesterdaySheetProps {
  open: boolean;
  date: DateKey;
  // 어제 아직 체크하지 않은 식물
  plants: readonly Plant[];
  onSubmit: (choices: Record<string, CareStatus>) => void;
  onClose: () => void;
}

// 광고를 본 뒤 어제 빠뜨린 식물을 하나씩 골라서 기록해요.
export function YesterdaySheet({ open, date, plants, onSubmit, onClose }: YesterdaySheetProps) {
  const [choices, setChoices] = useState<Record<string, CareStatus>>({});
  const isComplete = plants.every((plant) => choices[plant.id] !== undefined);

  const choose = (id: string, status: CareStatus) => setChoices((current) => ({ ...current, [id]: status }));

  return (
    <BottomSheet
      open={open}
      onDimmerClick={onClose}
      header={<BottomSheet.Header>어제({formatMonthDay(date)}) 기록하기</BottomSheet.Header>}
      cta={
        <div className="sheet-cta">
          <Button
            display="block"
            size="large"
            disabled={!isComplete}
            onClick={() => {
              onSubmit(choices);
              setChoices({});
            }}
          >
            기록하기
          </Button>
        </div>
      }
    >
      <ul className="yesterday-list">
        {plants.map((plant) => (
          <li key={plant.id}>
            <PlantIcon kind={plant.kind} size={18} />
            <strong>{plant.name}</strong>
            <div className="segmented">
              <button
                type="button"
                className={choices[plant.id] === "watered" ? "selected" : undefined}
                onClick={() => choose(plant.id, "watered")}
              >
                물 줬어요
              </button>
              <button
                type="button"
                className={choices[plant.id] === "skipped" ? "selected" : undefined}
                onClick={() => choose(plant.id, "skipped")}
              >
                안 줬어요
              </button>
            </div>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
