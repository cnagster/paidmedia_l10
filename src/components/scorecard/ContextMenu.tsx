import { useEffect, useRef } from "react";

interface Props {
  x: number;
  y: number;
  onCreateTodo: () => void;
  onCreateIssue: () => void;
  onClose: () => void;
}

const ITEMS = [
  { icon: "☑", label: "Create To-Do", key: "todo" },
  { icon: "⚑", label: "Create Issue", key: "issue" },
] as const;

export default function ContextMenu({ x, y, onCreateTodo, onCreateIssue, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    // slight delay so the right-click that opened the menu doesn't immediately close it
    const id = setTimeout(() => document.addEventListener("mousedown", handleClick), 50);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handleClick); };
  }, [onClose]);

  // Keep menu inside viewport
  const menuWidth = 200;
  const menuHeight = 96;
  const left = x + menuWidth > window.innerWidth ? x - menuWidth : x;
  const top  = y + menuHeight > window.innerHeight ? y - menuHeight : y;

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left,
        top,
        width: menuWidth,
        background: "#fff",
        border: "1px solid #e2e6ea",
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        zIndex: 9999,
        padding: "6px 0",
      }}
    >
      {ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => {
            onClose();
            if (item.key === "todo") onCreateTodo();
            else onCreateIssue();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "9px 16px",
            background: "none",
            border: "none",
            fontSize: 14,
            color: "#333",
            cursor: "pointer",
            textAlign: "left",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f7f9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <span style={{ fontSize: 15, width: 18, textAlign: "center", color: "#888" }}>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
