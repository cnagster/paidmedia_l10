type NavItem = "overview" | "scorecard" | "todos" | "issues" | "headlines";

interface Props {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
}

const navItems: { id: NavItem; label: string; icon: string }[] = [
  { id: "overview",  label: "Overview",  icon: "⊙" },
  { id: "scorecard", label: "Scorecard", icon: "↗" },
  { id: "todos",     label: "To-Dos",    icon: "☑" },
  { id: "issues",    label: "Issues",    icon: "⚑" },
  { id: "headlines", label: "Headlines", icon: "◻" },
];

export default function Sidebar({ activeNav, onNavChange }: Props) {
  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        height: "100vh",
        background: "#fff",
        borderRight: "1px solid #e8eaed",
        display: "flex",
        flexDirection: "column",
        padding: "16px 0",
      }}
    >
      <div>
        {/* Brand */}
        <div
          style={{
            padding: "8px 20px 20px",
            fontWeight: 700,
            fontSize: 16,
            color: "#1a1a2e",
            letterSpacing: "-0.3px",
          }}
        >
          Paid Media L10
        </div>

        {/* Nav items */}
        <nav>
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "10px 20px",
                  background: isActive ? "#f0f7f8" : "transparent",
                  border: "none",
                  borderLeft: isActive ? "3px solid #5b9ea6" : "3px solid transparent",
                  color: isActive ? "#5b9ea6" : "#555",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
