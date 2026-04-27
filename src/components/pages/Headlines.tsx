import { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import type { HeadlineItem, User } from "../../context/AppContext";
import UserPicker from "../ui/UserPicker";
import ContextMenu from "../scorecard/ContextMenu";
import CreateItemModal from "../scorecard/CreateItemModal";


function Avatar({ user, size = 30 }: { user: User; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: user.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700, flexShrink: 0 }}>
      {user.initials}
    </div>
  );
}

function MegaphoneIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 16L20 30H12C9.79 30 8 31.79 8 34V46C8 48.21 9.79 50 12 50H20L24 66H32V50L60 64V16Z" fill="#ccc" />
      <path d="M64 18C66.21 18 68 28.06 68 40C68 51.94 66.21 62 64 62V18Z" fill="#bbb" />
    </svg>
  );
}

// ── Create Headline Modal ─────────────────────────────────────────────────────

function CreateHeadlineModal({ onClose }: { onClose: () => void }) {
  const { users, addHeadline } = useApp();
  const [title, setTitle]   = useState("");
  const [desc,  setDesc]    = useState("");
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const author = users.find((u) => u.id === authorId) ?? null;

  function handleSubmit() {
    if (!title.trim()) return;
    addHeadline({ title: title.trim(), description: desc.trim(), archived: false, team: "Marketing", author });
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ background: "#fff", borderRadius: 12, width: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #eee" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Create Headline</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {/* Author avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button
              ref={avatarRef}
              onClick={() => setPickerOpen(true)}
              title="Set author"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", borderRadius: "50%" }}
            >
              {author
                ? <Avatar user={author} size={36} />
                : <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0f0f0", border: "1.5px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#bbb" }}>+</div>
              }
            </button>
            <span style={{ fontSize: 13, color: "#888" }}>{author ? author.name : "No author"}</span>
          </div>

          <input
            autoFocus
            placeholder="Headline title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            style={{ width: "100%", padding: "10px 0", border: "none", borderBottom: "2px solid #5b9ea6", fontSize: 15, outline: "none", color: "#1a1a2e", marginBottom: 14, boxSizing: "border-box" }}
          />

          <textarea
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "8px 0", border: "none", borderBottom: "1px solid #eee", fontSize: 13, outline: "none", color: "#555", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: "1px solid #eee" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", background: "none", border: "1px solid #dde1e7", borderRadius: 6, fontSize: 13, cursor: "pointer", color: "#555" }}>Cancel</button>
          <button onClick={handleSubmit} style={{ padding: "8px 18px", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
        </div>
      </div>

      {pickerOpen && (
        <UserPicker
          users={users}
          selectedIds={authorId ? [authorId] : []}
          anchorEl={avatarRef.current}
          onChange={(ids) => { setAuthorId(ids[0] ?? null); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

// ── Headline row ──────────────────────────────────────────────────────────────

function HeadlineRow({ headline, isDragOver, onArchive, onDelete, onDragStart, onDragOver, onDrop, onDragEnd, onUpdateTitle, onUpdateAuthor, allUsers, onContextMenu }: {
  headline: HeadlineItem;
  isDragOver: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateAuthor: (author: User | null) => void;
  allUsers: User[];
  onContextMenu: (e: React.MouseEvent, title: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, headline.title); }}
      style={{ borderBottom: "1px solid #f5f5f5", padding: "14px 24px", background: "#fff", borderTop: isDragOver ? "2px solid #5b9ea6" : "2px solid transparent", cursor: "grab" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "28px 36px 1fr 90px 44px", alignItems: "center", gap: 12 }}>
        {/* Archive checkbox */}
        <button
          onClick={onArchive}
          title={headline.archived ? "Unarchive" : "Archive"}
          style={{ width: 20, height: 20, borderRadius: 4, border: headline.archived ? "none" : "2px solid #ccc", background: headline.archived ? "#5b9ea6" : "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, padding: 0, flexShrink: 0 }}
        >
          {headline.archived ? "✓" : ""}
        </button>

        {/* Author avatar — clickable */}
        <button
          ref={avatarRef}
          onClick={() => setShowPicker((v) => !v)}
          title="Set author"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", borderRadius: "50%" }}
        >
          {headline.author
            ? <Avatar user={headline.author} size={30} />
            : <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#bbb" }}>?</div>
          }
        </button>

        {/* Title + description */}
        <div>
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
              style={{ width: "100%", border: "1px solid #5b9ea6", borderRadius: 4, padding: "2px 6px", fontSize: 14, fontWeight: 500, outline: "none", color: "#222", boxSizing: "border-box" }}
            />
          ) : (
            <div
              onClick={() => setExpanded((v) => !v)}
              onDoubleClick={() => { setEditingTitle(true); setTitleVal(headline.title); }}
              title="Double-click to edit"
              style={{ fontSize: 14, fontWeight: 500, color: headline.archived ? "#aaa" : "#222", cursor: "pointer", textDecoration: headline.archived ? "line-through" : "none" }}
            >
              {headline.title}
            </div>
          )}
          {expanded && headline.description && (
            <div style={{ marginTop: 6, fontSize: 13, color: "#666", lineHeight: 1.5 }}>{headline.description}</div>
          )}
        </div>

        {/* Created date */}
        <span style={{ fontSize: 12, color: "#aaa" }}>{headline.createdAt}</span>

        {/* ⋯ menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 18, padding: "2px 6px", borderRadius: 4 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}
          >⋯</button>
          {menuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />
              <div style={{ position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid #e2e6ea", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 150, padding: "4px 0" }}>
                <button
                  onClick={() => { onArchive(); setMenuOpen(false); }}
                  style={{ display: "block", width: "100%", padding: "8px 14px", background: "none", border: "none", fontSize: 13, color: "#333", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >{headline.archived ? "Unarchive" : "Archive"}</button>
                <button
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  style={{ display: "block", width: "100%", padding: "8px 14px", background: "none", border: "none", fontSize: 13, color: "#de350b", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
      {showPicker && (
        <UserPicker
          users={allUsers}
          selectedIds={headline.author ? [headline.author.id] : []}
          anchorEl={avatarRef.current}
          onChange={(ids) => { onUpdateAuthor(allUsers.find((u) => u.id === ids[0]) ?? null); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

// ── Main Headlines page ───────────────────────────────────────────────────────

export default function Headlines() {
  const { headlines, users, archiveHeadline, deleteHeadline, reorderHeadlines, updateHeadline } = useApp();
  const [showArchive, setShowArchive] = useState(false);
  const [search,      setSearch]      = useState("");
  const [showModal,   setShowModal]   = useState(false);
  const [dragOverId,  setDragOverId]  = useState<string | null>(null);
  const [ctxMenu,     setCtxMenu]     = useState<{ x: number; y: number; title: string } | null>(null);
  const [createItem,  setCreateItem]  = useState<{ type: "todo" | "issue"; title: string } | null>(null);
  const dragId = useRef<string | null>(null);

  const filtered = headlines.filter((h) => {
    if (!showArchive && h.archived) return false;
    if (search && !h.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: "32px 36px", minHeight: "100vh", background: "#f5f6f7" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>Headlines</h1>
          <p style={{ marginTop: 4, color: "#777", fontSize: 14 }}>Easily share important announcements with your team.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 20 }}>🔔</button>
          <button
            onClick={() => setShowModal(true)}
            style={{ padding: "8px 20px", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >Create</button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select style={filterSelect}><option>Team: Marketing</option><option>Team: All</option></select>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div onClick={() => setShowArchive((v) => !v)} style={{ width: 40, height: 22, borderRadius: 11, background: showArchive ? "#5b9ea6" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 2, left: showArchive ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize: 14, color: "#555" }}>Archive</span>
        </div>
        <div style={{ flex: 1 }} />
        {["PDF", "↓"].map((icon) => (
          <button key={icon} style={{ background: "none", border: "1px solid #e2e6ea", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#666", cursor: "pointer" }}>{icon}</button>
        ))}
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13, pointerEvents: "none" }}>🔍</span>
          <input
            placeholder="Search Headlines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid #dde1e7", borderRadius: 6, fontSize: 13, outline: "none", width: 200, background: "#fff" }}
          />
        </div>
      </div>

      {/* Card */}
      <div style={{ background: "#fff", border: "1px solid #e2e6ea", borderRadius: 12, overflow: "hidden" }}>
        {/* Card header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>
            Headlines <span style={{ fontWeight: 400, color: "#aaa", fontSize: 16, marginLeft: 6 }}>{filtered.length}</span>
          </h2>
        </div>

        {/* Column headers (only when there are rows) */}
        {filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "28px 36px 1fr 90px 44px", gap: 12, padding: "8px 24px", borderBottom: "1px solid #f0f0f0", background: "#fafbfc" }}>
            <div />
            <div />
            <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>Title</span>
            <span style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>Created</span>
            <div />
          </div>
        )}

        {/* Rows or empty state */}
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <MegaphoneIcon />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 6 }}>Your team hasn't added any Headlines yet.</p>
              <p style={{ fontSize: 14, color: "#888" }}>Headlines are a great way to share important news</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{ marginTop: 8, padding: "12px 32px", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >Create Headline</button>
            <button style={{ background: "none", border: "none", color: "#5b9ea6", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              Learn more about Headlines
            </button>
          </div>
        ) : (
          filtered.map((h) => (
            <HeadlineRow
              key={h.id}
              headline={h}
              isDragOver={dragOverId === h.id}
              onArchive={() => archiveHeadline(h.id)}
              onDelete={() => deleteHeadline(h.id)}
              onDragStart={() => { dragId.current = h.id; }}
              onDragOver={(e) => { e.preventDefault(); setDragOverId(h.id); }}
              onDrop={() => { if (dragId.current && dragId.current !== h.id) reorderHeadlines(dragId.current, h.id); dragId.current = null; setDragOverId(null); }}
              onDragEnd={() => { dragId.current = null; setDragOverId(null); }}
              onUpdateTitle={(title) => updateHeadline(h.id, { title })}
              onUpdateAuthor={(author) => updateHeadline(h.id, { author })}
              allUsers={users}
              onContextMenu={(e, title) => setCtxMenu({ x: e.clientX, y: e.clientY, title })}
            />
          ))
        )}

        {/* Card footer — add button */}
        {filtered.length > 0 && (
          <div style={{ padding: "12px 24px", borderTop: "1px solid #f0f0f0" }}>
            <button onClick={() => setShowModal(true)} style={{ background: "none", border: "none", color: "#5b9ea6", fontSize: 14, cursor: "pointer", padding: 0 }}>
              + Add Headline
            </button>
          </div>
        )}
      </div>

      {showModal && <CreateHeadlineModal onClose={() => setShowModal(false)} />}

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          onCreateTodo={() => { setCreateItem({ type: "todo", title: ctxMenu.title }); setCtxMenu(null); }}
          onCreateIssue={() => { setCreateItem({ type: "issue", title: ctxMenu.title }); setCtxMenu(null); }}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {createItem && (
        <CreateItemModal
          defaultType={createItem.type}
          kpiTitle={createItem.title}
          prefillDescription=""
          onClose={() => setCreateItem(null)}
        />
      )}
    </div>
  );
}

const filterSelect: React.CSSProperties = {
  padding: "7px 12px", border: "1px solid #dde1e7", borderRadius: 6, fontSize: 13, background: "#fff", cursor: "pointer", color: "#333",
};
