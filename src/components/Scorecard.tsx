import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import KPISectionComponent from "./scorecard/KPISection";
import { generateWeeks } from "./scorecard/utils";
import type { KPISection } from "./scorecard/types";

const WEEKS = generateWeeks(13);

const INITIAL_SECTIONS: KPISection[] = [
  {
    id: "marketing",
    title: "Marketing KPIs",
    collapsed: false,
    kpis: [
      {
        id: "1",
        title: "Cupids Total Revenue",
        goalOperator: ">=",
        goalValue: 750000,
        valueType: "currency",
        weeklyValues: {
          "2026-03-23": 940535.06,
          "2026-03-16": 810062.74,
          "2026-03-09": 857372.67,
          "2026-03-02": 820000,
          "2026-02-23": 795000,
          "2026-02-16": 760000,
        },
      },
      {
        id: "2",
        title: "DTC Revenue",
        goalOperator: ">=",
        goalValue: 687500,
        valueType: "currency",
        weeklyValues: {
          "2026-03-23": 852405.06,
          "2026-03-16": 725799.74,
          "2026-03-09": 764895.67,
          "2026-03-02": 710000,
          "2026-02-23": 695000,
          "2026-02-16": 702000,
        },
      },
      {
        id: "3",
        title: "Amazon Revenue",
        goalOperator: ">=",
        goalValue: 87500,
        valueType: "currency",
        weeklyValues: {
          "2026-03-23": 88130,
          "2026-03-16": 84263,
          "2026-03-09": 92477,
          "2026-03-02": 85000,
          "2026-02-23": 91000,
          "2026-02-16": 88900,
        },
      },
      {
        id: "4",
        title: "Amazon to DTC Sales %",
        goalOperator: ">=",
        goalValue: 10,
        valueType: "percentage",
        weeklyValues: {
          "2026-03-23": 10.34,
          "2026-03-16": 11.61,
          "2026-03-09": 12.09,
          "2026-03-02": 10.8,
          "2026-02-23": 11.2,
          "2026-02-16": 10.5,
        },
      },
      {
        id: "5",
        title: "Email & SMS Campaign Revenue",
        goalOperator: ">=",
        goalValue: 70000,
        valueType: "currency",
        weeklyValues: {
          "2026-03-23": 37105.73,
          "2026-03-16": 44684.91,
          "2026-03-09": 46575.94,
          "2026-03-02": 40000,
          "2026-02-23": 38500,
          "2026-02-16": 42000,
        },
      },
      {
        id: "6",
        title: "Email Campaign Revenue %",
        goalOperator: ">=",
        goalValue: 8,
        valueType: "percentage",
        weeklyValues: {
          "2026-03-23": 4.35,
          "2026-03-16": 6.16,
          "2026-03-09": 6.09,
          "2026-03-02": 5.2,
          "2026-02-23": 5.8,
          "2026-02-16": 6.3,
        },
      },
      {
        id: "7",
        title: "Email & SMS Flow Revenue",
        goalOperator: ">=",
        goalValue: 61250,
        valueType: "currency",
        weeklyValues: {
          "2026-03-23": 29335.67,
          "2026-03-16": 26198.7,
          "2026-03-09": 24236.29,
          "2026-03-02": 28000,
          "2026-02-23": 31000,
          "2026-02-16": 27500,
        },
      },
      {
        id: "8",
        title: "Email Flow Revenue %",
        goalOperator: ">=",
        goalValue: 7,
        valueType: "percentage",
        weeklyValues: {
          "2026-03-23": 3.44,
          "2026-03-16": 3.61,
          "2026-03-09": 3.17,
          "2026-03-02": 3.8,
          "2026-02-23": 4.1,
          "2026-02-16": 3.9,
        },
      },
      {
        id: "9",
        title: "Cupids MRR",
        goalOperator: ">=",
        goalValue: 500000,
        valueType: "currency",
        weeklyValues: {
          "2026-03-23": 227405.1,
          "2026-03-16": 181392.12,
          "2026-03-09": 131292.11,
          "2026-03-02": 150000,
          "2026-02-23": 165000,
          "2026-02-16": 172000,
        },
      },
    ],
  },
];

