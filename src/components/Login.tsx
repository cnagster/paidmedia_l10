import { useState } from "react";

const CREDENTIALS = [
  { username: "carlos",    password: "paidmedia2026" },
  { username: "naveen",    password: "paidmedia2026" },
  { username: "miguel",    password: "paidmedia2026" },
  { username: "jermin",    password: "paidmedia2026" },
  { username: "dun",       password: "paidmedia2026" },
  { username: "albaltazar", password: "paidmedia2026" },
];

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const match = CREDENTIALS.find(
      (c) => c.username === username.toLowerCase().trim() && c.password === password
    );
    if (match) {
      localStorage.setItem("ninety-auth", "1");
      localStorage.setItem("ninety-auth-user", match.username);
      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 32px rgba(0,0,0,0.10)", padding: "40px 44px", width: 360 }}>
        {/* Logo / title */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.5px" }}>Paid Media L10</div>
          <div style={{ fontSize: 14, color: "#888", marginTop: 6 }}>Sign in to continue</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Username</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              style={{ padding: "10px 14px", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 14, outline: "none", color: "#1a1a2e" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#5b9ea6")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#dde1e7")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              style={{ padding: "10px 14px", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 14, outline: "none", color: "#1a1a2e" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#5b9ea6")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#dde1e7")}
            />
          </div>

          {error && <div style={{ fontSize: 13, color: "#de350b", textAlign: "center" }}>{error}</div>}

          <button
            type="submit"
            style={{ marginTop: 8, padding: "11px 0", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4a8a92")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#5b9ea6")}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
