/**
 * Settings Module - Configurable registry and system settings
 * Allows users to customize registry path, port range, and other options
 * Settings stored in ~/.dev-ports/settings.json
 * 
 * Priority order for registry path:
 * 1. CLI flag --registry
 * 2. Environment variable DEVPORT_REGISTRY
 * 3. Settings file (~/.dev-ports/settings.json)
 * 4. Default (~/.dev-ports/registry.json)
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Default paths
const SETTINGS_DIR = path.join(os.homedir(), '.dev-ports');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');
const DEFAULT_REGISTRY = path.join(SETTINGS_DIR, 'registry.json');

// Default settings
const DEFAULT_SETTINGS = {
  // Registry file location
  registryPath: DEFAULT_REGISTRY,
  
  // Port range configuration
  portRange: [9000, 9999],
  
  // DNS configuration
  useLocaltestMe: true,  // Use *.localtest.me instead of editing hosts file
  
  // Default scan directories for auto-discovery
  baseScanDirs: [],
  
  // Docker configuration
  dockerEnvPath: './.env',
  dockerComposeTemplate: 'templates/docker-compose.yml',
  
  // UI preferences
  theme: 'light',  // 'light' | 'dark'
  language: 'en',  // 'en' | 'es' | 'fr' | 'de' | 'zh'
  
  // Backup configuration
  autoBackup: true,
  backupCount: 5,  // Number of backups to keep
  
  // Advanced
  checkPortAvailability: true,
  generateVSCodeSettings: true
};

// Ensure settings directory exists
fs.ensureDirSync(SETTINGS_DIR);

/**
 * Load settings from file
 * @returns {Promise<Object>} Settings object
 */
async function loadSettings() {
  try {
    if (await fs.pathExists(SETTINGS_FILE)) {
      const fileSettings = await fs.readJson(SETTINGS_FILE);
      return { ...DEFAULT_SETTINGS, ...fileSettings };
    }
  } catch (err) {
    console.error('Warning: Could not load settings file, using defaults');
  }
  
  // If settings file doesn't exist, create it with defaults
  await saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

/**
 * Load settings synchronously
 * @returns {Object} Settings object
 */
function loadSettingsSync() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileSettings = fs.readJsonSync(SETTINGS_FILE);
      return { ...DEFAULT_SETTINGS, ...fileSettings };
    }
  } catch (err) {
    console.error('Warning: Could not load settings file, using defaults');
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to file
 * @param {Object} settings - Settings to save
 * @returns {Promise<void>}
 */
async function saveSettings(settings) {
  await fs.writeJson(SETTINGS_FILE, settings, { spaces: 2 });
}

/**
 * Get a specific setting
 * @param {string} key - Setting key
 * @param {*} defaultValue - Default value if not found
 * @returns {Promise<*>} Setting value
 */
async function getSetting(key, defaultValue = undefined) {
  const settings = await loadSettings();
  return key in settings ? settings[key] : defaultValue;
}

/**
 * Set a specific setting
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 * @returns {Promise<void>}
 */
async function setSetting(key, value) {
  const settings = await loadSettings();
  settings[key] = value;
  await saveSettings(settings);
}

/**
 * Get the effective registry path (with priority handling)
 * @param {Object} options - Options
 * @param {string} options.cliFlag - Registry path from CLI flag
 * @returns {string} Registry path
 */
function getRegistryPath(options = {}) {
  // Priority 1: CLI flag
  if (options.cliFlag) {
    return path.resolve(options.cliFlag);
  }
  
  // Priority 2: Environment variable
  if (process.env.DEVPORT_REGISTRY) {
    return path.resolve(process.env.DEVPORT_REGISTRY);
  }
  
  // Priority 3: Settings file
  const settings = loadSettingsSync();
  if (settings.registryPath) {
    return path.resolve(settings.registryPath);
  }
  
  // Priority 4: Default
  return DEFAULT_REGISTRY;
}

/**
 * Get the effective port range
 * @returns {Array<number>} [minPort, maxPort]
 */
function getPortRange() {
  const settings = loadSettingsSync();
  return settings.portRange || DEFAULT_SETTINGS.portRange;
}

/**
 * Get settings file path
 * @returns {string} Settings file path
 */
function getSettingsPath() {
  return SETTINGS_FILE;
}

/**
 * Get settings directory path
 * @returns {string} Settings directory path
 */
function getSettingsDir() {
  return SETTINGS_DIR;
}

/**
 * Reset settings to defaults
 * @returns {Promise<void>}
 */
async function resetSettings() {
  await saveSettings(DEFAULT_SETTINGS);
}

/**
 * Export settings to file
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} Output path
 */
async function exportSettings(outputPath) {
  const settings = await loadSettings();
  await fs.writeJson(outputPath, settings, { spaces: 2 });
  return outputPath;
}

/**
 * Import settings from file
 * @param {string} inputPath - Input file path
 * @param {boolean} merge - Merge with existing settings
 * @returns {Promise<Object>} Imported settings
 */
async function importSettings(inputPath, merge = false) {
  const importData = await fs.readJson(inputPath);
  
  if (merge) {
    const existing = await loadSettings();
    const merged = { ...existing, ...importData };
    await saveSettings(merged);
    return merged;
  } else {
    await saveSettings(importData);
    return importData;
  }
}

/**
 * Validate settings
 * @param {Object} settings - Settings to validate
 * @returns {Object} Validation result
 */
function validateSettings(settings) {
  const errors = [];
  const warnings = [];
  
  // Validate registry path
  if (settings.registryPath) {
    const registryDir = path.dirname(settings.registryPath);
    if (!fs.existsSync(registryDir)) {
      warnings.push(`Registry directory does not exist: ${registryDir}`);
    }
  }
  
  // Validate port range
  if (settings.portRange) {
    const [min, max] = settings.portRange;
    if (typeof min !== 'number' || typeof max !== 'number') {
      errors.push('Port range must be an array of two numbers');
    } else if (min >= max) {
      errors.push('Port range minimum must be less than maximum');
    } else if (min < 1024 || max > 65535) {
      warnings.push('Port range should be between 1024 and 65535');
    }
  }
  
  // Validate base scan directories
  if (settings.baseScanDirs && Array.isArray(settings.baseScanDirs)) {
    settings.baseScanDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        warnings.push(`Base scan directory does not exist: ${dir}`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = {
  loadSettings,
  loadSettingsSync,
  saveSettings,
  getSetting,
  setSetting,
  getRegistryPath,
  getPortRange,
  getSettingsPath,
  getSettingsDir,
  resetSettings,
  exportSettings,
  importSettings,
  validateSettings,
  DEFAULT_SETTINGS,
  SETTINGS_FILE,
  SETTINGS_DIR,
  DEFAULT_REGISTRY
};
