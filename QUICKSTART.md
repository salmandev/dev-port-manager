# Dev Port Manager - Quick Start

## 🚀 Get Started in 3 Steps

### 1. Install
```bash
npm install
npm link  # Optional: use dev-port command globally
```

### 2. Choose Your Interface

#### Option A: CLI (Command Line)
```bash
dev-port assign my-app
dev-port list
dev-port scan ~/Projects
```

#### Option B: Web Dashboard
```bash
npm run server
# Open: http://localhost:4000
# Live Status: http://localhost:4000/status
```

#### Option C: Desktop App
```bash
npm start
# Native GUI opens automatically
```

### 3. Access Your Projects

All projects are accessible at:
```
http://<project-name>.localtest.me:<port>
```

Example: `http://my-app.localtest.me:9000`

URLs open in your **default browser** automatically.

---

## 📋 Common Commands

### Project Management
```bash
dev-port assign my-app          # Assign port/host
dev-port list                   # List all projects
dev-port remove my-app          # Remove project
dev-port scan ~/Projects        # Auto-discover projects
```

### Settings
```bash
dev-port settings               # View settings
dev-port set theme dark         # Change theme
dev-port registry               # Show registry location
```

### Docker
```bash
dev-port docker my-app          # Generate Docker files
dev-port docker-check           # Check Docker availability
```

### Backup
```bash
dev-port backup                 # Create backup
dev-port backups                # List backups
dev-port restore                # Restore from backup
```

---

## 🌐 URLs Explained

### localtest.me Domains
Projects use `*.localtest.me` which automatically resolves to `127.0.0.1`:

```
http://my-app.localtest.me:9000  →  localhost:9000
```

**Benefits:**
- No `/etc/hosts` editing required
- Works on all platforms immediately
- Each project has unique subdomain

### Where URLs Open
- **Desktop App:** Opens in your **default browser** (Chrome, Firefox, Edge)
- **Web Dashboard:** Opens in **new browser tab**
- **CLI:** Prints URL, you open it manually

---

## 🧪 Testing

```bash
npm test              # Run unit tests
npm run test:api      # Run API tests
npm run test:all      # Run all tests
```

All 26 tests should pass ✅

---

## 🔧 Troubleshooting

### URL doesn't open
The URL is valid, but no server is running on that port. Start your application first.

### Port already in use
```bash
dev-port check 9000     # Check if port is free
dev-port assign app --port 9050  # Use different port
```

### Electron shows errors
All Electron issues are fixed. URLs now open in external browser automatically.

### Web dashboard not loading
```bash
npm run server          # Start web server
# Wait 2 seconds
# Open: http://localhost:4000
```

---

## 📁 Project Structure

```
dev-port-manager/
├─ bin/dev-port.js      # CLI
├─ lib/                 # Core modules
├─ desktop/             # Electron app
├─ views/               # Web templates
├─ public/              # Web assets
├─ test/                # Tests
└─ server.js            # Web server
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Assign project | `dev-port assign my-app` |
| List projects | `dev-port list` |
| Scan directory | `dev-port scan ~/Projects` |
| Web dashboard | `npm run server` |
| Desktop app | `npm start` |
| Tests | `npm test` |
| Settings | `dev-port settings` |
| Help | `dev-port --help` |

---

## 🔗 Important URLs

- **Web Dashboard:** http://localhost:4000
- **Live Status:** http://localhost:4000/status
- **API:** http://localhost:4000/api/*

---

**Ready to go! 🚀**

For detailed documentation, see:
- `README.md` - Full documentation
- `TESTING.md` - Testing guide
- `FIXES.md` - Recent fixes
