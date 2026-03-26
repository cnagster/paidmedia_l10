import { useState, useEffect, useRef } from "react";
import type { User } from "../../context/AppContext";

interface Props {
  users: User[];
  selectedIds: string[];
  anchorEl: HTMLElement | null;
  onChange: (ids: string[]) => void;
  onClose: () => void;
}

export default function UserPicker({ users, selectedIds, anchorEl, onChange, onClose }: Props) {
  const [search, setSearch] = useState("");
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

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: 230,
        background: "#fff",
        border: "1px solid #e2e6ea",
        borderRadius: 10,
        boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
        zIndex: 20000,
        overflow: "hidden",
      }}
    >
      {/* Search */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
        <input
          autoFocus
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #e2e6ea",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>

      {/* User list */}
      <div style={{ maxHeight: 220, overflowY: "auto" }}>
        {filtered.map((user) => {
          const selected = selectedIds.includes(user.id);
          return (
            <button
              key={user.id}
              onClick={() => toggle(user.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 14px",
                background: selected ? "#f0f7f8" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "#f5f7f9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = selected ? "#f0f7f8" : "none"; }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: user.color,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {user.initials}
              </div>
              <span style={{ fontSize: 14, flex: 1, color: "#333" }}>{user.name}</span>
              {selected && (
                <span style={{ color: "#5b9ea6", fontSize: 15, fontWeight: 700 }}>✓</span>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ padding: "12px 14px", fontSize: 13, color: "#aaa" }}>No members found.</p>
        )}
      </div>
    </div>
  );
}
