# Config File Editing Feature

## ✅ What's Been Added

### 1. Edit Config Files from CLI ✅
```bash
# List config files
dev-port config-list
dev-port configs ~/my-project

# Edit port (auto-backups!)
dev-port config-edit vite.config.js 5173
dev-port edit-config .env 3000

# List backups
dev-port config-backups

# Restore from backup (coming in UI)
dev-port config-restore
```

---

### 2. Auto-Backup Before Changes ✅
Every edit automatically creates a backup:
```
~/.dev-ports/config-backups/
  ├── vite.config.js.2026-03-21T01-30-00.bak
  ├── .env.2026-03-21T01-30-00.bak
  └── package.json.2026-03-21T01-30-00.bak
```

**Safety:**
- ✅ Backup created before every change
- ✅ Timestamped backups
- ✅ Can restore anytime
- ✅ Original file preserved

---

### 3. Supported Config Files ✅

| File Type | Reads | Updates Port | Backups |
|-----------|-------|--------------|---------|
| **package.json** | ✅ | ✅ (port, devPort) | ✅ |
| **.env** | ✅ | ✅ (PORT=) | ✅ |
| **vite.config.js/ts** | ✅ | ✅ (port:) | ✅ |
| **next.config.js** | ✅ | ✅ | ✅ |
| **nuxt.config.js** | ✅ | ✅ | ✅ |
| **angular.json** | ✅ | Read-only | ✅ |

---

## 🚀 Usage Examples

### Example 1: Change Vite Port

**Before:**
```javascript
// vite.config.js
export default {
  server: {
    port: 8091  // Current
  }
}
```

**Edit:**
```bash
# List config files
dev-port config-list
# 📁 Config Files:
#    vite.config.js (port: 8091)

# Update port
dev-port config-edit vite.config.js 5173
# ✅ Updated vite.config.js with port 5173
#    Backup: ~/.dev-ports/config-backups/vite.config.js.2026-03-21T01-30-00.bak
```

**After:**
```javascript
// vite.config.js
export default {
  server: {
    port: 5173  // Updated!
  }
}
```

---

### Example 2: Change .env Port

**Before:**
```env
# .env
PORT=9000
```

**Edit:**
```bash
dev-port config-edit .env 3000
# ✅ Updated .env with port 3000
```

**After:**
```env
# .env
PORT=3000
```

---

### Example 3: Restore from Backup

**List backups:**
```bash
dev-port config-backups
# 💾 Config Backups:
#    1   .env.2026-03-21T01-30-00.bak
#        ~/.dev-ports/config-backups/.env.2026-03-21T01-30-00.bak
#        3/21/2026, 1:30:00 AM
```

**Restore (CLI - coming soon in UI):**
```bash
# Manual restore
cp ~/.dev-ports/config-backups/.env.2026-03-21T01-30-00.bak .env
```

---

## 🎯 Desktop UI Integration (Coming Next)

### Config Editor Tab
```
Project: my-app
─────────────────────────────────────
📁 Config Files Found:

✅ package.json        Port: 3000  [Edit]
✅ .env               Port: 3000  [Edit]
✅ vite.config.js     Port: 5173  [Edit]

─────────────────────────────────────
[Edit Port] Dialog:

Current Port: 3000
New Port: [____]

☑ Create backup before saving

[Save] [Cancel]
```

### Backup Manager
```
💾 Config Backups for my-app
─────────────────────────────────────

1. .env.2026-03-21T01-30-00.bak
   Created: 3/21/2026, 1:30 AM
   [Preview] [Restore]

2. vite.config.js.2026-03-21T01-25-00.bak
   Created: 3/21/2026, 1:25 AM
   [Preview] [Restore]

─────────────────────────────────────
[Restore Selected] [Delete Old Backups]
```

---

## 🛡️ Safety Features

### Before Edit
- ✅ Auto-backup created
- ✅ Backup timestamped
- ✅ Original preserved

### During Edit
- ✅ Atomic write (no partial saves)
- ✅ Error handling
- ✅ Rollback on failure

