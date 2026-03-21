#!/usr/bin/env node

/**
 * Fix All Projects - Capture basePath and detect actual ports
 * Usage: node scripts/fix-all-projects.js
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const REGISTRY_FILE = path.join(os.homedir(), '.dev-ports', 'registry.json');

async function fixAllProjects() {
  console.log('🔍 Fixing all projects...\n');
  
  // Read registry
  const registry = fs.readJsonSync(REGISTRY_FILE);
  let updated = 0;
  
  // Find all project directories
  const searchDirs = [
    path.join(os.homedir(), 'Projects'),
    path.join(os.homedir(), 'projects'),
    path.join(os.homedir(), 'dev'),
    path.join(os.homedir(), 'src'),
    'd:\\Dev\\GitHub'
  ];
  
  for (const searchDir of searchDirs) {
    if (!fs.existsSync(searchDir)) continue;
    
    const folders = fs.readdirSync(searchDir);
    
    for (const folder of folders) {
      const projectPath = path.join(searchDir, folder);
      const stats = fs.statSync(projectPath);
      
      if (!stats.isDirectory()) continue;
      
      // Check if has .project-dev.json
      const projectDevFile = path.join(projectPath, '.project-dev.json');
      if (!fs.existsSync(projectDevFile)) continue;
      
      try {
        const projectConfig = fs.readJsonSync(projectDevFile);
        const projectName = projectConfig.name || folder;
        
        // Check if in registry
        if (!registry[projectName]) continue;
        
        // Update basePath if missing
        if (!registry[projectName].basePath || registry[projectName].basePath === 'N/A') {
          registry[projectName].basePath = projectPath;
          console.log(`✅ ${projectName}: basePath = ${projectPath}`);
          updated++;
        }
        
        // Detect actual port from config files
        const actualPort = await detectActualPort(projectPath);
        if (actualPort && actualPort !== registry[projectName].port) {
          console.log(`  📍 ${projectName}: port ${registry[projectName].port} → ${actualPort} (actual)`);
          registry[projectName].port = actualPort;
          registry[projectName].url = `http://${registry[projectName].host}:${actualPort}`;
          updated++;
        }
        
      } catch (err) {
        console.error(`❌ Error processing ${folder}: ${err.message}`);
      }
    }
  }
  
  // Save updated registry
  fs.writeJsonSync(REGISTRY_FILE, registry, { spaces: 2 });
  
  console.log(`\n✅ Fixed ${updated} project(s)!`);
}

async function detectActualPort(projectPath) {
  // Check .env
  const envFile = path.join(projectPath, '.env');
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    const match = content.match(/PORT=(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  
  // Check package.json
  const pkgFile = path.join(projectPath, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkg = fs.readJsonSync(pkgFile);
    if (pkg.devPort) return pkg.devPort;
    if (pkg.port) return pkg.port;
  }
  
  // Check vite.config.js/ts
  const viteConfigs = ['vite.config.js', 'vite.config.ts'];
  for (const config of viteConfigs) {
    const configPath = path.join(projectPath, config);
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      const match = content.match(/port:\s*(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
  }
  
  return null;
}

// Run
fixAllProjects().catch(console.error);
