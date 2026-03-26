import { useState } from "react";
import type { CSSProperties } from "react";
import type { KPI, KPISection as KPISectionType, WeekRange, GoalOperator, ValueType } from "./types";
import { formatValue, formatGoal, meetsGoal, getTrend, getAverage } from "./utils";
import ContextMenu from "./ContextMenu";
import CreateItemModal from "./CreateItemModal";
import type { ItemType } from "./CreateItemModal";

interface Props {
  section: KPISectionType;
  weeks: WeekRange[];
  onUpdate: (s: KPISectionType) => void;
  onDelete: () => void;
}

const TREND_STYLE = {
  "on-track": { symbol: "↗", color: "#22a06b", bg: "#e3fcef" },
  warning:    { symbol: "⚠", color: "#ff8800", bg: "#fff8e6" },
  "off-track":{ symbol: "⊘", color: "#de350b", bg: "#ffebe6" },
} as const;

// Column widths & sticky left offsets
const W = { cb: 40, trend: 48, title: 240, goal: 148, avg: 138, week: 138 };
const L = {
  cb:    0,
  trend: W.cb,
  title: W.cb + W.trend,
  goal:  W.cb + W.trend + W.title,
  avg:   W.cb + W.trend + W.title + W.goal,
};
const FIXED_WIDTH = L.avg + W.avg;

function stickyCell(left: number, width: number, extra?: CSSProperties): CSSProperties {
  return {
    position: "sticky",
    left,
    width,
    minWidth: width,
    zIndex: 2,
    padding: "10px 12px",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "middle",
    background: "#fff",
    ...extra,
  };
}

function weekCell(meets: boolean | null): CSSProperties {
  return {
    padding: "10px 14px",
    borderBottom: "1px solid #f0f0f0",
    textAlign: "right",
    fontSize: 13,
    color: meets === true ? "#1a7f5a" : meets === false ? "#bf2600" : "#ccc",
    background: meets === true ? "#f6fef9" : meets === false ? "#fff5f5" : "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
    minWidth: W.week,
  };
}

