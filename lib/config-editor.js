/**
 * Config File Editor Module
 * Read, edit, and save project configuration files
 * With automatic backup before changes
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const BACKUP_DIR = path.join(os.homedir(), '.dev-ports', 'config-backups');

// Ensure backup directory exists
fs.ensureDirSync(BACKUP_DIR);

/**
 * Backup a config file before editing
 * @param {string} filePath - File to backup
 * @returns {Promise<string>} Backup file path
 */
async function backupConfigFile(filePath) {
  try {
    if (!await fs.pathExists(filePath)) {
      return null;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = path.basename(filePath);
    const backupPath = path.join(BACKUP_DIR, `${fileName}.${timestamp}.bak`);
    
    await fs.copy(filePath, backupPath);
    
    return backupPath;
  } catch (err) {
    console.error('Error backing up config file:', err);
    return null;
  }
}

/**
 * Read and parse config file
 * @param {string} filePath - File to read
 * @returns {Promise<Object>} Parsed config
 */
async function readConfigFile(filePath) {
  try {
    if (!await fs.pathExists(filePath)) {
      return { exists: false, content: null, parsed: null };
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    const ext = path.extname(filePath).toLowerCase();
    
    let parsed = null;
    
    // Parse based on file type
    if (ext === '.json') {
      parsed = JSON.parse(content);
    } else if (ext === '.js' || ext === '.ts' || ext === '.mjs') {
      // For JS/TS files, extract port using regex
      const portMatch = content.match(/port:\s*(\d+)/);
      if (portMatch) {
        parsed = { port: parseInt(portMatch[1], 10) };
      }
    } else if (ext === '.env' || filePath.endsWith('.env')) {
      // Parse .env file
      parsed = {};
      content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
          parsed[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      });
    }
    
    return {
      exists: true,
      content,
      parsed,
      type: ext
    };
  } catch (err) {
    console.error('Error reading config file:', err);
    return { exists: false, content: null, parsed: null, error: err.message };
  }
}

/**
 * Update port in config file
 * @param {string} filePath - File to update
 * @param {number} newPort - New port value
 * @returns {Promise<Object>} Result
 */
async function updateConfigPort(filePath, newPort) {
  try {
    if (!await fs.pathExists(filePath)) {
      return { success: false, error: 'File not found' };
    }
    
    // Backup first
    const backupPath = await backupConfigFile(filePath);
    
    const content = await fs.readFile(filePath, 'utf8');
    const ext = path.extname(filePath).toLowerCase();
    let newContent = content;
    
    // Update based on file type
    if (ext === '.json') {
      const parsed = JSON.parse(content);
      parsed.port = newPort;
      parsed.devPort = newPort; // Also set devPort if it exists
      newContent = JSON.stringify(parsed, null, 2);
    } else if (ext === '.js' || ext === '.ts' || ext === '.mjs') {
      // Update port in JS/TS files
      if (content.includes('port:')) {
        newContent = content.replace(/port:\s*\d+/, `port: ${newPort}`);
      } else if (content.includes('server:')) {
        // Add port to server config
        newContent = content.replace(
          /server:\s*\{/,
          `server: {\n    port: ${newPort},`
        );
      }
    } else if (ext === '.env' || filePath.endsWith('.env')) {
      // Update .env file
      if (content.includes('PORT=')) {
        newContent = content.replace(/PORT=.*/, `PORT=${newPort}`);
      } else {
        newContent = content.trim() + `\nPORT=${newPort}\n`;
      }
    }
    
    await fs.writeFile(filePath, newContent, 'utf8');
    
    return {
      success: true,
      message: `Updated ${path.basename(filePath)} with port ${newPort}`,
      backup: backupPath
    };
  } catch (err) {
    console.error('Error updating config file:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Find all config files for a project
 * @param {string} projectPath - Project base path
 * @returns {Promise<Array>} Array of config files
 */
async function findConfigFiles(projectPath) {
  const configFiles = [];
  
  const filesToCheck = [
    'package.json',
    '.env',
    '.env.local',
    'vite.config.js',
    'vite.config.ts',
    'next.config.js',
    'nuxt.config.js',
    'angular.json',
    'tsconfig.json',
    'jsconfig.json'
  ];
  
  for (const file of filesToCheck) {
    const fullPath = path.join(projectPath, file);
    if (await fs.pathExists(fullPath)) {
      const config = await readConfigFile(fullPath);
      if (config.exists) {
        configFiles.push({
          name: file,
          path: fullPath,
          type: config.type,
          hasPort: config.parsed && (config.parsed.port || config.parsed.PORT),
          port: config.parsed?.port || config.parsed?.PORT || null
        });
      }
    }
  }
  
  return configFiles;
}

/**
 * List all backups for a project
 * @param {string} projectName - Project name
 * @returns {Promise<Array>} Array of backups
 */
async function listConfigBackups(projectName = null) {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    let backups = files
      .filter(f => f.endsWith('.bak'))
      .map(f => {
        const stat = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          filename: f,
          path: path.join(BACKUP_DIR, f),
          timestamp: f.match(/\.(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})\.bak$/)?.[1],
          size: stat.size
        };
      })
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    
    if (projectName) {
      // Filter backups related to project
      backups = backups.filter(b => 
        b.filename.toLowerCase().includes(projectName.toLowerCase())
      );
    }
    
    return backups;
  } catch (err) {
    console.error('Error listing backups:', err);
    return [];
  }
}

/**
 * Restore config from backup
 * @param {string} backupPath - Backup file path
 * @param {string} originalPath - Original file path (optional)
 * @returns {Promise<Object>} Result
 */
async function restoreConfigBackup(backupPath, originalPath = null) {
  try {
    if (!await fs.pathExists(backupPath)) {
      return { success: false, error: 'Backup file not found' };
    }
    
    // Extract original filename from backup filename
    if (!originalPath) {
      const backupFilename = path.basename(backupPath);
      const originalFilename = backupFilename.replace(/\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.bak$/, '');
      
      // Try to find the original file in common locations
      const possiblePaths = [
        path.join(process.cwd(), originalFilename),
        path.join(os.homedir(), originalFilename)
      ];
      
      for (const p of possiblePaths) {
        if (await fs.pathExists(p)) {
          originalPath = p;
          break;
        }
      }
    }
    
    if (originalPath) {
      await fs.copy(backupPath, originalPath);
      return {
        success: true,
        message: `Restored ${path.basename(originalPath)} from backup`,
        backup: backupPath
      };
    } else {
      return {
        success: false,
        error: 'Original file path not found'
      };
    }
  } catch (err) {
    console.error('Error restoring backup:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  backupConfigFile,
  readConfigFile,
  updateConfigPort,
  findConfigFiles,
  listConfigBackups,
  restoreConfigBackup,
  BACKUP_DIR
};
