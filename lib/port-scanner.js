/**
 * Port Scanner Module - Detect actual running ports
 * Scans project configs and checks what's actually running
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const net = require('net');
const { exec } = require('child_process');
const { promisify } = require('util');
const configEditor = require('./config-editor');

const execAsync = promisify(exec);

/**
 * Check if a port is actually in use (something is listening)
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} True if something is running on that port
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close(() => resolve(false));
    });
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Common development ports to scan
 */
const COMMON_PORTS = [
  3000,  // React/Next.js
  3001,  // Alternative React
  4000,  // Dev Port Manager web
  4200,  // Angular
  5173,  // Vite default
  5174,  // Vite alternative
  8000,  // Python/Django
  8008,  // Alternative Python
  8080,  // Common Java/Node
  8081,  // Alternative Java/Node
  8082,  // Alternative
  8083,  // Alternative
  8084,  // Alternative
  8085,  // Alternative
  8086,  // Alternative
  8087,  // Alternative
  8088,  // Alternative
  8089,  // Alternative
  8090,  // Alternative
  9000,  // Common Node
  9001,  // Alternative
  9002,  // Alternative
  9003,  // Alternative
  9004,  // Alternative
  9005,  // Alternative
  9006,  // Alternative
  9007,  // Alternative
  9008,  // Alternative
  9009,  // Alternative
  9010,  // Alternative
  10000, // Alternative
];

/**
 * Scan all common ports for running servers
 * @returns {Promise<Array>} Array of running services
 */
async function scanCommonPorts() {
  const running = [];
  
  for (const port of COMMON_PORTS) {
    const inUse = await isPortInUse(port);
    if (inUse) {
      const pid = await getProcessOnPort(port);
      const processName = await getProcessName(pid);
      
      running.push({
        port,
        pid,
        processName,
        isCommonDevPort: true
      });
    }
  }
  
  return running;
}

/**
 * Find projects that might be running on detected ports
 * @param {Array} runningPorts - Array of running port info
 * @param {Array} projects - Projects from registry
 * @returns {Array} Matches between running ports and projects
 */
function matchRunningToProjects(runningPorts, projects) {
  const matches = [];
  
  for (const running of runningPorts) {
    // Check if any project has this port in config
    for (const project of projects) {
      if (project.basePath) {
        // Check if project's registered port matches
        if (project.port === running.port) {
          matches.push({
            project,
            running,
            matchType: 'registered_port',
            confidence: 'high'
          });
        }
      }
    }
  }
  
  return matches;
}

/**
 * Generate recommendations for port sync
 * @param {Array} scanResults - Results from scanAllProjects
 * @param {Array} runningPorts - Results from scanCommonPorts
 * @returns {Array} Recommendations
 */
function generateRecommendations(scanResults, runningPorts) {
  const recommendations = [];
  
  // Check for projects with mismatched ports
  for (const result of scanResults) {
    const ps = result.portStatus;
    
    // If config port differs from registered
    if (ps.configPort && ps.configPort !== ps.registeredPort) {
      recommendations.push({
        type: 'config_mismatch',
        project: result.name,
        currentPort: ps.registeredPort,
        recommendedPort: ps.configPort,
        reason: `Config file (${ps.configSource}) uses port ${ps.configPort}`,
        confidence: 'high',
        autoFixable: true
      });
    }
    
    // If different port is actually running
    if (ps.actualPort && ps.actualPort !== ps.registeredPort) {
      recommendations.push({
        type: 'running_mismatch',
        project: result.name,
        currentPort: ps.registeredPort,
        recommendedPort: ps.actualPort,
        reason: `Server is actually running on port ${ps.actualPort} (${ps.processName || 'unknown'})`,
        confidence: 'high',
        autoFixable: true,
        isRunning: true
      });
    }
  }
  
  // Check for running servers not in registry
  for (const running of runningPorts) {
    const matchedProject = scanResults.find(r => r.port === running.port);
    
    if (!matchedProject) {
      recommendations.push({
        type: 'unregistered_server',
        project: null,
        currentPort: null,
        recommendedPort: running.port,
        reason: `Server running on port ${running.port} (${running.processName || 'unknown'}) not in registry`,
        confidence: 'medium',
        autoFixable: false,
        isRunning: true,
        processName: running.processName
      });
    }
  }
  
  return recommendations;
}

/**
 * Get process ID using a port
 * @param {number} port - Port number
 * @returns {Promise<number|null>} PID or null
 */
