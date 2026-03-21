# Dev Port Manager - Build Guide

## Prerequisites

```bash
# Node.js 18+ required
node --version  # Should be v18 or higher

# Install dependencies
npm install
```

---

## Build Commands

### Quick Build (Current Platform)
```bash
npm run build
```

### Platform-Specific Builds

#### Windows
```bash
npm run build:win
```

**Output:**
- `dist/Dev Port Manager-1.0.0-win-x64.exe` (NSIS installer)
- `dist/Dev Port Manager-1.0.0-win-x64.msi` (MSI installer)
- `dist/Dev Port Manager-portable-1.0.0-win-x64.exe` (Portable)

#### macOS
```bash
npm run build:mac
```

**Output:**
- `dist/Dev Port Manager-1.0.0-mac-x64.dmg` (Intel)
- `dist/Dev Port Manager-1.0.0-mac-arm64.dmg` (Apple Silicon)

#### Linux
```bash
npm run build:linux
```

**Output:**
- `dist/Dev Port Manager-1.0.0-linux-x64.AppImage`
- `dist/Dev Port Manager-1.0.0-linux-x64.deb`

#### All Platforms (Requires multiple OS)
```bash
npm run build:all
```

---

## Build Output

### Directory Structure
```
dist/
├─ Dev Port Manager-1.0.0-win-x64.exe      # Windows installer
├─ Dev Port Manager-1.0.0-win-x64.msi      # Windows MSI
├─ Dev Port Manager-portable-1.0.0.exe     # Windows portable
├─ Dev Port Manager-1.0.0-mac-x64.dmg      # macOS Intel
├─ Dev Port Manager-1.0.0-mac-arm64.dmg    # macOS Apple Silicon
├─ Dev Port Manager-1.0.0-linux-x64.AppImage
└─ Dev Port Manager-1.0.0-linux-x64.deb
```

---

## Installer Features

### NSIS Installer (.exe)
- ✅ Custom installation directory
- ✅ Desktop shortcut
- ✅ Start menu shortcut
- ✅ Uninstaller
- ✅ Run after install
- ✅ Admin privileges option

### MSI Installer (.msi)
- ✅ Enterprise deployment
- ✅ Silent install: `msiexec /i file.msi /quiet`
- ✅ GPO deployment
- ✅ SCCM compatible
- ✅ Custom install location

### Portable (.exe)
- ✅ No installation required
- ✅ Run from USB drive
- ✅ Self-contained
- ✅ Perfect for testing

### DMG (macOS)
- ✅ Drag to Applications
- ✅ Code signed
- ✅ Notarized (with Apple Developer ID)

### AppImage (Linux)
- ✅ Universal Linux package
- ✅ No installation required
- ✅ Works on most distributions
- ✅ Auto-mounts and runs

### DEB (Linux)
- ✅ Debian/Ubuntu package
- ✅ Installs to /opt
- ✅ Desktop integration
- ✅ apt-manageable

---

## Code Signing

### Windows

Create `build/signing-config.json`:
```json
{
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "your-password",
  "signingHashAlgorithms": ["sha256"],
  "sign": "signtool sign /f ${certificateFile} /p ${certificatePassword} /t http://timestamp.digicert.com ${path}"
}
```

### macOS

Requires Apple Developer ID:
```bash
# Set in .env or environment
export APPLE_ID=your@apple.com
export APPLE_APP_SPECIFIC_PASSWORD=your-password
export APPLE_TEAM_ID=your-team-id

npm run build:mac
```

---

## Publishing

### GitHub Releases

Update `package.json`:
```json
"publish": {
  "provider": "github",
  "owner": "your-org",
  "repo": "dev-port-manager",
  "releaseType": "release"
}
```

### Publish Command
```bash
npm run release
```

This will:
1. Build installers
2. Create GitHub release
3. Upload artifacts
4. Notify auto-updater

---

## Testing Builds

### Test Installer
```bash
# Windows
dist/Dev\ Port\ Manager-1.0.0-win-x64.exe

# macOS
open dist/Dev\ Port\ Manager-1.0.0-mac-x64.dmg

# Linux
chmod +x dist/Dev\ Port\ Manager-1.0.0-linux-x64.AppImage
./dist/Dev\ Port\ Manager-1.0.0-linux-x64.AppImage
```

### Test Portable
```bash
# Windows
dist/Dev\ Port\ Manager-portable-1.0.0.exe

# Runs without installation, perfect for testing
```

---

## Build Configuration

### package.json build section

```json
{
  "build": {
    "appId": "com.devportmanager.app",
    "productName": "Dev Port Manager",
    "artifactName": "${productName}-${version}-${os}-${arch}.${ext}",
    "directories": {
      "output": "dist",
      "buildResources": "build"
    },
    "files": [
      "desktop/**/*",
      "lib/**/*",
      "bin/**/*",
      "views/**/*",
      "public/**/*",
      "server.js",
      "package.json"
    ],
    "win": {
      "target": ["nsis", "msi", "portable"]
    },
    "mac": {
      "target": ["dmg"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

---

## Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Missing Dependencies
```bash
# Install build tools
npm install --save-dev electron-builder
```

### macOS Notarization Fails
```bash
# Check Apple ID credentials
xcrun notarytool history --apple-id "your@apple.com"
```

### Windows Build Too Large
- Enable compression in NSIS config
- Remove unnecessary files from build
- Use portable build (smaller)

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/build.yml`:
```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install
      - run: npm run build:${{ matrix.os == 'windows-latest' && 'win' || matrix.os == 'macos-latest' && 'mac' || 'linux' }}
      
      - uses: actions/upload-artifact@v3
        with:
          name: dist-${{ matrix.os }}
          path: dist/
```

---

## Distribution

### Where to Distribute

1. **GitHub Releases** (Recommended)
   - Free
   - Auto-update compatible
   - Version tracking

2. **Website**
   - Direct downloads
   - Custom branding
   - Analytics

3. **Package Managers**
   - Windows: winget, chocolatey
   - macOS: Homebrew
   - Linux: Snap, Flatpak

4. **Enterprise**
   - Internal repository
   - MSI for GPO
   - MDM for macOS

---

## Size Optimization

### Default Build Sizes
- Windows installer: ~150MB
- macOS DMG: ~160MB
- Linux AppImage: ~140MB

### Reduce Size
1. Remove unused dependencies
2. Use webpack to bundle
3. Enable compression
4. Remove source maps in production

---

## Performance Benchmarks

### Build Times
- Windows: ~2 minutes
- macOS: ~3 minutes
- Linux: ~2 minutes

### Install Times
- NSIS: ~10 seconds
- MSI: ~15 seconds
- Portable: Instant (no install)

---

## Next Steps

1. **Build**: `npm run build`
2. **Test**: Install and test on target OS
3. **Sign**: Code sign if distributing publicly
4. **Publish**: Upload to GitHub or website
5. **Monitor**: Track downloads and errors

---

**Happy Building! 🚀**
