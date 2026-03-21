# Changelog

All notable changes to Dev Port Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Plugin system for extensibility
- Service management (start/stop projects)
- Team collaboration features
- Mobile app (iOS/Android)
- Cloud hosting option

## [1.0.0] - 2026-03-21

### Added
- **CLI** with 25+ commands
  - `assign` - Assign port and host to project
  - `scan` - Auto-discover projects in directory
  - `list` - List all registered projects
  - `remove` - Remove project from registry
  - `info` - Get project details
  - `sync` - Sync hosts file
  - `docker` - Generate Docker files
  - `docker-start` - Start Docker services
  - `docker-stop` - Stop Docker services
  - `docker-check` - Check Docker availability
  - `settings` - View/edit settings
  - `backup` - Create registry backup
  - `restore` - Restore from backup
  - `dashboard` - Start web dashboard
  - And more...

- **Web Dashboard**
  - Real-time project management UI
  - Live port status monitoring
  - Search and filter functionality
  - Backup/restore interface
  - Settings management
  - Live status page (auto-refreshes)

- **Desktop App (Electron)**
  - Native GUI for Windows, macOS, Linux
  - Auto-update support
  - Drag-and-drop directory scanning
  - Service start/stop capability
  - Light/dark mode themes
  - Keyboard shortcuts
  - Menu integration
  - Notifications

- **Central Configuration**
  - Configurable registry path
  - Settings file management
  - Cloud sync support (Google Drive, Dropbox, OneDrive)
  - Environment variable overrides
  - CLI flag overrides

- **Project Detection**
  - Node.js (package.json)
  - Maven (pom.xml)
  - Gradle (build.gradle, build.gradle.kts)
  - Python (requirements.txt, setup.py, pyproject.toml)
  - Ruby (Gemfile)
  - Rust (Cargo.toml)
  - Go (go.mod)
  - PHP (composer.json)
  - Manual marker (.project-marker)

- **Docker Integration**
  - Auto-generate .env files
  - Docker Compose templates
  - Service start/stop commands
  - Container status checking

- **Backup & Restore**
  - Automatic backups
  - Timestamped backup files
  - Restore from latest or specific backup
  - Export/import registry

- **Cross-Platform Support**
  - Windows (win32)
  - macOS (darwin)
  - Linux (linux)
  - OS-specific paths
  - Platform-aware hosts file handling

- **Installers**
  - Windows: NSIS (.exe), MSI, Portable
  - macOS: DMG (Intel + Apple Silicon)
  - Linux: AppImage, DEB

- **Auto-Update**
  - electron-updater integration
  - GitHub Releases integration
  - Silent background downloads
  - User-prompted restart

### Fixed
- Electron URLs opening in external browser (not internally)
- IPC handler cloning errors
- Scan directory null pointer issues
- Port availability checking race conditions
- Settings serialization issues

### Changed
- Improved error messages
- Enhanced logging
- Better project type detection
- Faster scan performance
- More reliable port checking

### Technical
- **Total Lines of Code**: 6,000+
- **Test Coverage**: 26/26 tests passing
- **Dependencies**: 6 core, 3 dev
- **Bundle Size**: ~150MB (desktop)

---

## [0.1.0] - 2026-03-15

### Added
- Initial prototype
- Basic CLI commands
- Simple registry system
- Web dashboard prototype

---

## Version Numbering

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

## Release Schedule

- **Major**: Every 6 months
- **Minor**: Monthly
- **Patch**: As needed

## Getting Updates

### CLI
```bash
npm update -g dev-port-manager
```

### Desktop App
- Auto-updates enabled by default
- Manual check: Help → Check for Updates

### Web Dashboard
- Refreshes automatically
- Check version in footer

---

**Stay updated! ⭐**

[Unreleased]: https://github.com/your-org/dev-port-manager/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/dev-port-manager/releases/tag/v1.0.0
[0.1.0]: https://github.com/your-org/dev-port-manager/releases/tag/v0.1.0
