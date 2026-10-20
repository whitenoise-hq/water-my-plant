import { ChevronLeft } from "lucide-react";

export function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="back-bar">
      <button type="button" onClick={onBack}>
        <ChevronLeft size={22} strokeWidth={2.2} />
        {label}
      </button>
    </div>
  );
}
