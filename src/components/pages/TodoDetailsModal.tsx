import { useEffect, useRef, useState } from "react";
import type { TodoItem } from "../../context/AppContext";

interface Props {
  todo: TodoItem;
  onSave: (changes: Partial<TodoItem>) => void;
  onClose: () => void;
}

export default function TodoDetailsModal({ todo, onSave, onClose }: Props) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") handleClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);

  function handleClose() {
    const changes: Partial<TodoItem> = {};
    if (title.trim() && title !== todo.title) changes.title = title.trim();
    if (description !== (todo.description ?? "")) changes.description = description;
    if (Object.keys(changes).length > 0) onSave(changes);
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) handleClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ background: "#fff", borderRadius: 12, width: 560, maxWidth: "95vw", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>To-Do Details</span>
          <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18, padding: "2px 6px", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: "20px 24px", flex: 1 }}>
          <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #5b9ea6", borderRadius: 6, fontSize: 15, outline: "none", marginBottom: 16, boxSizing: "border-box" }}
          />

          <label style={{ fontSize: 12, color: "#aaa", display: "block", marginBottom: 6 }}>Description / Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            placeholder="Add a description or notes..."
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #e2e6ea", borderRadius: 6, fontSize: 14, lineHeight: 1.6, outline: "none", fontFamily: "inherit", color: "#333", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 24px", borderTop: "1px solid #f0f0f0" }}>
          <button onClick={handleClose} style={{ padding: "10px 24px", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
