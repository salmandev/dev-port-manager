/**
 * Dev Port Manager - Test Suite
 * Comprehensive tests for CLI, lib modules, and API
 * 
 * Usage: npm test
 */

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Import modules to test
const { 
  assignProject, 
  listProjects, 
  getAllProjects,
  removeProject,
  getProject,
  scanDirectory,
  isPortAvailable,
  detectProjectType,
  backupRegistry,
  listBackups,
  restoreRegistry
} = require('../lib/project');

const settings = require('../lib/settings');
const { getRegistryPath } = require('../lib/registry');
const { getHostsFilePath } = require('../lib/host');
const dockerUtils = require('../lib/docker');

// Test utilities
const TEST_PROJECT_NAME = 'test-project-' + Date.now();
const TEST_DIR = path.join(os.tmpdir(), 'dev-port-test-' + Date.now());

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(message) {
  log('\n' + '='.repeat(60), 'blue');
  log(message, 'blue');
  log('='.repeat(60), 'blue');
}

// Test results tracking
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    log(`✅ ${name}`, 'green');
    passed++;
  } catch (err) {
    log(`❌ ${name}`, 'red');
    log(`   Error: ${err.message}`, 'red');
    failed++;
    failures.push({ name, error: err.message });
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    log(`✅ ${name}`, 'green');
    passed++;
  } catch (err) {
    log(`❌ ${name}`, 'red');
    log(`   Error: ${err.message}`, 'red');
    failed++;
    failures.push({ name, error: err.message });
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

async function runTests() {
  section('Dev Port Manager - Test Suite');
  log(`Started at: ${new Date().toISOString()}`);
  log(`Platform: ${os.platform()} ${os.arch()}`);
  log(`Node: ${process.version}`);
  
  // Setup test directory
  await fs.ensureDir(TEST_DIR);
  
  // ==========================================================================
  // SETTINGS MODULE TESTS
  // ==========================================================================
  section('Settings Module Tests');
  
  test('Settings file exists', () => {
    const settingsPath = settings.getSettingsPath();
    assert(settingsPath.includes('.dev-ports'), 'Settings should be in .dev-ports directory');
  });
  
  await asyncTest('Load settings', async () => {
    const loadedSettings = await settings.loadSettings();
    assert(loadedSettings.registryPath, 'Should have registryPath');
    assert(loadedSettings.portRange, 'Should have portRange');
    assert(Array.isArray(loadedSettings.portRange), 'portRange should be array');
  });
  
  await asyncTest('Get port range', async () => {
    const range = settings.getPortRange();
    assert(Array.isArray(range), 'Port range should be array');
    assert(range.length === 2, 'Port range should have 2 values');
  });
  
  await asyncTest('Set and get setting', async () => {
    await settings.setSetting('testSetting', 'testValue');
    const value = await settings.getSetting('testSetting');
    assert(value === 'testValue', 'Should retrieve set value');
  });
  
  // ==========================================================================
  // REGISTRY MODULE TESTS
  // ==========================================================================
  section('Registry Module Tests');
  
  test('Registry path is configured', () => {
    const regPath = getRegistryPath();
    assert(regPath, 'Registry path should be defined');
    log(`   Registry: ${regPath}`, 'blue');
  });
  
  test('Hosts file path is correct', () => {
    const hostsPath = getHostsFilePath();
    assert(hostsPath, 'Hosts file path should be defined');
    if (os.platform() === 'win32') {
      assert(hostsPath.includes('drivers\\etc\\hosts'), 'Windows hosts path should be correct');
    } else {
      assert(hostsPath === '/etc/hosts', 'Unix hosts path should be correct');
    }
  });
  
  // ==========================================================================
  // PROJECT MODULE TESTS
  // ==========================================================================
  section('Project Module Tests');
  
  await asyncTest('Check port availability', async () => {
    const available = await isPortAvailable(9999);
    assert(typeof available === 'boolean', 'Should return boolean');
  });
  
  await asyncTest('Detect project type', async () => {
    const type = detectProjectType(process.cwd());
    assert(type, 'Should detect project type');
    log(`   Current project type: ${type}`, 'blue');
  });
  
  await asyncTest('Assign project', async () => {
    const result = await assignProject(TEST_PROJECT_NAME, {
      basePath: TEST_DIR
    });
    assert(result.name === TEST_PROJECT_NAME, 'Project name should match');
    assert(result.port >= 9000 && result.port <= 9999, 'Port should be in range');
    assert(result.host, 'Should have host');
    assert(result.url, 'Should have URL');
    log(`   Assigned: ${result.name} -> ${result.url}`, 'blue');
  });
  
  await asyncTest('Get project', async () => {
    const projects = listProjects();
    // Find project by checking all keys
    const found = Object.keys(projects).some(key => key.includes(TEST_PROJECT_NAME));
    assert(found, 'Test project should exist in registry');
  });
  
  await asyncTest('List projects', async () => {
    const projects = listProjects();
    assert(typeof projects === 'object', 'Should return object');
    assert(projects[TEST_PROJECT_NAME], 'Test project should be in list');
  });
  
  await asyncTest('Get all projects', async () => {
    const projects = getAllProjects();
    assert(Array.isArray(projects), 'Should return array');
    assert(projects.length > 0, 'Should have at least one project');
  });
  
  // ==========================================================================
  // SCAN DIRECTORY TESTS
  // ==========================================================================
  section('Scan Directory Tests');
  
  await asyncTest('Scan directory (dry run)', async () => {
    const result = await scanDirectory(os.homedir(), { dryRun: true });
    assert(result, 'Should return result');
    assert(Array.isArray(result.results), 'Should have results array');
    assert(Array.isArray(result.skipped), 'Should have skipped array');
    log(`   Found ${result.results.length} projects`, 'blue');
    log(`   Skipped ${result.skipped.length} directories`, 'blue');
  });
  
  // ==========================================================================
  // DOCKER MODULE TESTS
  // ==========================================================================
  section('Docker Module Tests');
  
  await asyncTest('Check Docker availability', async () => {
    const available = await dockerUtils.isDockerAvailable();
    log(`   Docker available: ${available ? 'Yes' : 'No'}`, 'blue');
  });
  
  await asyncTest('Check Docker Compose availability', async () => {
    const available = await dockerUtils.isDockerComposeAvailable();
    log(`   Docker Compose available: ${available ? 'Yes' : 'No'}`, 'blue');
  });
  
  await asyncTest('Generate Docker .env', async () => {
    const project = getProject(TEST_PROJECT_NAME);
    const envPath = await dockerUtils.generateDockerEnv(TEST_DIR, project);
    const exists = await fs.pathExists(envPath);
    assert(exists, 'Docker .env file should exist');
    log(`   Generated: ${envPath}`, 'blue');
  });
  
  await asyncTest('Generate Docker Compose override', async () => {
    const project = getProject(TEST_PROJECT_NAME);
    const composePath = await dockerUtils.generateDockerComposeOverride(TEST_DIR, project);
    const exists = await fs.pathExists(composePath);
    assert(exists, 'Docker Compose file should exist');
    log(`   Generated: ${composePath}`, 'blue');
  });
  
  // ==========================================================================
  // BACKUP TESTS
  // ==========================================================================
  section('Backup/Restore Tests');
  
  await asyncTest('Create backup', async () => {
    const backupPath = await backupRegistry();
    const exists = await fs.pathExists(backupPath);
    assert(exists, 'Backup file should exist');
    log(`   Backup: ${backupPath}`, 'blue');
  });
  
  await asyncTest('List backups', async () => {
    const backups = await listBackups();
    assert(Array.isArray(backups), 'Should return array');
    assert(backups.length > 0, 'Should have at least one backup');
    log(`   Found ${backups.length} backups`, 'blue');
  });
  
  // ==========================================================================
  // CLEANUP
  // ==========================================================================
  section('Cleanup');
  
  await asyncTest('Remove test project', async () => {
    const removed = await removeProject(TEST_PROJECT_NAME);
    assert(removed, 'Should remove test project');
  });
  
  await asyncTest('Cleanup test directory', async () => {
    await fs.remove(TEST_DIR);
    log(`   Removed: ${TEST_DIR}`, 'blue');
  });
  
  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  section('Test Summary');
  log(`Total: ${passed + failed}`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failures.length > 0) {
    log('\nFailures:', 'red');
    failures.forEach(f => {
      log(`  - ${f.name}: ${f.error}`, 'red');
    });
  }
  
  log(`\nCompleted at: ${new Date().toISOString()}`, 'blue');
  
  // Exit with error code if tests failed
  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  log(`\n❌ Test suite error: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});
