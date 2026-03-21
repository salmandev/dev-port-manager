# Example Project Setup Scenarios

This directory contains example configurations and setup scenarios for using Dev Port Manager.

## Scenario 1: Single Microservice with Docker

**Setup:** API service in Docker container

### Files

- `registry.example.json` - Registry with 8 projects
- `project-config.example.json` - Single project config
- `docker-compose.example.yml` - Docker Compose setup
- `.env.example` - Environment variables

### Steps

```bash
# 1. Assign port
cd my-api-service
dpm assign api-service --output . --docker

# 2. Copy docker-compose template
cp /path/to/docker-compose.template.yml docker-compose.yml

# 3. Customize docker-compose.yml
# Replace <IMAGE_NAME> with your image
# Update service ports to use ${PROJ_PORT}

# 4. Start service
docker-compose up -d

# 5. Verify
curl http://api-service.localtest.me:$(jq .port .project-dev.json)
```

## Scenario 2: Multiple Microservices

**Setup:** 3 interconnected services (API Gateway, Auth, User)

### Services

```
API Gateway (9100)
├── Auth Service (9101)
└── User Service (9102)
```

### Setup Steps

```bash
# Terminal 1: API Gateway
cd api-gateway
dpm assign api-gateway --output .
npm start

# Terminal 2: Auth Service
cd auth-service
dpm assign auth-service --output .
npm start

# Terminal 3: User Service
cd user-service
dpm assign user-service --output .
npm start

# Terminal 4: Verify
dpm list
```

### Configuration

**api-gateway/.project-dev.json:**

```json
{
  "name": "api-gateway",
  "port": 9100,
  "url": "http://api-gateway.localtest.me:9100"
}
```

**api-gateway/config.js:**

```javascript
module.exports = {
  apiGateway: require('./.project-dev.json'),
  authService: {
    url: 'http://auth-service.localtest.me:9101'
  },
  userService: {
    url: 'http://user-service.localtest.me:9102'
  }
};
```

## Scenario 3: Development Environment Bootstrap

**Setup:** Automated bootstrap script for new developers

### bootstrap.sh

```bash
#!/bin/bash
set -e

echo "🚀 Bootstrapping development environment..."

# Check dpm installed
if ! command -v dpm &> /dev/null; then
    echo "Installing dev-port-manager..."
    npm install -g @devops/dev-port-manager
fi

# Initialize registry
dpm init

# Assign ports to all services
services=(
    "api-gateway"
    "auth-service"
    "user-service"
    "notification-service"
)

for service in "${services[@]}"; do
    if [ -d "$service" ]; then
        echo "Setting up $service..."
        (cd "$service" && dpm assign "$service" --output . --vscode)
    fi
done

echo "✓ Bootstrap complete!"
echo ""
echo "Assigned ports:"
dpm list

echo ""
echo "Next steps:"
echo "1. Install dependencies: npm install"
echo "2. Start services in separate terminals"
```

### package.json

```json
{
  "scripts": {
    "bootstrap": "bash bootstrap.sh",
    "setup-all": "npm bootstrap && npm install"
  }
}
```

## Scenario 4: CI/CD Integration (GitHub Actions)

**Setup:** Automated setup in CI/CD pipeline

### .github/workflows/dev-setup.yml

```yaml
name: Setup Dev Environment

on: [push, pull_request]

jobs:
  setup:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dev-port-manager
        run: npm install -g @devops/dev-port-manager
      
      - name: Initialize registry
        run: dpm init
      
      - name: Assign ports
        run: |
          dpm assign api-gateway --output ./api-gateway
          dpm assign auth-service --output ./auth-service
          dpm assign user-service --output ./user-service
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
```

## Scenario 5: Local Development with Existing Docker Hub Images

**Setup:** Use public images with local port assignment

### docker-compose.yml

```yaml
version: '3.9'

services:
  jenkins:
    image: jenkins/jenkins:latest
    container_name: jenkins-local
    ports:
      - "9001:8080"
    environment:
      JENKINS_OPTS: "--prefix=/jenkins"

  jira:
    image: atlassian/jira-software:latest
    container_name: jira-local
    ports:
      - "9004:8080"
    environment:
      ATL_JDBC_URL: jdbc:h2:mem:test
      ATL_DB_DRIVER: org.h2.Driver

  postgres-ui:
    image: adminer:latest
    container_name: postgres-ui
    ports:
      - "9200:8080"
    depends_on:
      - postgres

  postgres:
    image: postgres:14
    container_name: postgres-dev
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev

  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: redis-commander
    ports:
      - "9300:8081"
    environment:
      REDIS_HOSTS: local:redis:6379

  redis:
    image: redis:latest
    container_name: redis-dev
    ports:
      - "6379:6379"
```

### .env

```
PROJ_NAME=infrastructure
PROJ_PORT=9000
JENKINS_PORT=9001
JIRA_PORT=9004
POSTGRES_UI_PORT=9200
REDIS_COMMANDER_PORT=9300
```

### Usage

```bash
# Assign infrastructure ports
dpm assign jenkins-local --port 9001
dpm assign jira-local --port 9004
dpm assign postgres-ui --port 9200
dpm assign redis-commander --port 9300

# Sync /etc/hosts
sudo dpm sync

# Start stack
docker-compose up -d

# View
dpm list
```

## Scenario 6: VS Code Remote Development

**Setup:** Using project config in VS Code Remote SSH

### .devcontainer/devcontainer.json

```json
{
  "name": "Dev Environment",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/nodejs:1": {
      "version": "18"
    }
  },
  "postCreateCommand": "npm install -g @devops/dev-port-manager && dpm init",
  "customizations": {
    "vscode": {
      "extensions": [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint"
      ],
      "settings": {
        "forwardPorts": [9100, 9101, 9102]
      }
    }
  }
}
```

## Scenario 7: Jenkins Integration

**Setup:** Use ports from registry in Jenkins Job

### Jenkinsfile

```groovy
pipeline {
    agent any
    
    environment {
        DPM_INIT = '''
            if ! command -v dpm &> /dev/null; then
                npm install -g @devops/dev-port-manager
            fi
            dpm init
        '''
    }
    
    stages {
        stage('Setup') {
            steps {
                sh(DPM_INIT)
                sh '''
                    dpm assign jenkins-build-${BUILD_ID} --output .
                    cat .project-dev.json
                '''
            }
        }
        
        stage('Build') {
            steps {
                sh '''
                    export $(jq -r '.environment | to_entries[] | "\(.key)=\(.value)"' .project-dev.json)
                    npm install
                    npm run build
                '''
            }
        }
        
        stage('Test') {
            steps {
                sh '''
                    export $(jq -r '.environment | to_entries[] | "\(.key)=\(.value)"' .project-dev.json)
                    npm test
                '''
            }
        }
    }
}
```

---

## Quick Reference

| Scenario | Key Feature |
|----------|------------|
| Scenario 1 | Single service + Docker |
| Scenario 2 | Multiple microservices |
| Scenario 3 | Team bootstrap script |
| Scenario 4 | GitHub Actions |
| Scenario 5 | Docker Compose stack |
| Scenario 6 | VS Code Remote |
| Scenario 7 | Jenkins integration |

---

For more details, see [USAGE.md](../USAGE.md)
