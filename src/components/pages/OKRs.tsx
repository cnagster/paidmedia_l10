import { useState, useEffect } from "react";
import type { Objective, OKRUser } from "../okr/types";
import ObjectiveCard from "../okr/ObjectiveCard";

const OKR_USERS: OKRUser[] = [
  { id: "u1", name: "Carlos Naguit",   initials: "CN", color: "#5b9ea6" },
  { id: "u2", name: "Naveen Jasrotia", initials: "NJ", color: "#e07b54" },
  { id: "u3", name: "Al Baltazar",     initials: "AB", color: "#9b59b6" },
  { id: "u4", name: "Miguel Naguit",   initials: "MN", color: "#2980b9" },
  { id: "u5", name: "Jermin David",    initials: "JD", color: "#27ae60" },
  { id: "u6", name: "Dun Abiera",      initials: "DA", color: "#e74c3c" },
];

function u(id: string): OKRUser {
  return OKR_USERS.find((x) => x.id === id)!;
}

const INITIAL_OBJECTIVES: Objective[] = [
  {
    id: "o1",
    title: "Achieve $51M Shopify Revenue (41% increase vs. 2025)",
    owner: "Naveen Jasrotia",
    status: "no-status",
    score: 0,
    notes: "",
    keyResults: [
      {
        id: "o1kr1",
        title: "Drive $45m revenue from current products at 38% MER",
        assignees: [],
        status: "no-status",
        score: 0,
      },
      {
        id: "o1kr2",
        title: "Drive $6m revenue from new products at 45% MER",
        assignees: [],
        status: "no-status",
        score: 0,
      },
      {
        id: "o1kr3",
        title:
          "Unlock paid channel growth in spend; each channel having its own hero (e.g. Tiktok = beauty pillowcase, Meta = comforters, sheets, Youtube = all products)",
        assignees: [u("u2"), u("u3")],
        status: "no-status",
        score: 0,
      },
    ],
  },
  {
    id: "o2",
    title:
      "Defend comforter at 45%, scale sheets to 45%, and maintain non-core at 10% (revenue percentage)",
    owner: "Naveen Jasrotia",
    status: "no-status",
    score: 0,
    notes: "",
    keyResults: [
      {
        id: "o2kr1",
        title:
          "Continue improving current efforts on comforters, and amplifying strategy further with influencer content + whitelisting, scaling further on core paid channels (Meta, Google, YT, Applovin), and finding scale on new channels (TikTok, Reddit, Taboola, Newsbreak, etc.)",
        assignees: [u("u2"), u("u4"), u("u5"), u("u6"), u("u3")],
        status: "no-status",
        score: 0,
      },
      {
        id: "o2kr2",
        title:
          "Establish full funnel campaigns on core paid channels for Sheets and have consistent daily spend of at least $10,000 per day collectively (TOF, MOF, BOF)",
        assignees: [u("u2")],
        status: "no-status",
        score: 0,
      },
      {
        id: "o2kr3",
        title:
          "Build and solidify content library for Sheets, making sure it contains all essential components to build similar ads as comforter (b-rolls, complete set of product shots--different angles, UGC content, influencer content, etc.)",
        assignees: [u("u6"), u("u4"), u("u5"), u("u7"), u("u8")],
        status: "no-status",
        score: 0,
      },
    ],
  },
  {
    id: "o3",
    title: "Unlock new paid channels to drive further growth, spending at least $2m in 2026",
    owner: "Carlos Naguit",
    status: "no-status",
    score: 0,
    notes: "",
    keyResults: [
      {
        id: "o3kr1",
        title:
          "Find at least 2 new paid channels that will spend meaningfully (minimum $x) and consistently, driving incremental reach and revenue",
        assignees: [u("u2"), u("u3")],
        status: "no-status",
        score: 0,
      },
      {
        id: "o3kr2",
        title:
          "Properly measure incremental reach and revenue through a measurement partner (MMM and Incrementality)",
        assignees: [u("u2"), u("u7")],
        status: "no-status",
        score: 0,
      },
      {
        id: "o3kr3",
        title:
          "Build and/or train team to excel at newly established paid channels to execute best practices strategically and tactically",
        assignees: [u("u9"), u("u10")],
        status: "no-status",
        score: 0,
      },
    ],
  },
];

