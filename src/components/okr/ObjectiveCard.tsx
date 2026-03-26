import { useState, useEffect, useRef } from "react";
import type { Objective, KeyResult, OKRStatus, OKRUser } from "./types";
import UserPicker from "../ui/UserPicker";

interface Props {
  objective: Objective;
  index: number; // 1-based, for O1/O2/O3 badge
  allUsers: OKRUser[];
  onChange: (updated: Objective) => void;
  onDelete: () => void;
}

const STATUS_OPTIONS: { value: OKRStatus; label: string; color: string }[] = [
  { value: "no-status", label: "No status",  color: "#888" },
  { value: "on-track",  label: "On track",   color: "#22a06b" },
  { value: "at-risk",   label: "At risk",    color: "#ff8800" },
  { value: "behind",    label: "Behind",     color: "#de350b" },
  { value: "done",      label: "Done",       color: "#0052cc" },
];

function statusStyle(status: OKRStatus): { bg: string; color: string } {
  switch (status) {
    case "on-track":  return { bg: "#e3fcef", color: "#22a06b" };
    case "at-risk":   return { bg: "#fff8e6", color: "#ff8800" };
    case "behind":    return { bg: "#ffebe6", color: "#de350b" };
    case "done":      return { bg: "#e6f3ff", color: "#0052cc" };
    default:          return { bg: "#f0f1f3", color: "#666" };
  }
}

function statusLabel(status: OKRStatus): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "No status";
}

// Column widths (right side)
const COL = { status: 110, score: 60, weight: 72, record: 60 };

interface StatusDropdownProps {
  status: OKRStatus;
  onChange: (s: OKRStatus) => void;
}

