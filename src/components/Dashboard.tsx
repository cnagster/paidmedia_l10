import { useState } from "react";
import TodoCard from "./TodoCard";

export default function Dashboard() {
  const [teamFilter, setTeamFilter] = useState("All");

  return (
    <div style={{ padding: "32px 36px", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>My 90</h1>
          <p style={{ marginTop: 4, color: "#777", fontSize: 14 }}>
            A personalized workspace to view tasks, data, goals, and more.
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: "#5b9ea6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          ✏ Edit Layout
        </button>
      </div>

      {/* Team filter */}
      <div style={{ marginBottom: 24 }}>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          style={{
            padding: "7px 12px",
            border: "1px solid #dde1e7",
            borderRadius: 6,
            fontSize: 14,
            background: "#fff",
            color: "#333",
            cursor: "pointer",
          }}
        >
          <option>All</option>
          <option>My Team</option>
        </select>
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <TodoCard title="Team To-Dos" type="team" />
        <TodoCard title="Private To-Dos" type="private" />
      </div>
    </div>
  );
}
