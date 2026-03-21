/**
 * Registry Module - Manages the global registry of all projects
 * Uses configurable path from settings module
 * 
 * Priority order for registry path:
 * 1. CLI flag --registry
 * 2. Environment variable DEVPORT_REGISTRY
 * 3. Settings file (~/.dev-ports/settings.json)
 * 4. Default (~/.dev-ports/registry.json)
 */

const fs = require('fs-extra');
const path = require('path');
const settings = require('./settings');

// Get registry path from settings (with priority handling)
let _registryPath = null;
let _registryDir = null;

/**
 * Initialize registry paths
 * @param {Object} options - Options
 * @param {string} options.cliFlag - Registry path from CLI flag
 */
function init(options = {}) {
  _registryPath = settings.getRegistryPath(options);
  _registryDir = path.dirname(_registryPath);
  
  // Ensure registry directory and file exist
  fs.ensureDirSync(_registryDir);
  fs.ensureFileSync(_registryPath);
  
  // Initialize empty registry if it doesn't exist or is invalid
  try {
    const existing = fs.readJsonSync(_registryPath, { throws: false });
    if (!existing || typeof existing !== 'object') {
      fs.writeJsonSync(_registryPath, {}, { spaces: 2 });
    }
  } catch (err) {
    fs.writeJsonSync(_registryPath, {}, { spaces: 2 });
  }
}

// Auto-initialize on module load
init();

/**
 * Read the registry file asynchronously
 * @returns {Promise<Object>} Registry data object
 */
async function readRegistry() {
  return fs.readJson(_registryPath);
}

/**
 * Write to the registry file asynchronously
 * @param {Object} data - Registry data to write
 * @returns {Promise<void>}
 */
async function writeRegistry(data) {
  return fs.writeJson(_registryPath, data, { spaces: 2 });
}

/**
 * Read registry synchronously
 * @returns {Object} Registry data
 */
function readRegistrySync() {
  return fs.readJsonSync(_registryPath);
}

/**
 * Write registry synchronously
 * @param {Object} data - Registry data to write
 */
function writeRegistrySync(data) {
  fs.writeJsonSync(_registryPath, data, { spaces: 2 });
}

/**
 * Get the registry file path
 * @returns {string} Full path to registry file
 */
function getRegistryPath() {
  return _registryPath;
}

/**
 * Get the registry directory path
 * @returns {string} Full path to registry directory
 */
function getRegistryDir() {
  return _registryDir;
}

/**
 * Reinitialize with new options (for CLI flag override)
 * @param {Object} options - Options
 */
function reinit(options = {}) {
  init(options);
}

module.exports = { 
  readRegistry, 
  writeRegistry, 
  readRegistrySync, 
  writeRegistrySync, 
  getRegistryPath,
  getRegistryDir,
  init,
  reinit,
  REGISTRY_FILE: _registryPath,
  REGISTRY_DIR: _registryDir
};
