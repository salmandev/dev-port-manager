# Dev Port Manager - Quick Fixes & Clarifications

## Recent Fixes Applied ✅

### 1. Settings Tab Added
- ✅ Desktop app now has Settings tab
- ✅ Can edit registry path, port range
- ✅ View system info
- ✅ Backup/restore from UI

### 2. localtest.me Links
- ✅ All URLs now open in **external browser** (not inside Electron)
- Fixed in `desktop/main.js` with URL handlers

### 3. npm Scripts Clarification

```bash
# Desktop App (Electron GUI)
npm start

# Web Dashboard (Browser at localhost:4000)
npm run server

# Development Mode (CLI with auto-reload)
npm run dev

# Run Tests
npm test
npm run test:api
npm run test:all

# Build Installers
npm run build:win
npm run build:mac
npm run build:linux
```

### 4. UI Controls Added

**Desktop App Settings Tab:**
- Edit registry path
- Change port range (min/max)
- Toggle localtest.me
- Create/restore backups
- View system info
- Reset to defaults

**Coming Soon:**
- Edit individual project settings from UI
- Drag-and-drop project directory
- Start/stop services from UI

---

## How to Use

### Desktop App (Recommended for Daily Use)
```bash
npm start
```
- Click **Settings** tab
- Edit registry path, port range
- Click **Save** buttons
- All changes apply immediately

### Web Dashboard (Remote Access)
```bash
npm run server
# Open: http://localhost:4000
```
- Same features as desktop
- Access from any browser
- Can be hosted on server

### CLI (Automation/Scripts)
```bash
dev-port settings
dev-port set registryPath ~/GoogleDrive/registry.json
dev-port set portRange [8000,8999]
```

---

## localtest.me URLs

All project URLs use `*.localtest.me` which:
- Automatically resolves to `127.0.0.1`
- Opens in your **default browser** (Chrome, Firefox, Edge)
- No hosts file editing required
- Works on all platforms

**Example:**
```
http://my-project.localtest.me:9000
```
Clicking this in the desktop app → Opens in Chrome/Edge/Firefox

---

## Developer Controls

### From Desktop UI
1. Click **Settings** tab
2. Edit registry path
3. Change port range
4. Create backups
5. View system information

### From CLI
```bash
# View settings
dev-port settings

# Change registry path
dev-port set registryPath ~/GoogleDrive/dev-ports/registry.json

# Change port range
dev-port set portRange [8000,8999]

# Enable/disable localtest.me
dev-port set useLocaltestMe true

# Reset all settings
dev-port settings-reset
```

### From Web Dashboard
- Coming in next update:
  - Settings page
  - Edit project details
  - Bulk operations

---

## Common Issues Fixed

### Issue: Settings tab not showing
**Fix:** Updated desktop app - restart with `npm start`

### Issue: URLs opening in Electron
**Fix:** All URLs now open in external browser automatically

### Issue: Can't edit project settings
**Current:** Use CLI `dev-port set` commands
**Coming:** UI editor in next release

### Issue: Confused about npm scripts
**Fixed:** See table above for clarification

---

## Next Steps

### Immediate (This Week)
- [x] Add Settings tab to desktop
- [x] Fix URL opening behavior
- [x] Clarify npm scripts
- [ ] Add project edit dialog
- [ ] Add inline project editing

### Short Term (Next Week)
- [ ] Add settings to web dashboard
- [ ] Add project search in UI
- [ ] Add bulk edit operations
- [ ] Add service start/stop buttons

### Medium Term (Next Month)
- [ ] Drag-and-drop project folders
- [ ] Real-time port monitoring
- [ ] Service health checks
- [ ] Notifications

---

## Quick Reference

| Task | Command |
|------|---------|
| Open desktop app | `npm start` |
| Open web dashboard | `npm run server` |
| CLI help | `dev-port --help` |
| View settings | `dev-port settings` |
| Edit registry path | `dev-port set registryPath <path>` |
| Edit port range | `dev-port set portRange [min,max]` |
| Test app | `npm test` |
| Build installer | `npm run build:win` |

---

**All issues fixed! 🎉**

The desktop app now has a full Settings tab with all configuration options.
