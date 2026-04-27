import type { GoalOperator, ValueType, WeekRange, KPI } from "./types";

// Format a Date using its local components (not UTC). This avoids
// timezone bugs where a local Monday can become a UTC Tuesday after
// toISOString() conversion in negative-offset timezones.
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Given any date string (YYYY-MM-DD), return the Monday of that week
// as a YYYY-MM-DD string. Used to normalize legacy Sunday/Tuesday keys.
export function mondayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - daysSinceMonday);
  return toLocalISODate(date);
}

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
      key: toLocalISODate(monday),
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

// Evaluates a formula like "[Comforter Spend] / [Spend] * 100"
// for a specific week, substituting values from sibling KPIs.
// Returns null if any referenced KPI has no value for that week.
export function evaluateFormula(
  formula: string,
  weekKey: string,
  allKPIs: KPI[]
): number | null {
  try {
    let expr = formula;
    const refs = formula.match(/\[([^\]]+)\]/g) ?? [];
    for (const ref of refs) {
      const title = ref.slice(1, -1);
      const kpi = allKPIs.find((k) => k.title === title);
      if (!kpi) return null;
      const val = kpi.weeklyValues[weekKey];
      if (val == null) return null;
      expr = expr.replace(ref, String(val));
    }
    // eslint-disable-next-line no-new-func
    const result = new Function("return (" + expr + ")")() as number;
    return isFinite(result) ? result : null;
  } catch {
    return null;
  }
}