function StatusBadge({ status, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const { bg, color } = statusStyle(status);

  function openDropdown() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    const id = setTimeout(() => document.addEventListener("mousedown", onMouseDown), 50);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", onMouseDown); };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={openDropdown}
        style={{
          background: bg,
          color,
          border: "none",
          borderRadius: 5,
          padding: "3px 9px",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {statusLabel(status)}
      </button>
      {open && (
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 160,
            background: "#fff",
            border: "1px solid #e2e6ea",
            borderRadius: 8,
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
            zIndex: 20000,
            overflow: "hidden",
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "8px 12px",
                background: status === opt.value ? "#f5f7f9" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 13,
                color: "#333",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f7f9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = status === opt.value ? "#f5f7f9" : "none"; }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: opt.color,
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function ObjectiveCard({ objective, index, allUsers, onChange, onDelete }: Props) {
  const [editingObjTitle, setEditingObjTitle] = useState(false);
  const [objTitleVal, setObjTitleVal] = useState(objective.title);

  const [editingOwner, setEditingOwner] = useState(false);
  const [ownerVal, setOwnerVal] = useState(objective.owner);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesVal, setNotesVal] = useState(objective.notes);

  const [editingKRTitle, setEditingKRTitle] = useState<string | null>(null);
  const [krTitleVal, setKRTitleVal] = useState("");

  const [editingKRScore, setEditingKRScore] = useState<string | null>(null);
  const [krScoreVal, setKRScoreVal] = useState("");

  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const [pickerKRId, setPickerKRId] = useState<string | null>(null);

  const krCount = objective.keyResults.length;
  const weightPct = krCount > 0 ? Math.round((100 / krCount) * 10) / 10 : 0;

  function pushObj(changes: Partial<Objective>) {
    onChange({ ...objective, ...changes });
  }

  function pushKR(id: string, changes: Partial<KeyResult>) {
    pushObj({
      keyResults: objective.keyResults.map((kr) =>
        kr.id === id ? { ...kr, ...changes } : kr
      ),
    });
  }

  function addKR() {
    const newKR: KeyResult = {
      id: Date.now().toString(),
      title: "New Key Result",
      assignees: [],
      status: "no-status",
      score: 0,
    };
    pushObj({ keyResults: [...objective.keyResults, newKR] });
  }

  function deleteKR(id: string) {
    pushObj({ keyResults: objective.keyResults.filter((kr) => kr.id !== id) });
  }

  function commitObjTitle() {
    setEditingObjTitle(false);
    if (objTitleVal.trim()) pushObj({ title: objTitleVal.trim() });
    else setObjTitleVal(objective.title);
  }

  function commitOwner() {
    setEditingOwner(false);
    if (ownerVal.trim()) pushObj({ owner: ownerVal.trim() });
    else setOwnerVal(objective.owner);
  }

  function commitNotes() {
    setEditingNotes(false);
    pushObj({ notes: notesVal });
  }

  function commitKRTitle(id: string) {
    setEditingKRTitle(null);
    if (krTitleVal.trim()) pushKR(id, { title: krTitleVal.trim() });
  }

  function commitKRScore(id: string) {
    setEditingKRScore(null);
    const num = parseFloat(krScoreVal);
    if (!isNaN(num)) pushKR(id, { score: Math.min(10, Math.max(0, num)) });
  }

  const colHeaderStyle: React.CSSProperties = {
    width: COL.status,
    minWidth: COL.status,
    fontSize: 11,
    color: "#aaa",
    fontWeight: 500,
    textAlign: "center" as const,
    paddingBottom: 4,
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e6ea",
        borderRadius: 10,
        marginBottom: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top micro-bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 16px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fafbfc",
        }}
      >
        <button
          onClick={addKR}
          style={{ background: "none", border: "none", color: "#5b9ea6", fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          + Add KR
        </button>
        <span style={{ color: "#ddd", fontSize: 12 }}>|</span>
        <button
          onClick={() => { setEditingNotes(true); }}
          style={{ background: "none", border: "none", color: "#999", fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          Notes
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={onDelete}
          title="Delete objective"
          style={{ background: "none", border: "none", color: "#ccc", fontSize: 13, cursor: "pointer", padding: "0 2px" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#de350b"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#ccc"; }}
        >
          ✕
        </button>
      </div>

      {/* Column headers row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 16px 0 16px",
        }}
      >
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ ...colHeaderStyle, width: COL.status, minWidth: COL.status, textAlign: "center" }}>Progress</div>
          <div style={{ width: COL.score, minWidth: COL.score, fontSize: 11, color: "#aaa", fontWeight: 500, textAlign: "center" }}>Score</div>
          <div style={{ width: COL.weight, minWidth: COL.weight, fontSize: 11, color: "#aaa", fontWeight: 500, textAlign: "center" }}>Weight</div>
          <div style={{ width: COL.record, minWidth: COL.record, fontSize: 11, color: "#aaa", fontWeight: 500, textAlign: "center" }}>Record</div>
        </div>
      </div>

      {/* Objective row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          borderBottom: "1px solid #f0f0f0",
          gap: 8,
        }}
      >
        {/* Badge */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#2563eb",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          O{index}
        </div>

        {/* Title + owner */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingObjTitle ? (
            <input
              autoFocus
              value={objTitleVal}
              onChange={(e) => setObjTitleVal(e.target.value)}
              onBlur={commitObjTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitObjTitle();
                if (e.key === "Escape") { setEditingObjTitle(false); setObjTitleVal(objective.title); }
              }}
              style={{
                width: "100%",
                fontSize: 14,
                fontWeight: 600,
                border: "1px solid #5b9ea6",
                borderRadius: 4,
                padding: "2px 6px",
                outline: "none",
              }}
            />
          ) : (
            <div
              onDoubleClick={() => { setEditingObjTitle(true); setObjTitleVal(objective.title); }}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1a1a2e",
                cursor: "default",
                userSelect: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title="Double-click to edit"
            >
              {objective.title}
            </div>
          )}

          {editingOwner ? (
            <input
              autoFocus
              value={ownerVal}
              onChange={(e) => setOwnerVal(e.target.value)}
              onBlur={commitOwner}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitOwner();
                if (e.key === "Escape") { setEditingOwner(false); setOwnerVal(objective.owner); }
              }}
              style={{
                marginTop: 2,
                fontSize: 12,
                border: "1px solid #5b9ea6",
                borderRadius: 4,
                padding: "1px 5px",
                outline: "none",
                color: "#666",
              }}
            />
          ) : (
            <div
              onDoubleClick={() => { setEditingOwner(true); setOwnerVal(objective.owner); }}
              style={{ fontSize: 12, color: "#888", marginTop: 2, cursor: "default", userSelect: "none" }}
              title="Double-click to edit owner"
            >
              {objective.owner}
            </div>
          )}
        </div>

        {/* Right columns */}
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: COL.status, minWidth: COL.status, display: "flex", justifyContent: "center" }}>
            <StatusBadge
              status={objective.status}
              onChange={(s) => pushObj({ status: s })}
            />
          </div>
          <div style={{ width: COL.score, minWidth: COL.score, textAlign: "center", fontSize: 13, color: "#555" }}>
            {objective.score}
          </div>
          <div style={{ width: COL.weight, minWidth: COL.weight, textAlign: "center", fontSize: 13, color: "#aaa" }}>
            —
          </div>
          <div style={{ width: COL.record, minWidth: COL.record, textAlign: "center", fontSize: 13, color: "#aaa" }}>
            —
          </div>
        </div>
      </div>

      {/* KR rows */}
      {objective.keyResults.map((kr, krIndex) => {
        const { bg, color } = statusStyle(kr.status);
        return (
          <div
            key={kr.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "9px 16px 9px 56px",
              borderBottom: "1px solid #f0f0f0",
              gap: 8,
              position: "relative",
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget.querySelector<HTMLButtonElement>("[data-kr-delete]");
              if (btn) btn.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget.querySelector<HTMLButtonElement>("[data-kr-delete]");
              if (btn) btn.style.opacity = "0";
            }}
          >
            {/* KR badge */}
            <div
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                borderRadius: 12,
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 600,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              KR{krIndex + 1}
            </div>

            {/* Title + assignees */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingKRTitle === kr.id ? (
                <input
                  autoFocus
                  value={krTitleVal}
                  onChange={(e) => setKRTitleVal(e.target.value)}
                  onBlur={() => commitKRTitle(kr.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitKRTitle(kr.id);
                    if (e.key === "Escape") setEditingKRTitle(null);
                  }}
                  style={{
                    width: "100%",
                    fontSize: 13,
                    border: "1px solid #5b9ea6",
                    borderRadius: 4,
                    padding: "2px 6px",
                    outline: "none",
                  }}
                />
              ) : (
                <div
                  onDoubleClick={() => { setEditingKRTitle(kr.id); setKRTitleVal(kr.title); }}
                  style={{
                    fontSize: 13,
                    color: "#333",
                    cursor: "default",
                    userSelect: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title="Double-click to edit"
                >
                  {kr.title}
                </div>
              )}

              {/* Assignee avatars */}
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
                {kr.assignees.slice(0, 4).map((user) => (
                  <div
                    key={user.id}
                    title={user.name}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: user.color,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      setPickerKRId(kr.id);
                      setPickerAnchor(e.currentTarget as HTMLElement);
                    }}
                  >
                    {user.initials}
                  </div>
                ))}
                {kr.assignees.length > 4 && (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#e2e6ea",
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 600,
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      setPickerKRId(kr.id);
                      setPickerAnchor(e.currentTarget as HTMLElement);
                    }}
                  >
                    +{kr.assignees.length - 4}
                  </div>
                )}
                {/* "+" button to add assignees */}
                <button
                  onClick={(e) => {
                    setPickerKRId(kr.id);
                    setPickerAnchor(e.currentTarget as HTMLElement);
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#f0f1f3",
                    color: "#888",
                    border: "1px dashed #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Right columns */}
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: COL.status, minWidth: COL.status, display: "flex", justifyContent: "center" }}>
                <StatusBadge
                  status={kr.status}
                  onChange={(s) => pushKR(kr.id, { status: s })}
                />
              </div>
              <div
                style={{ width: COL.score, minWidth: COL.score, textAlign: "center", fontSize: 13, color: "#555", cursor: "pointer" }}
                onClick={() => { setEditingKRScore(kr.id); setKRScoreVal(String(kr.score)); }}
                title="Click to edit score"
              >
                {editingKRScore === kr.id ? (
                  <input
                    autoFocus
                    value={krScoreVal}
                    onChange={(e) => setKRScoreVal(e.target.value)}
                    onBlur={() => commitKRScore(kr.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitKRScore(kr.id);
                      if (e.key === "Escape") setEditingKRScore(null);
                    }}
                    style={{
                      width: 40,
                      textAlign: "center",
                      border: "1px solid #5b9ea6",
                      borderRadius: 3,
                      padding: "1px 4px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                ) : (
                  kr.score
                )}
              </div>
              <div style={{ width: COL.weight, minWidth: COL.weight, textAlign: "center", fontSize: 13, color: "#555" }}>
                {krCount > 0 ? `${weightPct}%` : "—"}
              </div>
              <div style={{ width: COL.record, minWidth: COL.record, textAlign: "center", fontSize: 13, color: "#555" }}>
                0
              </div>
            </div>

            {/* Delete KR button — shown on hover */}
            <button
              data-kr-delete
              onClick={() => deleteKR(kr.id)}
              title="Delete key result"
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#ccc",
                fontSize: 12,
                cursor: "pointer",
                opacity: 0,
                transition: "opacity 0.1s",
                padding: "2px 4px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#de350b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#ccc"; }}
            >
              ✕
            </button>
          </div>
        );
      })}

      {/* Notes row */}
      {(objective.notes || editingNotes) && (
        <div style={{ padding: "8px 16px", borderBottom: "1px solid #f0f0f0" }}>
          {editingNotes ? (
            <textarea
              autoFocus
              value={notesVal}
              onChange={(e) => setNotesVal(e.target.value)}
              onBlur={commitNotes}
              onKeyDown={(e) => { if (e.key === "Escape") commitNotes(); }}
              placeholder="Add notes..."
              style={{
                width: "100%",
                minHeight: 72,
                fontSize: 13,
                color: "#555",
                border: "1px solid #5b9ea6",
                borderRadius: 6,
                padding: "6px 10px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <div
              onClick={() => { setEditingNotes(true); setNotesVal(objective.notes); }}
              style={{ fontSize: 13, color: "#666", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 6 }}
            >
              <span style={{ fontSize: 14 }}>📄</span>
              <span>Notes: {objective.notes}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "10px 16px" }}>
        <button
          onClick={addKR}
          style={{
            background: "none",
            border: "none",
            color: "#5b9ea6",
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
          }}
        >
          + Add Key Result
        </button>
      </div>

      {/* UserPicker portal */}
      {pickerAnchor && pickerKRId && (() => {
        const kr = objective.keyResults.find((k) => k.id === pickerKRId);
        if (!kr) return null;
        return (
          <UserPicker
            users={allUsers}
            selectedIds={kr.assignees.map((a) => a.id)}
            anchorEl={pickerAnchor}
            onChange={(ids) => {
              const assignees = ids
                .map((id) => allUsers.find((u) => u.id === id))
                .filter((u): u is OKRUser => !!u);
              pushKR(pickerKRId, { assignees });
            }}
            onClose={() => { setPickerAnchor(null); setPickerKRId(null); }}
          />
        );
      })()}
    </div>
  );
}
