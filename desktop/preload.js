/**
 * Dev Port Manager - Electron Preload Script
 * Secure bridge between renderer and main process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('devPortAPI', {
  // Project management
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProject: (name) => ipcRenderer.invoke('get-project', name),
  assignProject: (data) => ipcRenderer.invoke('assign-project', data),
  removeProject: (name) => ipcRenderer.invoke('remove-project', name),
  
  // Scanning
  scanDirectory: (baseDir, dryRun) => ipcRenderer.invoke('scan-directory', baseDir, dryRun),
  detectProjectType: (path) => ipcRenderer.invoke('detect-project-type', path),
  
  // Config reading/updating
  readProjectConfig: (path) => ipcRenderer.invoke('read-project-config', path),
  updateProjectConfig: (path, port, options) => ipcRenderer.invoke('update-project-config', path, port, options),
  
  // Port scanning/syncing
  scanProjectPort: (path, port) => ipcRenderer.invoke('scan-project-port', path, port),
  scanAllPorts: () => ipcRenderer.invoke('scan-all-ports'),
  syncPorts: () => ipcRenderer.invoke('sync-ports'),
  scanCommonPorts: () => ipcRenderer.invoke('scan-common-ports'),
  getPortRecommendations: () => ipcRenderer.invoke('get-port-recommendations'),
  killPort: (port) => ipcRenderer.invoke('kill-port', port),
  suggestPort: (type, preferred) => ipcRenderer.invoke('suggest-port', type, preferred),
  
  // Config editing
  findConfigFiles: (path) => ipcRenderer.invoke('find-config-files', path),
  readConfigFile: (path) => ipcRenderer.invoke('read-config-file', path),
  updateConfigPort: (path, port) => ipcRenderer.invoke('update-config-port', path, port),
  listConfigBackups: (project) => ipcRenderer.invoke('list-config-backups', project),
  restoreConfigBackup: (backup, original) => ipcRenderer.invoke('restore-config-backup', backup, original),
  
  // NPM commands
  detectNpmScripts: (path) => ipcRenderer.invoke('detect-npm-scripts', path),
  runNpmCommand: (path, command) => ipcRenderer.invoke('run-npm-command', path, command),
  killProcess: (pid) => ipcRenderer.invoke('kill-process', pid),
  getRunningProcesses: () => ipcRenderer.invoke('get-running-processes'),
  
  // System operations
  syncHosts: () => ipcRenderer.invoke('sync-hosts'),
  checkPort: (port) => ipcRenderer.invoke('check-port', port),
  
  // Backup/Restore
  createBackup: () => ipcRenderer.invoke('create-backup'),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  restoreBackup: (backupPath) => ipcRenderer.invoke('restore-backup', backupPath),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // File dialogs
  showDirectoryDialog: () => ipcRenderer.invoke('show-directory-dialog'),
  showMessage: (options) => ipcRenderer.invoke('show-message', options),
  
  // Event listeners
  onRefresh: (callback) => {
    ipcRenderer.on('refresh-projects', callback);
  },
  onShowAssignModal: (callback) => {
    ipcRenderer.on('show-assign-modal', callback);
  },
  onShowScanModal: (callback) => {
    ipcRenderer.on('show-scan-modal', callback);
  },
  onSyncHosts: (callback) => {
    ipcRenderer.on('sync-hosts', callback);
  },
  onCreateBackup: (callback) => {
    ipcRenderer.on('create-backup', callback);
  }
});

// Platform info
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  platform: process.platform
});
