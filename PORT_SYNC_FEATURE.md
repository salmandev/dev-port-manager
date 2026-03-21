# Port Sync Feature - Auto-Detect & Sync Actual Ports

## 🎯 Problem Solved

**Before:**
- Registry says port 9001
- But Vite is actually running on 5173
- .env has PORT=3000
- **No way to know what's actually running!**

**Now:**
- Click "Sync Actual Ports" 🔍
- Scans all projects
- Detects actual running servers
- Reads config files
- **Syncs registry with reality!**

---

## 🚀 How It Works

### 1. Scan Projects
```
Click: 🔍 Sync Actual Ports

Scans:
✅ Running processes (netstat/lsof)
✅ package.json (devPort, port, scripts)
✅ .env (PORT variable)
✅ vite.config.js/ts (server.port)
✅ next.config.js
✅ angular.json
```

### 2. Detect Discrepancies
```
Example Output:
Found 2 discrepancies:

my-app: Registry=9001, Config=5173
jenkins: Registry=9002, Config=8080

Update registry to match actual ports?
[OK] [Cancel]
```

### 3. Sync Registry
```
✅ Updated 2 projects:
  my-app: 9001 → 5173
  jenkins: 9002 → 8080
```

---

## 📊 What Gets Detected

### Running Servers
| Check | Method |
|-------|--------|
| **Port in use** | net.createServer() test |
| **Process ID** | netstat (Win) / lsof (Mac/Linux) |
| **Process name** | tasklist (Win) / ps (Mac/Linux) |

### Config Files
| File | Field | Example |
|------|-------|---------|
| **package.json** | devPort, port, scripts | `"devPort": 3000` |
| **.env** | PORT | `PORT=5173` |
| **vite.config.js** | server.port | `port: 5173` |
| **next.config.js** | port | `port: 3000` |
| **angular.json** | architect.serve.options.port | `"port": 4200` |

---

## 💡 Use Cases

### Case 1: Vite Changed Port Automatically
```
Scenario:
- Assigned port 9001
- But Vite detected 9001 in use
- Auto-started on 5173 instead

Solution:
1. Click "Sync Actual Ports"
2. Detects Vite running on 5173
3. Updates registry to 5173
4. ✅ Now registry matches reality!
```

### Case 2: Config File Has Different Port
```
Scenario:
- Registry: 9001
- package.json: "devPort": 3000
- .env: PORT=3000

Solution:
1. Click "Sync Actual Ports"
2. Reads config files
3. Shows discrepancy
4. Updates registry to 3000
```

### Case 3: Multiple Projects Running
```
Scenario:
- 10 projects assigned
- Only 5 actually running
- Some on different ports

Solution:
1. Click "Sync Actual Ports"
2. Shows which are running + actual ports
3. Updates all at once
4. ✅ Complete sync!
```

---

## 🎮 How to Use

### Desktop App

1. **Open App**
   ```bash
   npm start
   ```

2. **Click "Sync Actual Ports"** 🔍
   - Scans all projects
   - Shows discrepancies
   - Asks to update

3. **Review & Confirm**
   - See what changed
   - Confirm or cancel

4. **Done!** ✅
   - Registry updated
   - .project-dev.json updated
   - Everything in sync!

### CLI (Coming Soon)
```bash
dev-port sync-ports
dev-port scan-ports
```

---

## 🔍 What Happens During Sync

### Step-by-Step

```
1. Read registry
   ↓
2. For each project:
   a. Check if registered port is in use
   b. Read package.json for devPort/port
   c. Read .env for PORT
   d. Read vite.config for server.port
   e. Compare all ports
   ↓
3. Find discrepancies
   ↓
4. Ask user to confirm
   ↓
5. Update registry + .project-dev.json
   ↓
6. Show results
```

---

## 📈 Example Output

### No Discrepancies
```
✅ All ports are in sync!
```

### With Discrepancies
```
Found 2 discrepancies:

my-app: Registry=9001, Config=5173 (vite.config.js)
react-app: Registry=9002, Config=3000 (.env)

Update registry to match actual ports?
[OK] [Cancel]
```

### After Sync
```
✅ Updated 2 projects:
  my-app: 9001 → 5173
  react-app: 9002 → 3000
```

---

## 🛡️ Safety Features

### Non-Destructive
- ✅ Only updates port fields
- ✅ Backs up before changes
- ✅ Asks for confirmation
- ✅ Can be reversed

### Smart Detection
- ✅ Only updates if different
- ✅ Prefers running ports
- ✅ Falls back to config files
- ✅ Ignores if no discrepancy

### Error Handling
- ✅ Continues on individual failures
- ✅ Reports what succeeded/failed
- ✅ Doesn't corrupt registry

---

## 🎯 Benefits

| Benefit | Description |
|---------|-------------|
| **Accuracy** | Registry matches reality |
| **Time-saving** | No manual checking |
| **Batch update** | All projects at once |
| **Safe** | Confirmation dialogs |
| **Automatic** | Detects running servers |
| **Smart** | Reads multiple config sources |

---

## 🔧 Advanced Features

### Manual Scan (Per Project)
Coming in v1.1.0:
```javascript
// Right-click project → Scan Port
// Shows detailed port info
```

### Auto-Scan on Startup
Coming in v1.1.0:
```javascript
// Settings → Auto-scan on startup
// Always shows current state
```

### Port Conflict Detection
Coming in v1.1.0:
```javascript
// Warns if two projects use same port
// Suggests alternatives
```

---

## 📝 Notes

### What Gets Updated
- ✅ registry.json (global)
- ✅ .project-dev.json (per project)
- ❌ Config files (package.json, .env, etc.) - Read only for now

### What Doesn't Get Updated
- ❌ vite.config.js (read only)
- ❌ .env files (read only)
- ❌ Other config files (read only)

**Future:** Option to update config files too!

---

## 🐛 Troubleshooting

### "No discrepancies found"
- Registry already matches configs
- Or no config files detected
- Check if project has package.json/.env

### "Sync failed"
- Check file permissions
- Ensure projects are accessible
- Try running as admin (Windows)

### "Port detection inaccurate"
- Some frameworks use dynamic ports
- Check actual running process
- Manual edit may be needed

---

## 🚀 Coming Soon

### v1.1.0 Features
- [ ] Auto-scan on startup
- [ ] Per-project manual scan
- [ ] Port conflict detection
- [ ] Update config files (write mode)
- [ ] CLI commands

### v1.2.0 Features
- [ ] Real-time port monitoring
- [ ] Auto-start services
- [ ] Health checks
- [ ] Reverse proxy integration

---

## 💬 Feedback

Found a bug? Have a suggestion?

- Open issue on GitHub
- Join Discord community
- Email: support@devportmanager.com

---

**Keep your ports in sync! 🎉**

Click "Sync Actual Ports" to auto-detect and update.