export default function KPISection({ section, weeks, onUpdate, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(section.collapsed);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; kpi: KPI } | null>(null);
  const [createModal, setCreateModal] = useState<{ type: ItemType; kpi: KPI } | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(section.title);
  const [editingKPITitle, setEditingKPITitle] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<string | null>(null); // kpiId
  const [tempGoalOp, setTempGoalOp] = useState<GoalOperator>(">=");
  const [tempGoalVal, setTempGoalVal] = useState("");
  const [tempValueType, setTempValueType] = useState<ValueType>("number");
  const [editingCell, setEditingCell] = useState<{ kpiId: string; weekKey: string } | null>(null);
  const [tempValue, setTempValue] = useState("");

  function push(changes: Partial<KPISectionType>) {
    onUpdate({ ...section, title: sectionTitle, ...changes });
  }

  function updateKPI(id: string, changes: Partial<KPI>) {
    push({ kpis: section.kpis.map((k) => (k.id === id ? { ...k, ...changes } : k)) });
  }

  function deleteKPI(id: string) {
    push({ kpis: section.kpis.filter((k) => k.id !== id) });
  }

  function addKPI() {
    const title = prompt("KPI title:");
    if (!title?.trim()) return;
    push({
      kpis: [
        ...section.kpis,
        {
          id: Date.now().toString(),
          title: title.trim(),
          goalOperator: ">=",
          goalValue: 0,
          valueType: "number",
          weeklyValues: {},
        },
      ],
    });
  }

  function openGoalEdit(kpi: KPI) {
    setEditingGoal(kpi.id);
    setTempGoalOp(kpi.goalOperator);
    setTempGoalVal(kpi.goalValue === 0 ? "" : String(kpi.goalValue));
    setTempValueType(kpi.valueType);
  }

  function commitGoal(id: string) {
    const num = parseFloat(tempGoalVal.replace(/[$,%\s]/g, ""));
    if (!isNaN(num)) updateKPI(id, { goalOperator: tempGoalOp, goalValue: num, valueType: tempValueType });
    else if (tempGoalVal.trim() === "") updateKPI(id, { goalOperator: tempGoalOp, valueType: tempValueType });
    setEditingGoal(null);
  }

  function commitKPITitle(id: string) {
    if (tempValue.trim()) updateKPI(id, { title: tempValue.trim() });
    setEditingKPITitle(null);
  }

  function commitCell(kpiId: string, weekKey: string) {
    const kpi = section.kpis.find((k) => k.id === kpiId)!;
    if (tempValue.trim() === "") {
      // Clear the cell — remove the key so it's excluded from average
      const next = { ...kpi.weeklyValues };
      delete next[weekKey];
      updateKPI(kpiId, { weeklyValues: next });
    } else {
      const num = parseFloat(tempValue.replace(/[$,%\s]/g, ""));
      if (!isNaN(num)) {
        updateKPI(kpiId, { weeklyValues: { ...kpi.weeklyValues, [weekKey]: num } });
      }
    }
    setEditingCell(null);
  }

  function clearCell(kpiId: string, weekKey: string) {
    const kpi = section.kpis.find((k) => k.id === kpiId)!;
    const next = { ...kpi.weeklyValues };
    delete next[weekKey];
    updateKPI(kpiId, { weeklyValues: next });
    setEditingCell(null);
  }

  function buildPrefill(kpi: KPI): string {
    const opLabel: Record<GoalOperator, string> = {
      ">=": "Greater than or equal to",
      "<=": "Less than or equal to",
      ">": "Greater than",
      "<": "Less than",
      "=": "Equal to",
    };
    const goalLine = `Goal: ${opLabel[kpi.goalOperator]} ${formatValue(kpi.goalValue, kpi.valueType)}`;
    const weekLines = weeks
      .slice(0, 3)
      .filter((w) => kpi.weeklyValues[w.key] != null)
      .map((w) => `${w.label}: ${formatValue(kpi.weeklyValues[w.key], kpi.valueType)}`);
    return [goalLine, "", ...weekLines].join("\n");
  }

  function saveSectionTitle() {
    setEditingSectionTitle(false);
    push({});
  }

  const totalWidth = FIXED_WIDTH + weeks.length * W.week;

  return (
    <div style={{ marginBottom: 24, background: "#fff", border: "1px solid #e2e6ea", borderRadius: 10, overflow: "hidden" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: collapsed ? "none" : "1px solid #e8eaed",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {editingSectionTitle ? (
            <input
              autoFocus
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              onBlur={saveSectionTitle}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") saveSectionTitle(); }}
              style={{ fontSize: 17, fontWeight: 700, border: "1px solid #5b9ea6", borderRadius: 4, padding: "2px 6px", outline: "none" }}
            />
          ) : (
            <h2
              onDoubleClick={() => { setEditingSectionTitle(true); setSectionTitle(section.title); }}
              style={{ fontSize: 17, fontWeight: 700, cursor: "default", userSelect: "none" }}
              title="Double-click to rename"
            >
              {sectionTitle}
            </h2>
          )}
          <span style={{ fontSize: 15, color: "#aaa", fontWeight: 400 }}>{section.kpis.length}</span>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={onDelete}
            title="Delete section"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 14, lineHeight: 1 }}
          >
            ✕
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 16, lineHeight: 1 }}
          >
            {collapsed ? "∨" : "∧"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                borderCollapse: "collapse",
                tableLayout: "fixed",
                width: totalWidth,
                minWidth: totalWidth,
              }}
            >
              <thead>
                <tr style={{ background: "#fafbfc" }}>
                  <th style={stickyCell(L.cb, W.cb, { background: "#fafbfc" })}>
                    <input type="checkbox" style={{ accentColor: "#5b9ea6" }} />
                  </th>
                  <th style={stickyCell(L.trend, W.trend, { background: "#fafbfc", fontSize: 11, color: "#aaa", fontWeight: 500, textAlign: "center" })}>
                    Trend
                  </th>
                  <th style={stickyCell(L.title, W.title, { background: "#fafbfc", fontSize: 12, color: "#aaa", fontWeight: 500, textAlign: "left" })}>
                    Title
                  </th>
                  <th style={stickyCell(L.goal, W.goal, { background: "#fafbfc", fontSize: 12, color: "#aaa", fontWeight: 500, textAlign: "left" })}>
                    Goal
                  </th>
                  <th style={stickyCell(L.avg, W.avg, { background: "#fafbfc", fontSize: 12, color: "#aaa", fontWeight: 500, textAlign: "right" })}>
                    Average
                  </th>
                  {weeks.map((w) => (
                    <th
                      key={w.key}
                      style={{
                        padding: "10px 14px",
                        fontSize: 12,
                        color: "#aaa",
                        fontWeight: 500,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        minWidth: W.week,
                        borderBottom: "1px solid #f0f0f0",
                        background: "#fafbfc",
                      }}
                    >
                      {w.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {section.kpis.map((kpi) => {
                  const trend = getTrend(kpi, weeks);
                  const avg = getAverage(kpi, weeks);
                  const ti = TREND_STYLE[trend];

                  return (
                    <tr key={kpi.id}>
                      {/* Checkbox */}
                      <td style={stickyCell(L.cb, W.cb, { textAlign: "center" })}>
                        <input type="checkbox" style={{ accentColor: "#5b9ea6" }} />
                      </td>

                      {/* Trend */}
                      <td style={stickyCell(L.trend, W.trend, { textAlign: "center" })}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: ti.bg,
                            color: ti.color,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {ti.symbol}
                        </span>
                      </td>

                      {/* Title */}
                      <td style={stickyCell(L.title, W.title)}>
                        {editingKPITitle === kpi.id ? (
                          <input
                            autoFocus
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => commitKPITitle(kpi.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitKPITitle(kpi.id);
                              if (e.key === "Escape") setEditingKPITitle(null);
                            }}
                            style={{ width: "100%", border: "1px solid #5b9ea6", borderRadius: 3, padding: "2px 6px", fontSize: 14, outline: "none" }}
                          />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                            <span
                              onDoubleClick={() => { setEditingKPITitle(kpi.id); setTempValue(kpi.title); }}
                              onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, kpi }); }}
                              title={kpi.title + " (double-click to edit, right-click for actions)"}
                              style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "default" }}
                            >
                              {kpi.title}
                            </span>
                            <button
                              onClick={() => deleteKPI(kpi.id)}
                              title="Delete KPI"
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", fontSize: 12, flexShrink: 0, padding: "0 2px" }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Goal — click to edit */}
                      <td
                        style={stickyCell(L.goal, W.goal, {
                          fontSize: 13,
                          color: "#555",
                          cursor: "pointer",
                        })}
                        onClick={() => { if (editingGoal !== kpi.id) openGoalEdit(kpi); }}
                        title="Click to edit goal"
                      >
                        {editingGoal === kpi.id ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              {/* Operator */}
                              <select
                                autoFocus
                                value={tempGoalOp}
                                onChange={(e) => setTempGoalOp(e.target.value as GoalOperator)}
                                onKeyDown={(e) => { if (e.key === "Escape") setEditingGoal(null); }}
                                style={{ border: "1px solid #5b9ea6", borderRadius: 3, fontSize: 12, padding: "2px 3px", outline: "none", background: "#fff" }}
                              >
                                {([">=", "<=", ">", "<", "="] as GoalOperator[]).map((op) => (
                                  <option key={op} value={op}>{op}</option>
                                ))}
                              </select>
                              {/* Value */}
                              <input
                                value={tempGoalVal}
                                onChange={(e) => setTempGoalVal(e.target.value)}
                                onBlur={() => commitGoal(kpi.id)}
                                onKeyDown={(e) => { if (e.key === "Enter") commitGoal(kpi.id); if (e.key === "Escape") setEditingGoal(null); }}
                                placeholder="value"
                                style={{ width: 72, border: "1px solid #5b9ea6", borderRadius: 3, padding: "2px 4px", fontSize: 13, outline: "none" }}
                              />
                            </div>
                            {/* Value type */}
                            <select
                              value={tempValueType}
                              onChange={(e) => setTempValueType(e.target.value as ValueType)}
                              onKeyDown={(e) => { if (e.key === "Escape") setEditingGoal(null); }}
                              style={{ border: "1px solid #c8d0d8", borderRadius: 3, fontSize: 11, padding: "2px 3px", outline: "none", background: "#fff", color: "#555" }}
                            >
                              <option value="number">Number</option>
                              <option value="currency">Currency ($)</option>
                              <option value="percentage">Percentage (%)</option>
                            </select>
                          </div>
                        ) : (
                          kpi.goalValue === 0 && kpi.valueType === "number"
                            ? <span style={{ color: "#bbb", fontSize: 12 }}>Set goal…</span>
                            : formatGoal(kpi.goalOperator, kpi.goalValue, kpi.valueType)
                        )}
                      </td>

                      {/* Average */}
                      <td style={stickyCell(L.avg, W.avg, { textAlign: "right", fontSize: 13, color: "#555", fontWeight: 500 })}>
                        {formatValue(avg, kpi.valueType)}
                      </td>

                      {/* Weekly values */}
                      {weeks.map((w) => {
                        const val = kpi.weeklyValues[w.key] ?? null;
                        const meets = meetsGoal(val, kpi.goalOperator, kpi.goalValue);
                        const isEditing = editingCell?.kpiId === kpi.id && editingCell.weekKey === w.key;

                        return (
                          <td
                            key={w.key}
                            style={weekCell(meets)}
                            onClick={() => {
                              if (!isEditing) {
                                setEditingCell({ kpiId: kpi.id, weekKey: w.key });
                                setTempValue(val != null ? String(val) : "");
                              }
                            }}
                          >
                            {isEditing ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <input
                                  autoFocus
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  onBlur={() => commitCell(kpi.id, w.key)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") commitCell(kpi.id, w.key);
                                    if (e.key === "Escape") setEditingCell(null);
                                  }}
                                  style={{
                                    width: 80,
                                    textAlign: "right",
                                    border: "1px solid #5b9ea6",
                                    borderRadius: 3,
                                    padding: "1px 4px",
                                    fontSize: 13,
                                    outline: "none",
                                  }}
                                />
                                <button
                                  onMouseDown={(e) => { e.preventDefault(); clearCell(kpi.id, w.key); }}
                                  title="Clear cell"
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 14, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}
                                >×</button>
                              </div>
                            ) : (
                              <span style={{ opacity: val == null ? 0.35 : 1 }}>
                                {val != null ? formatValue(val, kpi.valueType) : "—"}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add KPI */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0" }}>
            <button
              onClick={addKPI}
              style={{ background: "none", border: "none", color: "#5b9ea6", fontSize: 14, cursor: "pointer", padding: 0 }}
            >
              + Add KPI
            </button>
          </div>
        </>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onCreateTodo={() => setCreateModal({ type: "todo", kpi: contextMenu.kpi })}
          onCreateIssue={() => setCreateModal({ type: "issue", kpi: contextMenu.kpi })}
          onClose={() => setContextMenu(null)}
        />
      )}

      {createModal && (
        <CreateItemModal
          defaultType={createModal.type}
          kpiTitle={createModal.kpi.title}
          prefillDescription={buildPrefill(createModal.kpi)}
          onClose={() => setCreateModal(null)}
        />
      )}
    </div>
  );
}
