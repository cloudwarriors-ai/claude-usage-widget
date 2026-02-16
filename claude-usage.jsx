// Claude Pro Max Usage — Übersicht Desktop Widget
// Reads OAuth token from macOS Keychain (Claude Code credentials)
// and displays real-time usage gauges on your desktop.

export const command = `
TOKEN=$(security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null | /usr/bin/python3 -c "
import sys, json
try:
    data = json.loads(sys.stdin.read())
    print(data.get('claudeAiOauth', {}).get('accessToken', ''))
except:
    print('')
" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  curl -s --max-time 10 \
    -H "Authorization: Bearer $TOKEN" \
    -H "anthropic-beta: oauth-2025-04-20" \
    -H "User-Agent: claude-usage-widget/1.0" \
    https://api.anthropic.com/api/oauth/usage 2>/dev/null
else
  echo '{"error":"no_token"}'
fi
`;

export const refreshFrequency = 60000;

export const className = `
  bottom: 20px;
  right: 20px;
  z-index: 1;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
`;

const WINDOWS = {
  five_hour:           { label: "5-Hour",      short: "5H" },
  seven_day:           { label: "7-Day",       short: "7D" },
  seven_day_oauth_apps:{ label: "OAuth Apps",  short: "OA" },
  seven_day_opus:      { label: "Opus",        short: "OP" },
};

function getColor(pct) {
  if (pct >= 80) return "#ef4444";
  if (pct >= 50) return "#f59e0b";
  return "#22c55e";
}

function getGlow(pct) {
  if (pct >= 80) return "0 0 20px rgba(239,68,68,0.3)";
  if (pct >= 50) return "0 0 20px rgba(245,158,11,0.2)";
  return "0 0 20px rgba(34,197,94,0.15)";
}

function timeUntil(isoStr) {
  if (!isoStr) return "";
  const diff = new Date(isoStr) - new Date();
  if (diff <= 0) return "Resetting...";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function Gauge({ pct, label, resetsAt }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = getColor(pct);
  const reset = timeUntil(resetsAt);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
    }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dasharray 1s ease-out" }}
        />
        <text x="48" y="44" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">
          {Math.round(pct)}%
        </text>
        <text x="48" y="60" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
          {pct >= 80 ? "Heavy" : pct >= 50 ? "Moderate" : "Light"}
        </text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.8)" }}>
          {label}
        </div>
        {reset && (
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
            {reset}
          </div>
        )}
      </div>
    </div>
  );
}

export const render = ({ output, error }) => {
  if (error) {
    return (
      <div style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 20px",
        color: "#ef4444",
        fontSize: "12px",
      }}>
        Error: {String(error).slice(0, 80)}
      </div>
    );
  }

  let data;
  try {
    data = JSON.parse(output);
  } catch {
    return (
      <div style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 20px",
        color: "rgba(255,255,255,0.5)",
        fontSize: "12px",
      }}>
        Loading...
      </div>
    );
  }

  if (data.error === "no_token") {
    return (
      <div style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 20px",
        color: "rgba(255,255,255,0.5)",
        fontSize: "12px",
      }}>
        Run <span style={{ color: "#fbbf24" }}>claude --login</span> to authenticate
      </div>
    );
  }

  // Collect active windows
  const windows = [];
  for (const [key, meta] of Object.entries(WINDOWS)) {
    const w = data[key];
    if (w && typeof w.utilization === "number") {
      windows.push({ ...meta, pct: w.utilization, resetsAt: w.resets_at });
    }
  }

  const activeWindows = windows.filter(w => w.pct > 0 || w.resetsAt);
  const maxPct = windows.reduce((max, w) => Math.max(max, w.pct), 0);

  return (
    <div style={{
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: getGlow(maxPct),
      padding: "16px 20px",
      minWidth: "180px",
    }}>
      {/* Header */}
      <div style={{
        fontSize: "11px",
        fontWeight: "700",
        color: "rgba(255,255,255,0.5)",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}>
        <div style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: getColor(maxPct),
          boxShadow: `0 0 6px ${getColor(maxPct)}`,
        }} />
        Claude Pro Max
      </div>

      {/* Gauges */}
      {activeWindows.length > 0 ? (
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
        }}>
          {activeWindows.map(w => (
            <Gauge key={w.label} pct={w.pct} label={w.label} resetsAt={w.resetsAt} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "8px 0",
          fontSize: "12px",
          color: "rgba(255,255,255,0.35)",
        }}>
          No active usage
        </div>
      )}
    </div>
  );
};
