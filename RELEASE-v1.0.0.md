# GitHub Release v1.0.0 - Draft Notes

**Tag:** `v1.0.0`  
**Release Title:** v1.0.0 - Initial Release  
**Date:** March 21, 2026

---

## 🎉 What's New

Dev Port Manager is a production-grade tool for managing 100+ local development projects with zero port conflicts. This is the initial public release featuring CLI, Web Dashboard, and Desktop App.

---

## ✨ Key Features

### 🖥️ Three Interfaces, One Tool

- **CLI** - 28+ commands for terminal workflows and automation
- **Web Dashboard** - Visual project management at localhost:4000
- **Desktop App** - Native experience with auto-updates (Windows, macOS, Linux)

### 🚀 Core Capabilities

- **Automatic Port Assignment** - Smart allocation in 9000-9999 range with conflict detection
- **Hosts File Management** - Auto-configures `/etc/hosts` for clean local domains  
- **Project Detection** - Auto-discovers Node.js, Maven, Gradle, Python, Ruby, Rust, Go, PHP projects
- **Docker Integration** - Generate `.env` and `docker-compose.yml` files automatically
- **Service Control** - Start/stop projects with `dpm start` / `dpm stop`
- **Process Monitoring** - See what's actually running with `dpm ps`
- **Backup & Restore** - Never lose your registry configuration
- **Cross-Platform** - Works identically on Windows, macOS, and Linux

---

## 📦 Installation

### Option 1: Global npm Install (Recommended)

```bash
npm install -g dev-port-manager
```

### Option 2: Desktop App Download

Download the installer for your platform from the **Assets** section below:

- **Windows**: `Dev-Port-Manager-1.0.0-win-x64.exe` (NSIS installer)
- **macOS**: `Dev-Port-Manager-1.0.0-mac.dmg` (Intel + Apple Silicon)
- **Linux**: `Dev-Port-Manager-1.0.0-linux.AppImage` or `.deb`

### Option 3: From Source

```bash
git clone https://github.com/sshaikh-git/dev-port-manager.git
cd dev-port-manager
npm install
npm link
```

---

## 🚀 Quick Start

```bash
# Initialize (first time only)
dpm init

# Assign your first project
cd my-project/
dpm assign my-project --vscode

# Start it
dpm start my-project

# Check what's running
dpm ps
```

---

## 📖 Documentation

- [README](https://github.com/sshaikh-git/dev-port-manager#readme) - Full documentation
- [Usage Guide](https://github.com/sshaikh-git/dev-port-manager/blob/main/USAGE.md) - Detailed examples
- [Architecture](https://github.com/sshaikh-git/dev-port-manager/blob/main/ARCHITECTURE.md) - System design
- [Quick Reference](https://github.com/sshaikh-git/dev-port-manager/blob/main/QUICKREF.md) - Command cheat sheet

---

## 🐛 Known Issues

- Desktop app icons need to be generated for custom installations
- Windows: Running as Administrator required for hosts file sync
- macOS: Gatekeeper may block unsigned app (expected for initial release)

**Workarounds:**
- Use CLI (`dpm sync`) for hosts file management on Windows
- macOS users: Right-click app → Open to bypass Gatekeeper

---

## 📊 Command Reference

### Project Management
| Command | Description |
|---------|-------------|
| `dpm assign <name>` | Assign port/host to project |
| `dpm list` | List all registered projects |
| `dpm info <name>` | Get project details |
| `dpm remove <name>` | Remove from registry |
| `dpm scan <dir>` | Auto-discover projects |

### Service Control
| Command | Description |
|---------|-------------|
| `dpm start [project]` | Start project (NEW ✨) |
| `dpm stop [project]` | Stop running project (NEW ✨) |
| `dpm ps` | List running processes (NEW ✨) |
| `dpm docker-start` | Start Docker Compose |
| `dpm docker-stop` | Stop Docker Compose |

### Docker
| Command | Description |
|---------|-------------|
| `dpm docker <project>` | Generate Docker files |
| `dpm docker-check` | Check Docker availability |

### Registry & Config
| Command | Description |
|---------|-------------|
| `dpm sync` | Update hosts file |
| `dpm backup` | Create registry backup |
| `dpm restore` | Restore from backup |
| `dpm settings` | View/edit settings |

---

## 🧪 Testing

Run the test suite:

```bash
npm test
```

All 26 tests passing ✅

---

## 🙏 Acknowledgments

Built with:
- [Commander.js](https://github.com/tj/commander.js)
- [Chalk](https://github.com/chalk/chalk)
- [Express](https://expressjs.com/)
- [Electron](https://www.electronjs.org/)
- [Inquirer](https://github.com/SBoudrias/Inquirer.js)

---

## 📄 License

MIT License - see [LICENSE](https://github.com/sshaikh-git/dev-port-manager/blob/main/LICENSE) for details.

---

## 🎯 What's Next? (v1.1.0 Roadmap)

- [ ] Plugin system for extensibility
- [ ] VS Code extension
- [ ] Team collaboration features
- [ ] Enhanced service management
- [ ] Mobile app (iOS/Android)

---

## 📸 Screenshots

### CLI Interface
![CLI Status](https://github.com/sshaikh-git/dev-port-manager/raw/main/screenshots/cli-status.png)

### Web Dashboard
![Web Dashboard](https://github.com/sshaikh-git/dev-port-manager/raw/main/screenshots/web-dashboard.png)

### Desktop App
![Desktop App](https://github.com/sshaikh-git/dev-port-manager/raw/main/screenshots/desktop-app.png)

---

**Full Changelog**: https://github.com/sshaikh-git/dev-port-manager/compare/v0.0.0...v1.0.0

---

## 🔗 Quick Links

- [Download Desktop App](#assets)
- [View Full Documentation](https://github.com/sshaikh-git/dev-port-manager#readme)
- [Report a Bug](https://github.com/sshaikh-git/dev-port-manager/issues/new?template=bug_report.yml)
- [Request a Feature](https://github.com/sshaikh-git/dev-port-manager/issues/new?template=feature_request.yml)
- [Join Discussions](https://github.com/sshaikh-git/dev-port-manager/discussions)

---

<div align="center">

**Made with ❤️ by developers, for developers**

[![Stars](https://img.shields.io/github/stars/sshaikh-git/dev-port-manager?style=social)](https://github.com/sshaikh-git/dev-port-manager/stargazers)
[![Downloads](https://img.shields.io/github/downloads/sshaikh-git/dev-port-manager/v1.0.0/total)](https://github.com/sshaikh-git/dev-port-manager/releases/tag/v1.0.0)

</div>
