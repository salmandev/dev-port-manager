#!/usr/bin/env node
/**
 * Setup script for Dev Port Manager
 * Runs on install to initialize registry and validate environment
 */

const path = require('path');
const fs = require('fs').promises;
const Registry = require('./lib/registry');

async function setup() {
  const registryPath = path.join(process.env.HOME || process.env.USERPROFILE, '.dpm', 'registry.json');
  
  try {
    const registry = new Registry(registryPath);
    
    // Check if registry exists
    try {
      await fs.stat(registryPath);
      console.log('✓ Registry already initialized');
    } catch {
      // Initialize new registry
      await registry.initialize();
      console.log('✓ Registry initialized at:', registryPath);
    }

    // Test registry load
    await registry.load();
    console.log('✓ Registry validation passed');

  } catch (error) {
    console.error('⚠ Setup warning:', error.message);
    // Don't fail npm install
    process.exit(0);
  }
}

setup().catch(error => {
  console.error('Setup failed:', error);
  process.exit(0);
});
