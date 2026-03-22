/**
 * Dev Port Manager Dashboard - Client-side JavaScript
 * Handles UI interactions and API calls
 */

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
    event.target.classList.remove('active');
  }
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
    throw err;
  }
}

async function refreshProjects() {
  try {
    const data = await apiCall('/api/projects');
    updateProjectsTable(data.projects);
    updateStats(data.projects);
    checkAllPortStatuses(data.projects);
    showToast('✅ Projects refreshed');
  } catch (err) {
    console.error('Failed to refresh:', err);
  }
}

async function checkAllPortStatuses(projects) {
  try {
    const response = await fetch('/api/ports/status');
    const data = await response.json();
    if (data.success) {
      data.status.forEach(status => {
        const badge = document.querySelector(`.status-badge[data-port="${status.port}"]`);
        if (badge) {
          if (status.available) {
            badge.textContent = '✅ Free';
            badge.className = 'status-badge status-free';
          } else {
            badge.textContent = '🔴 In Use';
            badge.className = 'status-badge status-used';
          }
        }
      });
    }
  } catch (err) {
    console.error('Failed to check port statuses:', err);
  }
}

async function assignProject(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  try {
    await apiCall('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    hideModal('assign-modal');
    form.reset();
    refreshProjects();
    showToast('✅ Project assigned successfully');
  } catch (err) {
    console.error('Failed to assign:', err);
  }
}

async function removeProject(name) {
  if (!confirm(`Are you sure you want to remove "${name}"?`)) return;
  
  try {
    await apiCall(`/api/projects/${name}`, { method: 'DELETE' });
    refreshProjects();
    showToast(`✅ Project "${name}" removed`);
  } catch (err) {
    console.error('Failed to remove:', err);
  }
}

async function scanDirectory(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  data.dryRun = document.getElementById('scan-dry-run').checked;
  
  const resultsDiv = document.getElementById('scan-results');
  resultsDiv.innerHTML = '<p>Scanning...</p>';
  
  try {
    const response = await apiCall('/api/scan', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    const { results, skipped, errors } = response.result;
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
      setTimeout(() => refreshProjects(), 1000);
    }
  } catch (err) {
    resultsDiv.innerHTML = `<p class="error">❌ ${err.message}</p>`;
  }
}

async function syncHosts() {
  try {
    const data = await apiCall('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ useHostsFile: false })
    });
    showToast('✅ ' + data.result.message);
  } catch (err) {
    console.error('Failed to sync:', err);
  }
}

async function createBackup() {
  try {
    const data = await apiCall('/api/backup', { method: 'POST' });
    showToast('✅ Backup created: ' + data.backupPath);
  } catch (err) {
    console.error('Failed to backup:', err);
  }
}

async function checkPort(port) {
  try {
    const response = await fetch(`/api/port/${port}`);
    const data = await response.json();
    if (data.available) {
      showToast(`✅ Port ${port} is available`);
    } else {
      showToast(`⚠️ Port ${port} is in use`, 'warning');
    }
  } catch (err) {
    showToast(`❌ Could not check port ${port}`, 'error');
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
// UI UPDATE FUNCTIONS
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
        <a href="${p.url}" target="_blank" class="url-link">
          🔗 ${p.url}
        </a>
      </td>
      <td><span class="os-badge os-${p.os}">${p.os}</span></td>
      <td><span class="status-badge" data-port="${p.port}">Checking...</span></td>
      <td class="actions">
        <button class="btn-icon" onclick="copyUrl('${p.url}')" title="Copy URL">📋</button>
        <button class="btn-icon" onclick="checkPort(${p.port})" title="Check Port">🔍</button>
        <button class="btn-icon btn-danger" onclick="removeProject('${p.name}')" title="Remove">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function updateStats(projects) {
  // Count project types
  const types = {};
  projects.forEach(p => {
    const type = p.projectType || 'other';
    types[type] = (types[type] || 0) + 1;
  });
  
  document.getElementById('project-types').textContent = Object.keys(types).length;
  
  // Count used ports
  const usedPorts = projects.map(p => p.port);
  const availablePorts = 1000 - usedPorts.length;
  document.getElementById('available-ports').textContent = availablePorts;
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

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ============================================================================
// THEME TOGGLE
// ============================================================================

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Set theme
  html.setAttribute('data-theme', newTheme);
  
  // Save to localStorage
  localStorage.setItem('dpm-theme', newTheme);
  
  // Show toast notification
  const icon = newTheme === 'light' ? '☀️' : '🌙';
  const themeName = newTheme === 'light' ? 'Light' : 'Dark';
  showToast(`${icon} ${themeName} mode enabled`, 'success');
}

/**
 * Load saved theme preference
 */
function loadThemePreference() {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('dpm-theme');
  
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else {
    // Default to dark theme
    html.setAttribute('data-theme', 'dark');
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Load theme preference
  loadThemePreference();
  
  // Initial stats update
  fetch('/api/projects')
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        updateStats(data.projects);
      }
    })
    .catch(console.error);
});
