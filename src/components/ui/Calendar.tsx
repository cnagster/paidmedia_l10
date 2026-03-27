import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";

interface Props {
  value: Date | null;
  anchorEl: HTMLElement | null;
  onChange: (date: Date) => void;
  onClose: () => void;
}

const DAYS   = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

export default function Calendar({ value, anchorEl, onChange, onClose }: Props) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(value?.getFullYear()  ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth()     ?? today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  // Position below anchor
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
  }, [anchorEl]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node) &&
          anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose();
      }
    }
    const id = setTimeout(() => document.addEventListener("mousedown", onMouseDown), 50);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", onMouseDown); };
  }, [onClose, anchorEl]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  // Build 42-cell grid
  const firstDow      = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth   = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev    = new Date(viewYear, viewMonth, 0).getDate();
  const cells: { day: number; kind: "prev" | "curr" | "next" }[] = [];
  for (let i = firstDow - 1; i >= 0; i--)  cells.push({ day: daysInPrev - i,   kind: "prev" });
  for (let d = 1; d <= daysInMonth; d++)    cells.push({ day: d,                kind: "curr" });
  let n = 1;
  while (cells.length < 42)                 cells.push({ day: n++,              kind: "next" });

  function isSelected(day: number, kind: string) {
    if (!value || kind !== "curr") return false;
    return value.getFullYear() === viewYear && value.getMonth() === viewMonth && value.getDate() === day;
  }
  function isToday(day: number, kind: string) {
    return kind === "curr" && today.getFullYear() === viewYear &&
           today.getMonth() === viewMonth && today.getDate() === day;
  }
  function select(day: number, kind: "prev" | "curr" | "next") {
    let y = viewYear, m = viewMonth;
    if (kind === "prev") { m--; if (m < 0)  { m = 11; y--; } }
    if (kind === "next") { m++; if (m > 11) { m = 0;  y++; } }
    onChange(new Date(y, m, day));
    onClose();
  }

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 284,
        background: "#fff",
        border: "1px solid #e2e6ea",
        borderRadius: 10,
        boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
        padding: "14px 14px 10px",
        zIndex: 20000,
        userSelect: "none",
      }}
    >
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={prevMonth} style={navBtn}>‹</button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <select
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            style={{ border: "1px solid #e2e6ea", borderRadius: 5, padding: "3px 6px", fontSize: 13, fontWeight: 600, color: "#1a1a2e", background: "#fff", cursor: "pointer" }}
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            style={{ border: "1px solid #e2e6ea", borderRadius: 5, padding: "3px 6px", fontSize: 13, fontWeight: 600, color: "#1a1a2e", background: "#fff", cursor: "pointer" }}
          >
            {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 1 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button onClick={nextMonth} style={navBtn}>›</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#aaa", fontWeight: 600, padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((cell, i) => {
          const sel = isSelected(cell.day, cell.kind);
          const tod = isToday(cell.day, cell.kind);
          return (
            <button
              key={i}
              onClick={() => select(cell.day, cell.kind)}
              style={{
                padding: "6px 0",
                border: tod && !sel ? "1.5px solid #5b9ea6" : "1.5px solid transparent",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
                background: sel ? "#5b9ea6" : "none",
                color: sel ? "#fff" : cell.kind !== "curr" ? "#ccc" : "#333",
                fontWeight: sel || tod ? 600 : 400,
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Today shortcut */}
      <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 8, textAlign: "center" }}>
        <button
          onClick={() => { onChange(new Date(today)); onClose(); }}
          style={{ background: "none", border: "none", color: "#5b9ea6", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
        >
          Today
        </button>
      </div>
    </div>
  );
}

const navBtn: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 20,
  color: "#555",
  padding: "0 8px",
  lineHeight: 1,
};
