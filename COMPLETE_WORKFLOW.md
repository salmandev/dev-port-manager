# Complete Dev Workflow - Config Editing + NPM Commands

## ✅ What's Been Implemented

### 1. Config File Editing (CLI + Desktop APIs) ✅
```bash
# List config files
dev-port config-list
dev-port configs ~/my-project

# Edit port (AUTO-BACKUPS!)
dev-port config-edit vite.config.js 5173
dev-port edit-config .env 3000

# List backups
dev-port config-backups
```

### 2. NPM Command Execution (CLI + Desktop APIs) ✅
```bash
# Run npm command
dev-port npm-run          # Runs 'npm run dev' by default
dev-port npm-run build    # Runs 'npm run build'
dev-port npm install      # Runs 'npm install'

# List available scripts
dev-port npm-scripts
dev-port scripts ~/my-project
```

### 3. Desktop App Integration (APIs Ready) ✅
All functions exposed to desktop UI:
- `findConfigFiles()` - List config files
- `readConfigFile()` - Read config
- `updateConfigPort()` - Edit port with backup
- `listConfigBackups()` - View backups
- `detectNpmScripts()` - List npm scripts
- `runNpmCommand()` - Execute npm command
- `killProcess()` - Stop running process
- `getRunningProcesses()` - View active processes

---

## 🚀 Usage Examples

### Example 1: Change Vite Port from 8091 to 5173

**CLI:**
```bash
# 1. List config files
dev-port config-list
# 📁 Config Files:
#    vite.config.js (port: 8091)

# 2. Edit port (auto-backups!)
dev-port config-edit vite.config.js 5173
# ✅ Updated vite.config.js with port 5173
#    Backup: ~/.dev-ports/config-backups/vite.config.js.2026-03-21T02-00-00.bak

# 3. Update registry
dev-port assign my-app --port 5173
```

**Desktop (Coming in UI update):**
```
1. Select project → Tools tab
2. Click "Config Files"
3. Find vite.config.js → [Edit]
4. Change port: 8091 → 5173
5. ☑ Create backup
6. [Save]
```

---

### Example 2: Start Dev Server

**CLI:**
```bash
# Go to project directory
cd ~/my-project

# Run dev server
dev-port npm-run
# 🚀 Running: npm run dev
#    in /home/user/my-project
# 
# [VITE] dev server running on http://localhost:5173

# Or run specific command
dev-port npm-run build
```

**Desktop (Coming in UI update):**
```
1. Select project → Tools tab
2. Click "NPM Scripts"
3. Find "dev" → [Run]
4. Terminal output shows in app
5. [Stop] button appears when running
```

---

### Example 3: Full Workflow

**Scenario:** Set up new project from scratch

```bash
# 1. Scan and assign
dev-port scan ~/projects/my-app
# ✅ Assigned my-app → port 9001

# 2. Check config files
dev-port config-list ~/projects/my-app
# 📁 Config Files:
#    package.json
#    .env (port: 9001)

# 3. Install dependencies
dev-port npm-run ~/projects/my-app install
# 🚀 Running: npm install
# ✅ Command completed successfully

# 4. Edit config to match registry
dev-port config-edit ~/projects/my-app/.env 9001
# ✅ Updated .env with port 9001

# 5. Start dev server
dev-port npm-run ~/projects/my-app dev
# 🚀 Running: npm run dev
# [VITE] dev server running on http://localhost:9001
```

---

## 📊 Features Comparison

| Feature | CLI | Desktop APIs | Desktop UI |
|---------|-----|--------------|------------|
| **List Config Files** | ✅ | ✅ | Coming |
| **Edit Config Port** | ✅ | ✅ | Coming |
| **List Backups** | ✅ | ✅ | Coming |
| **Restore Backup** | Manual | ✅ | Coming |
| **List NPM Scripts** | ✅ | ✅ | Coming |
| **Run NPM Command** | ✅ | ✅ | Coming |
| **Terminal Output** | Console | Callback | Coming |
| **Kill Process** | ✅ | ✅ | Coming |

---

## 🛡️ Safety Features

### Config Editing
- ✅ Auto-backup before every change
- ✅ Timestamped backups
- ✅ Can restore anytime
- ✅ Atomic writes (no partial saves)
- ✅ Error handling with rollback

### NPM Commands
- ✅ Process tracking
- ✅ Can kill runaway processes
- ✅ Exit code reporting
- ✅ Output streaming
- ✅ Error handling

---

## 🎯 Desktop UI Implementation Guide

### Tools Tab Structure

