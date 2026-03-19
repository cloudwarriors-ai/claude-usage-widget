# Claude Usage Widget

A macOS desktop widget that shows your Claude subscription usage in real-time. Works with Pro, Teams, and Enterprise accounts.

![widget](screenshot.png)

## What it shows

- **5-Hour** rolling session utilization
- **7-Day** weekly rolling utilization
- **Opus / Sonnet** model-specific limits (when active)
- Countdown to next reset
- Color-coded: green (<50%) / amber (50-80%) / red (>80%)

Auto-refreshes every 60 seconds. Only active gauges are shown — inactive windows are hidden automatically.

## Quick install

**Prerequisites:** macOS, [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and logged in.

```bash
# 1. Install Übersicht (free desktop widget engine)
brew install --cask ubersicht

# 2. Download the widget
curl -fsSL https://raw.githubusercontent.com/cloudwarriors-ai/claude-usage-widget/main/claude-usage.jsx \
  -o "$HOME/Library/Application Support/Übersicht/widgets/claude-usage.jsx"

# 3. Launch
open -a "Übersicht"
```

That's it. If you're logged into Claude Code, the widget picks up your token automatically.

## Manual install

1. Install [Übersicht](https://tracesof.net/uebersicht/) (or `brew install --cask ubersicht`)
2. Copy `claude-usage.jsx` into `~/Library/Application Support/Übersicht/widgets/`
3. Open Übersicht — widget appears in the bottom-right corner

## How it works

```
macOS Keychain → Claude Code OAuth token → Anthropic usage API → Desktop gauges
```

No API keys to configure. The widget reads the same OAuth token that Claude Code stores in your macOS Keychain and calls the usage endpoint that claude.ai uses internally.

## Customization

Edit `claude-usage.jsx` (or the copy in your widgets folder) to change:

| Setting | Where | Default |
|---------|-------|---------|
| Position | `className` → `bottom` / `right` | Bottom-right (20px) |
| Refresh rate | `refreshFrequency` | 60000ms (1 min) |
| Color thresholds | `getColor()` | Green <50%, Amber <80%, Red >=80% |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Widget not showing | System Settings → Privacy & Security → Accessibility → enable Übersicht |
| "Run claude --login" | Open terminal, run `claude --login` |
| Token expired | Open Claude Code in terminal — it auto-refreshes the token |
| Stale data | Right-click Übersicht menu bar icon → Refresh All Widgets |

## License

MIT
