# Installation & Deployment Guide

## Quick Start (5 minutes)

### 1. Install from NPM

```bash
npm install -g @devops/dev-port-manager
```

### 2. Verify Installation

```bash
dpm --version
dpm --help
```

### 3. Initialize Registry

```bash
dpm init
```

### 4. Assign First Port

```bash
cd my-service
dpm assign my-service --output . --vscode
cat .project-dev.json
```

### 5. Start Your Service

```bash
# View configuration
cat .project-dev.json | jq .

# Export port
export PROJ_PORT=$(jq -r '.port' .project-dev.json)

# Start service on assigned port
npm start  # Service should listen on $PROJ_PORT
```

---

## Installation Methods

### Method 1: NPM Global (Recommended)

```bash
# Install
npm install -g @devops/dev-port-manager

# Verify
dpm --version

# Uninstall (if needed)
npm uninstall -g @devops/dev-port-manager
```

### Method 2: Local Development

```bash
# Clone repository
git clone https://github.com/dev-port-manager/dev-port-manager.git
cd dev-port-manager

# Install dependencies
npm install

# Link locally
npm link

# Verify
dpm --version

# Unlink (when done)
npm unlink
```

### Method 3: Docker

```dockerfile
FROM node:18-alpine

RUN npm install -g @devops/dev-port-manager

WORKDIR /app
CMD ["dpm", "--help"]
```

```bash
docker build -t dev-port-manager .
docker run --rm dev-port-manager dpm --version
```

---

## Post-Installation Setup

### For macOS

1. **Install Node.js** (if not already installed)
   ```bash
   brew install node
   ```

2. **Install dev-port-manager**
   ```bash
   npm install -g @devops/dev-port-manager
   ```

3. **Use localtest.me** (recommended, no sudo needed)
   ```bash
   dpm assign my-service
   # Uses my-service.localtest.me automatically
   ```

### For Linux

1. **Install Node.js**
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```

2. **Install dev-port-manager**
   ```bash
   npm install -g @devops/dev-port-manager
   ```

3. **Optional: Set up sudo for /etc/hosts sync**
   ```bash
   # Use localtest.me (no sudo needed)
   dpm assign my-service
   
   # Or configure passwordless sudo:
   echo "$(whoami) ALL=(ALL) NOPASSWD: $(which dpm) sync" | sudo tee -a /etc/sudoers.d/dpm
   ```

### For Windows

1. **Install Node.js**
   - Download from https://nodejs.org/
   - Or use chocolatey: `choco install nodejs`

2. **Install dev-port-manager**
   ```powershell
   npm install -g @devops/dev-port-manager
   ```

3. **Use PowerShell for bootstrap**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   & dpm assign my-service
   ```

4. **Optional: WSL Support**
   ```bash
   # Inside WSL (Ubuntu/Debian/etc)
   npm install -g @devops/dev-port-manager
   dpm init
   ```

### For WSL2 (Windows Subsystem for Linux)

```bash
# Inside WSL
npm install -g @devops/dev-port-manager

# Use localtest.me or WSL-specific hosts
dpm assign my-service

# Optional: Access from Windows
# Windows resolves *.localtest.me to 127.0.0.1
# Same as Linux
```

---

## Team/Organization Deployment

### Scenario 1: Team Onboarding Script

Create `setup-env.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Setting up dev environment..."

# Install CLI
npm install -g @devops/dev-port-manager

# Initialize
dpm init

# Set up standard services
services=(
    "api-gateway"
    "auth-service"
    "user-service"
    "notification-service"
)

for service in "${services[@]}"; do
    dpm assign "$service" --vscode
done

echo "✓ Setup complete!"
echo "Available services:"
dpm list
```

Usage:
```bash
# Run once per team member
bash setup-env.sh
```

### Scenario 2: Docker Container

**Dockerfile:**

```dockerfile
FROM node:18-alpine

RUN npm install -g @devops/dev-port-manager

RUN mkdir -p /root/.dpm
VOLUME ["/root/.dpm"]

WORKDIR /workspace
ENTRYPOINT ["dpm"]
```

**Build & Use:**

```bash
# Build image
docker build -t dpm:latest .

# Create volume for persistent registry
docker volume create dpm-registry

# Run command
docker run --volume dpm-registry:/root/.dpm dpm init
docker run --volume dpm-registry:/root/.dpm dpm list
```

### Scenario 3: CI/CD Pipeline Integration

**GitHub Actions:**

```yaml
name: Setup Dev Environment

on: [push]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install -g @devops/dev-port-manager
      - run: dpm init
      - run: dpm assign my-service
      - run: dpm list
```

**GitLab CI:**

```yaml
build:
  image: node:18-alpine
  script:
    - npm install -g @devops/dev-port-manager
    - dpm init
    - dpm assign my-service
    - dpm list
```

**Jenkins:**

```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                sh '''
                    npm install -g @devops/dev-port-manager
                    dpm init
                    dpm assign jenkins-build-${BUILD_ID}
                '''
            }
        }
    }
}
```

---

## Configuration & Maintenance

### Registry Backup & Restore

