import { useState } from "react";
import { useApp } from "../context/AppContext";

interface Props {
  title: string;
  type: "team" | "private";
}

export default function TodoCard({ title, type }: Props) {
  const { todos, toggleTodo, addTodo } = useApp();
  const [showDone, setShowDone] = useState(false);

  const filtered = todos.filter((t) => {
    if (type === "team"    &&  t.isPrivate) return false;
    if (type === "private" && !t.isPrivate) return false;
    if (!showDone && t.done) return false;
    if (showDone  && !t.done) return false;
    return true;
  });

  function handleAdd() {
    const t = prompt("New to-do title:");
    if (!t?.trim()) return;
    addTodo({ title: t.trim(), description: "", dueBy: "", done: false, team: "Marketing", isPrivate: type === "private", assignees: [] });
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e6ea",
        borderRadius: 10,
        padding: "20px 22px",
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Card header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>
          {title}{" "}
          <span style={{ fontWeight: 400, color: "#888", fontSize: 15 }}>{filtered.length}</span>
        </h2>
        {/* Archive toggle */}
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
      {filtered.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #f0f0f0" }}>
          <span>Title</span>
          <span>Due by</span>
        </div>
      )}

      {/* Todo list */}
      {filtered.length > 0 ? (
        <ul style={{ listStyle: "none", flex: 1 }}>
          {filtered.map((todo) => (
            <li
              key={todo.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                  style={{ width: 16, height: 16, accentColor: "#5b9ea6", cursor: "pointer", flexShrink: 0 }}
                />
                <span style={{ fontSize: 14, color: todo.done ? "#aaa" : "#333", textDecoration: todo.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {todo.title}
                </span>
              </div>
              <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>{todo.dueBy || "—"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 20 }}>
          <div style={{ width: 64, height: 64, border: "2px solid #ddd", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 28 }}>✓</div>
          <p style={{ color: "#888", textAlign: "center", fontSize: 14 }}>You have no {title} right now.</p>
          <button
            onClick={handleAdd}
            style={{ padding: "9px 24px", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", fontWeight: 500 }}
          >
            Create To-Do
          </button>
        </div>
      )}

      {/* Footer */}
      {filtered.length > 0 && (
        <button
          onClick={handleAdd}
          style={{ marginTop: 16, background: "none", border: "none", color: "#5b9ea6", fontSize: 14, cursor: "pointer", textAlign: "left", padding: "4px 0" }}
        >
          + Create To-Do
        </button>
      )}
    </div>
  );
}
