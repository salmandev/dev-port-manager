/**
 * Dev Port Manager Web Dashboard Server
 * Express-based web server for viewing and managing projects
 * Usage: node server.js [port]
 */

const express = require('express');
const path = require('path');
const os = require('os');
const {
  getAllProjects,
  getProject,
  assignProject,
  removeProject,
  scanDirectory,
  detectProjectType,
  syncHosts,
  backupRegistry,
  listBackups,
  restoreRegistry,
  getLatestBackup,
  isPortAvailable,
  REGISTRY_FILE,
  REGISTRY_DIR
} = require('./lib/project');
const { getHostsFilePath } = require('./lib/host');
const { getRegistryPath } = require('./lib/registry');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Get all projects
 * GET /api/projects
 */
app.get('/api/projects', (req, res) => {
  try {
    const projects = getAllProjects();
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get single project
 * GET /api/projects/:name
 */
app.get('/api/projects/:name', (req, res) => {
  try {
    const project = getProject(req.params.name);
    if (project) {
      res.json({ success: true, project });
    } else {
      res.status(404).json({ success: false, error: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Assign a new project
 * POST /api/projects
 */
app.post('/api/projects', async (req, res) => {
  try {
    const { name, port, host, basePath } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Project name is required' });
    }
    
    const project = await assignProject(name, {
      port: port ? parseInt(port, 10) : undefined,
      host,
      basePath: basePath || process.cwd()
    });
    
    res.json({ success: true, project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Remove a project
 * DELETE /api/projects/:name
 */
app.delete('/api/projects/:name', async (req, res) => {
  try {
    const removed = await removeProject(req.params.name);
    if (removed) {
      res.json({ success: true, message: 'Project removed' });
    } else {
      res.status(404).json({ success: false, error: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Scan directory for projects
 * POST /api/scan
 */
app.post('/api/scan', async (req, res) => {
  try {
    const { baseDir, dryRun } = req.body;
    if (!baseDir) {
      return res.status(400).json({ success: false, error: 'Base directory is required' });
    }
    
    const result = await scanDirectory(baseDir, { dryRun: dryRun === true });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Sync hosts
 * POST /api/sync
 */
app.post('/api/sync', async (req, res) => {
  try {
    const { useHostsFile } = req.body;
    const result = await syncHosts({ useHostsFile: useHostsFile === true });
    res.json({ success: result.success, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Create backup
 * POST /api/backup
 */
app.post('/api/backup', async (req, res) => {
  try {
    const backupPath = await backupRegistry();
    res.json({ success: true, backupPath });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * List backups
 * GET /api/backups
 */
app.get('/api/backups', async (req, res) => {
  try {
    const backups = await listBackups();
    res.json({ success: true, backups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Restore from backup
 * POST /api/restore
 */
app.post('/api/restore', async (req, res) => {
  try {
    const { backupPath } = req.body;
    if (backupPath) {
      await restoreRegistry(backupPath);
    } else {
      const latest = await getLatestBackup();
      if (!latest) {
        return res.status(404).json({ success: false, error: 'No backups found' });
      }
      await restoreRegistry(latest.path);
    }
    res.json({ success: true, message: 'Registry restored' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get port status
 * GET /api/port/:port
 */
app.get('/api/port/:port', async (req, res) => {
  try {
    const port = parseInt(req.params.port, 10);
    const available = await isPortAvailable(port);
    res.json({ success: true, port, available });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get all ports status
 * GET /api/ports/status
 */
app.get('/api/ports/status', async (req, res) => {
  try {
    const projects = getAllProjects();
    const status = await Promise.all(
      projects.map(async p => ({
        name: p.name,
        port: p.port,
        available: await isPortAvailable(p.port)
      }))
    );
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Suggest port for project
 * GET /api/suggest-port?projectType=node&preferredPort=8080
 */
app.get('/api/suggest-port', async (req, res) => {
  try {
    const { projectType, preferredPort } = req.query;
    const portScanner = require('./lib/port-scanner');
    const result = await portScanner.suggestPort(projectType, preferredPort ? parseInt(preferredPort) : null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Update project port
 * POST /api/update-port
 */
app.post('/api/update-port', async (req, res) => {
  try {
    const { name, port, basePath, updateConfig } = req.body;
    const configEditor = require('./lib/config-editor');
    const { readRegistrySync, writeRegistrySync } = require('./lib/registry');
    
    // Update registry
    const registry = readRegistrySync();
    if (registry[name]) {
      registry[name].port = port;
      registry[name].url = `http://${registry[name].host}:${port}`;
      registry[name].localhostUrl = `http://localhost:${port}`;
      registry[name].updatedAt = new Date().toISOString();
      writeRegistrySync(registry);
      
      // Optionally update config files
      if (updateConfig && basePath) {
        await configEditor.updateConfigPort(basePath, port);
      }
      
      res.json({ success: true, message: 'Port updated' });
    } else {
      res.status(404).json({ success: false, error: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get system info
 * GET /api/system
 */
app.get('/api/system', (req, res) => {
  try {
    res.json({
      success: true,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        homedir: os.homedir(),
        registryFile: getRegistryPath(),
        registryDir: REGISTRY_DIR,
        hostsFile: getHostsFilePath()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Live status page
 * GET /status
 */
app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'status.html'));
});

// ============================================================================
// WEB ROUTES
// ============================================================================

/**
 * Dashboard home page
 * GET /
 */
app.get('/', (req, res) => {
  try {
    const projects = getAllProjects();
    res.render('index', { 
      projects,
      system: {
        platform: os.platform(),
        registryFile: getRegistryPath()
      }
    });
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

/**
 * Start server function for CLI integration
 */
function start(port = PORT) {
  app.listen(port, () => {
    console.log(`🚀 Dev Port Manager Dashboard running at http://localhost:${port}`);
  });
  return app;
}

// Start server if run directly
if (require.main === module) {
  const port = process.argv[2] ? parseInt(process.argv[2], 10) : PORT;
  start(port);
}

module.exports = { app, start };
