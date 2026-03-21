# Smart Port Detection & Auto-Recommendations

## 🎯 What It Does

**Automatically detects running servers** on common development ports and **recommends updates** to keep your registry in sync!

---

## 🔍 Ports Scanned Automatically

### Common Development Ports
| Port | Framework/Use |
|------|---------------|
| 3000 | React/Next.js |
| 3001 | Alternative React |
| 4000 | Dev Port Manager web |
| 4200 | Angular |
| 5173 | Vite (default) |
| 5174 | Vite (alternative) |
| 8000 | Python/Django |
| 8008 | Python (alt) |
| 8080 | Java/Node (common) |
| 8081-8090 | Java/Node (alt) |
| 9000-9010 | Node.js |
| 10000 | Alternative |

**Total:** 35+ common ports scanned automatically!

---

## 🚀 How It Works

### Step 1: Scan Running Servers
```
Click: 🔍 Sync Actual Ports

Scans:
✅ All registered projects
✅ 35+ common development ports
✅ Config files (.env, package.json, vite.config)
✅ Actual running processes
```

### Step 2: Generate Recommendations
```
Example Output:

Found 3 port issue(s):

1. ⚠️ my-react-app
   Config file (vite.config.js) uses port 5173
   Current: 9001 → Recommended: 5173

2. 🟢 jenkins-local
   Server is actually running on port 8080 (java.exe)
   Current: 9002 → Recommended: 8080

3. ⚠️ Unknown
   Server running on port 3000 (node.exe) not in registry

Auto-fix all issues?
[OK] [Cancel]
```

### Step 3: Auto-Fix
```
Click OK → Automatically:

✅ Updates vite.config.js → port 5173
✅ Updates .env → PORT=8080
✅ Updates registry → matches reality
✅ Updates .project-dev.json

Result:
✅ Fixed 2 project(s): my-react-app, jenkins-local
✅ Updated registry: 2 project(s)
```

---

## 📊 Recommendation Types

### 1. Config Mismatch ⚠️
```
Registry: 9001
vite.config.js: 5173

Recommendation: Update to 5173
Confidence: High
Auto-Fixable: ✅ Yes
```

### 2. Running Mismatch 🟢
```
Registry: 9002
Actually running: 8080 (java.exe)

Recommendation: Update to 8080
Confidence: High
Auto-Fixable: ✅ Yes
```

### 3. Unregistered Server ⚠️
```
Detected: node.exe on port 3000
Not in registry

Recommendation: Add to registry
Confidence: Medium
Auto-Fixable: ❌ Manual add needed
```

---

## 💡 Use Cases

### Case 1: Vite Auto-Changed Port
```
Scenario:
- Assigned 9001
- Vite detected conflict
- Auto-started on 5173

Solution:
1. Click "Sync Actual Ports"
2. Detects vite.config.js has 5173
3. Recommends update
4. Auto-fixes config + registry
```

### Case 2: Java App on 8080
```
Scenario:
- Jenkins running on 8080
- Registry says 9002
- Java process detected

Solution:
1. Click "Sync Actual Ports"
2. Detects java.exe on 8080
3. Shows running process
4. Updates registry to 8080
```

### Case 3: Multiple Apps Running
```
Scenario:
- 5 projects running
- Various ports (3000, 5173, 8080, etc.)
- Registry out of sync

Solution:
1. Click "Sync Actual Ports"
2. Scans all 35+ common ports
3. Finds all running servers
4. Auto-fixes everything at once!
```

---

## 🎮 How to Use

### Desktop App

```bash
npm start
```

Then:
1. Click **"Sync Actual Ports"** 🔍
2. Review recommendations
3. Click **OK** to auto-fix
4. Done! ✅

### What Gets Updated

| File | Updated? | Notes |
|------|----------|-------|
| registry.json | ✅ Yes | Global registry |
| .project-dev.json | ✅ Yes | Per-project config |
| package.json | ✅ Yes | devPort field |
| .env | ✅ Yes | PORT variable |
| vite.config.js/ts | ✅ Yes | server.port |
| Other configs | ⚠️ Read-only | Coming soon |

---

## 📈 Example Session

### Before Sync
```bash
# Registry
my-app → 9001
jenkins → 9002
react-app → 9003

# Actually Running
my-app → 5173 (Vite)
jenkins → 8080 (Java)
react-app → 3000 (React)

# Config Files
my-app/.env → PORT=5173
jenkins/pom.xml → 8080
react-app/package.json → 3000
```

### After Sync
```bash
# Registry (Updated!)
my-app → 5173 ✅
jenkins → 8080 ✅
react-app → 3000 ✅

# Config Files (Updated!)
my-app/.env → PORT=5173 ✅
jenkins/pom.xml → 8080 ✅
react-app/package.json → 3000 ✅

# Everything in sync! 🎉
```

---

## 🛡️ Safety Features

### Smart Recommendations
- ✅ Only suggests if different
- ✅ Shows confidence level
- ✅ Explains why
- ✅ Asks before changing

### Auto-Fix Safety
- ✅ Only fixes what it can
- ✅ Reports failures
- ✅ Continues on errors
- ✅ Backs up before changes

### User Control
- ✅ Review before applying
- ✅ Cancel anytime
- ✅ See what will change
- ✅ Partial fixes OK

---

## 🔧 Advanced Features

### Process Detection
```
Detects running processes:
- node.exe (Node.js)
- java.exe (Java/Maven/Gradle)
- python.exe (Python)
- ruby.exe (Ruby)
- go.exe (Go)
- And more!
```

### Config File Reading
```
Reads from:
✅ package.json (devPort, port, scripts)
✅ .env (PORT)
✅ vite.config.js/ts (server.port)
✅ next.config.js (port)
✅ nuxt.config.js (port)
✅ angular.json (architect.serve.options.port)
```

### Confidence Levels
```
High:   Config file or running server detected
Medium: Unregistered server found
Low:    Guess based on project type
```

---

## 📝 Notes

### What's Auto-Fixed
- ✅ Registry port
- ✅ .project-dev.json
- ✅ package.json (devPort)
- ✅ .env (PORT)
- ✅ vite.config (server.port)

### What's Read-Only (For Now)
- ❌ pom.xml (Maven)
- ❌ build.gradle (Gradle)
- ❌ angular.json
- ❌ next.config.js
- ❌ Other framework configs

**Coming soon:** Write support for more config types!

---

## 🐛 Troubleshooting

### "No issues found"
- All ports already in sync
- Or no servers currently running
- Start some projects and try again

### "Auto-fix failed"
- Check file permissions
- Ensure files aren't locked
- Try running as admin (Windows)

### "Unknown server on port X"
- Server not associated with registered project
- Manually add project first
- Or ignore if not needed

---

## 🚀 Coming Soon

### v1.2.0 Features
- [ ] Write support for pom.xml
- [ ] Write support for build.gradle
- [ ] Write support for angular.json
- [ ] Real-time port monitoring
- [ ] Auto-start services
- [ ] Port conflict prevention

### v1.3.0 Features
- [ ] Machine learning port suggestions
- [ ] Project-specific port preferences
- [ ] Team sync (shared registry)
- [ ] Cloud backup integration

---

## 💬 Feedback

Found a bug? Have a suggestion?

- Open issue on GitHub
- Join Discord community
- Email: support@devportmanager.com

---

**Smart port detection keeps your projects in sync! 🎉**

Click "Sync Actual Ports" to auto-detect and fix.