```bash
# Backup registry
cp ~/.dpm/registry.json ~/.dpm/registry.json.backup

# Restore from backup
cp ~/.dpm/registry.json.backup ~/.dpm/registry.json

# Share across machines
scp ~/.dpm/registry.json user@remote:~/.dpm/registry.json
```

### Sync /etc/hosts

```bash
# Linux/macOS/WSL
sudo dpm sync

# Backup before sync
sudo dpm sync --backup

# Remove stale entries
sudo dpm sync --remove-stale
```

### View Registry

```bash
# Pretty print
cat ~/.dpm/registry.json | jq .

# Count projects
jq 'keys[] | select(. != "_metadata" and . != "_reserved") | "."' ~/.dpm/registry.json | wc -l

# Export for backup
jq . ~/.dpm/registry.json > backup-$(date +%Y%m%d).json
```

---

## Troubleshooting Installation

### Issue: "npm: command not found"

```bash
# Install Node.js from https://nodejs.org/
# Or package manager:
brew install node          # macOS
sudo apt install nodejs    # Linux
choco install nodejs       # Windows
```

### Issue: "dpm: command not found"

```bash
# Check npm prefix
npm config get prefix

# Add to PATH (if needed)
export PATH=$PATH:$(npm config get prefix)/bin

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export PATH=$PATH:$(npm config get prefix)/bin' >> ~/.bashrc
```

### Issue: "Permission denied"

```bash
# Fix npm permissions (macOS/Linux)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to bashrc/zshrc:
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
```

### Issue: "Registry not initialized"

```bash
# Initialize
dpm init

# Verify
ls -la ~/.dpm/registry.json
```

For more troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Verification Checklist

After installation, verify everything works:

```bash
# 1. CLI installed
dpm --version
# Expected: 1.0.0 or similar

# 2. Registry initialized
dpm init

# 3. Registry exists
ls -la ~/.dpm/registry.json
# Expected: File exists

# 4. Can assign port
dpm assign test-project

# 5. Can list projects
dpm list
# Expected: test-project listed

# 6. Can view status
dpm status
# Expected: Registry info displayed

# 7. Cleanup
dpm remove test-project
```

---

## System Requirements

### Minimum

- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- 50 MB disk space

### Operating Systems

- ✅ Linux (Ubuntu, Debian, CentOS, Alpine, etc.)
- ✅ macOS (10.13+)
- ✅ Windows (with PowerShell)
- ✅ WSL (Windows Subsystem for Linux)
- ✅ Docker containers

### Optional

- sed/awk (for advanced /etc/hosts editing)
- sudo/admin access (for /etc/hosts sync)
- Docker/docker-compose (for Docker integration)
- VS Code (for port forwarding features)

---

## Security

### Before First Use

1. **Review registry location**: `~/.dpm/registry.json`
   - User-readable (non-sensitive data)
   - Can be synced to team storage
   - Should be gitignored in projects

2. **Understand port access**:
   - Localhost only (127.0.0.1)
   - Not exposed to external network
   - User responsible for firewall rules

3. **For /etc/hosts sync**:
   - Requires admin/sudo privileges
   - Automatic backups created before modification
   - Review changes with `sudo dpm sync --backup`

### Best Practices

- ✅ Keep registry updated
- ✅ Back up registry regularly
- ✅ Git ignore project configs in sensitive repos
- ✅ Use separate registry per environment (if needed)
- ✅ Review /etc/hosts changes before applying

---

## Uninstallation

### Uninstall CLI

```bash
npm uninstall -g @devops/dev-port-manager
```

### Clean Up Registry

```bash
# Keep registry (optional, for future use)
# ls ~/.dpm/registry.json

# Or remove completely
rm -rf ~/.dpm/
```

### Clean Up /etc/hosts (Linux/macOS)

```bash
# Remove DPM entries from /etc/hosts
sudo sed -i '/DEV PORT MANAGER/,/DEV PORT MANAGER END/d' /etc/hosts

# Or WSL:
sed -i '/DEV PORT MANAGER/,/DEV PORT MANAGER END/d' /etc/hosts
```

---

## Updates

### Check Version

```bash
dpm --version
```

### Update to Latest

```bash
npm install -g @devops/dev-port-manager@latest
```

### Update to Specific Version

```bash
npm install -g @devops/dev-port-manager@1.0.0
```

### Check for Updates

```bash
npm outdated -g @devops/dev-port-manager
```

---

## Next Steps

After installation:

1. **Read Quick Start**: [README.md](./README.md)
2. **Study Usage Guide**: [USAGE.md](./USAGE.md)
3. **Review Examples**: [examples/](./examples/)
4. **Run Tutorial**: Follow [QUICKREF.md](./QUICKREF.md)

---

## Support

- 📖 [Documentation](./README.md)
- ❓ [Troubleshooting](./TROUBLESHOOTING.md)
- 🏗️ [Architecture](./ARCHITECTURE.md)
- 💬 [Contributing](./CONTRIBUTING.md)

---

## Getting Help

If you encounter issues:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review the [examples](./examples/)
3. Read [USAGE.md](./USAGE.md) for detailed guidance
4. See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details

---

Ready to go! 🚀

Start with: `dpm --help`
