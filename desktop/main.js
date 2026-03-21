/**
 * Dev Port Manager - Electron Main Process
 * Cross-platform desktop application with auto-update support
 */

const { app, BrowserWindow, ipcMain, dialog, Menu, shell, nativeTheme } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

// Auto-updater
const { autoUpdater } = require('electron-updater');

// Import core modules
const {
  getAllProjects,
  getProject,
  assignProject,
  removeProject,
  scanDirectory,
  syncHosts,
  backupRegistry,
  listBackups,
  restoreRegistry,
  getLatestBackup,
  isPortAvailable,
  detectProjectType,
  getPortRange
} = require('../lib/project');

const settings = require('../lib/settings');
const { getHostsFilePath } = require('../lib/host');
const { getRegistryPath } = require('../lib/registry');
const configReader = require('../lib/config-reader');
const portScanner = require('../lib/port-scanner');
const configEditor = require('../lib/config-editor');
const npmExecutor = require('../lib/npm-executor');

// Keep a global reference of the window object
let mainWindow;
let serverProcess = null;

/**
 * Create the main browser window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: 'default',
    backgroundColor: '#f9fafb'
  });

  // Load the web dashboard
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Open external URLs in default browser (not in Electron)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Allow navigation to local files
    if (url.startsWith('file://')) return;
    
    // Open all other URLs in external browser
    event.preventDefault();
    shell.openExternal(url);
  });

  // Create application menu
  createMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Setup auto-updater
  setupAutoUpdater();
}

/**
 * Setup auto-update functionality
 */
function setupAutoUpdater() {
  // Don't auto-update in development
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    mainWindow.webContents.send('update-available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available');
    mainWindow.webContents.send('update-not-available', info);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`Download progress: ${progressObj.percent}%`);
    mainWindow.webContents.send('download-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    mainWindow.webContents.send('update-downloaded', info);
    
    // Ask user to restart
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'A new version is ready to install',
      detail: 'Dev Port Manager will restart to apply the update',
      buttons: ['Restart Now', 'Later']
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
    mainWindow.webContents.send('update-error', err);
  });

  // Check for updates on startup
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 5000);
}