async function getProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      // Windows: netstat -ano
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const match = stdout.match(/LISTENING\s+(\d+)/);
      return match ? parseInt(match[1]) : null;
    } else {
      // macOS/Linux: lsof
      const { stdout } = await execAsync(`lsof -i :${port} -t`);
      return stdout.trim() ? parseInt(stdout.trim()) : null;
    }
  } catch (err) {
    return null;
  }
}

/**
 * Get process name from PID
 * @param {number} pid - Process ID
 * @returns {Promise<string|null>} Process name or null
 */
async function getProcessName(pid) {
  try {
    if (!pid) return null;
    
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV`);
      const match = stdout.match(/"([^"]+)"/);
      return match ? match[1] : null;
    } else {
      const { stdout } = await execAsync(`ps -p ${pid} -o comm=`);
      return stdout.trim() || null;
    }
  } catch (err) {
    return null;
  }
}

/**
 * Scan a project for actual running port
 * @param {string} projectPath - Project base path
 * @param {number} registeredPort - Port from registry
 * @returns {Promise<Object>} Port status info
 */
async function scanProjectPort(projectPath, registeredPort) {
  const result = {
    registeredPort,
    actualPort: null,
    isRunning: false,
    processName: null,
    pid: null,
    configPort: null,
    configSource: null,
    runningPort: null  // ← NEW: Actually running port
  };
  
  // FIRST: Check if registered port is actually in use
  const registeredPortInUse = await isPortInUse(registeredPort);
  if (registeredPortInUse) {
    result.isRunning = true;
    result.actualPort = registeredPort;
    result.runningPort = registeredPort;
    const pid = await getProcessOnPort(registeredPort);
    result.pid = pid;
    result.processName = await getProcessName(pid);
  }
  
  // SECOND: Scan common dev ports to find what's actually running
  const commonDevPorts = [3000, 3001, 4000, 4200, 5173, 5174, 8000, 8008, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090, 8091, 8092, 9000, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010];
  
  for (const port of commonDevPorts) {
    if (port === registeredPort) continue; // Already checked
    
    const portInUse = await isPortInUse(port);
    if (portInUse) {
      // Check if this port is mentioned in any config file
      const configFiles = await findConfigFiles(projectPath);
      const hasMatchingConfig = configFiles.some(f => f.port === port);
      
      if (hasMatchingConfig) {
        result.runningPort = port;
        result.isRunning = true;
        if (!result.actualPort) {
          result.actualPort = port;
          const pid = await getProcessOnPort(port);
          result.pid = pid;
          result.processName = await getProcessName(pid);
        }
      }
    }
  }
  
  // THIRD: Read config files to find configured port
  try {
    const configFiles = await configEditor.findConfigFiles(projectPath);
    for (const file of configFiles) {
      if (file.hasPort && file.port) {
        result.configPort = file.port;
        result.configSource = file.name;
        break;
      }
    }
  } catch (err) {
    console.error('Error reading config files:', err);
  }
  
  return result;
}

/**
 * Scan all projects and sync with actual running ports
 * @param {Array} projects - Projects from registry
 * @returns {Promise<Array>} Projects with actual port status
 */
async function scanAllProjects(projects) {
  const results = [];
  
  for (const project of projects) {
    if (project.basePath) {
      const portStatus = await scanProjectPort(project.basePath, project.port);
      results.push({
        ...project,
        portStatus
      });
    } else {
      results.push({
        ...project,
        portStatus: {
          registeredPort: project.port,
          actualPort: null,
          isRunning: false,
          processName: null,
          configPort: null,
          configSource: null
        }
      });
    }
  }
  
  return results;
}

/**
 * Find discrepancies between registry and actual config
 * @param {Array} projects - Projects with port status
 * @returns {Array} Projects with discrepancies
 */
function findDiscrepancies(projects) {
  return projects.filter(p => {
    const ps = p.portStatus;
    return ps.configPort && ps.configPort !== ps.registeredPort;
  });
}

/**
 * Sync registry with actual running ports
 * @param {Array} projects - Projects to sync
 * @returns {Promise<Object>} Sync results
 */
async function syncRegistryWithActual(projects) {
  const { writeRegistry, readRegistry } = require('./project');
  const updated = [];
  const unchanged = [];
  const errors = [];
  
  const registry = await readRegistry();
  
  for (const project of projects) {
    const ps = project.portStatus;
    
    // If actual port is different from registered, update
    if (ps.actualPort && ps.actualPort !== ps.registeredPort) {
      try {
        const oldPort = registry[project.name].port;
        registry[project.name].port = ps.actualPort;
        registry[project.name].url = `http://${project.host}:${ps.actualPort}`;
        registry[project.name].updatedAt = new Date().toISOString();
        
        // Also update .project-dev.json if exists
        if (project.basePath) {
          const projectFile = path.join(project.basePath, '.project-dev.json');
          if (await fs.pathExists(projectFile)) {
            const projectConfig = await fs.readJson(projectFile);
            projectConfig.port = ps.actualPort;
            projectConfig.url = `http://${project.host}:${ps.actualPort}`;
            await fs.writeJson(projectFile, projectConfig, { spaces: 2 });
          }
        }
        
        updated.push({
          name: project.name,
          oldPort,
          newPort: ps.actualPort
        });
      } catch (err) {
        errors.push({
          name: project.name,
          error: err.message
        });
      }
    } else {
      unchanged.push(project.name);
    }
  }
  
  await writeRegistry(registry);
  
  return { updated, unchanged, errors };
}

