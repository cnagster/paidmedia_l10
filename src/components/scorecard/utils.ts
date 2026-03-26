import type { GoalOperator, ValueType, WeekRange, KPI } from "./types";

export function generateWeeks(count: number): WeekRange[] {
  // Weeks are Mon–Sun. Find Monday of current week.
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 1=Mon … 5=Fri
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - daysSinceMonday);

  const weeks: WeekRange[] = [];
  for (let i = 0; i < count; i++) {
    const monday = new Date(thisMonday);
    monday.setDate(thisMonday.getDate() - i * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    weeks.push({
      key: monday.toISOString().slice(0, 10),
      label: `${fmtDate(monday)} - ${fmtDate(sunday)}`,
    });
  }
  return weeks;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatValue(value: number | null | undefined, type: ValueType): string {
  if (value == null) return "";
  switch (type) {
    case "currency":
      return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      });
    case "percentage":
      return `${value.toFixed(2)}%`;
    default:
      return value.toLocaleString();
  }
}

export function formatGoal(op: GoalOperator, value: number, type: ValueType): string {
  return `${op} ${formatValue(value, type)}`;
}

export function meetsGoal(
  value: number | null | undefined,
  op: GoalOperator,
  goal: number
): boolean | null {
  if (value == null) return null;
  switch (op) {
    case ">=": return value >= goal;
    case "<=": return value <= goal;
    case ">":  return value > goal;
    case "<":  return value < goal;
    case "=":  return value === goal;
  }
}

export type TrendStatus = "on-track" | "warning" | "off-track";

export function getTrend(kpi: KPI, weeks: WeekRange[]): TrendStatus {
  const recent = weeks.slice(0, 4);
  let met = 0, total = 0;
  for (const w of recent) {
    const v = kpi.weeklyValues[w.key];
    if (v != null) {
      total++;
      if (meetsGoal(v, kpi.goalOperator, kpi.goalValue)) met++;
    }
  }
  if (total === 0) return "warning";
  const r = met / total;
  if (r >= 0.75) return "on-track";
  if (r >= 0.25) return "warning";
  return "off-track";
}

export function getAverage(kpi: KPI, weeks: WeekRange[]): number | null {
  const vals = weeks
    .map((w) => kpi.weeklyValues[w.key])
    .filter((v): v is number => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
