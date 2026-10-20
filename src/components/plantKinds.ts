import { Clover, Flower2, Leaf, type LucideIcon, Sprout, TreeDeciduous } from "lucide-react";

import type { PlantKind } from "../domain/plants";

export const PLANT_KIND_OPTIONS: ReadonlyArray<{ id: PlantKind; label: string; Icon: LucideIcon }> = [
  { id: "leaf", label: "잎 식물", Icon: Leaf },
  { id: "succulent", label: "다육·선인장", Icon: Sprout },
  { id: "flower", label: "꽃", Icon: Flower2 },
  { id: "herb", label: "허브", Icon: Clover },
  { id: "tree", label: "나무", Icon: TreeDeciduous },
];

export const ICON_BY_KIND = Object.fromEntries(PLANT_KIND_OPTIONS.map((option) => [option.id, option.Icon])) as Record<
  PlantKind,
  LucideIcon
>;
