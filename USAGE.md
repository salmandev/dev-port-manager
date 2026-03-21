# Dev Port Manager - Usage Guide

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Command Reference](#command-reference)
4. [Common Workflows](#common-workflows)
5. [Integration Patterns](#integration-patterns)
6. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Node.js 14+ 
- npm or yarn
- (Optional) sudo access for `/etc/hosts` management

### Install

```bash
npm install -g @devops/dev-port-manager
```

### Verify

```bash
dpm --version
dpm --help
```

## Getting Started

### 1. First Time Setup

```bash
# Initialize the registry
dpm init

# Check status
dpm status
```

Output:
```
=== Dev Port Manager Status ===

Registry: /home/user/.dpm/registry.json
Total projects: 0
Port range: 9000–9999
Used ports: 0
Available ports: 1000
```

### 2. Create Your First Project

```bash
# Go to your project directory
cd my-service/

# Assign a port
dpm assign my-service --output . --vscode
```

Output:
```
✓ Project 'my-service' assigned to port 9100
  Host: my-service.localtest.me
  URL: http://my-service.localtest.me:9100
  Config: /path/to/my-service/.project-dev.json
```

### 3. View Generated Config

```bash
cat .project-dev.json
```

```json
{
  "name": "my-service",
  "host": "my-service.localtest.me",
  "port": 9100,
  "url": "http://my-service.localtest.me:9100",
  "environment": {
    "PROJ_NAME": "my-service",
    "PROJ_HOST": "my-service.localtest.me",
    "PROJ_PORT": 9100,
    "PROJ_URL": "http://my-service.localtest.me:9100"
  }
}
```

### 4. Use in Your Application

**Node.js:**

```javascript
const config = require('./.project-dev.json');

const express = require('express');
const app = express();

app.listen(config.port, '127.0.0.1', () => {
  console.log(`Service running at ${config.url}`);
});
```

**Python:**

```python
import json

with open('.project-dev.json') as f:
    config = json.load(f)

app.run(
    port=config['port'],
    host='127.0.0.1',
    debug=True
)
```

**Bash:**

```bash
#!/bin/bash
CONFIG=.project-dev.json
PORT=$(jq -r '.port' $CONFIG)
HOST=$(jq -r '.host' $CONFIG)

echo "Starting service on $HOST:$PORT"
# Your startup command
```

## Command Reference

### dpm assign <project>

Assign a port to a project.

```bash
# Basic usage
dpm assign my-service

# With custom output directory
dpm assign my-service --output ./config

# With VS Code integration
dpm assign my-service --vscode

# With Docker support
dpm assign my-service --docker

# With custom hostname
dpm assign my-service --host my-service.local

# With specific port
dpm assign my-service --port 9200
```

**All options:**

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--host` | `-h` | string | `{project}.localtest.me` | Custom hostname |
| `--port` | `-p` | number | auto | Specify port (auto if not given) |
| `--output` | `-o` | string | `.` | Output directory |
| `--vscode` | `-v` | boolean | false | Generate VS Code settings |
| `--docker` | `-d` | boolean | false | Generate Docker .env |

### dpm list [filter]

List all projects.

```bash
# All projects
dpm list

# Filter by name
dpm list api
dpm list jenkins

# JSON output
dpm list --json > projects.json

# Only active projects
dpm list --active-only
```

Sample output:

```
┌──────────────────────┬──────────────────────────────────────┬───────┬────────────────────────────────────┐
│ Project              │ Host                                 │ Port  │ URL                                │
├──────────────────────┼──────────────────────────────────────┼───────┼────────────────────────────────────┤
│ api-gateway          │ api-gateway.localtest.me             │ 9100  │ http://api-gateway.localtest.me... │
│ auth-service         │ auth-service.localtest.me            │ 9101  │ http://auth-service.localtest.me.. │
│ user-service         │ user-service.localtest.me            │ 9102  │ http://user-service.localtest.me.. │
└──────────────────────┴──────────────────────────────────────┴───────┴────────────────────────────────────┘
```

### dpm sync

Sync `/etc/hosts` from registry.

```bash
# Requires sudo/admin
sudo dpm sync

# With backup
sudo dpm sync --backup

# Remove stale entries
sudo dpm sync --remove-stale
```

### dpm remove <project>

Remove a project from registry.

```bash
dpm remove my-service

# Verify it's removed
dpm list | grep my-service  # Should show nothing
```

### dpm init

Initialize registry.

```bash
dpm init

# Check
ls -la ~/.dpm/registry.json
```

### dpm status

Show registry status.

```bash
dpm status
```

## Common Workflows

### Workflow 1: Set Up Multiple Services

```bash
# Create microservices
dpm assign api-gateway --output ./api-gateway --vscode
dpm assign auth-service --output ./auth-service --vscode
dpm assign user-service --output ./user-service --vscode

# View all
dpm list

# List output:
# api-gateway      → 9100
# auth-service     → 9101
# user-service     → 9102
```

### Workflow 2: Docker Compose Setup

```bash
# Assign port
dpm assign web-app --docker

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.9'
services:
  web:
    build: .
    ports:
      - "${PROJ_PORT}:8080"
    env_file:
      - .env
EOF

# View generated .env
cat .env
# Output:
# PROJ_NAME=web-app
# PROJ_PORT=9100
# ...

# Start service
docker-compose up -d

# Access at http://web-app.localtest.me:9100
```

### Workflow 3: Bootstrap New Project

Create `bootstrap.sh`:

```bash
#!/bin/bash
set -e

PROJECT=$(basename "$(pwd)")
echo "Bootstrapping $PROJECT..."

# Assign port
dpm assign "$PROJECT" --output . --vscode

# Load environment
export $(grep PROJ_PORT .project-dev.json | xargs)

# Install dependencies
npm install

# Start service
npm start
```

Run:

```bash
chmod +x bootstrap.sh
./bootstrap.sh
```

### Workflow 4: CI/CD Integration

In your CI/CD pipeline:

```bash
# Jenkins/GitLab/GitHub Actions
- name: Setup Dev Environment
  run: |
    dpm assign ${{ env.SERVICE_NAME }} --output .
    cat .project-dev.json
    export $(grep PROJ .project-dev.json | xargs)
    echo "Service URL: $PROJ_URL"
```

### Workflow 5: Local Development with Multiple Services

Start multiple services in one session:

```bash
#!/bin/bash

# Terminal 1: API Gateway
cd ./api-gateway
dpm assign api-gateway
npm start

# Terminal 2: Auth Service
cd ./auth-service
dpm assign auth-service
npm start

# Terminal 3: User Service
cd ./user-service
dpm assign user-service
npm start

# Terminal 4: View all services
dpm list
```

## Integration Patterns

### Pattern 1: Node.js/Express

```javascript
// server.js
const config = require('./.project-dev.json');
const express = require('express');
const app = express();

app.get('/status', (req, res) => {
  res.json({
    name: config.name,
    host: config.host,
    port: config.port
  });
});

app.listen(config.port, '127.0.0.1', () => {
  console.log(`✓ Running at ${config.url}`);
});
```

### Pattern 2: Python/Flask

```python
# app.py
import json
from flask import Flask, jsonify

with open('.project-dev.json') as f:
    config = json.load(f)

app = Flask(__name__)

@app.route('/status')
def status():
    return jsonify(config)

if __name__ == '__main__':
    app.run(
        port=config['port'],
        host='127.0.0.1'
    )

# Run: python app.py
```

### Pattern 3: Docker Compose

```yaml
version: '3.9'

services:
  app:
    build: .
    ports:
      - "${PROJ_PORT}:8080"
    env_file:
      - .env
    environment:
      SERVICE_URL: "${PROJ_URL}"
      LOG_LEVEL: debug

volumes:
  data:
```

### Pattern 4: GitHub Actions

```yaml
name: Setup Local Environment

on: [push]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dpm
        run: npm install -g @devops/dev-port-manager
      
      - name: Assign port
        run: |
          dpm init
          dpm assign ${{ github.event.repository.name }}
          cat .project-dev.json
      
      - name: Start service
        run: npm start
```

## Troubleshooting

### "dpm: command not found"

**Solution:**

```bash
# Check if installed
npm list -g @devops/dev-port-manager

# Reinstall
npm install -g @devops/dev-port-manager

# Check PATH
echo $PATH | grep npm
```

### "Permission denied" on /etc/hosts sync

**Solution 1: Use sudo**

```bash
sudo dpm sync
```

**Solution 2: Use localtest.me**

```bash
# Use default localtest.me (no sudo needed)
dpm assign my-service
```

### "Port already in use"

**Solution:**

```bash
# Check what's using the port
lsof -i :9100        # Linux/Mac
netstat -ano | findstr :9100  # Windows

# Assign different port
dpm assign my-service --port 9200
```

### Registry not found

**Solution:**

```bash
# Initialize registry
dpm init

# Check
ls -la ~/.dpm/registry.json
```

### JSON parse error in .project-dev.json

**Solution:**

```bash
# Regenerate config
dpm remove my-service
dpm assign my-service

# Verify
cat .project-dev.json | jq .
```

---

For more help: `dpm --help`
