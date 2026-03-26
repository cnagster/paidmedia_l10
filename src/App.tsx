import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Scorecard from "./components/Scorecard";
import Todos from "./components/pages/Todos";
import Issues from "./components/pages/Issues";
import Headlines from "./components/pages/Headlines";

type NavItem = "overview" | "scorecard" | "todos" | "issues" | "headlines";

function AppShell() {
  const [activeNav, setActiveNav] = useState<NavItem>("overview");

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <main style={{ flex: 1, overflow: "auto" }}>
        {activeNav === "overview"  && <Dashboard />}
        {activeNav === "scorecard" && <Scorecard />}
        {activeNav === "todos"     && <Todos />}
        {activeNav === "issues"    && <Issues />}
        {activeNav === "headlines" && <Headlines />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
