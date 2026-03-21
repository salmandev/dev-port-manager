/**
 * Host Module - Cross-platform hosts file management
 * Handles /etc/hosts (Linux/macOS) and C:\Windows\System32\drivers\etc\hosts (Windows)
 */

const os = require('os');
const path = require('path');
const fs = require('fs-extra');

/**
 * Get the path to the hosts file based on OS
 * @returns {string} Path to hosts file
 */
function getHostsFilePath() {
  switch (os.platform()) {
    case 'win32':
      return path.join(process.env['SystemRoot'] || 'C:\\Windows', 'System32', 'drivers', 'etc', 'hosts');
    case 'darwin':
    case 'linux':
    default:
      return '/etc/hosts';
  }
}

/**
 * Check if running as administrator/root
 * @returns {boolean} True if running with elevated privileges
 */
function isElevated() {
  if (os.platform() === 'win32') {
    // On Windows, simplified check - full implementation would require native module
    return process.getuid ? process.getuid() === 0 : false;
  }
  // On Unix-like systems, check if running as root
  return process.getuid && process.getuid() === 0;
}

/**
 * Get elevation warning message based on OS
 * @returns {string} Warning message
 */
function getElevationWarning() {
  switch (os.platform()) {
    case 'win32':
      return 'Run this CLI as Administrator to edit the hosts file';
    case 'darwin':
    case 'linux':
      return 'Use sudo to edit the hosts file';
    default:
      return 'You may need elevated privileges to edit the hosts file';
  }
}

/**
 * Read the hosts file content
 * @returns {Promise<string>} Hosts file content
 */
async function readHostsFile() {
  const hostsFile = getHostsFilePath();
  try {
    return await fs.readFile(hostsFile, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read hosts file (${hostsFile}): ${err.message}`);
  }
}

/**
 * Write to the hosts file
 * @param {string} content - New content for hosts file
 * @returns {Promise<void>}
 */
async function writeHostsFile(content) {
  const hostsFile = getHostsFilePath();
  try {
    await fs.writeFile(hostsFile, content, 'utf8');
  } catch (err) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      throw new Error(`Permission denied: ${getElevationWarning()}`);
    }
    throw new Error(`Cannot write hosts file (${hostsFile}): ${err.message}`);
  }
}

/**
 * Add a host entry to the hosts file
 * @param {string} host - Hostname to add
 * @param {string} ip - IP address (default: 127.0.0.1)
 * @returns {Promise<boolean>} True if added, false if already exists
 */
async function addHostEntry(host, ip = '127.0.0.1') {
  const hostsFile = getHostsFilePath();
  let content = await readHostsFile();
  
  // Check if entry already exists
  const lines = content.split('\n');
  const exists = lines.some(line => {
    const trimmed = line.trim();
    return trimmed.startsWith('#') || 
           (trimmed.includes(ip) && trimmed.includes(host));
  });
  
  if (exists) {
    return false;
  }
  
  // Add new entry with comment
  const timestamp = new Date().toISOString().split('T')[0];
  content += `\n# Dev Port Manager - ${timestamp}\n${ip} ${host}\n`;
  
  await writeHostsFile(content);
  return true;
}

/**
 * Remove a host entry from the hosts file
 * @param {string} host - Hostname to remove
 * @returns {Promise<boolean>} True if removed, false if not found
 */
async function removeHostEntry(host) {
  const hostsFile = getHostsFilePath();
  let content = await readHostsFile();
  
  const lines = content.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    // Keep comments and lines that don't contain this host
    return trimmed.startsWith('#') || !trimmed.includes(host);
  });
  
  if (filteredLines.length === lines.length) {
    return false; // Host not found
  }
  
  await writeHostsFile(filteredLines.join('\n'));
  return true;
}

/**
 * Sync all registry entries to hosts file
 * @param {Object} registry - Registry data
 * @returns {Promise<Object>} Result with added/removed counts
 */
async function syncHostsFile(registry) {
  const hostsFile = getHostsFilePath();
  let content = await readHostsFile();
  
  // Remove old dev-port-manager entries
  const lines = content.split('\n');
  const filteredLines = lines.filter((line, index) => {
    // Keep lines that are not dev-port-manager comments or entries
    if (line.includes('# Dev Port Manager')) return false;
    if (line.includes('.localtest.me')) return false;
    return true;
  });
  
  // Add new entries
  const timestamp = new Date().toISOString().split('T')[0];
  filteredLines.push(`\n# Dev Port Manager - ${timestamp}`);
  
  for (const [name, info] of Object.entries(registry)) {
    if (info.host && !info.host.includes('localtest.me')) {
      filteredLines.push(`127.0.0.1 ${info.host}`);
    }
  }
  
  await writeHostsFile(filteredLines.join('\n'));
  
  return {
    success: true,
    hostsFile,
    entries: Object.keys(registry).length
  };
}

module.exports = {
  getHostsFilePath,
  isElevated,
  getElevationWarning,
  readHostsFile,
  writeHostsFile,
  addHostEntry,
  removeHostEntry,
  syncHostsFile
};
