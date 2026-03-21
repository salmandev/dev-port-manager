/**
 * Dev Port Manager - Electron Renderer Process
 * Desktop app UI logic
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load system info
  await loadSystemInfo();
  
  // Load projects
  await loadProjects();
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup IPC listeners
  setupIPCListeners();
});

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadSystemInfo() {
  try {
    const result = await window.devPortAPI.getSystemInfo();
    if (result.success) {
      const { system } = result;
      document.getElementById('platform-badge').textContent = system.platform;
      document.getElementById('platform-badge').className = `badge badge-${system.platform}`;
      document.getElementById('registry-info').textContent = system.registryDir;
    }
  } catch (err) {
    console.error('Failed to load system info:', err);
  }
}

// Cache for projects
let projectsCache = [];

async function loadProjects() {
  try {
    const result = await window.devPortAPI.getProjects();
    if (result.success) {
      projectsCache = result.projects;
      updateProjectsTable(result.projects);
      updateStats(result.projects);
    }
  } catch (err) {
    console.error('Failed to load projects:', err);
    showToast('❌ Failed to load projects', 'error');
  }
}

function getProject(name) {
  return projectsCache ? projectsCache.find(p => p.name === name) : null;
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateProjectsTable(projects) {
  const tbody = document.getElementById('projects-body');
  
  if (projects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <p>📭 No projects registered yet</p>
          <p class="hint">Use "Assign Project" or "Scan Directory" to get started</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = projects.map(p => `
    <tr data-name="${p.name}">
      <td><span class="project-name">${p.name}</span></td>
      <td>
        <span class="type-badge type-${p.projectType || 'other'}">
          ${p.projectType || 'unknown'}
        </span>
      </td>
      <td>${p.host}</td>
      <td><span class="port-badge">${p.port}</span></td>
      <td>
        <div class="url-list">
          <a href="${p.url}" target="_blank" class="url-link" title="${p.url}">
            🔗 ${p.host.replace('.localtest.me', '')}
          </a>
          ${p.localhostUrl ? `
            <a href="${p.localhostUrl}" target="_blank" class="url-link localhost" title="${p.localhostUrl}">
              🏠 localhost:${p.port}
            </a>
          ` : `
            <a href="http://localhost:${p.port}" target="_blank" class="url-link localhost" title="http://localhost:${p.port}">
              🏠 localhost:${p.port}
            </a>
          `}
        </div>
      </td>
      <td><span class="os-badge os-${p.os}">${p.os}</span></td>
      <td><span class="status-badge" data-port="${p.port}">Checking...</span></td>
      <td class="actions">
        <button class="btn-icon" onclick="editProject('${p.name}', ${p.port}, '${p.basePath || ''}')" title="Edit Project">✏️</button>
        <button class="btn-icon" onclick="copyUrl('${p.url}')" title="Copy URL">📋</button>
        <button class="btn-icon" onclick="checkPortStatus(${p.port}, this)" title="Check Port">🔍</button>
        <button class="btn-icon btn-danger" onclick="removeProject('${p.name}')" title="Remove">🗑️</button>
      </td>
    </tr>
  `).join('');
  
  // Check port statuses
  checkAllPortStatuses(projects);
}

async function checkAllPortStatuses(projects) {
  for (const p of projects) {
    try {
      const result = await window.devPortAPI.checkPort(p.port);
      const badge = document.querySelector(`.status-badge[data-port="${p.port}"]`);
      if (badge && result.success) {
        if (result.available) {
          badge.textContent = '✅ Free';
          badge.className = 'status-badge status-free';
        } else {
          badge.textContent = '🔴 In Use';
          badge.className = 'status-badge status-used';
        }
      }
    } catch (err) {
      console.error('Failed to check port:', err);
    }
  }
}

async function checkPortStatus(port, button) {
  try {
    const result = await window.devPortAPI.checkPort(port);
    if (result.success) {
      if (result.available) {
        showToast(`✅ Port ${port} is available`, 'success');
      } else {
        showToast(`⚠️ Port ${port} is in use`, 'warning');
      }
    }
  } catch (err) {
    showToast('❌ Failed to check port', 'error');
  }
}

function updateStats(projects) {
  document.getElementById('stat-total').textContent = projects.length;
  
  // Count project types
  const types = {};
  projects.forEach(p => {
    const type = p.projectType || 'other';
    types[type] = (types[type] || 0) + 1;
  });
  
  document.getElementById('stat-types').textContent = Object.keys(types).length;
  
  // Available ports
  const availablePorts = 1000 - projects.length;
  document.getElementById('stat-available').textContent = availablePorts;
}

function filterProjects() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const typeFilter = document.getElementById('filter-type').value;
  const rows = document.querySelectorAll('#projects-body tr[data-name]');
  
  rows.forEach(row => {
    const name = row.dataset.name.toLowerCase();
    const type = row.querySelector('.type-badge')?.textContent?.toLowerCase() || '';
    
    const matchesSearch = !search || name.includes(search);
    const matchesType = !typeFilter || type === typeFilter;
    
    row.style.display = (matchesSearch && matchesType) ? '' : 'none';
  });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Update active state
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show/hide tab content
      const projectsElements = document.querySelectorAll('#projects-tab, .table-container');
      const settingsElement = document.getElementById('settings-tab');
      const toolsElement = document.getElementById('tools-tab');

      if (tabName === 'projects') {
        projectsElements.forEach(el => el.style.display = 'block');
        settingsElement.style.display = 'none';
        toolsElement.style.display = 'none';
      } else if (tabName === 'settings') {
        projectsElements.forEach(el => el.style.display = 'none');
        settingsElement.style.display = 'block';
        toolsElement.style.display = 'none';
        loadSettings();
      } else if (tabName === 'tools') {
        projectsElements.forEach(el => el.style.display = 'none');
        settingsElement.style.display = 'none';
        toolsElement.style.display = 'block';
        loadToolsProjects();
      }
    });
  });

  // Action buttons
  document.getElementById('btn-assign').addEventListener('click', () => showModal('assign-modal'));
  document.getElementById('btn-scan').addEventListener('click', () => showModal('scan-modal'));
  document.getElementById('btn-sync').addEventListener('click', syncHosts);
  document.getElementById('btn-backup').addEventListener('click', createBackup);
  document.getElementById('btn-refresh').addEventListener('click', loadProjects);
  document.getElementById('btn-settings').addEventListener('click', () => {
    document.querySelector('[data-tab="settings"]').click();
  });
  document.getElementById('btn-sync-ports').addEventListener('click', syncActualPorts);
  
  // Browse buttons
  document.getElementById('btn-browse').addEventListener('click', async () => {
    const result = await window.devPortAPI.showDirectoryDialog();
    if (result.success && result.path) {
      document.getElementById('project-path').value = result.path;
    }
  });

  document.getElementById('btn-browse-scan').addEventListener('click', async () => {
    const result = await window.devPortAPI.showDirectoryDialog();
    if (result.success && result.path) {
      document.getElementById('scan-path').value = result.path;
    }
  });

  // Settings buttons
  document.getElementById('btn-browse-registry').addEventListener('click', async () => {
    const result = await window.devPortAPI.showDirectoryDialog();
    if (result.success && result.path) {
      document.getElementById('setting-registry-path').value = result.path;
    }
  });

  document.getElementById('btn-save-registry').addEventListener('click', saveRegistryPath);
  document.getElementById('btn-save-port-range').addEventListener('click', savePortRange);
  document.getElementById('btn-create-backup').addEventListener('click', async () => {
    const result = await window.devPortAPI.createBackup();
    if (result.success) {
      showToast('✅ Backup created');
      loadBackups();
    } else {
      showToast('❌ ' + result.error, 'error');
    }
  });
  document.getElementById('btn-restore-backup').addEventListener('click', async () => {
    const result = await window.devPortAPI.listBackups();
    if (result.success && result.backups.length > 0) {
      restoreBackup(result.backups[0].path);
    } else {
      showToast('❌ No backups found', 'error');
    }
  });
  document.getElementById('btn-reset-settings').addEventListener('click', resetSettings);
  
  // Tools tab buttons
  document.getElementById('btn-load-configs').addEventListener('click', loadConfigFiles);
  document.getElementById('btn-load-scripts').addEventListener('click', loadNpmScripts);
  document.getElementById('btn-clear-terminal').addEventListener('click', clearTerminal);
  document.getElementById('btn-kill-process').addEventListener('click', killCurrentProcess);
  document.getElementById('btn-refresh-processes').addEventListener('click', loadRunningProcesses);
  
  // Forms
  document.getElementById('assign-form').addEventListener('submit', handleAssignProject);
  document.getElementById('scan-form').addEventListener('submit', handleScanDirectory);
  
  // Search/Filter
  document.getElementById('search-input').addEventListener('input', filterProjects);
  document.getElementById('filter-type').addEventListener('change', filterProjects);
}

function setupIPCListeners() {
  window.devPortAPI.onRefresh(() => {
    loadProjects();
    showToast('🔄 Projects refreshed');
  });
  
  window.devPortAPI.onShowAssignModal(() => {
    showModal('assign-modal');
  });
  
  window.devPortAPI.onShowScanModal(() => {
    showModal('scan-modal');
  });
  
  window.devPortAPI.onSyncHosts(() => {
    syncHosts();
  });
  
  window.devPortAPI.onCreateBackup(() => {
    createBackup();
  });
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleAssignProject(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  const result = await window.devPortAPI.assignProject(data);
  
  if (result.success) {
    hideModal('assign-modal');
    form.reset();
    await loadProjects();
    showToast('✅ Project assigned successfully');
  } else {
    showToast('❌ ' + result.error, 'error');
  }
}

async function handleScanDirectory(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  data.dryRun = document.getElementById('scan-dry-run').checked;
  
  const resultsDiv = document.getElementById('scan-results');
  resultsDiv.innerHTML = '<p>Scanning...</p>';
  
  const result = await window.devPortAPI.scanDirectory(data.baseDir, data.dryRun);
  
  if (result.success) {
    const { results, skipped, errors } = result.result;
    let html = '<h3>Results</h3>';
    
    if (results.length > 0) {
      html += `<p class="success">✅ Assigned: ${results.length}</p>`;
      results.forEach(r => {
        if (r.url) {
          html += `<div class="result-item">
            <span class="type-badge type-${r.type}">${r.type}</span>
            <strong>${r.name}</strong> → Port: ${r.port}
          </div>`;
        }
      });
    }
    
    if (skipped.length > 0) {
      html += `<p class="hint">⊘ Skipped: ${skipped.length}</p>`;
    }
    
    if (errors.length > 0) {
      html += `<p class="error">❌ Errors: ${errors.length}</p>`;
    }
    
    resultsDiv.innerHTML = html;
    
    if (!data.dryRun && results.length > 0) {
      setTimeout(loadProjects, 1000);
    }
  } else {
    resultsDiv.innerHTML = `<p class="error">❌ ${result.error}</p>`;
  }
}

async function removeProject(name) {
  const result = await window.devPortAPI.showMessage({
    type: 'question',
    buttons: ['Cancel', 'Remove'],
    defaultId: 0,
    cancelId: 0,
    title: 'Confirm Removal',
    message: `Remove "${name}"?`,
    detail: 'This will remove the project from the registry but won\'t delete any files.'
  });
  
  if (result.response === 1) {
    const removeResult = await window.devPortAPI.removeProject(name);
    if (removeResult.success) {
      await loadProjects();
      showToast(`✅ Project "${name}" removed`);
    } else {
      showToast('❌ ' + removeResult.error, 'error');
    }
  }
}

async function editProject(name, currentPort, basePath) {
  const project = getProject(name);
  const actualBasePath = basePath || (project && project.basePath) || '';
  
  // Read project config files if we have a path
  let detectedPort = null;
  if (actualBasePath) {
    try {
      const configResult = await window.devPortAPI.readProjectConfig(actualBasePath);
      if (configResult.success && configResult.config) {
        detectedPort = configResult.config.detectedPort;
      }
    } catch (err) {
      console.error('Error reading config:', err);
    }
  }
  
  // Show edit dialog
  const portStr = prompt(
    `Edit port for ${name}:\n\n` +
    `Current assigned port: ${currentPort}\n` +
    (detectedPort ? `Detected config port: ${detectedPort}\n\n` : '') +
    `Enter new port:`,
    currentPort.toString()
  );
  
  if (!portStr || portStr === currentPort.toString()) {
    return; // User cancelled or no change
  }
  
  const newPort = parseInt(portStr, 10);
  if (isNaN(newPort) || newPort < 1024 || newPort > 65535) {
    showToast('❌ Invalid port number', 'error');
    return;
  }
  
  // Ask to update config files
  let updateConfigs = false;
  if (actualBasePath) {
    const confirmResult = confirm(
      `Update config files to use port ${newPort}?\n\n` +
      `This will update:\n` +
      `- package.json (devPort field)\n` +
      `- .env file (PORT variable)\n` +
      `- vite.config.js/ts (if exists)\n\n` +
      `Click OK to update configs, Cancel to only change registry.`
    );
    updateConfigs = confirmResult;
  }
  
  try {
    // Update config files if requested
    if (updateConfigs && actualBasePath) {
      const updateResult = await window.devPortAPI.updateProjectConfig(actualBasePath, newPort, {
        updatePackage: true,
        updateEnv: true,
        updateVite: true
      });
      
      if (updateResult.success) {
        showToast(`✅ Project "${name}" updated to port ${newPort} and config files updated`, 'success');
      } else {
        showToast('⚠️ Port updated in registry, but config update failed: ' + updateResult.error, 'warning');
      }
    } else {
      showToast(`✅ Project "${name}" port updated to ${newPort} (registry only)`, 'success');
    }
    
    // Reload projects
    await loadProjects();
  } catch (err) {
    showToast('❌ Error: ' + err.message, 'error');
  }
}

async function syncHosts() {
  const result = await window.devPortAPI.syncHosts();
  if (result.success) {
    showToast('✅ ' + result.result.message);
  } else {
    showToast('⚠️ ' + result.result.message, 'warning');
  }
}

async function createBackup() {
  const result = await window.devPortAPI.createBackup();
  if (result.success) {
    showToast('✅ Backup created');
  } else {
    showToast('❌ ' + result.error, 'error');
  }
}

function copyUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast('✅ URL copied to clipboard');
  }).catch(() => {
    showToast('❌ Failed to copy URL', 'error');
  });
}

// ============================================================================
// SETTINGS FUNCTIONS
// ============================================================================

async function loadSettings() {
  try {
    const result = await window.devPortAPI.getSettings();
    if (result.success) {
      const settings = result.settings;
      
      // Populate settings form
      document.getElementById('setting-registry-path').value = settings.registryPath || '';
      document.getElementById('setting-port-min').value = settings.portRange[0];
      document.getElementById('setting-port-max').value = settings.portRange[1];
      document.getElementById('setting-use-localtest').checked = settings.useLocaltestMe !== false;
      
      // Load system info
      const systemResult = await window.devPortAPI.getSystemInfo();
      if (systemResult.success) {
        const system = systemResult.system;
        document.getElementById('system-info').innerHTML = `
          <p><strong>Platform:</strong> ${system.platform} ${system.arch}</p>
          <p><strong>Registry:</strong> ${system.registryFile}</p>
          <p><strong>Settings:</strong> ${system.settingsFile}</p>
          <p><strong>Hosts File:</strong> ${system.hostsFile}</p>
        `;
      }
      
      // Load backups
      loadBackups();
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

async function loadBackups() {
  try {
    const result = await window.devPortAPI.listBackups();
    if (result.success) {
      const list = document.getElementById('backup-list');
      if (result.backups.length === 0) {
        list.innerHTML = '<p class="hint">No backups found</p>';
      } else {
        list.innerHTML = result.backups.map(b => `
          <div class="backup-item">
            <span>${b.filename}</span>
            <button class="btn btn-sm" onclick="restoreBackup('${b.path}')">Restore</button>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load backups:', err);
  }
}

async function saveRegistryPath() {
  const path = document.getElementById('setting-registry-path').value;
  if (!path) {
    showToast('❌ Please enter a path', 'error');
    return;
  }
  
  try {
    const result = await window.devPortAPI.updateSettings({ registryPath: path });
    if (result.success) {
      showToast('✅ Registry path saved');
      loadSettings();
    } else {
      showToast('❌ ' + result.error, 'error');
    }
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

async function savePortRange() {
  const min = parseInt(document.getElementById('setting-port-min').value);
  const max = parseInt(document.getElementById('setting-port-max').value);
  
  if (min >= max) {
    showToast('❌ Min port must be less than max', 'error');
    return;
  }
  
  try {
    const result = await window.devPortAPI.updateSettings({ portRange: [min, max] });
    if (result.success) {
      showToast('✅ Port range saved');
    } else {
      showToast('❌ ' + result.error, 'error');
    }
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

async function restoreBackup(backupPath) {
  if (!confirm('Restore from this backup? Current registry will be replaced.')) return;
  
  try {
    const result = await window.devPortAPI.restoreBackup(backupPath);
    if (result.success) {
      showToast('✅ Backup restored');
      loadBackups();
    } else {
      showToast('❌ ' + result.error, 'error');
    }
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

async function resetSettings() {
  if (!confirm('Reset all settings to defaults?')) return;
  
  try {
    const result = await window.devPortAPI.resetSettings();
    if (result.success) {
      showToast('✅ Settings reset');
      loadSettings();
    } else {
      showToast('❌ ' + result.error, 'error');
    }
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

async function syncActualPorts() {
  try {
    showToast('🔍 Scanning projects and common ports...', 'info');
    
    // Get recommendations
    const recResult = await window.devPortAPI.getPortRecommendations();
    if (!recResult.success) {
      throw new Error(recResult.error);
    }
    
    const { recommendations } = recResult;
    
    if (recommendations.length === 0) {
      showToast('✅ All ports are in sync! No issues found.', 'success');
      // Still refresh to show latest status
      await loadProjects();
      await loadToolsProjects();
      return;
    }
    
    // Build recommendation message
    let message = `Found ${recommendations.length} port issue(s):\n\n`;
    
    recommendations.forEach((rec, i) => {
      const icon = rec.isRunning ? '🟢' : '⚠️';
      message += `${i + 1}. ${icon} ${rec.project || 'Unknown'}\n`;
      message += `   ${rec.reason}\n`;
      if (rec.currentPort) {
        message += `   Current: ${rec.currentPort} → Recommended: ${rec.recommendedPort}\n`;
      }
      message += '\n';
    });
    
    message += 'Auto-fix all issues?';
    
    if (confirm(message)) {
      showToast('⚙️ Applying fixes...', 'info');
      
      // Auto-fix what we can
      const fixable = recommendations.filter(r => r.autoFixable);
      const fixed = [];
      const failed = [];
      
      for (const rec of fixable) {
        try {
          if (rec.project) {
            const project = projectsCache.find(p => p.name === rec.project);
            if (project && project.basePath && project.basePath !== 'N/A') {
              await window.devPortAPI.updateProjectConfig(
                project.basePath, 
                rec.recommendedPort,
                { updatePackage: true, updateEnv: true, updateVite: true }
              );
              fixed.push(rec.project);
            }
          }
        } catch (err) {
          failed.push(rec.project || `port ${rec.recommendedPort}`);
        }
      }
      
      // Sync registry
      const syncResult = await window.devPortAPI.syncPorts();
      
      let resultMsg = '';
      if (fixed.length > 0) {
        resultMsg += `✅ Fixed ${fixed.length} project(s): ${fixed.join(', ')}\n`;
      }
      if (syncResult.success && syncResult.updated.length > 0) {
        resultMsg += `✅ Updated registry: ${syncResult.updated.length} project(s)\n`;
      }
      if (failed.length > 0) {
        resultMsg += `⚠️ Failed: ${failed.join(', ')}`;
      }
      
      showToast(resultMsg || '✅ Done!', 'success');
      
      // CRITICAL: Reload projects to reflect changes!
      await loadProjects();
      await loadToolsProjects();
      
      // Show success message with reload confirmation
      setTimeout(() => {
        showToast('🔄 UI refreshed with latest data', 'info');
      }, 1000);
    }
  } catch (err) {
    showToast('❌ Error: ' + err.message, 'error');
  }
}

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================

function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    hideModal(event.target.id);
  }
};

// ============================================================================
// TOOLS TAB FUNCTIONS
// ============================================================================

let currentProject = null;
let currentProcessPid = null;

function appendToTerminal(text, type = 'info') {
  const terminal = document.getElementById('terminal-output');
  const line = document.createElement('div');
  line.className = type;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
  const terminal = document.getElementById('terminal-output');
  terminal.innerHTML = '<div class="info">Terminal cleared</div>';
}

async function loadToolsProjects() {
  try {
    const result = await window.devPortAPI.getProjects();
    const select = document.getElementById('tools-project-select');
    
    select.innerHTML = '<option value="">-- Select a project --</option>';
    
    if (result.success) {
      result.projects.forEach(p => {
        const option = document.createElement('option');
        option.value = p.name;
        option.textContent = `${p.name} (Port: ${p.port})`;
        option.dataset.project = JSON.stringify(p);
        select.appendChild(option);
      });
      
      select.onchange = () => {
        const option = select.options[select.selectedIndex];
        if (option.value) {
          currentProject = JSON.parse(option.dataset.project);
          document.getElementById('project-info').style.display = 'block';
          document.getElementById('project-path').textContent = currentProject.basePath || 'N/A';
          document.getElementById('project-port').textContent = currentProject.port;
          document.getElementById('project-type').textContent = currentProject.projectType || 'unknown';
          appendToTerminal(`Selected project: ${currentProject.name}`, 'info');
        } else {
          currentProject = null;
          document.getElementById('project-info').style.display = 'none';
        }
      };
    }
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

async function loadConfigFiles() {
  if (!currentProject || !currentProject.basePath || currentProject.basePath === 'N/A') {
    appendToTerminal('⚠️ Project basePath is missing. Please re-assign the project from its directory:', 'stderr');
    appendToTerminal(`   cd ${currentProject.name} && dev-port assign ${currentProject.name}`, 'info');
    showToast('⚠️ Project path missing - re-assign from directory', 'error');
    return;
  }
  
  const list = document.getElementById('config-files-list');
  list.innerHTML = '<div class="loading">🔍 Loading config files...</div>';
  
  try {
    appendToTerminal(`Loading config files for ${currentProject.name}...`, 'info');
    const result = await window.devPortAPI.findConfigFiles(currentProject.basePath);
    
    list.innerHTML = '';
    
    if (result.success && result.files.length > 0) {
      result.files.forEach(f => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.innerHTML = `
          <div>
            <div class="config-name">${f.name}${f.hasPort ? ` (port: ${f.port})` : ''}</div>
            <div class="config-path">${f.path}</div>
          </div>
          <div class="config-actions">
            <button class="btn btn-sm" onclick="window.editConfigFile('${f.path}', ${f.port || 'null'})">✏️ Edit</button>
          </div>
        `;
        list.appendChild(item);
      });
      appendToTerminal(`✅ Found ${result.files.length} config files`, 'stdout');
      showToast(`✅ Loaded ${result.files.length} config files`, 'success');
    } else {
      list.innerHTML = '<p class="hint">No config files found</p>';
      appendToTerminal('No config files found', 'stderr');
      showToast('⚠️ No config files found', 'warning');
    }
  } catch (err) {
    list.innerHTML = '<p class="error">❌ Failed to load config files</p>';
    appendToTerminal(`Error: ${err.message}`, 'stderr');
    showToast(`❌ ${err.message}`, 'error');
  }
}

async function editConfigFile(filePath, currentPort) {
  const newPort = prompt(`Edit port in ${filePath}:`, currentPort || '');
  if (!newPort) return;
  
  const portNum = parseInt(newPort, 10);
  if (isNaN(portNum)) {
    appendToTerminal('Invalid port number', 'stderr');
    return;
  }
  
  try {
    appendToTerminal(`Updating ${filePath} to port ${portNum}...`, 'info');
    const result = await window.devPortAPI.updateConfigPort(filePath, portNum);
    
    if (result.success) {
      appendToTerminal(`✅ ${result.message}`, 'stdout');
      if (result.backup) {
        appendToTerminal(`Backup: ${result.backup}`, 'info');
      }
      loadConfigFiles(); // Refresh list
    } else {
      appendToTerminal(`❌ ${result.error}`, 'stderr');
    }
  } catch (err) {
    appendToTerminal(`Error: ${err.message}`, 'stderr');
  }
}

async function loadNpmScripts() {
  if (!currentProject || !currentProject.basePath || currentProject.basePath === 'N/A') {
    appendToTerminal('⚠️ Project basePath is missing. Please re-assign the project from its directory:', 'stderr');
    appendToTerminal(`   cd ${currentProject.name} && dev-port assign ${currentProject.name}`, 'info');
    showToast('⚠️ Project path missing - re-assign from directory', 'error');
    return;
  }
  
  const list = document.getElementById('npm-scripts-list');
  list.innerHTML = '<div class="loading">🔍 Loading NPM scripts...</div>';
  
  try {
    appendToTerminal(`Loading NPM scripts for ${currentProject.name}...`, 'info');
    const result = await window.devPortAPI.detectNpmScripts(currentProject.basePath);
    
    list.innerHTML = '';
    
    if (result.success && result.scripts.length > 0) {
      result.scripts.forEach(s => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.innerHTML = `
          <div>
            <div class="config-name">${s.name}${s.isCommon ? ' ⭐' : ''}</div>
            <div class="config-path">${s.command}</div>
          </div>
          <div class="config-actions">
            <button class="btn btn-sm" onclick="runNpmScript('${s.name}', '${s.command.replace(/'/g, "\\'")}')">▶️ Run</button>
          </div>
        `;
        list.appendChild(item);
      });
      appendToTerminal(`✅ Found ${result.scripts.length} NPM scripts`, 'stdout');
      showToast(`✅ Loaded ${result.scripts.length} NPM scripts`, 'success');
    } else {
      list.innerHTML = '<p class="hint">No NPM scripts found (no package.json?)</p>';
      appendToTerminal('No NPM scripts found', 'stderr');
      showToast('⚠️ No NPM scripts found', 'warning');
    }
  } catch (err) {
    list.innerHTML = '<p class="error">❌ Failed to load scripts</p>';
    appendToTerminal(`Error: ${err.message}`, 'stderr');
    showToast(`❌ ${err.message}`, 'error');
  }
}

async function runNpmScript(scriptName, scriptCommand) {
  if (!currentProject || !currentProject.basePath) {
    appendToTerminal('Please select a project first', 'stderr');
    return;
  }
  
  try {
    appendToTerminal(`🚀 Running: npm ${scriptCommand}`, 'info');
    appendToTerminal(`In: ${currentProject.basePath}`, 'info');
    
    // Clear terminal for new output
    clearTerminal();
    
    const result = await window.devPortAPI.runNpmCommand(
      currentProject.basePath,
      scriptCommand,
      (type, output) => {
        appendToTerminal(output.trim(), type === 'stdout' ? 'stdout' : 'stderr');
      }
    );
    
    if (result.success) {
      currentProcessPid = result.pid;
      appendToTerminal(`✅ Process started (PID: ${result.pid})`, 'stdout');
      appendToTerminal(`Status: ${result.status}`, 'info');
    } else {
      appendToTerminal(`❌ Failed: ${result.error}`, 'stderr');
    }
  } catch (err) {
    appendToTerminal(`Error: ${err.message}`, 'stderr');
  }
}

async function killCurrentProcess() {
  if (!currentProcessPid) {
    appendToTerminal('No running process to kill', 'stderr');
    return;
  }
  
  if (!confirm(`Kill process ${currentProcessPid}?`)) return;
  
  try {
    appendToTerminal(`Killing process ${currentProcessPid}...`, 'info');
    const result = await window.devPortAPI.killProcess(currentProcessPid);
    
    if (result.success) {
      appendToTerminal(`✅ Process ${currentProcessPid} killed`, 'stdout');
      currentProcessPid = null;
    } else {
      appendToTerminal(`❌ ${result.error}`, 'stderr');
    }
  } catch (err) {
    appendToTerminal(`Error: ${err.message}`, 'stderr');
  }
}

async function loadRunningProcesses() {
  try {
    const result = await window.devPortAPI.getRunningProcesses();
    const list = document.getElementById('running-processes-list');
    list.innerHTML = '';
    
    if (result.success && result.processes.length > 0) {
      result.processes.forEach(p => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.innerHTML = `
          <div>
            <div class="config-name">PID: ${p.pid} - ${p.command}</div>
            <div class="config-path">${p.projectPath}</div>
            <div class="config-path">Status: <span class="process-badge running">${p.status}</span></div>
          </div>
          <div class="config-actions">
            <button class="btn btn-sm btn-danger" onclick="killProcess(${p.pid})">⛔ Kill</button>
          </div>
        `;
        list.appendChild(item);
      });
      appendToTerminal(`Found ${result.processes.length} running processes`, 'stdout');
    } else {
      list.innerHTML = '<p class="hint">No running processes</p>';
    }
  } catch (err) {
    appendToTerminal(`Error: ${err.message}`, 'stderr');
  }
}

// Expose functions to window for onclick handlers
window.editConfigFile = function(filePath, currentPort) {
  console.log('Edit clicked:', filePath, currentPort);
  showToast(`Editing ${path.basename(filePath)}...`, 'info');
  editConfigFile(filePath, currentPort);
};

window.runNpmScript = function(scriptName, scriptCommand) {
  console.log('Run script clicked:', scriptName, scriptCommand);
  showToast(`🚀 Running: npm ${scriptName}`, 'info');
  runNpmScript(scriptName, scriptCommand);
};

window.killProcess = async (pid) => {
  if (!confirm(`Kill process ${pid}?`)) return;
  try {
    const result = await window.devPortAPI.killProcess(pid);
    if (result.success) {
      appendToTerminal(`✅ Process ${pid} killed`, 'stdout');
      showToast(`✅ Process ${pid} killed`, 'success');
      loadRunningProcesses();
    } else {
      appendToTerminal(`❌ ${result.error}`, 'stderr');
      showToast(`❌ ${result.error}`, 'error');
    }
  } catch (err) {
    appendToTerminal(`Error: ${err.message}`, 'stderr');
    showToast(`❌ ${err.message}`, 'error');
  }
};

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