const TABS = ["Weekly", "Monthly", "Quarterly", "Annual"] as const;

const STORAGE_KEY = "ninety-scorecard-sections";

function loadSections(): KPISection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as KPISection[];
  } catch {
    // corrupted data — fall through to default
  }
  return INITIAL_SECTIONS;
}

export default function Scorecard() {
  const [sections, setSections] = useState<KPISection[]>(loadSections);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  }, [sections]);
  const [activeTab] = useState<(typeof TABS)[number]>("Weekly");
  const [search, setSearch] = useState("");

  function updateSection(id: string, updated: KPISection) {
    setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  function deleteSection(id: string) {
    if (!confirm("Delete this section and all its KPIs?")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function addSection() {
    const title = prompt("Section name:");
    if (!title) return;
    setSections((prev) => [
      ...prev,
      { id: Date.now().toString(), title, kpis: [], collapsed: false },
    ]);
  }

  const filtered = sections.map((s) => ({
    ...s,
    kpis: search
      ? s.kpis.filter((k) => k.title.toLowerCase().includes(search.toLowerCase()))
      : s.kpis,
  }));

  return (
    <div style={{ padding: "32px 36px", minHeight: "100vh", background: "#f5f6f7" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a2e" }}>Scorecard</h1>
          <p style={{ marginTop: 4, color: "#777", fontSize: 14 }}>
            Record and evaluate key metrics, streamlined for strategic success.
          </p>
        </div>
        <button
          style={{
            padding: "8px 20px",
            background: "#5b9ea6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
          onClick={addSection}
        >
          Create
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 28,
          marginBottom: 20,
          borderBottom: "2px solid #e8eaed",
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              style={{
                background: "none",
                border: "none",
                padding: "8px 0",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#5b9ea6" : "#777",
                borderBottom: isActive ? "2px solid #5b9ea6" : "2px solid transparent",
                marginBottom: -2,
                cursor: tab === "Weekly" ? "default" : "not-allowed",
                opacity: tab === "Weekly" ? 1 : 0.5,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <select style={filterStyle}>
          <option>Team: Marketing</option>
          <option>Team: All</option>
        </select>
        <select style={filterStyle}>
          <option>View by: Week</option>
        </select>
        <select style={filterStyle}>
          <option>Date Range: Last 13 Weeks</option>
          <option>Date Range: Last 4 Weeks</option>
        </select>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#aaa",
              fontSize: 13,
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            placeholder="Search KPIs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 7,
              paddingBottom: 7,
              border: "1px solid #dde1e7",
              borderRadius: 6,
              fontSize: 13,
              outline: "none",
              width: 190,
              background: "#fff",
            }}
          />
        </div>
      </div>

      {/* KPI Sections */}
      {filtered.map((section) => (
        <KPISectionComponent
          key={section.id}
          section={section}
          weeks={WEEKS}
          onUpdate={(updated) => updateSection(section.id, updated)}
          onDelete={() => deleteSection(section.id)}
        />
      ))}

      {/* Add section */}
      <button
        onClick={addSection}
        style={{
          marginTop: 4,
          padding: "12px 20px",
          background: "#fff",
          border: "1px dashed #c8d0d8",
          borderRadius: 8,
          color: "#5b9ea6",
          fontSize: 14,
          cursor: "pointer",
          width: "100%",
        }}
      >
        + Add Section
      </button>
    </div>
  );
}

const filterStyle: CSSProperties = {
  padding: "7px 12px",
  border: "1px solid #dde1e7",
  borderRadius: 6,
  fontSize: 13,
  background: "#fff",
  cursor: "pointer",
  color: "#333",
};
