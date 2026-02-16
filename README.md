# Claude Pro Max Usage Widget

A macOS desktop widget that shows your Claude Pro Max subscription utilization in real-time.

![widget](screenshot.png)

## What it shows

- **5-Hour** rolling session utilization
- **7-Day** weekly rolling utilization
- **Opus / Sonnet** model-specific limits (when active)
- Countdown to reset times
- Color-coded status: green (<50%) / amber (50-80%) / red (>80%)

Auto-refreshes every 60 seconds.

## Prerequisites

- macOS
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated (`claude --login`)
- [Übersicht](https://tracesof.net/uebersicht/) (free macOS widget engine)

## Install

### 1. Install Übersicht

```bash
brew install --cask ubersicht
```

Or download from [tracesof.net/uebersicht](https://tracesof.net/uebersicht/).

### 2. Install the widget

```bash
cp claude-usage.jsx "$HOME/Library/Application Support/Übersicht/widgets/"
```

Or manually copy `claude-usage.jsx` into your Übersicht widgets folder:
`~/Library/Application Support/Übersicht/widgets/`

### 3. Launch Übersicht

Open Übersicht from Applications. The widget appears in the bottom-right corner of your desktop.

## One-liner install

```bash
brew install --cask ubersicht && \
curl -fsSL https://raw.githubusercontent.com/ttar-p/claude-usage-widget/main/claude-usage.jsx \
  -o "$HOME/Library/Application Support/Übersicht/widgets/claude-usage.jsx" && \
open -a "Übersicht"
```

## How it works

The widget reads your Claude Code OAuth token from the macOS Keychain and calls the same usage API that claude.ai's settings page uses. No API keys to configure — if you're logged into Claude Code, it just works.

```
macOS Keychain → OAuth token → api.anthropic.com/api/oauth/usage → Desktop widget
```

## Customization

Edit the widget file to change:

- **Position**: Modify `bottom` / `right` in `className` (e.g., `top: 20px; left: 20px;`)
- **Refresh rate**: Change `refreshFrequency` (milliseconds)
- **Colors**: Edit `getColor()` thresholds

## Troubleshooting

**Widget not showing?**
- Grant Übersicht permissions: System Settings → Privacy & Security → Accessibility
- Right-click Übersicht menu bar icon → Refresh All Widgets

**"Run claude --login to authenticate"?**
- Open a terminal and run `claude --login` to authenticate Claude Code

**Token expired?**
- Open Claude Code (`claude` in terminal) — it auto-refreshes the OAuth token

## License

MIT
