/**
 * Web Dashboard API Tests
 * Tests for Express server endpoints
 * 
 * Usage: node test/api-test.js
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:4000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function request(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000);
    req.end();
  });
}

async function testAPI() {
  log('\n========================================', 'blue');
  log('Web Dashboard API Tests', 'blue');
  log('========================================\n', 'blue');

  let passed = 0;
  let failed = 0;

  // Test 1: Get projects
  try {
    const res = await request('/api/projects');
    assert(res.status === 200, 'Should return 200');
    assert(res.data.success, 'Should return success');
    assert(Array.isArray(res.data.projects), 'Should return projects array');
    log(`✅ GET /api/projects - ${res.data.projects.length} projects`, 'green');
    passed++;
  } catch (err) {
    log(`❌ GET /api/projects - ${err.message}`, 'red');
    failed++;
  }

  // Test 2: Get system info
  try {
    const res = await request('/api/system');
    assert(res.status === 200, 'Should return 200');
    assert(res.data.success, 'Should return success');
    assert(res.data.system.platform, 'Should have platform');
    log(`✅ GET /api/system - ${res.data.system.platform}`, 'green');
    passed++;
  } catch (err) {
    log(`❌ GET /api/system - ${err.message}`, 'red');
    failed++;
  }

  // Test 3: Get port status
  try {
    const res = await request('/api/port/9000');
    assert(res.status === 200, 'Should return 200');
    assert(res.data.success, 'Should return success');
    assert(typeof res.data.available === 'boolean', 'Should return boolean');
    log(`✅ GET /api/port/9000 - ${res.data.available ? 'free' : 'in use'}`, 'green');
    passed++;
  } catch (err) {
    log(`❌ GET /api/port/9000 - ${err.message}`, 'red');
    failed++;
  }

  // Test 4: Get all ports status
  try {
    const res = await request('/api/ports/status');
    assert(res.status === 200, 'Should return 200');
    assert(res.data.success, 'Should return success');
    assert(Array.isArray(res.data.status), 'Should return status array');
    log(`✅ GET /api/ports/status - ${res.data.status.length} ports`, 'green');
    passed++;
  } catch (err) {
    log(`❌ GET /api/ports/status - ${err.message}`, 'red');
    failed++;
  }

  // Test 5: Get backups
  try {
    const res = await request('/api/backups');
    assert(res.status === 200, 'Should return 200');
    assert(res.data.success, 'Should return success');
    assert(Array.isArray(res.data.backups), 'Should return backups array');
    log(`✅ GET /api/backups - ${res.data.backups.length} backups`, 'green');
    passed++;
  } catch (err) {
    log(`❌ GET /api/backups - ${err.message}`, 'red');
    failed++;
  }

  // Summary
  log('\n========================================', 'blue');
  log(`API Tests: ${passed} passed, ${failed} failed`, passed > 0 && failed === 0 ? 'green' : 'red');
  log('========================================\n', 'blue');

  process.exit(failed > 0 ? 1 : 0);
}

// Wait for server to be ready, then run tests
setTimeout(() => {
  testAPI().catch(err => {
    log(`\n❌ API test error: ${err.message}`, 'red');
    process.exit(1);
  });
}, 2000);
