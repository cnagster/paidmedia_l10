import { useState } from "react";

interface Rock {
  id: number;
  title: string;
  dueBy: string;
  status: "on-track" | "off-track" | "done";
}

const initialRocks: Rock[] = [
  {
    id: 1,
    title: "Successfully transition majority of total spend...",
    dueBy: "Apr 1",
    status: "on-track",
  },
];

const statusColors: Record<Rock["status"], string> = {
  "on-track": "#5b9ea6",
  "off-track": "#e07b54",
  done: "#aaa",
};

const statusLabels: Record<Rock["status"], string> = {
  "on-track": "✓",
  "off-track": "!",
  done: "✓",
};

export default function RocksCard() {
  const [rocks, setRocks] = useState<Rock[]>(initialRocks);

  function addRock() {
    const title = prompt("New OKR / Rock title:");
    if (!title) return;
    setRocks((prev) => [
      ...prev,
      { id: Date.now(), title, dueBy: "TBD", status: "on-track" },
    ]);
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
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>
          OKRs{" "}
          <span style={{ fontWeight: 400, color: "#888", fontSize: 15 }}>
            {rocks.length}
          </span>
        </h2>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#aaa",
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <span style={{ width: 28 }}>S...</span>
        <span style={{ flex: 1 }}>Title</span>
        <span>Due by</span>
      </div>

      {/* Rocks list */}
      <ul style={{ listStyle: "none", flex: 1 }}>
        {rocks.map((rock) => (
          <li
            key={rock.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderBottom: "1px solid #f5f5f5",
            }}
          >
            {/* Status dot */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: statusColors[rock.status],
                color: "#fff",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {statusLabels[rock.status]}
            </div>

            <span
              style={{
                flex: 1,
                fontSize: 14,
                color: "#333",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {rock.title}
            </span>
            <span style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>
              {rock.dueBy}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <button
        onClick={addRock}
        style={{
          marginTop: 16,
          background: "none",
          border: "none",
          color: "#5b9ea6",
          fontSize: 14,
          cursor: "pointer",
          textAlign: "left",
          padding: "4px 0",
        }}
      >
        + Create Rock
      </button>
    </div>
  );
}
