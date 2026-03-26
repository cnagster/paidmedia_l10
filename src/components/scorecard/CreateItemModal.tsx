import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import { useApp } from "../../context/AppContext";
import Calendar from "../ui/Calendar";
import UserPicker from "../ui/UserPicker";

export type ItemType = "todo" | "issue";

interface Props {
  defaultType: ItemType;
  kpiTitle: string;
  prefillDescription: string;
  onClose: () => void;
}

const TYPE_LABELS: Record<ItemType, string> = { todo: "To-Do", issue: "Issue" };
const TOOLBAR_BTNS = ["B", "i", "U", "A", "≡←", "≡", "☰", "1≡", "¶", "+", "⋮"];

function nextFriday(): Date {
  const d = new Date();
  const diff = (5 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US");
}

export default function CreateItemModal({ defaultType, kpiTitle, prefillDescription, onClose }: Props) {
  const { users, addTodo, addIssue } = useApp();

  const [type,          setType]          = useState<ItemType>(defaultType);
  const [showTypePicker,setShowTypePicker] = useState(false);
  const [title,         setTitle]         = useState(kpiTitle);
  const [description,   setDescription]   = useState(prefillDescription);
  const [dueDate,       setDueDate]       = useState<Date | null>(nextFriday());
  const [team,          setTeam]          = useState("Marketing");
  const [isPrivate,     setIsPrivate]     = useState(false);
  const [assigneeIds,   setAssigneeIds]   = useState<string[]>([]);

  const [showCalendar,  setShowCalendar]  = useState(false);
  const [showUserPicker,setShowUserPicker]= useState(false);

  const overlayRef   = useRef<HTMLDivElement>(null);
  const dateAnchor   = useRef<HTMLButtonElement>(null);
  const avatarAnchor = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleSubmit() {
    const assignees = users.filter((u) => assigneeIds.includes(u.id));
    const dueDateStr = dueDate ? fmtDate(dueDate) : "";
    if (type === "todo") {
      addTodo({ title, description, dueBy: dueDateStr, done: false, team, isPrivate, assignees });
    } else {
      addIssue({ title, description, dueBy: dueDateStr, resolved: false, team, assignees, term: "short" });
    }
    onClose();
  }

  // Avatar display: show first assignee or default placeholder
  const firstAssignee = users.find((u) => assigneeIds.includes(u.id));

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          width: 640,
          maxWidth: "95vw",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #f0f0f0" }}>
          {/* Type switcher */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowTypePicker((v) => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
            >
              <span style={{ fontSize: 21, fontWeight: 700, color: "#1a1a2e" }}>Create </span>
              <span style={{ fontSize: 21, fontWeight: 700, color: "#5b9ea6" }}>{TYPE_LABELS[type]}</span>
              <span style={{ fontSize: 13, color: "#888", marginLeft: 2 }}>∨</span>
            </button>

            {showTypePicker && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff", border: "1px solid #e2e6ea", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 1, minWidth: 140, padding: "6px 0" }}>
                {(["todo", "issue"] as ItemType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setShowTypePicker(false); }}
                    style={{ display: "block", width: "100%", padding: "8px 16px", background: t === type ? "#f0f7f8" : "none", border: "none", fontSize: 14, color: t === type ? "#5b9ea6" : "#333", fontWeight: t === type ? 600 : 400, cursor: "pointer", textAlign: "left" }}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Window controls */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={onClose} style={iconBtn}>—</button>
            <button style={iconBtn}>⤢</button>
            <button onClick={onClose} style={iconBtn}>✕</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px 24px", flex: 1 }}>
          {/* Title row — clickable avatar + input */}
          <label style={fieldLabel}>Title</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            {/* Avatar / assignee trigger */}
            <button
              ref={avatarAnchor}
              onClick={() => { setShowCalendar(false); setShowUserPicker((v) => !v); }}
              title="Assign owner"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: firstAssignee?.color ?? "#c8d8db",
                color: "#fff",
                border: "2px solid transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
                cursor: "pointer",
                outline: showUserPicker ? "2px solid #5b9ea6" : "none",
                transition: "outline 0.1s",
              }}
            >
              {firstAssignee ? firstAssignee.initials : "?"}
              {assigneeIds.length > 1 && (
                <span style={{ fontSize: 9, position: "absolute", bottom: -2, right: -2, background: "#5b9ea6", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  +{assigneeIds.length - 1}
                </span>
              )}
            </button>

            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #5b9ea6", borderRadius: 6, fontSize: 15, outline: "none" }}
            />
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "#aaa", marginBottom: 14 }}>
            {title.length}/65,536
          </div>

          {/* Description */}
          <div style={{ border: "1px solid #e2e6ea", borderRadius: 6, overflow: "hidden", marginBottom: 20 }}>
            {/* Toolbar (decorative) */}
            <div style={{ display: "flex", alignItems: "center", gap: 1, padding: "6px 10px", borderBottom: "1px solid #f0f0f0", background: "#fafbfc", flexWrap: "wrap" }}>
              {TOOLBAR_BTNS.map((t, i) => (
                <button key={i} style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 6px", fontSize: 13, color: "#555", borderRadius: 3 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e8eaed")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              style={{ width: "100%", padding: "14px", border: "none", resize: "vertical", fontSize: 14, lineHeight: 1.7, outline: "none", fontFamily: "inherit", color: "#333" }}
            />
          </div>

          {/* Due date + Repeat */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={fieldLabel}>Due date</label>
              <button
                ref={dateAnchor}
                onClick={() => { setShowUserPicker(false); setShowCalendar((v) => !v); }}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: showCalendar ? "1.5px solid #5b9ea6" : "1px solid #e2e6ea",
                  borderRadius: 6,
                  fontSize: 14,
                  background: "#fff",
                  color: dueDate ? "#333" : "#aaa",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{dueDate ? fmtDate(dueDate) : "Pick a date"}</span>
                <span style={{ color: "#aaa", fontSize: 16 }}>📅</span>
              </button>
            </div>
            <div>
              <label style={fieldLabel}>Repeat</label>
              <select style={fieldInput}>
                <option>Don't repeat</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>

          {/* Team + Private */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}>
            <div>
              <label style={fieldLabel}>Team</label>
              <select value={team} onChange={(e) => setTeam(e.target.value)} style={fieldInput}>
                <option>Marketing</option>
                <option>All</option>
                <option>Engineering</option>
                <option>Sales</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <label style={fieldLabel}>Private {TYPE_LABELS[type]}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  onClick={() => setIsPrivate((v) => !v)}
                  style={{ width: 44, height: 24, borderRadius: 12, background: isPrivate ? "#5b9ea6" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <div style={{ position: "absolute", top: 2, left: isPrivate ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
                <span style={{ fontSize: 13, color: "#555" }}>Make this {TYPE_LABELS[type]} private.</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#aaa", marginBottom: 20 }}>
            Changing the team will affect which users the {TYPE_LABELS[type]} can be assigned to.
          </p>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
          <button onClick={handleSubmit} style={{ padding: 12, background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Create {TYPE_LABELS[type]}
          </button>
          <button onClick={onClose} style={{ padding: "12px 24px", background: "none", color: "#555", border: "1px solid #e2e6ea", borderRadius: 8, fontSize: 15, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>

      {/* Calendar popover */}
      {showCalendar && (
        <Calendar
          value={dueDate}
          anchorEl={dateAnchor.current}
          onChange={(d) => setDueDate(d)}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* User picker popover */}
      {showUserPicker && (
        <UserPicker
          users={users}
          selectedIds={assigneeIds}
          anchorEl={avatarAnchor.current}
          onChange={setAssigneeIds}
          onClose={() => setShowUserPicker(false)}
        />
      )}
    </div>
  );
}

const iconBtn: CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, padding: "2px 4px", lineHeight: 1 };
const fieldLabel: CSSProperties = { fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 };
const fieldInput: CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid #e2e6ea", borderRadius: 6, fontSize: 14, outline: "none", background: "#fff", color: "#333" };
