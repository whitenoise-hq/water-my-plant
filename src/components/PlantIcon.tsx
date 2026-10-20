import type { PlantKind } from "../domain/plants";
import { ICON_BY_KIND } from "./plantKinds";

export function PlantIcon({ kind, size = 22 }: { kind: PlantKind; size?: number }) {
  const Icon = ICON_BY_KIND[kind];
  return (
    <span className={`plant-icon kind-${kind}`}>
      <Icon size={size} strokeWidth={2.1} />
    </span>
  );
}
