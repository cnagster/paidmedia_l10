import { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import type { TodoItem, User } from "../../context/AppContext";
import CreateItemModal from "../scorecard/CreateItemModal";
import Calendar from "../ui/Calendar";
import UserPicker from "../ui/UserPicker";

function Avatar({ user, size = 30 }: { user: User; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: user.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700, flexShrink: 0 }}>
      {user.initials}
    </div>
  );
}

function RowMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 18, padding: "2px 4px", borderRadius: 4, lineHeight: 1 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}
      >
        ⋯
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid #e2e6ea", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 130, padding: "4px 0" }}>
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              style={{ display: "block", width: "100%", padding: "8px 14px", background: "none", border: "none", fontSize: 13, color: "#de350b", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Todos() {
  const { todos, toggleTodo, deleteTodo, updateTodo, addTodo, users } = useApp();

  const [tab,          setTab]          = useState<"team" | "private">("team");
  const [showArchive,  setShowArchive]  = useState(false);
  const [search,       setSearch]       = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [addingInline, setAddingInline] = useState(false);
  const [newTitle,     setNewTitle]     = useState("");
  const [page,         setPage]         = useState(1);
  const [perPage,      setPerPage]      = useState(25);
  const [dueSortOrder, setDueSortOrder] = useState<"asc" | "desc" | null>(null);

  function parseDueMs(dueBy: string): number {
    if (!dueBy) return Infinity; // empty dates sort last
    const d = new Date(`${dueBy} 2026`);
    return isNaN(d.getTime()) ? Infinity : d.getTime();
  }

  function toggleDueSort() {
    setDueSortOrder((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
    setPage(1);
  }

  const filtered = todos.filter((t) => {
    if (tab === "team"    && t.isPrivate)  return false;
    if (tab === "private" && !t.isPrivate) return false;
    if (!showArchive && t.done)            return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = dueSortOrder
    ? [...filtered].sort((a, b) => {
        const diff = parseDueMs(a.dueBy) - parseDueMs(b.dueBy);
        return dueSortOrder === "asc" ? diff : -diff;
      })
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const visible    = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  function submitInline() {
    const title = newTitle.trim();
    if (title) {
      addTodo({ title, description: "", dueBy: "", done: false, team: "Marketing", isPrivate: tab === "private", assignees: [] });
    }
    setNewTitle("");
    setAddingInline(false);
  }

  const tabLabel = tab === "team" ? "Team To-Dos" : "Private To-Dos";

  return (
    <div style={{ padding: "32px 36px", minHeight: "100vh", background: "#f5f6f7" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>To-Dos</h1>
          <p style={{ marginTop: 4, color: "#777", fontSize: 14 }}>Create, assign, and track deadlines for critical tasks.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 20 }}>🔔</button>
          <button
            onClick={() => setShowModal(true)}
            style={{ padding: "8px 20px", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            Create
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 24, borderBottom: "2px solid #e8eaed", marginBottom: 16 }}>
        {(["team", "private"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            style={{ background: "none", border: "none", padding: "8px 0", fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? "#5b9ea6" : "#777", borderBottom: tab === t ? "2px solid #5b9ea6" : "2px solid transparent", marginBottom: -2, cursor: "pointer", textTransform: "capitalize" }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select style={filterSelect}>
          <option>Team: Marketing</option>
          <option>Team: All</option>
        </select>
        <select style={filterSelect}>
          <option>Owner: All +{users.length}</option>
          {users.map((u) => <option key={u.id}>{u.name}</option>)}
        </select>

        {/* Archive toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            onClick={() => setShowArchive((v) => !v)}
            style={{ width: 40, height: 22, borderRadius: 11, background: showArchive ? "#5b9ea6" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
          >
            <div style={{ position: "absolute", top: 2, left: showArchive ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize: 14, color: "#555" }}>Archive</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Action icons */}
        {["↻", "PDF", "↓"].map((icon) => (
          <button key={icon} style={{ background: "none", border: "1px solid #e2e6ea", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#666", cursor: "pointer" }}>{icon}</button>
        ))}

        {/* Search */}
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13, pointerEvents: "none" }}>🔍</span>
          <input
            placeholder="Search To-Dos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid #dde1e7", borderRadius: 6, fontSize: 13, outline: "none", width: 200, background: "#fff" }}
          />
        </div>
      </div>

      {/* Table card */}
      <div style={{ background: "#fff", border: "1px solid #e2e6ea", borderRadius: 12, overflow: "hidden" }}>
        {/* Card header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>
            {tabLabel} <span style={{ fontWeight: 400, color: "#aaa", fontSize: 16 }}>{filtered.length}</span>
          </h2>
          <span style={{ fontSize: 20, color: "#22a06b" }}>↗</span>
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 90px 40px", alignItems: "center", padding: "8px 24px", borderBottom: "1px solid #f0f0f0", background: "#fafbfc" }}>
          <div />
          <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>Title</span>
          <button
            onClick={toggleDueSort}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, fontSize: 12, fontWeight: 500, color: dueSortOrder ? "#5b9ea6" : "#aaa" }}
            title="Sort by due date"
          >
            Due By
            <span style={{ fontSize: 11, lineHeight: 1 }}>
              {dueSortOrder === "asc" ? "↑" : dueSortOrder === "desc" ? "↓" : "↕"}
            </span>
          </button>
          <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>Owner</span>
          <div />
        </div>

        {/* Rows */}
        {visible.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
            {showArchive ? "No to-dos found." : "No incomplete to-dos. Toggle Archive to see completed ones."}
          </div>
        ) : (
          visible.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              allUsers={users}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
              onUpdateDue={(dueBy) => updateTodo(todo.id, { dueBy })}
              onUpdateAssignees={(assignees) => updateTodo(todo.id, { assignees })}
              onUpdateTitle={(title) => updateTodo(todo.id, { title })}
            />
          ))
        )}

        {/* Inline add row */}
        {addingInline && (
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 80px 40px", alignItems: "center", padding: "10px 24px", borderTop: "1px solid #f0f0f0" }}>
            <div />
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitInline(); if (e.key === "Escape") { setAddingInline(false); setNewTitle(""); } }}
              onBlur={submitInline}
              placeholder="To-Do title..."
              style={{ border: "1px solid #5b9ea6", borderRadius: 5, padding: "6px 10px", fontSize: 14, outline: "none" }}
            />
          </div>
        )}

        {/* Card footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderTop: "1px solid #f0f0f0" }}>
          <button
            onClick={() => setAddingInline(true)}
            style={{ background: "none", border: "none", color: "#5b9ea6", fontSize: 14, cursor: "pointer", padding: 0 }}
          >
            + Add To-Do
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Items per page */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#666" }}>
              <span>Items per page:</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                style={{ border: "1px solid #e2e6ea", borderRadius: 5, padding: "3px 6px", fontSize: 13, background: "#fff" }}
              >
                {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Page info */}
            <span style={{ fontSize: 13, color: "#666" }}>
              {sorted.length === 0 ? "0" : `${(safePage - 1) * perPage + 1} – ${Math.min(safePage * perPage, sorted.length)}`} of {sorted.length}
            </span>

            {/* Pagination controls */}
            <div style={{ display: "flex", gap: 2 }}>
              {[
                { label: "⟨⟨", action: () => setPage(1),           disabled: safePage === 1 },
                { label: "⟨",  action: () => setPage((p) => p - 1), disabled: safePage === 1 },
                { label: "⟩",  action: () => setPage((p) => p + 1), disabled: safePage === totalPages },
                { label: "⟩⟩", action: () => setPage(totalPages),   disabled: safePage === totalPages },
              ].map(({ label, action, disabled }) => (
                <button
                  key={label}
                  onClick={action}
                  disabled={disabled}
                  style={{ background: "none", border: "1px solid #e2e6ea", borderRadius: 4, padding: "3px 8px", fontSize: 13, cursor: disabled ? "default" : "pointer", color: disabled ? "#ccc" : "#555" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create modal */}
      {showModal && (
        <CreateItemModal
          defaultType="todo"
          kpiTitle=""
          prefillDescription=""
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function TodoRow({ todo, allUsers, onToggle, onDelete, onUpdateDue, onUpdateAssignees, onUpdateTitle }: {
  todo: TodoItem;
  allUsers: User[];
  onToggle: () => void;
  onDelete: () => void;
  onUpdateDue: (dueBy: string) => void;
  onUpdateAssignees: (assignees: User[]) => void;
  onUpdateTitle: (title: string) => void;
}) {
  const [showCal,     setShowCal]     = useState(false);
  const [showPicker,  setShowPicker]  = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");
  const dateRef  = useRef<HTMLButtonElement>(null);
  const ownerRef = useRef<HTMLButtonElement>(null);

  // Parse stored dueBy string back to a Date for the calendar
  function parseDue(): Date | null {
    if (!todo.dueBy) return null;
    const d = new Date(todo.dueBy);
    return isNaN(d.getTime()) ? null : d;
  }

  function handleDateChange(date: Date) {
    onUpdateDue(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }

  const selectedIds = todo.assignees.map((u) => u.id);
  function handleOwnerChange(ids: string[]) {
    onUpdateAssignees(allUsers.filter((u) => ids.includes(u.id)));
  }

  return (
    <>
      <div
        style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 90px 40px", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid #f5f5f5" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        {/* Checkbox */}
        <button
          onClick={onToggle}
          style={{ width: 22, height: 22, borderRadius: "50%", border: todo.done ? "none" : "2px solid #ccc", background: todo.done ? "#22a06b" : "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0, padding: 0 }}
        >
          {todo.done ? "✓" : ""}
        </button>

        {/* Title */}
        {editingTitle ? (
          <input
            autoFocus
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={() => { if (titleVal.trim()) onUpdateTitle(titleVal.trim()); setEditingTitle(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { if (titleVal.trim()) onUpdateTitle(titleVal.trim()); setEditingTitle(false); }
              if (e.key === "Escape") setEditingTitle(false);
            }}
            style={{ border: "1px solid #5b9ea6", borderRadius: 4, padding: "2px 6px", fontSize: 14, outline: "none", color: "#333", marginRight: 16, width: "100%", boxSizing: "border-box" }}
          />
        ) : (
          <span
            onDoubleClick={() => { setEditingTitle(true); setTitleVal(todo.title); }}
            title="Double-click to edit"
            style={{ fontSize: 14, color: todo.done ? "#aaa" : "#333", textDecoration: todo.done ? "line-through" : "none", paddingRight: 16, cursor: "default" }}
          >
            {todo.title}
          </span>
        )}

        {/* Due By — clickable */}
        <button
          ref={dateRef}
          onClick={() => { setShowPicker(false); setShowCal((v) => !v); }}
          style={{ background: "none", border: "1px solid transparent", borderRadius: 5, padding: "3px 6px", fontSize: 13, color: todo.dueBy ? "#555" : "#bbb", cursor: "pointer", textAlign: "left", width: "100%" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#dde1e7")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
        >
          {todo.dueBy || "Set date"}
        </button>

        {/* Owner — clickable */}
        <button
          ref={ownerRef}
          onClick={() => { setShowCal(false); setShowPicker((v) => !v); }}
          style={{ background: "none", border: "1px solid transparent", borderRadius: 5, padding: "3px 4px", cursor: "pointer", display: "flex", gap: 4, alignItems: "center" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#dde1e7")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
        >
          {todo.assignees.length > 0
            ? todo.assignees.slice(0, 2).map((u) => <Avatar key={u.id} user={u} size={26} />)
            : <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f0f0f0", border: "1.5px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#bbb" }}>+</div>
          }
        </button>

        {/* Menu */}
        <RowMenu onDelete={onDelete} />
      </div>

      {showCal && (
        <Calendar
          value={parseDue()}
          anchorEl={dateRef.current}
          onChange={handleDateChange}
          onClose={() => setShowCal(false)}
        />
      )}

      {showPicker && (
        <UserPicker
          users={allUsers}
          selectedIds={selectedIds}
          anchorEl={ownerRef.current}
          onChange={handleOwnerChange}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

const filterSelect: React.CSSProperties = {
  padding: "7px 12px", border: "1px solid #dde1e7", borderRadius: 6, fontSize: 13, background: "#fff", cursor: "pointer", color: "#333",
};