```html
<div class="tools-tab">
  <!-- Config Files Section -->
  <section class="config-section">
    <h3>📁 Config Files</h3>
    <div class="config-list" id="config-list">
      <!-- Populated by findConfigFiles() -->
    </div>
  </section>
  
  <!-- NPM Scripts Section -->
  <section class="npm-section">
    <h3>📜 NPM Scripts</h3>
    <div class="script-list" id="script-list">
      <!-- Populated by detectNpmScripts() -->
    </div>
  </section>
  
  <!-- Terminal Output -->
  <section class="terminal-section">
    <h3>💻 Terminal</h3>
    <div class="terminal-output" id="terminal-output">
      <!-- Output from runNpmCommand() -->
    </div>
  </section>
</div>
```

### JavaScript Implementation

```javascript
// Load config files
async function loadConfigFiles() {
  const project = getCurrentProject();
  const result = await window.devPortAPI.findConfigFiles(project.basePath);
  
  const list = document.getElementById('config-list');
  list.innerHTML = result.files.map(f => `
    <div class="config-item">
      <div>
        <div class="config-name">${f.name}${f.hasPort ? ` (port: ${f.port})` : ''}</div>
        <div class="config-path">${f.path}</div>
      </div>
      <div class="config-actions">
        <button onclick="editConfig('${f.path}', ${f.port})">Edit</button>
      </div>
    </div>
  `).join('');
}

// Edit config port
async function editConfig(filePath, currentPort) {
  const newPort = prompt('New port:', currentPort);
  if (!newPort) return;
  
  const result = await window.devPortAPI.updateConfigPort(filePath, parseInt(newPort));
  if (result.success) {
    showToast(`✅ ${result.message}`, 'success');
    if (result.backup) {
      showToast(`Backup: ${result.backup}`, 'info');
    }
  } else {
    showToast(`❌ ${result.error}`, 'error');
  }
}

// Load npm scripts
async function loadNpmScripts() {
  const project = getCurrentProject();
  const result = await window.devPortAPI.detectNpmScripts(project.basePath);
  
  const list = document.getElementById('script-list');
  list.innerHTML = result.scripts.map(s => `
    <div class="script-item">
      <div>
        <div class="script-name">${s.name}${s.isCommon ? ' ⭐' : ''}</div>
        <div class="script-command">${s.command}</div>
      </div>
      <button onclick="runNpmScript('${s.name}')">Run</button>
    </div>
  `).join('');
}

// Run npm script
async function runNpmScript(scriptName) {
  const project = getCurrentProject();
  const terminal = document.getElementById('terminal-output');
  
  terminal.innerHTML += `<div class="info">🚀 Running: npm run ${scriptName}</div>`;
  
  await window.devPortAPI.runNpmCommand(
    project.basePath,
    `npm run ${scriptName}`,
    (type, output) => {
      terminal.innerHTML += `<div class="${type}">${output}</div>`;
      terminal.scrollTop = terminal.scrollHeight;
    }
  );
  
  terminal.innerHTML += `<div class="info">✅ Completed</div>`;
}
```

---

## 📝 API Reference

### Config Editor API

```javascript
// Find all config files for project
window.devPortAPI.findConfigFiles(projectPath)
→ { success, files: [{name, path, type, hasPort, port}] }

// Read config file
window.devPortAPI.readConfigFile(filePath)
→ { success, config: {exists, content, parsed, type} }

// Update port in config (auto-backups!)
window.devPortAPI.updateConfigPort(filePath, newPort)
→ { success, message, backup }

// List backups
window.devPortAPI.listConfigBackups(projectName)
→ { success, backups: [{filename, path, timestamp, size}] }

// Restore backup
window.devPortAPI.restoreConfigBackup(backupPath, originalPath)
→ { success, message }
```

### NPM Executor API

```javascript
// Detect npm scripts
window.devPortAPI.detectNpmScripts(projectPath)
→ { success, scripts: [{name, command, isCommon}] }

// Run npm command
window.devPortAPI.runNpmCommand(projectPath, command, onOutput)
→ { success, pid, command, status, exitCode }

// Kill process
window.devPortAPI.killProcess(pid)
→ { success }

// Get running processes
window.devPortAPI.getRunningProcesses()
→ { success, processes: [{pid, command, projectPath, startTime}] }
```

---

## 🐛 Troubleshooting

### "No config files found"
```bash
# Check if project has config files
ls package.json .env vite.config.js

# Or use full path
dev-port config-list /full/path/to/project
```

### "Permission denied"
```bash
# Check file permissions
# On Windows, run as Administrator if needed
```

### "NPM command failed"
```bash
# Check if npm is installed
npm --version

# Check if package.json exists
ls package.json

# Try manual execution
cd project && npm run dev
```

### "Process won't stop"
```bash
# Force kill
dev-port kill <pid>

# Or manually
taskkill /F /PID <pid>  # Windows
kill -9 <pid>           # macOS/Linux
```

---

## 🎉 Success!

**Complete Dev Workflow is ready! 🚀**

- ✅ Config editing with auto-backup
- ✅ NPM command execution
- ✅ Process management
- ✅ Desktop APIs ready
- ✅ CLI fully functional

**Next:** Desktop UI implementation (4-6 hours estimated)
