import { Pencil } from "lucide-react";
import { useState } from "react";

import { BackBar } from "../components/BackBar";
import { MonthNav } from "../components/MonthNav";
import { PlantIcon } from "../components/PlantIcon";
import { buildMonthGrid, type DateKey, daysBetween, monthKeyOf } from "../domain/date";
import { formatAgo } from "../domain/format";
import { type AppState, averageWateringInterval, careOn, lastWateredDate, type Plant } from "../domain/plants";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface PlantDetailPageProps {
  state: AppState;
  plant: Plant;
  today: DateKey;
  onEdit: () => void;
  onBack: () => void;
}

export function PlantDetailPage({ state, plant, today, onEdit, onBack }: PlantDetailPageProps) {
  const [month, setMonth] = useState(monthKeyOf(today));
  const last = lastWateredDate(state, plant.id, today);
  const average = averageWateringInterval(state, plant.id);
  const together = daysBetween(plant.createdAt, today) + 1;

  return (
    <div className="page">
      <BackBar label="오늘" onBack={onBack} />

      <header className="detail-header">
        <PlantIcon kind={plant.kind} size={28} />
        <div>
          <h1>{plant.name}</h1>
          <p>{plant.intervalDays ? `${plant.intervalDays}일마다 물 주기` : "주기를 정하지 않았어요"}</p>
        </div>
        <button type="button" className="icon-button" aria-label="식물 정보 수정" onClick={onEdit}>
          <Pencil size={19} strokeWidth={2.1} />
        </button>
      </header>

      <section className="stat-grid">
        <div>
          <span>마지막 물</span>
          <strong>{last ? formatAgo(last, today) : "기록 없음"}</strong>
        </div>
        <div>
          <span>평균 주기</span>
          <strong>{average ? `${average}일` : "-"}</strong>
        </div>
        <div>
          <span>함께한 날</span>
          <strong>{together}일</strong>
        </div>
      </section>

      <section className="card calendar-card">
        <MonthNav month={month} maxMonth={monthKeyOf(today)} onChange={setMonth} />
        <div className="calendar">
          {WEEKDAYS.map((day) => (
            <span key={day} className="weekday">
              {day}
            </span>
          ))}
          {buildMonthGrid(month).map((date, index) => {
            if (!date) return <span key={`blank-${index}`} />;
            const status = careOn(state, plant.id, date);
            return (
              <span
                key={date}
                className={["day", status ? `is-${status}` : null, date === today ? "today" : null]
                  .filter(Boolean)
                  .join(" ")}
              >
                {Number(date.slice(8))}
              </span>
            );
          })}
        </div>
        <div className="legend">
          <span>
            <i className="dot watered" /> 물 준 날
          </span>
          <span>
            <i className="dot skipped" /> 안 준 날
          </span>
        </div>
      </section>
    </div>
  );
}
