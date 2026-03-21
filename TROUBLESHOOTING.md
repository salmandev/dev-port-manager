# Troubleshooting Guide

## Installation Issues

### Issue: "npm: command not found"

**Cause:** Node.js/npm not installed

**Solution:**

```bash
# Install Node.js from https://nodejs.org/
# Or use a package manager:

# macOS (Homebrew)
brew install node

# Ubuntu/Debian
sudo apt-get install nodejs npm

# Windows
choco install nodejs
```

### Issue: "dpm: command not found"

**Cause:** CLI not installed globally

**Solution:**

```bash
# Install globally
npm install -g @devops/dev-port-manager

# Verify
dpm --version

# If still not found, check npm prefix
npm config get prefix

# Add to PATH if needed (Linux/Mac)
export PATH=$PATH:$(npm config get prefix)/bin
```

### Issue: Permission denied during installation

**Cause:** npm doesn't have write permissions to global directory

**Solution (Option 1): Fix npm permissions**

```bash
# On Linux/Mac, change npm default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
```

**Solution (Option 2): Use sudo (not recommended)**

```bash
sudo npm install -g @devops/dev-port-manager
```

---

## Registry Issues

### Issue: "Registry not found"

**Error:** `Failed to load registry: ENOENT`

**Cause:** Registry doesn't exist yet

**Solution:**

```bash
dpm init

# Verify
ls -la ~/.dpm/registry.json
```

### Issue: "Cannot create directory ~/.dpm"

**Cause:** Permission issue

**Solution:**

```bash
# Check home directory
echo $HOME

# Ensure it's writable
mkdir -p ~/.dpm
chmod 755 ~/.dpm

# Retry
dpm init
```

### Issue: "Invalid JSON in registry.json"

**Cause:** Registry file corrupted

**Solution:**

```bash
# Backup the corrupted file
cp ~/.dpm/registry.json ~/.dpm/registry.json.corrupted

# Reinitialize
dpm init

# Or restore from backup if available
cp ~/.dpm/registry.json.backup ~/.dpm/registry.json
```

---

## Port Assignment Issues

### Issue: "Port already assigned to project"

**Error:** `✗ Port 9100 already assigned to project: api-gateway`

**Cause:** Port already in registry

**Solution (Option 1): Auto-assign different port**

```bash
dpm assign my-service
# Will assign next available port
```

**Solution (Option 2): Remove existing project**

```bash
dpm remove api-gateway
dpm assign api-gateway --port 9100
```

**Solution (Option 3): Use different port**

```bash
dpm assign my-service --port 9150
```

### Issue: "Port in use by another process"

**Error:** System returned port in use

**Cause:** Port already bound by another service

**Solution (Option 1): Kill the process**

```bash
# Linux/Mac: Find process using port
lsof -i :9100

# Windows: Find process using port
netstat -ano | findstr :9100

# Kill the process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

**Solution (Option 2): Use different port**

```bash
dpm assign my-service --port 9150
```

**Solution (Option 3): Start service on different port**

```bash
# Or change your service to listen on different port
NODE_PORT=9150 npm start
```

### Issue: "Port must be between 9000 and 9999"

**Cause:** Port specification outside valid range

**Solution:**

```bash
# Use valid port range
dpm assign my-service --port 9100  # Valid
dpm assign my-service --port 8000  # Invalid - outside range
```

---

## Configuration File Issues

### Issue: ".project-dev.json not created"

**Cause:** Output directory doesn't exist or not writable

**Solution (Option 1): Create output directory**

```bash
mkdir -p ./config
dpm assign my-service --output ./config
```

**Solution (Option 2): Use current directory**

```bash
dpm assign my-service --output .
```

**Solution (Option 3): Use temp directory**

```bash
dpm assign my-service --output /tmp
```

### Issue: "Cannot read .project-dev.json in application"

**Cause:** File path wrong or file doesn't exist

**Solution:**

```bash
# Verify file exists
ls -la .project-dev.json

# Test parsing
cat .project-dev.json | jq .

# In Node.js:
const config = require('./.project-dev.json');

# In Python:
import json
with open('.project-dev.json') as f:
    config = json.load(f)

# In Bash:
source <(jq -r '.environment | to_entries[] | "\(.key)=\(.value)"' .project-dev.json)
```

---

## Hosts File Issues

### Issue: "Permission denied" on sync

**Error:** `Permission denied. Run with sudo/admin`

**Cause:** Need elevated privileges to modify /etc/hosts

**Solution (Option 1): Use sudo**

```bash
sudo dpm sync

# Verify
grep DEV_PORT_MANAGER /etc/hosts
```

**Solution (Option 2): Use localtest.me instead**

```bash
# Don't need sudo with localtest.me
dpm assign my-service
# Uses my-service.localtest.me automatically
```

### Issue: "Hostname not resolving"

**Error:** `curl: Could not resolve host`

**Cause:** Entry not in /etc/hosts or DNS issue

**Solution (Option 1): Verify entry exists**

```bash
grep "my-service" /etc/hosts
# Should see: 127.0.0.1 my-service.local
```

**Solution (Option 2): Use localhost instead**

```bash
# Instead of hostname
curl http://localhost:9100

# Or check IP
nslookup my-service.localtest.me
```

**Solution (Option 3): Manual /etc/hosts entry**

```bash
# Linux/Mac
echo "127.0.0.1 my-service.local" | sudo tee -a /etc/hosts