/**
 * Create application menu
 */
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('refresh-projects');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Projects',
      submenu: [
        {
          label: 'Assign Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('show-assign-modal');
          }
        },
        {
          label: 'Scan Directory',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('show-scan-modal');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Sync Hosts',
          click: () => {
            mainWindow.webContents.send('sync-hosts');
          }
        },
        {
          label: 'Create Backup',
          click: () => {
            mainWindow.webContents.send('create-backup');
          }
        },
        { type: 'separator' },
        {
          label: 'Open Registry Folder',
          click: () => {
            const { shell } = require('electron');
            const settings = require('../lib/settings');
            shell.openPath(settings.getRegistryDir());
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Dev Port Manager',
              message: 'Dev Port Manager v1.0.0',
              detail: `Cross-platform development port manager\n\nOS: ${os.platform()} ${os.arch()}\nRegistry: ${REGISTRY_FILE}`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================================================================
// IPC HANDLERS
// ============================================================================

/**
 * Get all projects
 */
ipcMain.handle('get-projects', async () => {
  try {
    const projects = getAllProjects();
    // Ensure projects are JSON-serializable
    return { 
      success: true, 
      projects: projects.map(p => ({
        name: p.name,
        host: p.host || '',
        port: p.port || 0,
        url: p.url || '',
        projectType: p.projectType || 'unknown',
        os: p.os || 'unknown',
        assignedAt: p.assignedAt || '',
        basePath: p.basePath || ''
      }))
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Get single project
 */
ipcMain.handle('get-project', (event, name) => {
  try {
    const project = getProject(name);
    return { success: true, project };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Assign a new project
 */
ipcMain.handle('assign-project', (event, data) => {
  try {
    const project = assignProject(data.name, {
      port: data.port ? parseInt(data.port, 10) : undefined,
      host: data.host,
      basePath: data.basePath || process.cwd()
    });
    return { success: true, project };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Remove a project
 */
ipcMain.handle('remove-project', (event, name) => {
  try {
    const removed = removeProject(name);
    return { success: true, removed };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Scan directory
 */
ipcMain.handle('scan-directory', async (event, baseDir, dryRun) => {
  try {
    const result = await scanDirectory(baseDir, { dryRun });
    // Ensure result is JSON-serializable
    return {
      success: true,
      result: {
        results: (result.results || []).map(r => ({
          name: r.name || '',
          type: r.type || 'unknown',
          status: r.status || '',
          host: r.host || '',
          port: r.port || 0,
          url: r.url || ''
        })),
        skipped: result.skipped || [],
        errors: result.errors || []
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Sync hosts
 */
ipcMain.handle('sync-hosts', async () => {
  try {
    const result = await syncHosts({ useHostsFile: false });
    return { 
      success: result.success, 
      result: {
        message: result.message,
        hostsFile: result.hostsFile || ''
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Create backup
 */
ipcMain.handle('create-backup', async () => {
  try {
    const backupPath = await backupRegistry();
    return { success: true, backupPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * List backups
 */
ipcMain.handle('list-backups', async () => {
  try {
    const backups = await listBackups();
    return { success: true, backups };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Restore from backup
 */
ipcMain.handle('restore-backup', async (event, backupPath) => {
  try {
    if (backupPath) {
      await restoreRegistry(backupPath);
    } else {
      const latest = await getLatestBackup();
      if (!latest) {
        return { success: false, error: 'No backups found' };
      }
      await restoreRegistry(latest.path);
    }
    return { success: true, message: 'Registry restored' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Check if port is available
 */
ipcMain.handle('check-port', async (event, port) => {
  try {
    const available = await isPortAvailable(port);
    return { success: true, available };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Detect project type
 */
ipcMain.handle('detect-project-type', (event, projectPath) => {
  try {
    const type = detectProjectType(projectPath);
    return { success: true, type };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Read project config files
 */
ipcMain.handle('read-project-config', async (event, projectPath) => {
  try {
    const config = await configReader.readAllConfigs(projectPath);
    return { success: true, config };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Update project port in config files
 */
ipcMain.handle('update-project-config', async (event, projectPath, port, options = {}) => {
  try {
    const results = {
      package: false,
      env: false,
      vite: false
    };
    
    if (options.updatePackage !== false) {
      results.package = await configReader.updatePackageJsonPort(projectPath, port);
    }
    
    if (options.updateEnv !== false) {
      results.env = await configReader.updateEnvPort(projectPath, port);
    }
    
    if (options.updateVite !== false) {
      results.vite = await configReader.updateVitePort(projectPath, port);
    }
    
    return { success: true, results };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Scan project for actual running port
 */
ipcMain.handle('scan-project-port', async (event, projectPath, registeredPort) => {
  try {
    const result = await portScanner.scanProjectPort(projectPath, registeredPort);
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Scan all projects for actual ports
 */
ipcMain.handle('scan-all-ports', async () => {
  try {
    const { getAllProjects } = require('../lib/project');
    const projects = getAllProjects();
    const results = await portScanner.scanAllProjects(projects);
    const discrepancies = portScanner.findDiscrepancies(results);
    return { success: true, results, discrepancies };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Sync registry with actual running ports
 */
ipcMain.handle('sync-ports', async () => {
  try {
    const { getAllProjects } = require('../lib/project');
    const projects = getAllProjects();
    const results = await portScanner.scanAllProjects(projects);
    const syncResult = await portScanner.syncRegistryWithActual(results);
    return { success: true, ...syncResult };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Scan common ports for running servers
 */
ipcMain.handle('scan-common-ports', async () => {
  try {
    const running = await portScanner.scanCommonPorts();
    return { success: true, running };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Get port sync recommendations
 */
ipcMain.handle('get-port-recommendations', async () => {
  try {
    const { getAllProjects } = require('../lib/project');
    const projects = getAllProjects();
    const scanResults = await portScanner.scanAllProjects(projects);
    const runningPorts = await portScanner.scanCommonPorts();
    const recommendations = portScanner.generateRecommendations(scanResults, runningPorts);
    return { success: true, recommendations };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Kill process on port
 */
ipcMain.handle('kill-port', async (event, port) => {
  try {
    const result = await portScanner.killProcessOnPort(port);
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Suggest port for project
 */
ipcMain.handle('suggest-port', async (event, projectType, preferredPort) => {
  try {
    const result = await portScanner.suggestPort(projectType, preferredPort);
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Find config files for project
 */
ipcMain.handle('find-config-files', async (event, projectPath) => {
  try {
    const files = await configEditor.findConfigFiles(projectPath);
    return { success: true, files };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Read config file
 */
ipcMain.handle('read-config-file', async (event, filePath) => {
  try {
    const config = await configEditor.readConfigFile(filePath);
    return { success: true, config };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Update config file port
 */
ipcMain.handle('update-config-port', async (event, filePath, newPort) => {
  try {
    const result = await configEditor.updateConfigPort(filePath, newPort);
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * List config backups
 */
ipcMain.handle('list-config-backups', async (event, projectName) => {
  try {
    const backups = await configEditor.listConfigBackups(projectName);
    return { success: true, backups };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Restore config backup
 */
ipcMain.handle('restore-config-backup', async (event, backupPath, originalPath) => {
  try {
    const result = await configEditor.restoreConfigBackup(backupPath, originalPath);
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Detect npm scripts
 */
ipcMain.handle('detect-npm-scripts', async (event, projectPath) => {
  try {
    const scripts = await npmExecutor.detectNpmScripts(projectPath);
    return { success: true, scripts };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Run npm command
 */
ipcMain.handle('run-npm-command', async (event, projectPath, command) => {
  try {
    const result = await npmExecutor.runNpmCommand(projectPath, command);
    return { success: true, ...result };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Kill process
 */
ipcMain.handle('kill-process', async (event, pid) => {
  try {
    const result = await npmExecutor.killProcess(pid);
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Get running processes
 */
ipcMain.handle('get-running-processes', async () => {
  try {
    const processes = npmExecutor.getRunningProcesses();
    return { success: true, processes };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Get system info
 */
ipcMain.handle('get-system-info', async () => {
  try {
    const loadedSettings = await settings.loadSettings();
    return {
      success: true,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        homedir: os.homedir(),
        registryFile: getRegistryPath(),
        settingsFile: settings.getSettingsPath(),
        hostsFile: getHostsFilePath(),
        portRange: loadedSettings.portRange,
        useLocaltestMe: loadedSettings.useLocaltestMe
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Get settings
 */
ipcMain.handle('get-settings', async () => {
  try {
    const loadedSettings = await settings.loadSettings();
    const validation = settings.validateSettings(loadedSettings);
    return { success: true, settings: loadedSettings, validation };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Update settings
 */
ipcMain.handle('update-settings', async (event, newSettings) => {
  try {
    const currentSettings = await settings.loadSettings();
    const merged = { ...currentSettings, ...newSettings };
    await settings.saveSettings(merged);
    return { success: true, settings: merged };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Reset settings
 */
ipcMain.handle('reset-settings', async () => {
  try {
    await settings.resetSettings();
    return { success: true, message: 'Settings reset' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Show open directory dialog
 */
ipcMain.handle('show-directory-dialog', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    return { success: true, path: result.filePaths[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/**
 * Show message dialog
 */
ipcMain.handle('show-message', async (event, options) => {
  return dialog.showMessageBox(mainWindow, options);
});

// ============================================================================
// APP LIFECYCLE
// ============================================================================

// App ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// All windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Before quit
app.on('before-quit', () => {
  // Clean up any running processes
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  dialog.showErrorBox('Error', err.message);
});
