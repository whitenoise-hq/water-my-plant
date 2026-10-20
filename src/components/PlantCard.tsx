import { Check, ChevronRight, Droplets } from "lucide-react";

import type { DateKey } from "../domain/date";
import { formatAgo } from "../domain/format";
import type { CareStatus, Plant } from "../domain/plants";
import { PlantIcon } from "./PlantIcon";

interface PlantCardProps {
  plant: Plant;
  today: DateKey;
  status: CareStatus | undefined;
  lastWatered: DateKey | null;
  due: boolean;
  onCare: (status: CareStatus | null) => void;
  onOpen: () => void;
}

function StatusBadge({
  status,
  due,
}: {
  status: CareStatus | undefined;
  due: boolean;
}) {
  if (status === "watered") {
    return (
      <span className="plant-badge done">
        <Check size={12} strokeWidth={3} />물 줬어요
      </span>
    );
  }
  if (status === "skipped")
    return <span className="plant-badge rest">쉬는 날</span>;
  if (!due) return null;
  return (
    <span className="plant-badge due">
      <Droplets size={12} strokeWidth={2.4} />물 줄 차례
    </span>
  );
}

// 식물마다 '오늘 물 줬어요' / '오늘은 안 줘요'를 기록해요. 고른 버튼을 다시 누르면 취소돼요.
export function PlantCard({
  plant,
  today,
  status,
  lastWatered,
  due,
  onCare,
  onOpen,
}: PlantCardProps) {
  const toggle = (next: CareStatus) => onCare(status === next ? null : next);

  return (
    <article className={`plant-card${status ? ` is-${status}` : ""}`}>
      <div className="plant-card-head">
        <PlantIcon kind={plant.kind} />
        <div className="plant-card-text">
          <div className="plant-card-title">
            <strong>{plant.name}</strong>
            <StatusBadge status={status} due={due} />
          </div>
          <span>
            {lastWatered
              ? `마지막 물 ${formatAgo(lastWatered, today)}`
              : "아직 물 준 기록이 없어요"}
          </span>
        </div>
        {/* 카드를 눌러 들어갈 줄 모르는 사람도 있어서 상세로 가는 버튼을 따로 둬요 */}
        <button
          type="button"
          className="icon-button detail-link"
          onClick={onOpen}
          aria-label={`${plant.name} 기록 보기`}
        >
          <ChevronRight size={22} strokeWidth={2.2} />
        </button>
      </div>
      <div className="plant-card-actions">
        <button
          type="button"
          className={`care-button water${status === "watered" ? " selected" : ""}`}
          aria-pressed={status === "watered"}
          onClick={() => toggle("watered")}
        >
          오늘 물 줬어요
        </button>
        <button
          type="button"
          className={`care-button skip${status === "skipped" ? " selected" : ""}`}
          aria-pressed={status === "skipped"}
          onClick={() => toggle("skipped")}
        >
          오늘은 안 줘요
        </button>
      </div>
    </article>
  );
}
