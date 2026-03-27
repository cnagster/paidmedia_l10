import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { User } from "../context/AppContext";

interface Props {
  title: string;
  type: "team" | "private";
}

function Avatar({ user }: { user: User }) {
  return (
    <div style={{ width: 22, height: 22, borderRadius: "50%", background: user.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
      {user.initials}
    </div>
  );
}

export default function TodoCard({ title, type }: Props) {
  const { todos, toggleTodo, addTodo, currentUser } = useApp();
  const [showDone, setShowDone] = useState(false);

  // For team todos: only show those assigned to the current user
  const baseTodos = todos.filter((t) => {
    if (type === "team"    &&  t.isPrivate) return false;
    if (type === "private" && !t.isPrivate) return false;
    if (type === "team" && !currentUser) return false;
    if (type === "team" && currentUser && !t.assignees.some((u) => u.id === currentUser.id)) return false;
    if (!showDone && t.done) return false;
    if (showDone  && !t.done) return false;
    return true;
  });

  // For team todos assigned to multiple users, expand into one row per assignee
  const rows: { todoId: string; title: string; dueBy: string; done: boolean; assignee: User | null }[] =
    type === "team"
      ? baseTodos.flatMap((t) =>
          t.assignees.length > 1
            ? t.assignees.map((u) => ({ todoId: t.id, title: t.title, dueBy: t.dueBy, done: t.done, assignee: u }))
            : [{ todoId: t.id, title: t.title, dueBy: t.dueBy, done: t.done, assignee: t.assignees[0] ?? null }]
        )
      : baseTodos.map((t) => ({ todoId: t.id, title: t.title, dueBy: t.dueBy, done: t.done, assignee: null }));

  function handleAdd() {
    const t = prompt("New to-do title:");
    if (!t?.trim()) return;
    addTodo({ title: t.trim(), description: "", dueBy: "", done: false, team: "Marketing", isPrivate: type === "private", assignees: currentUser ? [currentUser] : [] });
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e6ea", borderRadius: 10, padding: "20px 22px", minHeight: 260, display: "flex", flexDirection: "column" }}>
      {/* Card header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>
          {title}{" "}
          <span style={{ fontWeight: 400, color: "#888", fontSize: 15 }}>{rows.length}</span>
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            onClick={() => setShowDone((v) => !v)}
            style={{ width: 34, height: 18, borderRadius: 9, background: showDone ? "#5b9ea6" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
          >
            <div style={{ position: "absolute", top: 2, left: showDone ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>Archive</span>
        </div>
      </div>

      {/* Column headers */}
      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: type === "team" ? "1fr 80px 28px" : "1fr 80px", fontSize: 12, color: "#aaa", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #f0f0f0", gap: 8 }}>
          <span>Title</span>
          <span>Due by</span>
          {type === "team" && <span>Who</span>}
        </div>
      )}

      {/* Todo rows */}
      {rows.length > 0 ? (
        <ul style={{ listStyle: "none", flex: 1, margin: 0, padding: 0 }}>
          {rows.map((row, i) => (
            <li
              key={`${row.todoId}-${i}`}
              style={{ display: "grid", gridTemplateColumns: type === "team" ? "1fr 80px 28px" : "1fr 80px", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                <input
                  type="checkbox"
                  checked={row.done}
                  onChange={() => toggleTodo(row.todoId)}
                  style={{ width: 15, height: 15, accentColor: "#5b9ea6", cursor: "pointer", flexShrink: 0 }}
                />
                <span style={{ fontSize: 14, color: row.done ? "#aaa" : "#333", textDecoration: row.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.title}
                </span>
              </div>
              <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>{row.dueBy || "—"}</span>
              {type === "team" && row.assignee && <Avatar user={row.assignee} />}
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 20 }}>
          <div style={{ width: 64, height: 64, border: "2px solid #ddd", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 28 }}>✓</div>
          <p style={{ color: "#888", textAlign: "center", fontSize: 14 }}>You have no {title} right now.</p>
          <button onClick={handleAdd} style={{ padding: "9px 24px", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontWeight: 500 }}>
            Create To-Do
          </button>
        </div>
      )}

      {rows.length > 0 && (
        <button onClick={handleAdd} style={{ marginTop: 16, background: "none", border: "none", color: "#5b9ea6", fontSize: 14, cursor: "pointer", textAlign: "left", padding: "4px 0" }}>
          + Create To-Do
        </button>
      )}
    </div>
  );
}