const STORAGE_KEY = "ninety-okr-all-periods";
const PERIODS = ["2026 Annual OKR", "Q1 OKR", "Q2 OKR", "Q3 OKR", "Q4 OKR"] as const;
type Period = (typeof PERIODS)[number];
type AllPeriods = Record<Period, Objective[]>;

function loadAll(): AllPeriods {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AllPeriods;
  } catch { /* fall through */ }
  // Seed "2026 Annual OKR" with initial data; others start empty
  return {
    "2026 Annual OKR": INITIAL_OBJECTIVES,
    "Q1 OKR": [],
    "Q2 OKR": [],
    "Q3 OKR": [],
    "Q4 OKR": [],
  };
}

export default function OKRs() {
  const [allPeriods, setAllPeriods] = useState<AllPeriods>(loadAll);
  const [activePeriod, setActivePeriod] = useState<Period>("2026 Annual OKR");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPeriods));
  }, [allPeriods]);

  const objectives = allPeriods[activePeriod];

  function setObjectives(updater: (prev: Objective[]) => Objective[]) {
    setAllPeriods((prev) => ({ ...prev, [activePeriod]: updater(prev[activePeriod]) }));
  }

  function updateObjective(id: string, updated: Objective) {
    setObjectives((prev) => prev.map((o) => (o.id === id ? updated : o)));
  }

  function deleteObjective(id: string) {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  }

  // Ordered unique owners (preserves first-appearance order)
  const owners: string[] = [];
  for (const obj of objectives) {
    if (obj.owner && !owners.includes(obj.owner)) owners.push(obj.owner);
  }

  function addObjectiveForOwner(owner: string) {
    setObjectives((prev) => [
      ...prev,
      { id: Date.now().toString(), title: "New Objective", owner, status: "no-status", score: 0, notes: "", keyResults: [] },
    ]);
  }

  function addPerson() {
    const name = prompt("Person's name:");
    if (!name?.trim()) return;
    addObjectiveForOwner(name.trim());
  }

  function ownerUser(name: string): OKRUser {
    return OKR_USERS.find((u) => u.name === name) ?? { id: name, name, initials: name.slice(0, 2).toUpperCase(), color: "#8e9aaf" };
  }

  // Global objective index (O1, O2, O3 … across all owners)
  const globalIndex: Record<string, number> = {};
  let counter = 1;
  for (const obj of objectives) {
    globalIndex[obj.id] = counter++;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f7" }}>
      {/* Sticky page header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #e2e6ea", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        {/* Period tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {PERIODS.map((period) => {
            const isActive = period === activePeriod;
            return (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 16,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? "#5b9ea6" : "none",
                  color: isActive ? "#fff" : "#666",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f0f7f8"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "none"; }}
              >
                {period}
              </button>
            );
          })}
        </div>

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["📍","💬","⋯"].map((icon) => (
            <button key={icon} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#888", padding: "4px 6px", borderRadius: 6 }}>{icon}</button>
          ))}
        </div>
      </div>

      {/* Body — one section per person */}
      <div style={{ padding: "28px 36px" }}>
        {owners.map((owner) => {
          const ownerObjs = objectives.filter((o) => o.owner === owner);
          const user = ownerUser(owner);
          return (
            <div key={owner} style={{ marginBottom: 40 }}>
              {/* Person section header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: user.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {user.initials}
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>{owner}</span>
              </div>

              {/* Objectives for this person */}
              {ownerObjs.map((obj) => (
                <ObjectiveCard
                  key={obj.id}
                  objective={obj}
                  index={globalIndex[obj.id]}
                  allUsers={OKR_USERS}
                  onChange={(updated) => updateObjective(obj.id, updated)}
                  onDelete={() => deleteObjective(obj.id)}
                />
              ))}

              {/* Add objective within this person's section */}
              <button
                onClick={() => addObjectiveForOwner(owner)}
                style={{ padding: "9px 16px", background: "#fff", border: "1px dashed #c8d0d8", borderRadius: 8, color: "#5b9ea6", fontSize: 13, cursor: "pointer", width: "100%" }}
              >
                + Add Objective for {owner}
              </button>
            </div>
          );
        })}

        {/* Add new person section */}
        <button
          onClick={addPerson}
          style={{ marginTop: 8, padding: "12px 20px", background: "#fff", border: "1px dashed #c8d0d8", borderRadius: 8, color: "#5b9ea6", fontSize: 14, cursor: "pointer", width: "100%" }}
        >
          + Add Person
        </button>
      </div>
    </div>
  );
}
