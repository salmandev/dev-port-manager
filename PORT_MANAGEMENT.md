# Port Management Features - Kill & Suggest

## ✅ New Features Added

### 1. Kill Process on Port 🔫
```bash
# Kill process running on specific port
dev-port kill 8080
dev-port kill-port 3000

# Desktop app: Coming in UI update
```

**Use Case:**
- Port 8080 is in use but you need it for Jenkins
- Kill the process occupying 8080
- Now Jenkins can use 8080

---

### 2. Smart Port Suggestion 💡
```bash
# Suggest port for specific project type
dev-port suggest jenkins
dev-port suggest node
dev-port suggest maven

# With preferred port
dev-port suggest jenkins --port 8080
```

**Output:**
```
💡 Port Suggestion:

   Suggested Port: 8080
   Reason: First available port for jenkins

   Alternatives: 8081, 8082, 9000
```

---

## 🎯 How It Works

### Port Killing

**Detection:**
```javascript
1. Check if port is in use (netstat/lsof)
2. Get process ID (PID)
3. Get process name
4. Kill with appropriate command:
   - Windows: taskkill /F /PID <pid>
   - macOS/Linux: kill -9 <pid>
```

**Safety:**
- ✅ Shows process name before killing
- ✅ Confirms successful kill
- ✅ Reports if no process found
- ✅ Handles permission errors

---

### Port Suggestion

**Smart Algorithm:**
```javascript
1. Read registry (used ports)
2. Check common ports for project type
3. Verify port is actually free (not in use)
4. Return first available + alternatives
```

**Project Type Defaults:**
| Type | Default Ports |
|------|---------------|
| Jenkins | 8080, 8081, 8082, 9000 |
| Node.js | 3000, 3001, 4000, 5173 |
| Maven | 8080, 8081, 8082, 9000 |
| Gradle | 8080, 8081, 8082, 9000 |
| Python | 5000, 8000, 8001 |
| React | 3000, 3001, 3002 |
| Angular | 4200, 4201, 4202 |
| Vite | 5173, 5174, 5175 |

---

## 🚀 Usage Examples

### Scenario 1: Jenkins Needs Port 8080

**Problem:**
```bash
# Something else is using 8080
dev-port assign jenkins --port 8080
# ❌ Error: Port 8080 is currently in use
```

**Solution:**
```bash
# 1. Check what's on 8080
dev-port check 8080
# 🔴 Port 8080 is in use

# 2. Kill it
dev-port kill 8080
# ✅ Killed process java.exe (PID 59456) on port 8080

# 3. Assign Jenkins
dev-port assign jenkins --port 8080
# ✅ Success!
```

---

### Scenario 2: Need Port for New Project

**Problem:**
```bash
# What port should I use for new Node app?
```

**Solution:**
```bash
# Get smart suggestion
dev-port suggest node
# 💡 Suggested Port: 3000
#    Alternatives: 3001, 4000, 5173

# Or with preference
dev-port suggest node --port 8000
# 💡 Suggested Port: 8000
```

---

### Scenario 3: Multiple Projects

**Problem:**
```bash
# Running out of common ports
# Need ports for: Jenkins, Node app, Python API
```

**Solution:**
```bash
# Get suggestions for each
dev-port suggest jenkins
# → 8080

dev-port suggest node
# → 3000

dev-port suggest python
# → 5000

# Assign all
dev-port assign jenkins --port 8080
dev-port assign my-app --port 3000
dev-port assign api --port 5000
```

---

## 📊 Comparison

| Task | Before | After |
|------|--------|-------|
| Free up port | Manual netstat + taskkill | ✅ `dev-port kill <port>` |
| Choose port | Guess or manual check | ✅ Smart suggestion |
| Port conflicts | Error, figure it out | ✅ Suggest alternatives |
| Project-specific | Generic 9000-9999 | ✅ Type-aware defaults |

---

## 🛡️ Safety Features

### Kill Command
- ✅ Only kills specified port
- ✅ Shows process name
- ✅ Confirms success
- ✅ Reports if not found
- ⚠️ Requires permissions (admin/root for some ports)

### Suggest Command
- ✅ Checks registry first
- ✅ Verifies port is actually free
- ✅ Provides alternatives
- ✅ Type-aware suggestions
- ✅ Never suggests conflicts

---

## 🔧 Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `lib/port-scanner.js` | ✅ Added killProcessOnPort, suggestPort |
| `bin/dev-port.js` | ✅ Added kill, suggest commands |
| `desktop/main.js` | ✅ Added IPC handlers |
| `desktop/preload.js` | ✅ Exposed APIs |

### New Functions

```javascript
// Kill process on port
killProcessOnPort(port)
→ { success, message/error, pid, processName }

// Suggest available port
suggestPort(projectType, preferredPort)
→ { success, port, reason, alternatives }
```

---

## 💡 Best Practices

### When to Kill
- ✅ You own the process
- ✅ It's a stale/dev process
- ✅ You need that port urgently
- ❌ Don't kill system processes
- ❌ Don't kill production services

### When to Use Suggestions
- ✅ New project setup
- ✅ Port conflicts
- ✅ Reorganizing ports
- ✅ Team coordination

---

## 🎮 Desktop App Integration (Coming Soon)

### Kill Button
```
Project List:
  my-app  [3000]  🔴 In Use  [Kill] [Edit]
  jenkins [8080]  🟢 Free    [Start] [Edit]
```

### Smart Assignment
```
Assign Project Dialog:
  Project Name: [my-app]
  Project Type: [Node.js ▼]
  
  💡 Suggested Port: 3000
  [Use 3000] [Use 3001] [Custom...]
```

---

## 📝 Notes

### Permissions
- Some ports require admin/root to kill
- System ports (< 1024) always require admin
- User ports (1024+) usually OK

### Platform Differences
- **Windows**: Uses taskkill
- **macOS/Linux**: Uses kill -9
- **Process names**: May vary by OS

### Limitations
- Can't kill protected processes
- Some processes auto-restart
- Network ports may be held by OS briefly

---

## 🐛 Troubleshooting

### "Permission denied"
```bash
# Windows: Run as Administrator
# macOS/Linux: Use sudo
sudo dev-port kill 8080
```

### "No process found"
```bash
# Port is already free!
# Or process is on different interface
netstat -ano | findstr :8080
```

### "Port still in use after kill"
```bash
# Process may have restarted
# Or another process took the port
# Wait a few seconds, try again
```

---

## 🚀 Future Enhancements

### Planned
- [ ] Desktop UI kill button
- [ ] Batch kill (multiple ports)
- [ ] Process info before kill
- [ ] Auto-suggest on conflict
- [ ] Port reservation system

### Ideas
- [ ] Kill by process name
- [ ] Kill all dev ports
- [ ] Port usage history
- [ ] Team port coordination
- [ ] Service restart instead of kill

---

**Port management made easy! 🎉**

`dev-port kill` + `dev-port suggest` = No more port conflicts!
