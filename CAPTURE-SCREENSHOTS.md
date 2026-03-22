# Screenshot Capture Script

Run these commands to capture all screenshots needed for README and release.

---

## 📸 Quick Screenshot Session (15 Minutes)

### Step 1: Open Terminal with Dark Theme

**Windows Terminal (Recommended):**
- Press `Win + ` ` (backtick) to open
- Use dark theme
- Set font size to 14-16px
- Window size: 120x40

### Step 2: Run Commands for Screenshots

**Screenshot 1: CLI Status**
```bash
node bin/dev-port.js status
```
Capture the output showing project status table.

**Screenshot 2: CLI List**
```bash
node bin/dev-port.js list
```
Capture the full list of registered projects.

**Screenshot 3: CLI Help**
```bash
node bin/dev-port.js --help
```
Capture the command list.

**Screenshot 4: Running Processes**
```bash
node bin/dev-port.js ps
```
Show running processes (start something first if needed).

**Screenshot 5: Web Dashboard**
```bash
node bin/dev-port.js dashboard
```
Then open browser to http://localhost:4000 and capture the web UI.

---

## 🎨 Screenshot Tips

### Composition
- **Terminal:** Dark background, light text
- **Window size:** 1200x800 minimum
- **Font:** Consolas, Fira Code, or Cascadia Code (14-16px)
- **Padding:** Leave some margin around output

### Tools
- **Windows:** Win + Shift + S (Snip & Sketch)
- **macOS:** Cmd + Shift + 4
- **Linux:** Flameshot or Print Screen

### Save Location
Save all screenshots to: `screenshots/`

```
screenshots/
├── cli-status.png
├── cli-list.png
├── cli-help.png
├── cli-ps.png
└── web-dashboard.png
```

---

## 📋 Alternative: Automated Screenshots

Run this script to generate text output for screenshots:

```bash
# Create screenshots directory
mkdir screenshots

# Generate output files (can be screenshotted)
node bin/dev-port.js status > screenshots/cli-status.txt
node bin/dev-port.js list > screenshots/cli-list.txt
node bin/dev-port.js --help > screenshots/cli-help.txt
node bin/dev-port.js ps > screenshots/cli-ps.txt

echo "✅ Output files generated in screenshots/"
echo "Now open each .txt file and screenshot it with nice formatting"
```

---

## 🖼️ Adding to README

After capturing screenshots, add to README.md:

```markdown
## 🖥️ Interface Preview

### CLI

![CLI Status](screenshots/cli-status.png)
*Quick overview of your dev environment*

![CLI List](screenshots/cli-list.png)
*All your projects at a glance*

### Web Dashboard

![Web Dashboard](screenshots/web-dashboard.png)
*Visual project management*
```

---

## ✅ Screenshot Checklist

Before adding to README/release:

- [ ] All screenshots are PNG format
- [ ] Text is readable at 100% zoom
- [ ] Consistent theme (all dark mode)
- [ ] Files optimized (<500KB each)
- [ ] Named according to convention
- [ ] Saved in `screenshots/` directory
- [ ] Added to README with proper markdown
- [ ] Alt text describes what's shown

---

**Ready? Let's capture! 📸**
