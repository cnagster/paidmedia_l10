import { useEffect, useState } from "react";

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes hidden = stale

export default function StaleTabBanner() {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let hiddenAt: number | null = null;

    function onVisibilityChange() {
      if (document.hidden) {
        hiddenAt = Date.now();
      } else if (hiddenAt != null) {
        const elapsed = Date.now() - hiddenAt;
        hiddenAt = null;
        if (elapsed >= STALE_THRESHOLD_MS) setStale(true);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  if (!stale) return null;

  return (
    <div style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "#fff8e6", border: "1px solid #ffd166", borderRadius: 8, padding: "10px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#7a5a00" }}>
      <span>⚠ This tab has been inactive for a while. Refresh to make sure you have the latest data before editing.</span>
      <button
        onClick={() => location.reload()}
        style={{ padding: "5px 12px", background: "#5b9ea6", color: "#fff", border: "none", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
      >
        Refresh
      </button>
      <button
        onClick={() => setStale(false)}
        title="Dismiss"
        style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, lineHeight: 1, padding: "0 4px" }}
      >
        ×
      </button>
    </div>
  );
}
