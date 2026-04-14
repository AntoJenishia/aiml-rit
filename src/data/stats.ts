import { Beaker, GraduationCap, TrendingUp } from "lucide-react";
import type { StatItem } from "@/lib/types";

export const statItems: StatItem[] = [
  { icon: GraduationCap, label: "Students", value: "480" },
  { icon: Beaker, label: "Labs", value: "6" },
  { icon: TrendingUp, label: "Placement", value: "92", suffix: "%" }
];

