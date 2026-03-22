# Screenshot Guide for Dev Port Manager

This guide helps you capture professional screenshots for the README and GitHub release.

---

## 📸 Required Screenshots (5 Total)

### 1. CLI - Status Command
**What to capture:** `dpm status` output showing system overview

**Steps:**
```bash
# Open terminal (dark theme preferred)
dpm status
```

**Expected output:**
```
=== Dev Port Manager Status ===

Registry: /home/user/.dpm/registry.json
Total projects: 3
Port range: 9000–9999
Used ports: 3
Available ports: 997

Hosts file: /etc/hosts
Synced: Yes
```

**Tips:**
- Use a clean terminal with dark background
- Ensure font is readable (14-16px)
- Terminal window should be 800x600 minimum
- Crop to show only relevant output

---

### 2. CLI - List Command
**What to capture:** `dpm list` showing registered projects

**Steps:**
```bash
dpm list
```

**Expected output:**
```
=== Registered Projects ===

  #  Name                    Port   Host                              Type    URL
  ─────────────────────────────────────────────────────────────────────────────────────
  1  my-app                  9100   my-app.localtest.me              node    http://...
  2  client-dashboard        9101   client-dashboard.localtest.me    maven   http://...
  3  api-service             9102   api-service.localtest.me         node    http://...

Total: 3 projects
```

**Tips:**
- Have at least 2-3 projects registered
- Show the table format clearly
- Include the summary line at bottom

---

### 3. CLI - Running Processes
**What to capture:** `dpm ps` showing active processes

**Steps:**
```bash
# Start a project first
dpm start my-app

# In another terminal
dpm ps
```

**Expected output:**
```
📊 Running Processes:

   ● my-app                   :9100 (node)
   ● api-service              :9102 (java)

   Total: 2 process(es) running
```

**Tips:**
- Actually have something running
- Show the green status indicator
- Include process type in parentheses

---

### 4. Web Dashboard
**What to capture:** Web UI at localhost:4000

**Steps:**
```bash
dpm dashboard
```

Then open browser to: `http://localhost:4000`

**What to capture:**
- Main projects list view
- Show at least 3-4 projects
- Include the header with "Dev Port Manager"
- Show status indicators (running/stopped)
- Browser window at 1200x800

**Tips:**
- Use Chrome/Firefox dev tools device mode off
- Ensure good contrast
- Show the URL bar with localhost:4000
- Dark mode if available looks more professional

**Alternative if no projects:**
- Show the empty state with "No projects registered"
- Show the "Scan Directory" button

---

### 5. Desktop App
**What to capture:** Electron desktop app main window

**Steps:**
```bash
# If already built
npm start

# Or run the built executable from dist/ folder
```

**What to capture:**
- Full app window
- Show menu bar
- Show project list
- Include window controls (minimize, maximize, close)
- App window at 1000x700

**Tips:**
- Show the app icon in title bar
- Include some UI elements (buttons, lists)
- Dark theme if available
- Show it's a native app (window decorations visible)

---

## 🎨 Screenshot Best Practices

### Technical Specs
- **Format:** PNG (lossless, supports transparency)
- **Resolution:** Minimum 800x600, ideally 1200x800
- **Color:** Full color (24-bit)
- **File size:** Keep under 500KB each (optimize with TinyPNG)

### Visual Style
- **Consistent theme:** All dark or all light mode
- **Clean background:** No desktop clutter visible
- **Readable fonts:** Minimum 14px in final image
- **Good contrast:** Text should be clearly legible
- **Crop tightly:** Remove unnecessary window chrome

### Naming Convention
```
screenshots/
├── cli-status.png
├── cli-list.png
├── cli-ps.png
├── web-dashboard.png
└── desktop-app.png
```

---

## 🛠️ Tools for Capturing & Editing

### Windows
- **Built-in:** Win + Shift + S (Snip & Sketch)
- **Advanced:** ShareX (free), Snagit (paid)
- **Optimization:** TinyPNG.com

### macOS
- **Built-in:** Cmd + Shift + 4
- **Advanced:** CleanShot X, Monosnap
- **Optimization:** ImageOptim

### Linux
- **Built-in:** Print Screen or Flameshot
- **Advanced:** Flameshot (recommended)
- **Optimization:** pngquant

### Browser Screenshots
- **Chrome DevTools:** Ctrl+Shift+P → "Screenshot"
- **Firefox:** Right-click → "Take Screenshot"

---

## 📝 Creating GIFs (Optional but Awesome!)

### For Quick Demos (5-10 seconds)

**Example: Show assign command workflow**

1. Record terminal session:
   ```bash
   # Use terminal recorder or screen recording
   # macOS: Cmd+Shift+5
   # Windows: Win+Alt+R (Xbox Game Bar)
   # Linux: SimpleScreenRecorder
   ```

2. Convert to GIF:
   - **Online:** ezgif.com
   - **Desktop:** LICEcap, ScreenToGif
   - **CLI:** ffmpeg + gifsicle

3. Optimize:
   - Max 640x480 for GIFs
   - 10-15 FPS is enough
   - Keep under 2MB

**Example GIFs to create:**
- `assign-workflow.gif` - Full project assignment flow
- `start-stop.gif` - Start and stop a project
- `dashboard-demo.gif` - Quick web dashboard tour

---

## ✅ Screenshot Checklist

Before adding to README:

- [ ] All screenshots are PNG format
- [ ] Text is readable at 100% zoom
- [ ] Consistent theme across all images
- [ ] Files are optimized (<500KB each)
- [ ] Named according to convention
- [ ] Placed in `screenshots/` directory
- [ ] Added to README with proper markdown
- [ ] Alt text describes what's shown
- [ ] Captions explain context (if needed)

---

## 📋 Quick Capture Session (30 Minutes)

**Minute 0-5:** Setup
- Open terminal (dark theme)
- Open browser (clean profile, no bookmarks bar)
- Close unnecessary apps

**Minute 5-15:** CLI Screenshots
```bash
dpm status      # Screenshot 1
dpm list        # Screenshot 2
dpm ps          # Screenshot 3
```

**Minute 15-20:** Web Dashboard
```bash
dpm dashboard   # Then screenshot browser
```

**Minute 20-30:** Desktop App
```bash
npm start       # Then screenshot app window
```

**Done!** ✅

---

## 🎯 Where to Use Screenshots

### README.md
Add in this order:
1. Hero image (optional logo)
2. CLI status (after features section)
3. Web dashboard (before installation)
4. Desktop app (in desktop app section)

### GitHub Release
- Include 2-3 best screenshots in release notes
- Link to full gallery

### Social Media
- Square crops for Twitter/LinkedIn
- Vertical for Instagram
- Add annotations with arrows/text

---

## 📸 Example README Integration

```markdown
## 🖥️ CLI Interface

Clean, colorful output that's easy to read:

![CLI Status](screenshots/cli-status.png)
*Quick overview of your dev environment*

![CLI List](screenshots/cli-list.png)
*All your projects at a glance*
```

---

**Ready to capture? Let's make this look professional! 📸**