/**
 * Kill process on a port
 * @param {number} port - Port to kill
 * @returns {Promise<Object>} Result
 */
async function killProcessOnPort(port) {
  try {
    const pid = await getProcessOnPort(port);
    if (!pid) {
      return { success: false, error: `No process found on port ${port}` };
    }
    
    const processName = await getProcessName(pid);
    
    return new Promise((resolve) => {
      const killCommand = process.platform === 'win32' 
        ? `taskkill /F /PID ${pid}`
        : `kill -9 ${pid}`;
      
      exec(killCommand, (err) => {
        if (err) {
          resolve({ 
            success: false, 
            error: `Failed to kill: ${err.message}`,
            pid,
            processName 
          });
        } else {
          resolve({ 
            success: true, 
            message: `Killed process ${processName} (PID ${pid}) on port ${port}`,
            pid,
            processName 
          });
        }
      });
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Suggest best available port based on project type
 * @param {string} projectType - Project type
 * @param {number} preferredPort - Preferred port if any
 * @returns {Promise<Object>} Suggested port
 */
async function suggestPort(projectType, preferredPort = null) {
  const { readRegistrySync } = require('./registry');
  const registry = readRegistrySync();
  const usedPorts = Object.values(registry).map(p => p.port);
  
  // Default port suggestions by type
  const typeDefaults = {
    'node': [3000, 3001, 4000, 5173, 8000],
    'maven': [8080, 8081, 8082, 9000, 9001],
    'gradle': [8080, 8081, 8082, 9000, 9090],
    'python': [5000, 8000, 8001, 8080],
    'react': [3000, 3001, 3002],
    'angular': [4200, 4201, 4202],
    'vue': [8080, 8081, 5173],
    'vite': [5173, 5174, 5175],
    'jenkins': [8080, 8081, 8082, 9000]
  };
  
  const candidates = preferredPort 
    ? [preferredPort, ...(typeDefaults[projectType] || []), 9000, 9001, 9002]
    : (typeDefaults[projectType] || [9000, 9001, 9002, 9003, 9004]);
  
  // Find first available port
  for (const port of candidates) {
    if (!usedPorts.includes(port)) {
      const inUse = await isPortInUse(port);
      if (!inUse) {
        return {
          success: true,
          port,
          reason: `First available port for ${projectType || 'project'}`,
          alternatives: candidates.slice(0, 5).filter(p => p !== port)
        };
      }
    }
  }
  
  // Fallback: find any available port in range
  for (let port = 9000; port <= 9999; port++) {
    if (!usedPorts.includes(port)) {
      const inUse = await isPortInUse(port);
      if (!inUse) {
        return {
          success: true,
          port,
          reason: 'First available port in range 9000-9999',
          alternatives: []
        };
      }
    }
  }
  
  return {
    success: false,
    error: 'No available ports found',
    port: null
  };
}

module.exports = {
  isPortInUse,
  getProcessOnPort,
  getProcessName,
  scanProjectPort,
  scanAllProjects,
  findDiscrepancies,
  syncRegistryWithActual,
  scanCommonPorts,
  matchRunningToProjects,
  generateRecommendations,
  killProcessOnPort,
  suggestPort,
  COMMON_PORTS
};
