# Tools Tab Fix - basePath Missing

## ✅ Issue Fixed

### Problem
Desktop Tools tab showed:
- Path: N/A
- "Please select a project first" error
- Config files and NPM scripts not loading

### Root Cause
Projects were assigned without storing `basePath` in the registry.

### Solution
1. **Auto-detect basePath** from `.project-dev.json` files
2. **Show helpful error** when basePath is missing
3. **Re-assign projects** from their directories

---

## 🔧 How to Fix Your Projects

### Option 1: Re-assign from Project Directory (Recommended)
```bash
# Go to project directory
cd d:\Dev\GitHub\devopstoolkit

# Re-assign (captures basePath automatically)
dev-port assign devopstoolkit
```

### Option 2: Auto-Detect (Already Implemented)
The app now automatically searches for `.project-dev.json` in common locations:
- `~/Projects/<name>/.project-dev.json`
- `~/projects/<name>/.project-dev.json`
- `~/dev/<name>/.project-dev.json`
- `~/src/<name>/.project-dev.json`

---

## 📊 Before vs After

### Before (Broken)
```
📁 Select Project
─────────────────────────────────
devopstoolkit (Port: 9004)

Path: N/A          ❌ Missing!
Port: 9004
Type: node

[🔍 Load Config Files] → "Please select a project first"
[🔍 Load Scripts] → "Please select a project first"
```

### After (Fixed)
```
📁 Select Project
─────────────────────────────────
devopstoolkit (Port: 9000)

Path: d:\Dev\GitHub\devopstoolkit  ✅ Found!
Port: 9000
Type: node

[🔍 Load Config Files] → Shows package.json, .env, etc.
[🔍 Load Scripts] → Shows dev, build, start, etc.
```

---

## 🚀 Quick Fix for All Projects

### Batch Fix Script
```bash
# Windows PowerShell
Get-ChildItem d:\Dev\GitHub -Directory | ForEach-Object {
  if (Test-Path "$($_.FullName)\.project-dev.json") {
    Write-Host "Fixing $($_.Name)..."
    Set-Location $_.FullName
    dev-port assign $_.Name
  }
}

# Or manually for each project
cd d:\Dev\GitHub\Jira
dev-port assign Jira

cd d:\Dev\GitHub\PDF-Architect
dev-port assign PDF-Architect
```

---

## ✅ Verification

### Check Project Info
```bash
dev-port info devopstoolkit

# Should show:
# 📁 Project: devopstoolkit
#    Host:      devopstoolkit.localtest.me
#    Port:      9000
#    Type:      [node]
#    OS:        win32
#    Assigned:  2026-03-21T05:00:00.000Z
```

### Check .project-dev.json
```bash
# Should exist and have basePath
cat d:\Dev\GitHub\devopstoolkit\.project-dev.json

# Output:
{
  "name": "devopstoolkit",
  "host": "devopstoolkit.localtest.me",
  "port": 9000,
  "url": "http://devopstoolkit.localtest.me:9000",
  "projectType": "node",
  "os": "win32",
  "basePath": "d:\\Dev\\GitHub\\devopstoolkit"  ✅
}
```

### Test Desktop Tools Tab
```bash
# Start desktop app
npm start

# Click Tools tab
# Select devopstoolkit
# Click "🔍 Load Config Files"
# Should show config files! ✅

# Click "🔍 Load Scripts"
# Should show NPM scripts! ✅
```

---

## 🎯 What's Fixed in Code

### lib/project.js
```javascript
// getAllProjects() now:
// 1. Reads registry
// 2. For each project without basePath:
//    - Searches common locations
//    - Reads .project-dev.json
//    - Updates registry with basePath
// 3. Returns projects with basePath
```

### desktop/renderer/renderer.js
```javascript
// loadConfigFiles() and loadNpmScripts() now:
// 1. Check if basePath exists
// 2. If missing, show helpful error:
//    "⚠️ Project basePath is missing. 
//     Please re-assign the project from its directory:
//     cd <project-name> && dev-port assign <project-name>"
// 3. If exists, load files/scripts normally
```

---

## 📝 Prevention

### Always Assign from Project Directory
```bash
# ✅ Correct
cd /path/to/project
dev-port assign my-project

# ❌ Wrong (basePath won't be captured)
dev-port assign my-project
```

### Or Specify basePath Explicitly
```bash
dev-port assign my-project --basePath /path/to/project
```

---

## 🐛 Still Not Working?

### Check Registry
```bash
# View registry
dev-port registry

# Open folder
explorer C:\Users\sshaikh\.dev-ports

# Edit registry.json manually if needed
```

### Check .project-dev.json
```bash
# Should exist in project root
ls .project-dev.json

# Should have basePath
cat .project-dev.json
```

### Restart Desktop App
```bash
# Close and reopen
npm start
```

---

**Tools tab now works correctly! 🎉**

Config files and NPM scripts will load once projects have basePath set.
