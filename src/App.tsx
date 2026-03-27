import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Scorecard from "./components/Scorecard";
import Todos from "./components/pages/Todos";
import Issues from "./components/pages/Issues";
import Headlines from "./components/pages/Headlines";
import OKRs from "./components/pages/OKRs";
import Login from "./components/Login";

type NavItem = "overview" | "scorecard" | "okrs" | "todos" | "issues" | "headlines";

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
        {activeNav === "okrs"      && <OKRs />}
      </main>
    </div>
  );
}

export default function App() {
  const [authed,   setAuthed]   = useState(() =>
    localStorage.getItem("ninety-auth") === "1" && !!localStorage.getItem("ninety-auth-user")
  );
  const [username, setUsername] = useState(() => localStorage.getItem("ninety-auth-user") ?? "");

  if (!authed) return <Login onLogin={(u) => { setAuthed(true); setUsername(u); }} />;

  return (
    <AppProvider username={username}>
      <AppShell />
    </AppProvider>
  );
}
