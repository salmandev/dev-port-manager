# Quick Fixes - Port & Registry Issues

## ✅ Issues Fixed

### 1. Web Dashboard Not Working ✅
**Problem:** http://localhost:4000 not working

**Solution:**
```bash
# Start the web server
npm run server

# Then access:
http://localhost:4000
http://dev-port-manager.localtest.me:4000
```

**Where port is set:**
- File: `server.js` line 29
- Code: `const PORT = process.env.PORT || 4000;`
- Default: **4000**

**To change port:**
```bash
# Option 1: Environment variable
set PORT=3000 & npm run server

# Option 2: Edit server.js
const PORT = process.env.PORT || 3000;
```

---

### 2. REGISTRY_DIR Not Defined ✅
**Problem:** "Open registry folder broken :: REGISTRY_DIR not defined"

**Solution:** Fixed in `lib/project.js`

**What was wrong:**
- `REGISTRY_DIR` wasn't being exported from `lib/project.js`
- Desktop app couldn't access registry directory path

**What was fixed:**
```javascript
// lib/project.js - Line 521
module.exports = {
  // ... other exports
  REGISTRY_DIR,
  REGISTRY_FILE
};
```

---

## 🚀 Quick Start

### Start Everything
```bash
# 1. Start web dashboard (Port 4000)
npm run server

# 2. Start desktop app
npm start

# 3. Use CLI
dev-port list
```

### Access Points
| Interface | URL/Command | Port |
|-----------|-------------|------|
| Web Dashboard | http://localhost:4000 | 4000 |
| localtest.me | http://dev-port-manager.localtest.me:4000 | 4000 |
| Desktop App | `npm start` | N/A |
| CLI | `dev-port list` | N/A |

---

## 🔧 Port Configuration

### Web Dashboard Port (4000)
**File:** `server.js`
```javascript
const PORT = process.env.PORT || 4000;
```

**Change it:**
```bash
# Temporary
set PORT=8080 && npm run server

# Permanent (edit server.js)
const PORT = process.env.PORT || 8080;
```

### Project Ports (9000-9999)
**File:** `lib/settings.js`
```javascript
portRange: [9000, 9999]
```

**Change it:**
```bash
dev-port set portRange [8000,8999]
```

---

## 📁 Registry Location

**Default:** `~/.dev-ports/registry.json`

**Windows:** `C:\Users\sshaikh\.dev-ports\registry.json`  
**macOS:** `~/.dev-ports/registry.json`  
**Linux:** `~/.dev-ports/registry.json`

**View registry:**
```bash
dev-port registry
```

**Open registry folder:**
```bash
# Windows
explorer C:\Users\sshaikh\.dev-ports

# macOS
open ~/.dev-ports

# Linux
xdg-open ~/.dev-ports
```

---

## 🐛 Troubleshooting

### "Port 4000 already in use"
```bash
# Check what's using port 4000
netstat -ano | findstr :4000

# Kill the process
taskkill /F /PID <PID>

# Or use different port
set PORT=3000 & npm run server
```

### "Cannot connect to localhost:4000"
```bash
# Check if server is running
netstat -ano | findstr :4000

# Should show LISTENING state
# If not, start server:
npm run server
```

### "REGISTRY_DIR not defined"
```bash
# Fixed! Just restart the app
npm start

# Or rebuild
npm install
```

### "localtest.me not working"
```bash
# Test DNS resolution
ping dev-port-manager.localtest.me

# Should resolve to 127.0.0.1
# If not, use localhost instead:
http://localhost:4000
```

---

## 📊 Port Map

| Port | Used By | Configurable |
|------|---------|--------------|
| **4000** | Web Dashboard | ✅ Yes (server.js) |
| **9000-9999** | Projects | ✅ Yes (settings) |
| **3000** | React apps | ⚠️ Per project |
| **5173** | Vite apps | ⚠️ Per project |
| **8080** | Java/Node | ⚠️ Per project |

---

## ✅ Verification

### Check Server is Running
```bash
# Should show LISTENING on port 4000
netstat -ano | findstr :4000

# Output should include:
# TCP    0.0.0.0:4000    0.0.0.0:0    LISTENING    <PID>
```

### Check Registry
```bash
# Should show registry path
dev-port registry

# Output:
# 📁 Registry file:
#    C:\Users\sshaikh\.dev-ports\registry.json
```

### Test Web Dashboard
```bash
# Should return success
curl http://localhost:4000/api/system

# Output:
# {"success":true,"system":{...}}
```

---

## 🎯 Quick Commands

```bash
# Start web dashboard
npm run server

# Check what's running on port 4000
netstat -ano | findstr :4000

# Kill process on port 4000
dev-port kill 4000

# View registry location
dev-port registry

# Open registry folder (Windows)
explorer C:\Users\sshaikh\.dev-ports

# Change web dashboard port
set PORT=3000 && npm run server
```

---

**All issues fixed! 🎉**

- ✅ Web dashboard runs on port 4000
- ✅ REGISTRY_DIR export fixed
- ✅ Registry folder accessible
- ✅ localtest.me working
