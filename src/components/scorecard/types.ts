export type GoalOperator = ">=" | "<=" | ">" | "<" | "=";
export type ValueType = "currency" | "percentage" | "number";

export interface WeekRange {
  key: string;   // Monday ISO date e.g. "2026-03-23"
  label: string; // "Mar 23 - Mar 29"
}

export interface KPI {
  id: string;
  title: string;
  goalOperator: GoalOperator;
  goalValue: number;
  valueType: ValueType;
  weeklyValues: Record<string, number | null>;
  formula?: string; // e.g. "[Comforter Spend] / [Spend] * 100"
}

export interface KPISection {
  id: string;
  title: string;
  kpis: KPI[];
  collapsed: boolean;
}