### After Edit
- ✅ Confirmation message
- ✅ Backup path shown
- ✅ Can restore anytime

---

## 📊 File Structure

```
~/.dev-ports/
├── registry.json              # Global registry
├── settings.json              # Settings
├── config-backups/            # ← NEW!
│   ├── package.json.2026-03-21T01-30-00.bak
│   ├── .env.2026-03-21T01-30-00.bak
│   └── vite.config.js.2026-03-21T01-30-00.bak
└── registry-backups/
    └── registry-backup-2026-03-21T01-00-00.json
```

---

## 💡 Use Cases

### Case 1: Vite Auto-Changed Port
```
Problem:
- Vite detected port 3000 in use
- Auto-started on 5173
- Registry says 3000

Solution:
1. dev-port config-list
2. dev-port config-edit vite.config.js 5173
3. dev-port assign my-app --port 5173
4. ✅ Everything in sync!
```

### Case 2: Team Member Changed Port
```
Problem:
- Teammate changed .env to 4000
- Your registry says 3000
- Conflicts!

Solution:
1. dev-port config-list
2. See .env has PORT=4000
3. dev-port assign my-app --port 4000
4. ✅ Updated to match team
```

### Case 3: Messed Up Config
```
Problem:
- Edited config manually
- Broke the syntax
- App won't start

Solution:
1. dev-port config-backups
2. Find last good backup
3. Restore backup
4. ✅ Fixed!
```

---

## 🔧 Technical Details

### Files Created/Modified

| File | Purpose |
|------|---------|
| `lib/config-editor.js` | ✅ New - Config editing with backup |
| `bin/dev-port.js` | ✅ Enhanced - CLI commands |
| `desktop/main.js` | ✅ Enhanced - IPC handlers |
| `desktop/preload.js` | ✅ Enhanced - APIs |

### New Functions

```javascript
// Backup config file
backupConfigFile(filePath)
→ backupPath

// Read config file
readConfigFile(filePath)
→ { exists, content, parsed, type }

// Update port in config
updateConfigPort(filePath, newPort)
→ { success, message, backup }

// Find all config files
findConfigFiles(projectPath)
→ [{ name, path, type, hasPort, port }]

// List backups
listConfigBackups(projectName)
→ [{ filename, path, timestamp, size }]

// Restore backup
restoreConfigBackup(backupPath, originalPath)
→ { success, message }
```

---

## 🎮 Next Steps (Your Choice!)

### Option A: Desktop UI (Recommended)
Add config editor tab to desktop app:
- List config files
- Edit port with dialog
- Show backups
- Restore button

**Effort:** 4-6 hours  
**Impact:** High - Easy to use

### Option B: NPM Commands (Optional)
Add ability to run npm commands:
- `npm install`
- `npm run dev`
- `npm start`
- With output logging

**Effort:** 2-3 hours  
**Impact:** Medium - Nice to have

### Option C: Both!
Do both features for complete dev workflow management.

**Effort:** 6-8 hours  
**Impact:** Very High - Complete solution

---

## 📝 Notes

### Backup Retention
- Backups stored in `~/.dev-ports/config-backups/`
- No auto-delete (manual cleanup)
- Timestamped for easy identification

### Supported Formats
- JSON files (package.json)
- JS/TS files (vite.config.js)
- ENV files (.env)
- More coming soon

### Limitations
- Some complex configs may need manual edit
- Always review changes
- Backup first for safety

---

## 🐛 Troubleshooting

### "File not found"
```bash
# Check file exists
ls vite.config.js

# Or use full path
dev-port config-edit /full/path/to/vite.config.js 5173
```

### "Permission denied"
```bash
# Check file permissions
# On Windows, run as Administrator if needed
```

### "Backup not found"
```bash
# List all backups
dev-port config-backups

# Backups are in ~/.dev-ports/config-backups/
```

---

**Config editing made safe and easy! 🎉**

Auto-backups + Easy editing = No more config fears!
