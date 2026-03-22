# Dev Port Manager

> **Stop wrestling with port conflicts. Start shipping.**

The production-grade tool for managing 100+ local development projects with zero conflicts. CLI, Web Dashboard, and Desktop App in one.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

---

## 🎯 What Problem Does This Solve?

You're juggling multiple projects:

```
client-a/     → port 3000 (conflicts with client-b)
client-b/     → port 3000 (oops, already taken)
side-project/ → port 8080 (wait, that's my Java app)
microservice-1/ → port 8080 (collision!)
microservice-2/ → port 8080 (😤)
```

**Dev Port Manager** automatically assigns unique ports and hosts to each project:

```
client-a/         → http://client-a.localtest.me:9001
client-b/         → http://client-b.localtest.me:9002
side-project/     → http://side-project.localtest.me:9003
microservice-1/   → http://microservice-1.localtest.me:9004
microservice-2/   → http://microservice-2.localtest.me:9005
```

No conflicts. No manual `/etc/hosts` editing. No brain cycles wasted.

---

## ✨ Features

### 🖥️ Three Interfaces, One Tool

| Interface | Best For | Commands |
|-----------|----------|----------|
| **CLI** | Terminal workflows, automation, CI/CD | `dpm assign`, `dpm start`, `dpm stop` |
| **Web Dashboard** | Quick visual checks, team sharing | `dpm dashboard` |
| **Desktop App** | Native experience, system integration | Download from Releases |

### 🚀 Core Capabilities

- **Automatic Port Assignment** - Smart allocation in 9000-9999 range with conflict detection
- **Hosts File Management** - Auto-configures `/etc/hosts` for clean local domains
- **Project Detection** - Auto-discovers Node.js, Maven, Gradle, Python, Ruby, Rust, Go, PHP projects
- **Docker Integration** - Generate `.env` and `docker-compose.yml` files automatically
- **Start/Stop Projects** - Launch and kill processes with `dpm start` / `dpm stop`
- **Process Monitoring** - See what's actually running with `dpm ps`
- **Backup & Restore** - Never lose your registry configuration
- **Cross-Platform** - Works identically on Windows, macOS, and Linux

---

## 📦 Installation

### Option 1: Global npm Install (Recommended)

```bash
npm install -g dev-port-manager
```

Verify installation:

```bash
dpm --version
dpm --help
```

### Option 2: Desktop App