# Windows (run as admin)
Add-Content "C:\Windows\System32\drivers\etc\hosts" "127.0.0.1 my-service.local"
```

### Issue: "Changes not taking effect"

**Cause:** Need to reload DNS cache

**Solution:**

```bash
# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux
sudo systemctl restart nscd
# Or:
sudo /etc/init.d/nscd restart

# Windows (run as admin)
ipconfig /flushdns
```

---

## Docker Integration Issues

### Issue: ".env not generated"

**Cause:** Didn't use --docker flag

**Solution:**

```bash
dpm assign my-service --docker
# Now .env is created
```

### Issue: "docker-compose can't read .env"

**Cause:** File in wrong directory or not referenced in compose file

**Solution (Option 1): Use env_file**

```yaml
services:
  app:
    env_file:
      - .env  # Must be in same directory
```

**Solution (Option 2): Check file location**

```bash
ls -la .env
docker-compose config --resolve-image-digests
```

### Issue: "Port mapping fails in Docker"

**Cause:** Port already in use on host

**Solution:**

```bash
# Check port usage
lsof -i :9100

# Use different port
dpm assign my-service --port 9150

# Update docker-compose.yml to use new port
```

---

## VS Code Integration Issues

### Issue: "Port forwarding not working"

**Cause:** VS Code settings not generated or conflicting

**Solution (Option 1): Regenerate settings**

```bash
dpm assign my-service --vscode
```

**Solution (Option 2): Manual configuration**

```bash
cat > .vscode/settings.json << 'EOF'
{
  "forwardPorts": [9100],
  "portsAttributes": {
    "9100": {
      "label": "My Service",
      "onAutoForward": "notify"
    }
  }
}
EOF
```

### Issue: "settings.json conflicts"

**Cause:** Existing settings conflict with generated ones

**Solution:**

```bash
# Backup existing
cp .vscode/settings.json .vscode/settings.json.backup

# Merge manually or regenerate
dpm assign my-service --vscode
```

---

## Platform-Specific Issues

### macOS

#### Issue: "zsource: command not found in bootstrap.sh"

**Solution:** Use bash explicitly

```bash
bash bootstrap.sh
# Not: zsh bootstrap.sh
```

#### Issue: "Port already in use by Bonjour"

**Solution:**

```bash
# Use port outside Bonjour range (17500-17600)
dpm assign my-service --port 9100
```

### Windows

#### Issue: "PowerShell execution policy error"

**Solution:**

```powershell
# Run as administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or use bypass
powershell -ExecutionPolicy Bypass -File bootstrap.ps1
```

#### Issue: "WSL /etc/hosts not updated"

**Solution (Option 1): Use WSL-specific command**

```bash
# In WSL
dpm sync  # May require passwordless sudo

# Or use localtest.me
dpm assign my-service  # Uses *.localtest.me
```

**Solution (Option 2): Update Windows hosts**

```powershell
# In PowerShell (admin)
Add-Content "C:\Windows\System32\drivers\etc\hosts" "127.0.0.1 my-service.local"
```

### Linux

#### Issue: "sudo requires password for dpm sync"

**Solution: Configure passwordless sudo**

```bash
# Edit sudoers (careful!)
sudo visudo

# Add line (replace with actual path):
username ALL=(ALL) NOPASSWD: /path/to/dpm sync

# Or use localtest.me
dpm assign my-service  # Uses *.localtest.me
```

---

## Debugging

### Enable Verbose Output

```bash
dpm assign my-service --verbose

# Or set environment variable
DPM_DEBUG=1 dpm assign my-service
```

### Check Registry Content

```bash
# View registry
jq . ~/.dpm/registry.json

# Count projects
jq 'keys | length' ~/.dpm/registry.json

# List all ports
jq '.[] | select(.port) | .port' ~/.dpm/registry.json
```

### Test Port Availability

```bash
# Test if port is available
node -e "require('net').createServer().listen(9100)"

# Test connection
curl http://localhost:9100

# Use netcat (nc)
nc -zv localhost 9100
```

### Check System Configuration

```bash
# Show all used ports
lsof -i -P -n | grep LISTEN  # Linux/Mac
netstat -ano | findstr LISTEN  # Windows

# Show registry location
echo $HOME
ls -la ~/.dpm/

# Show npm prefix
npm config get prefix
```

---

## Getting Help

### Resources

- 📖 [README.md](../README.md) - Main documentation
- 📖 [USAGE.md](../USAGE.md) - Detailed usage guide
- 🏗️ [ARCHITECTURE.md](../ARCHITECTURE.md) - Technical details
- ⚡ [QUICKREF.md](../QUICKREF.md) - Quick reference

### Contact & Support

- **Issues:** Open on GitHub
- **Discussions:** Add to GitHub Discussions
- **Questions:** Check documentation first

---

## Common Command Reference

```bash
# Initialization
dpm init                           # Initialize registry
dpm status                         # Show status

# Project Management
dpm assign my-project              # Assign port
dpm assign my-project --port 9150  # Assign specific port
dpm assign my-project --vscode     # With VS Code settings
dpm assign my-project --docker     # With Docker .env
dpm list                           # List all projects
dpm remove my-project              # Remove project

# System Management
sudo dpm sync                      # Update /etc/hosts (Linux/Mac)
sudo dpm sync --backup             # With backup

# Debugging
cat .project-dev.json | jq .       # View config
jq . ~/.dpm/registry.json          # View registry
```

---

If you can't find a solution, please:

1. Check existing [Issues](https://github.com/dev-port-manager/issues)
2. Create a new issue with:
   - Error message (full)
   - OS and version
   - Node.js and npm version
   - Steps to reproduce
3. Check the [Architecture](../ARCHITECTURE.md) for implementation details
