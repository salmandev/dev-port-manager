/**
 * NPM Command Executor Module
 * Run npm commands from Dev Port Manager
 * With output streaming and process management
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

// Store running processes
const runningProcesses = new Map();

/**
 * Run npm command
 * @param {string} projectPath - Project base path
 * @param {string} command - npm command (install, run dev, start, etc.)
 * @param {Object} options - Options
 * @param {Function} options.onOutput - Callback for output streaming
 * @param {Function} options.onExit - Callback when process exits
 * @returns {Promise<Object>} Process info
 */
async function runNpmCommand(projectPath, command, options = {}) {
  const { onOutput, onExit } = options;
  
  return new Promise((resolve, reject) => {
    try {
      // Parse command
      const [npmCmd, ...args] = command.split(' ');
      const isWindows = process.platform === 'win32';
      
      // Spawn npm process
      const npm = isWindows 
        ? spawn('cmd.exe', ['/c', 'npm', ...args], { cwd: projectPath })
        : spawn('npm', args, { cwd: projectPath });
      
      const processInfo = {
        pid: npm.pid,
        command,
        projectPath,
        startTime: new Date(),
        status: 'running'
      };
      
      // Store process
      runningProcesses.set(npm.pid, processInfo);
      
      // Handle stdout
      npm.stdout.on('data', (data) => {
        const output = data.toString();
        if (onOutput) onOutput('stdout', output);
        console.log(output);
      });
      
      // Handle stderr
      npm.stderr.on('data', (data) => {
        const output = data.toString();
        if (onOutput) onOutput('stderr', output);
        console.error(output);
      });
      
      // Handle exit
      npm.on('close', (code) => {
        processInfo.status = code === 0 ? 'success' : 'failed';
        processInfo.exitCode = code;
        processInfo.endTime = new Date();
        
        runningProcesses.delete(npm.pid);
        
        if (onExit) onExit(code);
        
        resolve({
          success: code === 0,
          exitCode: code,
          ...processInfo
        });
      });
      
      // Handle error
      npm.on('error', (err) => {
        processInfo.status = 'error';
        processInfo.error = err.message;
        
        runningProcesses.delete(npm.pid);
        
        if (onExit) onExit(null, err);
        
        reject(err);
      });
      
      resolve(processInfo);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Kill running process
 * @param {number} pid - Process ID
 * @returns {Promise<boolean>} Success
 */
async function killProcess(pid) {
  try {
    if (!runningProcesses.has(pid)) {
      return { success: false, error: 'Process not found' };
    }
    
    const isWindows = process.platform === 'win32';
    const killCommand = isWindows 
      ? spawn('taskkill', ['/F', '/PID', pid.toString()])
      : spawn('kill', ['-9', pid.toString()]);
    
    return new Promise((resolve) => {
      killCommand.on('close', (code) => {
        runningProcesses.delete(pid);
        resolve({ success: code === 0 });
      });
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Get running processes
 * @returns {Array} Running processes
 */
function getRunningProcesses() {
  return Array.from(runningProcesses.values());
}

/**
 * Check if project has running process
 * @param {string} projectPath - Project path
 * @returns {Object|null} Process info or null
 */
function getProcessForProject(projectPath) {
  for (const [pid, info] of runningProcesses.entries()) {
    if (info.projectPath === projectPath) {
      return { pid, ...info };
    }
  }
  return null;
}

/**
 * Detect available npm scripts from package.json
 * @param {string} projectPath - Project path
 * @returns {Promise<Array>} Available scripts
 */
async function detectNpmScripts(projectPath) {
  try {
    const pkgPath = path.join(projectPath, 'package.json');
    if (!await fs.pathExists(pkgPath)) {
      return [];
    }
    
    const pkg = await fs.readJson(pkgPath);
    const scripts = pkg.scripts || {};
    
    return Object.entries(scripts).map(([name, command]) => ({
      name,
      command,
      isCommon: ['dev', 'start', 'build', 'test', 'serve'].includes(name)
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Quick commands (common operations)
 */
const QUICK_COMMANDS = {
  install: 'npm install',
  dev: 'npm run dev',
  start: 'npm start',
  build: 'npm run build',
  test: 'npm test',
  serve: 'npm run serve'
};

module.exports = {
  runNpmCommand,
  killProcess,
  getRunningProcesses,
  getProcessForProject,
  detectNpmScripts,
  QUICK_COMMANDS,
  runningProcesses
};
