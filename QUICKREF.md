# Quick Reference

## Installation

```bash
npm install -g @devops/dev-port-manager
dpm --version
```

## Basic Commands

| Command | Purpose |
|---------|---------|
| `dpm assign PROJECT` | Assign port to project |
| `dpm list` | List all projects |
| `dpm remove PROJECT` | Remove project |
| `dpm sync` | Sync /etc/hosts |
| `dpm init` | Initialize registry |
| `dpm status` | Show status |
| `dpm --help` | Show help |

## Common Workflows

### New Project

```bash
cd my-project
dpm assign my-project --output . --vscode
cat .project-dev.json
npm start
```

### Docker Setup

```bash
dpm assign my-service --docker
docker-compose up -d
```

### Bootstrap Script

```bash
#!/bin/bash
dpm assign $(basename "$(pwd)") --output .
export $(grep PROJ_PORT .project-dev.json | xargs)
npm start
```

## Options

### dpm assign

- `--host, -h` - Custom hostname
- `--port, -p` - Specific port
- `--output, -o` - Output directory
- `--vscode, -v` - Generate VS Code settings
- `--docker, -d` - Generate Docker .env

### dpm list

- `--json` - JSON output
- `--active-only, -a` - Only active projects

### dpm sync

- `--backup, -b` - Create backup
- `--remove-stale, -r` - Remove old entries

## Environment Variables

After `dpm assign`:

- `PROJ_NAME` - Project name
- `PROJ_HOST` - Hostname
- `PROJ_PORT` - Port number
- `PROJ_URL` - Full URL
- `LOCALHOST_PORT` - Alias for port

## Port Ranges

```
9000-9099  → Core infrastructure
9100-9499  → Project services
9500-9999  → Experimental/Docker
```

## Hostnames

- Default: `{project}.localtest.me` (no admin needed)
- Custom: `-h my-server.local` (manual /etc/hosts)
- Sync: `sudo dpm sync` (admin required)

## Files Generated

- `.project-dev.json` - Project configuration
- `.env` - Docker environment (with `--docker`)
- `.vscode/settings.json` - Port forwarding (with `--vscode`)

## Registry Location

`~/.dpm/registry.json`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `dpm not found` | `npm install -g @devops/dev-port-manager` |
| Port in use | `dpm assign project --port 9200` |
| Admin denied | Use `localtest.me` (default) |
| Config missing | `dpm assign project --output .` |

## Examples

### List with JSON

```bash
dpm list --json | jq '.[] | {name, port}'
```

### Filter projects

```bash
dpm list api
```

### Check single project

```bash
dpm list my-service --json
```

### Generate without VS Code

```bash
dpm assign my-project
```

### Generate with all options

```bash
dpm assign my-project --output . --vscode --docker
```

### Use in shell script

```bash
#!/bin/bash
CONFIG=.project-dev.json
eval $(jq -r 'to_entries[] | "export \(.key | ascii_upcase)=\(.value | @json)"' $CONFIG)
echo "Service at: $PROJ_URL"
```

### Use in Node.js

```javascript
const config = require('./.project-dev.json');
const port = config.port;
const url = config.url;
```

### Use in Python

```python
import json
config = json.load(open('.project-dev.json'))
port = config['port']
url = config['url']
```

---

See [USAGE.md](./USAGE.md) for detailed guide  
See [README.md](./README.md) for full documentation
