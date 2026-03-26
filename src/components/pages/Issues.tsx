import { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import type { IssueItem, User } from "../../context/AppContext";
import CreateItemModal from "../scorecard/CreateItemModal";
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
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 18, padding: "2px 6px", borderRadius: 4, lineHeight: 1 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}
      >⋯</button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid #e2e6ea", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 130, padding: "4px 0" }}>
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              style={{ display: "block", width: "100%", padding: "8px 14px", background: "none", border: "none", fontSize: 13, color: "#de350b", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Issue section card (Short-Term or Long-Term) ──────────────────────────────

interface SectionProps {
  term: "short" | "long";
  label: string;
  issues: IssueItem[];
  allUsers: User[];
  showArchive: boolean;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateOwner: (id: string, assignees: User[]) => void;
  onReorder: (fromId: string, toId: string) => void;
  onAdd: () => void;
}

function IssueSection({ label, issues, allUsers, onResolve, onDelete, onUpdateOwner, onReorder, onAdd }: SectionProps) {
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [pickerFor, setPickerFor]   = useState<string | null>(null);
  const ownerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dragId    = useRef<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(issues.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const visible    = issues.slice((safePage - 1) * perPage, safePage * perPage);

  function handleDragStart(id: string) {
    dragId.current = id;
  }
  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }
  function handleDrop(toId: string) {
    if (dragId.current !== null && dragId.current !== toId) {
      onReorder(dragId.current, toId);
    }
    dragId.current = null;
    setDragOverId(null);
  }
  function handleDragEnd() {
    dragId.current = null;
    setDragOverId(null);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e6ea", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f0f0f0" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>
          {label} <span style={{ fontWeight: 400, color: "#aaa", fontSize: 16, marginLeft: 6 }}>{issues.length}</span>
        </h2>
        {/* View toggle (decorative) */}
        <div style={{ display: "flex", gap: 4 }}>
          {["☰", "⊞"].map((icon, i) => (
            <button key={i} style={{ background: i === 0 ? "#e8f4f6" : "none", border: "1px solid #e2e6ea", borderRadius: 5, padding: "4px 8px", fontSize: 14, cursor: "pointer", color: i === 0 ? "#5b9ea6" : "#888" }}>{icon}</button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 100px 70px 44px", alignItems: "center", padding: "8px 24px", borderBottom: "1px solid #f0f0f0", background: "#fafbfc" }}>
        <div />
        <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>Title</span>
        <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>Created</span>
        <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>Owner</span>
        <div />
      </div>

      {/* Rows */}
      {visible.length === 0 ? (
        <div style={{ padding: "32px 24px", textAlign: "center", color: "#aaa", fontSize: 14 }}>No issues here.</div>
      ) : (
        visible.map((issue, idx) => {
          const globalIdx  = (safePage - 1) * perPage + idx;
          const isDragOver = dragOverId === issue.id;
          const ownerIds   = issue.assignees.map((u) => u.id);
          return (
            <div
              key={issue.id}
              draggable
              onDragStart={() => handleDragStart(issue.id)}
              onDragOver={(e) => handleDragOver(e, issue.id)}
              onDrop={() => handleDrop(issue.id)}
              onDragEnd={handleDragEnd}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr 100px 70px 44px",
                alignItems: "center",
                padding: "13px 24px",
                borderBottom: "1px solid #f5f5f5",
                borderTop: isDragOver ? "2px solid #5b9ea6" : "2px solid transparent",
                cursor: "grab",
                background: dragId.current === issue.id ? "#f0f7f8" : "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { if (dragId.current === null) e.currentTarget.style.background = "#fafbfc"; }}
              onMouseLeave={(e) => { if (dragId.current === null) e.currentTarget.style.background = "none"; }}
            >
              {/* Resolve circle */}
              <button
                onClick={() => onResolve(issue.id)}
                title={issue.resolved ? "Re-open" : "Mark resolved"}
                style={{ width: 28, height: 28, borderRadius: "50%", border: issue.resolved ? "none" : "2px solid #ccc", background: issue.resolved ? "#22a06b" : "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, padding: 0, flexShrink: 0 }}
              >
                {issue.resolved ? "✓" : ""}
              </button>

              {/* Number + Title */}
              <span style={{ fontSize: 14, color: issue.resolved ? "#aaa" : "#333", textDecoration: issue.resolved ? "line-through" : "none" }}>
                <span style={{ fontWeight: 600, marginRight: 6 }}>{globalIdx + 1}.</span>
                {issue.title}
              </span>

              {/* Created */}
              <span style={{ fontSize: 13, color: "#888" }}>{issue.createdAt || "—"}</span>

              {/* Owner — clickable */}
              <button
                ref={(el) => { ownerRefs.current[issue.id] = el; }}
                onClick={() => setPickerFor(pickerFor === issue.id ? null : issue.id)}
                style={{ background: "none", border: "1px solid transparent", borderRadius: 5, padding: "2px 4px", cursor: "pointer", display: "flex", gap: 4, alignItems: "center" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#dde1e7")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
              >
                {issue.assignees.length > 0
                  ? issue.assignees.slice(0, 2).map((u) => <Avatar key={u.id} user={u} size={26} />)
                  : <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f0f0f0", border: "1.5px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#bbb" }}>+</div>
                }
              </button>

              <RowMenu onDelete={() => onDelete(issue.id)} />

              {/* UserPicker */}
              {pickerFor === issue.id && (
                <UserPicker
                  users={allUsers}
                  selectedIds={ownerIds}
                  anchorEl={ownerRefs.current[issue.id]}
                  onChange={(ids) => onUpdateOwner(issue.id, allUsers.filter((u) => ids.includes(u.id)))}
                  onClose={() => setPickerFor(null)}
                />
              )}
            </div>
          );
        })
      )}

      {/* Card footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderTop: "1px solid #f0f0f0" }}>
        <button onClick={onAdd} style={{ background: "none", border: "none", color: "#5b9ea6", fontSize: 14, cursor: "pointer", padding: 0 }}>
          + Add Issue
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#666" }}>
            <span>Items per page:</span>
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} style={{ border: "1px solid #e2e6ea", borderRadius: 5, padding: "3px 6px", fontSize: 13, background: "#fff" }}>
              {[25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <span style={{ fontSize: 13, color: "#666" }}>
            {issues.length === 0 ? "0" : `${(safePage - 1) * perPage + 1} – ${Math.min(safePage * perPage, issues.length)}`} of {issues.length}
          </span>
          <div style={{ display: "flex", gap: 2 }}>
            {[
              { label: "⟨⟨", action: () => setPage(1),           disabled: safePage === 1 },
              { label: "⟨",  action: () => setPage((p) => p - 1), disabled: safePage === 1 },
              { label: "⟩",  action: () => setPage((p) => p + 1), disabled: safePage === totalPages },
              { label: "⟩⟩", action: () => setPage(totalPages),   disabled: safePage === totalPages },
            ].map(({ label, action, disabled }) => (
              <button key={label} onClick={action} disabled={disabled}
                style={{ background: "none", border: "1px solid #e2e6ea", borderRadius: 4, padding: "3px 8px", fontSize: 13, cursor: disabled ? "default" : "pointer", color: disabled ? "#ccc" : "#555" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Issues page ──────────────────────────────────────────────────────────

export default function Issues() {
  const { issues, resolveIssue, deleteIssue, addIssue, updateIssue, reorderIssues, users } = useApp();

  const [showArchive, setShowArchive] = useState(false);
  const [search,      setSearch]      = useState("");
  const [showModal,   setShowModal]   = useState(false);
  const [addTerm,     setAddTerm]     = useState<"short" | "long">("short");
  const [addingFor,   setAddingFor]   = useState<"short" | "long" | null>(null);
  const [inlineTitle, setInlineTitle] = useState("");

  function sectionIssues(term: "short" | "long") {
    return issues.filter((i) => {
      if ((i.term ?? "short") !== term)  return false;
      if (!showArchive && i.resolved)    return false;
      if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }

  function handleAdd(term: "short" | "long") {
    setAddTerm(term);
    setAddingFor(term);
    setInlineTitle("");
  }

  function submitInline() {
    const title = inlineTitle.trim();
    if (title) {
      addIssue({ title, description: "", dueBy: "", resolved: false, team: "Marketing", assignees: [], term: addTerm });
    }
    setAddingFor(null);
    setInlineTitle("");
  }

  const shortIssues = sectionIssues("short");
  const longIssues  = sectionIssues("long");

  return (
    <div style={{ padding: "32px 36px", minHeight: "100vh", background: "#f5f6f7" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>Issues</h1>
          <p style={{ marginTop: 4, color: "#777", fontSize: 14 }}>Identify and organize your team's most pressing Issues to resolve them with ease.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 20 }}>🔔</button>
          <button onClick={() => setShowModal(true)} style={{ padding: "8px 20px", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Create
          </button>
        </div>
      </div>

      {/* Section labels (visual anchors) */}
      <div style={{ display: "flex", gap: 24, borderBottom: "2px solid #e8eaed", marginBottom: 16 }}>
        {(["Short-Term", "Long-Term"] as const).map((label) => (
          <a key={label} href={`#${label}`} style={{ padding: "8px 0", fontSize: 14, fontWeight: 600, color: "#5b9ea6", borderBottom: "2px solid #5b9ea6", marginBottom: -2, textDecoration: "none" }}>
            {label}
          </a>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select style={filterSelect}><option>Team: Marketing</option><option>Team: All</option></select>
        <select style={filterSelect}>
          <option>Owner: All +{users.length}</option>
          {users.map((u) => <option key={u.id}>{u.name}</option>)}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div onClick={() => setShowArchive((v) => !v)} style={{ width: 40, height: 22, borderRadius: 11, background: showArchive ? "#5b9ea6" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 2, left: showArchive ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize: 14, color: "#555" }}>Archive</span>
        </div>
        <div style={{ flex: 1 }} />
        {["↻", "PDF", "↓"].map((icon) => (
          <button key={icon} style={{ background: "none", border: "1px solid #e2e6ea", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#666", cursor: "pointer" }}>{icon}</button>
        ))}
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13, pointerEvents: "none" }}>🔍</span>
          <input placeholder="Search Issues..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid #dde1e7", borderRadius: 6, fontSize: 13, outline: "none", width: 200, background: "#fff" }} />
        </div>
      </div>

      {/* Short-Term section */}
      <div id="Short-Term">
        <IssueSection
          term="short" label="Short-Term" issues={shortIssues} allUsers={users} showArchive={showArchive}
          onResolve={resolveIssue} onDelete={deleteIssue}
          onUpdateOwner={(id, assignees) => updateIssue(id, { assignees })}
          onReorder={(fromId, toId) => reorderIssues("short", fromId, toId)}
          onAdd={() => handleAdd("short")}
        />
        {addingFor === "short" && (
          <InlineAdd value={inlineTitle} onChange={setInlineTitle} onSubmit={submitInline} onCancel={() => setAddingFor(null)} />
        )}
      </div>

      {/* Long-Term section */}
      <div id="Long-Term">
        <IssueSection
          term="long" label="Long-Term" issues={longIssues} allUsers={users} showArchive={showArchive}
          onResolve={resolveIssue} onDelete={deleteIssue}
          onUpdateOwner={(id, assignees) => updateIssue(id, { assignees })}
          onReorder={(fromId, toId) => reorderIssues("long", fromId, toId)}
          onAdd={() => handleAdd("long")}
        />
        {addingFor === "long" && (
          <InlineAdd value={inlineTitle} onChange={setInlineTitle} onSubmit={submitInline} onCancel={() => setAddingFor(null)} />
        )}
      </div>

      {showModal && (
        <CreateItemModal defaultType="issue" kpiTitle="" prefillDescription="" onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function InlineAdd({ value, onChange, onSubmit, onCancel }: { value: string; onChange: (v: string) => void; onSubmit: () => void; onCancel: () => void }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #5b9ea6", borderRadius: 8, padding: "10px 20px", marginTop: -12, marginBottom: 24 }}>
      <input
        autoFocus value={value} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); if (e.key === "Escape") onCancel(); }}
        onBlur={onSubmit}
        placeholder="Issue title..."
        style={{ width: "100%", border: "none", fontSize: 14, outline: "none", color: "#333" }}
      />
    </div>
  );
}

const filterSelect: React.CSSProperties = {
  padding: "7px 12px", border: "1px solid #dde1e7", borderRadius: 6, fontSize: 13, background: "#fff", cursor: "pointer", color: "#333",
};
