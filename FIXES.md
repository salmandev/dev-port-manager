# Dev Port Manager - Fixes Applied

## Electron Issues Fixed

### 1. URLs Opening in Electron Instead of External Browser ✅

**Problem:** Clicking project URLs tried to open them inside Electron window, causing ERR_CONNECTION_REFUSED errors.

**Fix:** Added URL handlers in `desktop/main.js` to open all external URLs in the default browser:

```javascript
const { shell } = require('electron');

// In createWindow():
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url);
  return { action: 'deny' };
});

mainWindow.webContents.on('will-navigate', (event, url) => {
  if (url.startsWith('file://')) return;
  event.preventDefault();
  shell.openExternal(url);
});
```

**Result:** All http/https URLs now open in your default browser (Chrome, Firefox, Edge, etc.)

---

### 2. IPC Handler Cloning Errors ✅

**Problem:** `Error: An object could not be cloned` in scan-directory and sync-hosts handlers.

**Fix:** Made all IPC handlers return only JSON-serializable data:

#### scan-directory handler:
```javascript
ipcMain.handle('scan-directory', async (event, baseDir, dryRun) => {
  const result = await scanDirectory(baseDir, { dryRun });
  return {
    success: true,
    result: {
      results: (result.results || []).map(r => ({
        name: r.name || '',
        type: r.type || 'unknown',
        status: r.status || '',
        host: r.host || '',
        port: r.port || 0,
        url: r.url || ''
      })),
      skipped: result.skipped || [],
      errors: result.errors || []
    }
  };
});
```

#### sync-hosts handler:
```javascript
ipcMain.handle('sync-hosts', async () => {
  const result = await syncHosts({ useHostsFile: false });
  return { 
    success: result.success, 
    result: {
      message: result.message,
      hostsFile: result.hostsFile || ''
    }
  };
});
```

**Result:** No more cloning errors, all IPC calls work correctly.

---

### 3. get-projects Handler ✅

**Fix:** Made async and ensured serializable output:

```javascript
ipcMain.handle('get-projects', async () => {
  const projects = getAllProjects();
  return { 
    success: true, 
    projects: projects.map(p => ({
      name: p.name,
      host: p.host || '',
      port: p.port || 0,
      url: p.url || '',
      projectType: p.projectType || 'unknown',
      os: p.os || 'unknown',
      assignedAt: p.assignedAt || '',
      basePath: p.basePath || ''
    }))
  };
});
```

---

## Web Dashboard (localhost:4000)

### How It Works

The web dashboard runs separately from Electron at **http://localhost:4000**

**Start the web server:**
```bash
npm run server
```

**Access points:**
- Main Dashboard: http://localhost:4000
- Live Status: http://localhost:4000/status
- API: http://localhost:4000/api/*

### localtest.me URLs

Projects use `*.localtest.me` domains which automatically resolve to 127.0.0.1:

```
http://dev-port-manager.localtest.me:9000
```

**This should open in your default browser**, not in Electron. The localtest.me domain is a wildcard DNS service that resolves all subdomains to 127.0.0.1.

**Note:** If a project URL doesn't open, it means no server is running on that port. The URL is valid, but the application needs to be started on that port.

---

## Testing

### Run All Tests
```bash
npm test              # Unit tests (21 tests)
npm run test:api      # API tests (5 tests)
npm run test:all      # All tests
```

### Test Electron App
```bash
npm start
```

Then:
1. Click "Assign Project"
2. Fill in project name
3. Click "Assign"
4. Click the URL link → Should open in **external browser**

### Test Web Dashboard
```bash
npm run server
```

Then open:
- http://localhost:4000 (dashboard)
- http://localhost:4000/status (live status, auto-refreshes)

---

## Files Modified

| File | Changes |
|------|---------|
| `desktop/main.js` | Added shell import, URL handlers, fixed IPC handlers |
| `desktop/preload.js` | No changes needed |
| `desktop/renderer/renderer.js` | No changes needed |
| `server.js` | Added /status route |
| `public/status.html` | New live status page |

---

## Current Status

✅ All Electron URL opening fixed
✅ All IPC cloning errors fixed
✅ All tests passing (26/26)
✅ Web dashboard working at localhost:4000
✅ Live status page working
✅ localtest.me URLs open in external browser

---

## Quick Start Guide

### For Development
```bash
# Terminal 1: Web dashboard
npm run server

# Terminal 2: Desktop app
npm start

# Terminal 3: CLI
dev-port list
```

### Access Points
- **Desktop App:** `npm start`
- **Web Dashboard:** http://localhost:4000
- **Live Status:** http://localhost:4000/status
- **CLI:** `dev-port <command>`

All URLs from the desktop app now open in your default browser!