Download from [GitHub Releases](https://github.com/your-org/dev-port-manager/releases):

- **Windows**: `.exe` (NSIS), `.msi`, or Portable
- **macOS**: `.dmg` (Intel + Apple Silicon)
- **Linux**: `.AppImage` or `.deb`

### Option 3: From Source

```bash
git clone https://github.com/your-org/dev-port-manager.git
cd dev-port-manager
npm install
npm link
```

---

## 🚀 Quick Start

### 1️⃣ Initialize (First Time Only)

```bash
dpm init
```

### 2️⃣ Assign Your First Project

```bash
cd my-awesome-project/
dpm assign my-awesome-project --vscode
```

**Output:**
```
✅ Project assigned:

   Name:        my-awesome-project
   Host:        my-awesome-project.localtest.me
   Port:        9100
   URL:         http://my-awesome-project.localtest.me:9100
   Type:        [node]
   OS:          win32

   Config: .project-dev.json
   ✓ .vscode/settings.json updated
```

### 3️⃣ Start Your Project

```bash
dpm start my-awesome-project
```

**Output:**
```
🚀 Starting my-awesome-project...
   Command: npm run dev
   Directory: C:\Projects\my-awesome-project

[Your app output here...]
```

### 4️⃣ Check What's Running

```bash
dpm ps
```

**Output:**
```
📊 Running Processes:

   ● my-awesome-project       :9100 (node)
   ● client-dashboard         :9101 (java)

   Total: 2 process(es) running
```

### 5️⃣ Stop a Project

```bash
dpm stop my-awesome-project
```

---

## 📖 Command Reference

### Project Management

| Command | Description | Example |
|---------|-------------|---------|
| `assign <name>` | Assign port/host to project | `dpm assign my-app --docker` |
| `list` | List all registered projects | `dpm list --json` |
| `info <name>` | Get project details | `dpm info my-app` |
| `remove <name>` | Remove from registry | `dpm remove my-app` |
| `scan <dir>` | Auto-discover projects | `dpm scan ./projects --dry-run` |
| `find <dir>` | Recursive project search | `dpm find ~/code` |

### Service Control

| Command | Description | Example |
|---------|-------------|---------|
| `start [project]` | Start project (auto-detects dev/start) | `dpm start my-app` |
| `stop [project]` | Stop running project | `dpm stop my-app` |
| `ps` | List running processes | `dpm ps` |
| `docker-start [project]` | Start Docker Compose | `dpm docker-start` |
| `docker-stop [project]` | Stop Docker Compose | `dpm docker-stop` |

### Docker Integration

| Command | Description | Example |
|---------|-------------|---------|
| `docker <project>` | Generate Docker files | `dpm docker my-app` |
| `docker-check` | Check Docker availability | `dpm docker-check` |

### Registry & Config

| Command | Description | Example |
|---------|-------------|---------|
| `sync` | Update hosts file | `dpm sync` |
| `backup` | Create registry backup | `dpm backup` |
| `restore` | Restore from backup | `dpm restore` |
| `export [file]` | Export registry | `dpm export backup.json` |
| `import <file>` | Import registry | `dpm import backup.json` |
| `settings` | View/edit settings | `dpm settings` |

### Utilities

| Command | Description | Example |
|---------|-------------|---------|
| `status` | Check system status | `dpm status` |
| `check <port>` | Check if port available | `dpm check 3000` |
| `detect [path]` | Detect project type | `dpm detect .` |
| `dashboard` | Start web UI | `dpm dashboard` |
| `npm-run [cmd]` | Run npm command | `dpm npm-run build` |
| `npm-scripts` | List available scripts | `dpm npm-scripts` |

---

## 🔧 Configuration

### Project Config (`.project-dev.json`)

Auto-generated in your project root:

```json
{
  "name": "my-app",
  "host": "my-app.localtest.me",
  "port": 9100,
  "url": "http://my-app.localtest.me:9100",
  "projectType": "node",
  "environment": {
    "PROJ_NAME": "my-app",
    "PROJ_HOST": "my-app.localtest.me",
    "PROJ_PORT": "9100",
    "PROJ_URL": "http://my-app.localtest.me:9100"
  }
}
```

### Use in Your Application

**Node.js:**
```javascript
const config = require('./.project-dev.json');
console.log(`Running on ${config.url}`);
```

**Environment Variables:**
```bash
# Auto-loaded from .env
echo $PROJ_URL  # http://my-app.localtest.me:9100
```

**Python:**
```python
import json
with open('.project-dev.json') as f:
    config = json.load(f)
    print(f"Running on {config['url']}")
```

---

## 🌐 Web Dashboard

Start the web UI:

```bash
dpm dashboard
```

Then open: **http://localhost:4000**

Features:
- 📊 Visual project list with search/filter
- 🟢 Live status indicators (running/stopped)
- ✏️ Edit project configurations
- 💾 Backup/restore interface
- ⚙️ Settings management

---

## 🖥️ Desktop App

Download from [Releases](https://github.com/your-org/dev-port-manager/releases) for:

- Native system tray integration
- Auto-updates
- Drag-and-drop directory scanning
- One-click start/stop
- Dark/Light themes

---

## 🐳 Docker Integration

### Generate Docker Files

```bash
dpm docker my-app
```

Creates:
- `.env` - Port and host variables
- `docker-compose.yml` - Pre-configured compose file
- `docker-compose.override.yml` - Local dev overrides

### Start Docker Services

```bash
dpm docker-start my-app
```

### Check Docker Status

```bash
dpm docker-check
```

---

## 🔄 Common Workflows

### Onboarding a New Project

```bash
cd new-project/
dpm assign new-project --docker --vscode
dpm start new-project
```

### Scanning Multiple Projects

```bash
# Scan all projects in a directory
dpm scan ~/projects --dry-run  # Preview first

# Actually assign
dpm scan ~/projects --docker
```

### Daily Development

```bash
# See what's running
dpm ps

# Start what you need
dpm start client-a
dpm start microservice-1

# Take a break, come back and stop everything
dpm stop client-a
dpm stop microservice-1
```

### Backup Before Major Changes

```bash
dpm backup
# ... make changes ...
dpm restore  # if something goes wrong
```

---

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Check what's on the port
dpm check 3000

# Kill it
dpm kill 3000

# Or stop by project name
dpm stop my-app
```

### Hosts File Issues

```bash
# Re-sync hosts file
dpm sync

# On Windows, run as Administrator
# On macOS/Linux, use sudo
sudo dpm sync
```

### Project Not Detected

```bash
# Manually specify project type
dpm assign my-app --type python

# Or create marker file
touch .project-marker
dpm assign my-app
```

### Reset Everything

```bash
# Clear registry
dpm settings-reset

# Reinitialize
dpm init
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing instructions
- Pull request process

### Quick Start for Contributors

```bash
git clone https://github.com/your-org/dev-port-manager.git
cd dev-port-manager
npm install
npm run dev  # Test CLI in watch mode
```

---

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System design and components
- [Usage Guide](./USAGE.md) - Detailed usage examples
- [Quick Reference](./QUICKREF.md) - Command cheat sheet
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [Roadmap](./ROADMAP.md) - Future development plans
- [CHANGELOG](./CHANGELOG.md) - Version history

---

## 🙏 Acknowledgments

Built with:
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Chalk](https://github.com/chalk/chalk) - Terminal colors
- [Express](https://expressjs.com/) - Web dashboard
- [Electron](https://www.electronjs.org/) - Desktop app
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) - Interactive menus

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🚀 Ready to Get Started?

```bash
npm install -g dev-port-manager
dpm init
dpm assign my-first-project
dpm start my-first-project
```

**That's it. No more port conflicts. Happy coding! 🎉**

---

<div align="center">

**Made with ❤️ by developers, for developers**

[Report Bug](https://github.com/your-org/dev-port-manager/issues) · [Request Feature](https://github.com/your-org/dev-port-manager/issues) · [Discussions](https://github.com/your-org/dev-port-manager/discussions)

</div>
