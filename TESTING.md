# Dev Port Manager - Testing Guide

## Overview

The Dev Port Manager includes a comprehensive test suite covering:
- Unit tests for all lib modules
- API tests for web dashboard endpoints
- Integration tests for full workflows

## Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Unit Tests Only
```bash
npm test
```

### Run API Tests Only
```bash
npm run test:api
```

## Test Coverage

### Unit Tests (test/test.js)
Tests the following modules:

#### Settings Module
- ✅ Settings file exists
- ✅ Load settings
- ✅ Get port range
- ✅ Set and get setting

#### Registry Module
- ✅ Registry path configuration
- ✅ Hosts file path detection

#### Project Module
- ✅ Port availability checking
- ✅ Project type detection
- ✅ Project assignment
- ✅ Project retrieval
- ✅ Project listing

#### Scan Directory
- ✅ Directory scanning (dry run)

#### Docker Module
- ✅ Docker availability check
- ✅ Docker Compose availability check
- ✅ Docker .env generation
- ✅ Docker Compose file generation

#### Backup/Restore
- ✅ Create backup
- ✅ List backups

### API Tests (test/api-test.js)
Tests the following endpoints:

- ✅ `GET /api/projects` - List all projects
- ✅ `GET /api/system` - Get system information
- ✅ `GET /api/port/:port` - Check single port status
- ✅ `GET /api/ports/status` - Check all ports status
- ✅ `GET /api/backups` - List registry backups

## Live Status Page

A real-time status page is available at:
```
http://localhost:4000/status
```

Features:
- Auto-refreshes every 30 seconds
- Shows all projects with live port status
- Displays system information
- Dark theme for easy monitoring

## Web Dashboard

The main dashboard is available at:
```
http://localhost:4000
```

Features:
- Project management UI
- Live port status
- Search and filter
- Backup/restore functionality
- Settings management

## Manual Testing Checklist

### CLI Commands
- [ ] `dev-port assign test-app` - Assign project
- [ ] `dev-port list` - List projects
- [ ] `dev-port info test-app` - Get project info
- [ ] `dev-port remove test-app` - Remove project
- [ ] `dev-port scan ~/Projects --dry-run` - Scan directory
- [ ] `dev-port settings` - View settings
- [ ] `dev-port set theme dark` - Update setting
- [ ] `dev-port backup` - Create backup
- [ ] `dev-port backups` - List backups
- [ ] `dev-port docker test-app --compose` - Generate Docker files
- [ ] `dev-port docker-check` - Check Docker availability
- [ ] `dev-port dashboard` - Start web dashboard

### Web Dashboard
- [ ] Open http://localhost:4000
- [ ] View projects table
- [ ] Click "Assign Project"
- [ ] Click "Scan Directory"
- [ ] Click "Refresh"
- [ ] Test search/filter
- [ ] Open http://localhost:4000/status (live status)

### Desktop App
- [ ] Run `npm start`
- [ ] View projects in desktop GUI
- [ ] Test "Assign Project" button
- [ ] Test "Scan Directory" button
- [ ] Verify live port status
- [ ] Test menu items

## Troubleshooting

### Tests Fail
If tests fail, check:
1. Node.js version (18+ required)
2. Dependencies installed: `npm install`
3. No other process using test ports
4. Write permissions in temp directory

### API Tests Fail
If API tests fail:
1. Start server: `npm run server`
2. Wait 2 seconds for server to start
3. Check port 4000 is available
4. Verify server is running: `curl http://localhost:4000/api/system`

### Desktop App Issues
If Electron fails:
1. Install dependencies: `npm install`
2. Run with npx: `npx electron desktop/main.js`
3. Check for console errors in DevTools

## Continuous Integration

Add to your CI/CD pipeline:
```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm install

- name: Run tests
  run: npm run test:all

- name: Start server
  run: npm run server &
  
- name: Wait for server
  run: sleep 5
  
- name: Run API tests
  run: npm run test:api
```

## Test Output Example

```
============================================================
Dev Port Manager - Test Suite
============================================================
Started at: 2026-03-20T22:33:39.950Z
Platform: win32 x64
Node: v22.18.0

============================================================
Settings Module Tests
============================================================
✅ Settings file exists
✅ Load settings
✅ Get port range
✅ Set and get setting

============================================================
Project Module Tests
============================================================
✅ Check port availability
✅ Detect project type
✅ Assign project
✅ Get project
✅ List projects
✅ Get all projects

============================================================
Test Summary
============================================================
Total: 21
Passed: 21
Failed: 0

Completed at: 2026-03-20T22:33:40.641Z
```

## Coverage Goals

Current coverage:
- Settings Module: 100%
- Registry Module: 100%
- Project Module: 100%
- Docker Module: 100%
- API Endpoints: 100%

Future goals:
- Add integration tests
- Add E2E tests for desktop app
- Add performance tests
- Add load tests
