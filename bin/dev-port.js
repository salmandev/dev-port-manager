#!/usr/bin/env node

/**
 * Dev Port Manager CLI - Main Entry Point
 * Cross-platform CLI for managing development ports and projects
 * Usage: dev-port <command> [options]
 */

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

// Import core modules
const {
  assignProject,
  listProjects,
  getAllProjects,
  removeProject,
  getProject,
  syncHosts,
  exportRegistry,
  importRegistry,
  backupRegistry,
  restoreRegistry,
  listBackups,
  getLatestBackup,
  scanDirectory,
  scanDirectoryRecursive,
  isPortAvailable,
  detectProjectType,
  generateDockerEnv,
  generateDockerCompose,
  getPortRange,
  REGISTRY_DIR,
  REGISTRY_FILE
} = require('../lib/project');

const dockerUtils = require('../lib/docker');
const portScanner = require('../lib/port-scanner');
const configEditor = require('../lib/config-editor');
const npmExecutor = require('../lib/npm-executor');

const { getRegistryPath, reinit } = require('../lib/registry');
const { getHostsFilePath, isElevated, getElevationWarning } = require('../lib/host');
const settings = require('../lib/settings');

// Handle --registry global option before parsing
const registryIndex = process.argv.findIndex(arg => arg === '--registry');
let registryPath = null;
if (registryIndex !== -1 && process.argv[registryIndex + 1]) {
  registryPath = process.argv[registryIndex + 1];
}

// Initialize registry with CLI flag override if provided
if (registryPath) {
  reinit({ cliFlag: registryPath });
}

// CLI metadata
program
  .name('dev-port')
  .description('Dev Port Manager - Cross-platform CLI for managing development ports and projects')
  .version('1.0.0')
  .option('--registry <path>', 'Custom registry file path (overrides settings)')
  .option('-v, --verbose', 'Verbose output');

// ============================================================================
// PROJECT MANAGEMENT COMMANDS
// ============================================================================

/**
 * Assign a port and host to a project
 */
program
  .command('assign <project>')
  .description('Assign a port and host to a project')
  .option('-p, --port <number>', 'Specify a specific port')
  .option('-h, --host <host>', 'Specify a custom host')
  .option('--no-check-port', 'Skip port availability check')
  .option('--docker', 'Generate Docker .env file')
  .action(async (project, options) => {
    try {
      const port = options.port ? parseInt(options.port, 10) : undefined;
      const info = await assignProject(project, { 
        port, 
        host: options.host,
        checkPort: options.checkPort !== false,
        generateDocker: options.docker
      });
      
      console.log(chalk.green('✅ Project assigned:\n'));
      console.log(`   ${chalk.bold('Name:')}        ${chalk.cyan(info.name)}`);
      console.log(`   ${chalk.bold('Host:')}        ${chalk.cyan(info.host)}`);
      console.log(`   ${chalk.bold('Port:')}        ${chalk.yellow(info.port)}`);
      console.log(`   ${chalk.bold('URL:')}         ${chalk.green(info.url)}`);
      console.log(`   ${chalk.bold('Type:')}        ${chalk.dim(`[${info.projectType}]`)}`);
      console.log(`   ${chalk.bold('OS:')}          ${chalk.dim(info.os)}`);
      console.log(`\n   ${chalk.dim('Config:')} ${chalk.underline(path.join(process.cwd(), '.project-dev.json'))}`);
      
      if (options.docker) {
        console.log(`   ${chalk.dim('Docker:')} ${chalk.underline(path.join(process.cwd(), '.env'))}`);
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Remove a project from the registry
 */
program
  .command('remove <project>')
  .description('Remove a project from the registry')
  .alias('rm')
  .action(async (project) => {
    try {
      const removed = await removeProject(project);
      if (removed) {
        console.log(chalk.green(`✅ Project '${chalk.cyan(project)}' removed successfully`));
      } else {
        console.log(chalk.yellow(`⚠️  Project '${chalk.cyan(project)}' not found`));
        process.exit(1);
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Get info about a specific project
 */
program
  .command('info <project>')
  .description('Get detailed info about a specific project')
  .action(async (project) => {
    try {
      const info = getProject(project);
      if (info) {
        console.log(chalk.green(`\n📁 Project: ${chalk.cyan(project)}\n`));
        console.log(`   ${chalk.bold('Host:')}      ${chalk.cyan(info.host)}`);
        console.log(`   ${chalk.bold('Port:')}      ${chalk.yellow(info.port)}`);
        console.log(`   ${chalk.bold('URL:')}       ${chalk.green(info.url)}`);
        console.log(`   ${chalk.bold('Type:')}      ${chalk.dim(`[${info.projectType}]`)}`);
        console.log(`   ${chalk.bold('OS:')}        ${chalk.dim(info.os)}`);
        console.log(`   ${chalk.bold('Assigned:')}  ${chalk.dim(info.assignedAt)}`);
        console.log();
      } else {
        console.log(chalk.yellow(`⚠️  Project '${chalk.cyan(project)}' not found`));
        process.exit(1);
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// LISTING COMMANDS
// ============================================================================

/**
 * List all registered projects
 */
program
  .command('list')
  .description('List all registered projects')
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    try {
      const projects = getAllProjects();
      
      if (projects.length === 0) {
        console.log(chalk.yellow('No projects registered yet. Use "dev-port assign" or "dev-port scan".'));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(projects, null, 2));
        return;
      }

      console.log(chalk.green('\n📋 Registered Projects:\n'));
      console.log(chalk.bold('PROJECT'.padEnd(25) + 'TYPE'.padEnd(12) + 'PORT'.padEnd(10) + 'HOST'.padEnd(30) + 'URL'));
      console.log('─'.repeat(100));
      
      for (const p of projects) {
        const typeBadge = chalk.dim(`[${p.projectType || 'unknown'}]`.padEnd(12));
        console.log(
          chalk.cyan(p.name.padEnd(25)) +
          typeBadge +
          chalk.yellow(String(p.port).padEnd(10)) +
          chalk.white(p.host.padEnd(30)) +
          chalk.green(p.url)
        );
      }
      console.log(`\n${chalk.dim(`Total: ${projects.length} project(s)`)}`);
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// SCAN COMMANDS
// ============================================================================

/**
 * Scan a directory for projects
 */
program
  .command('scan <baseDir>')
  .description('Scan a directory and auto-assign ports to projects')
  .option('-n, --dry-run', 'Show what would be done without making changes')
  .option('--docker', 'Generate Docker .env files')
  .action(async (baseDir, options) => {
    try {
      const resolvedPath = path.resolve(baseDir);
      
      if (!await fs.pathExists(resolvedPath)) {
        throw new Error(`Directory not found: ${resolvedPath}`);
      }

      console.log(chalk.dim(`Scanning: ${resolvedPath}\n`));
      
      const { results, skipped, errors } = await scanDirectory(resolvedPath, { 
        dryRun: options.dryRun,
        generateDocker: options.docker
      });
      
      if (options.dryRun) {
        console.log(chalk.yellow('🔍 DRY RUN - No changes made\n'));
      } else {
        console.log(chalk.green('✅ Scan complete\n'));
      }

      if (results.length > 0) {
        console.log(chalk.green(`📋 Projects ${options.dryRun ? 'to be' : ''} assigned (${results.length}):`));
        console.log('─'.repeat(90));
        results.forEach(r => {
          const typeBadge = r.type ? chalk.dim(`[${r.type}]`.padEnd(10)) : '';
          if (r.url) {
            console.log(`   ${typeBadge} ${chalk.cyan(r.name.padEnd(25))} Port: ${chalk.yellow(r.port)}  ${chalk.green(r.url)}`);
          } else {
            console.log(`   ${typeBadge} ${chalk.cyan(r.name.padEnd(25))} ${chalk.dim(r.status)}`);
          }
        });
        console.log();
      }

      if (skipped.length > 0) {
        console.log(chalk.dim(`⊘ Skipped (${skipped.length}):`));
        skipped.forEach(s => {
          console.log(`   ${chalk.gray(s.name.padEnd(30))} - ${chalk.gray(s.reason)}`);
        });
        console.log();
      }

      if (errors.length > 0) {
        console.log(chalk.red(`❌ Errors (${errors.length}):`));
        errors.forEach(e => {
          console.log(`   ${chalk.red(e.name.padEnd(30))} - ${chalk.red(e.error)}`);
        });
        console.log();
      }

      if (results.length === 0 && skipped.length === 0 && errors.length === 0) {
        console.log(chalk.yellow('No projects found. Add .project-marker or ensure project files exist (package.json, pom.xml, etc.)'));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Find projects recursively
 */
program
  .command('find <baseDir>')
  .description('Find all projects recursively (by project type detection)')
  .alias('search')
  .option('-j, --json', 'Output as JSON')
  .action(async (baseDir, options) => {
    try {
      const resolvedPath = path.resolve(baseDir);
      
      if (!await fs.pathExists(resolvedPath)) {
        throw new Error(`Directory not found: ${resolvedPath}`);
      }

      const projects = await scanDirectoryRecursive(resolvedPath);
      
      if (projects.length === 0) {
        console.log(chalk.yellow('No projects found.'));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(projects, null, 2));
        return;
      }

      console.log(chalk.green(`\n🔍 Found ${projects.length} projects:\n`));
      projects.forEach((p, i) => {
        const typeBadge = chalk.dim(`[${p.type}]`.padEnd(10));
        console.log(`${chalk.cyan(String(i + 1).padEnd(3))} ${typeBadge} ${p.path}`);
      });
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// SYNC COMMANDS
// ============================================================================

/**
 * Sync hosts file
 */
program
  .command('sync')
  .description('Sync registry to hosts file (optional with localtest.me)')
  .option('--hosts-file', 'Edit hosts file instead of using localtest.me')
  .action(async (options) => {
    try {
      const result = await syncHosts({ useHostsFile: options.hostsFile });
      if (result.success) {
        console.log(chalk.green(`✅ ${result.message}`));
        if (result.hostsFile) {
          console.log(chalk.dim(`   Hosts file: ${result.hostsFile}`));
        }
      } else {
        console.log(chalk.yellow(`⚠️  ${result.message}`));
        if (result.hostsFile) {
          console.log(chalk.dim(`   Hosts file: ${result.hostsFile}`));
          console.log(chalk.dim(`   ${getElevationWarning()}`));
        }
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// DOCKER COMMANDS
// ============================================================================

/**
 * Generate Docker files for a project
 */
program
  .command('docker <project>')
  .description('Generate Docker .env and docker-compose.yml for a project')
  .option('--compose', 'Also generate docker-compose.yml')
  .action(async (project, options) => {
    try {
      const info = getProject(project);
      if (!info) {
        console.log(chalk.yellow(`⚠️  Project '${chalk.cyan(project)}' not found`));
        process.exit(1);
        return;
      }

      const envPath = await dockerUtils.generateDockerEnv(info.basePath || process.cwd(), info);
      console.log(chalk.green('✅ Docker .env generated:'));
      console.log(`   ${chalk.cyan(envPath)}`);

      if (options.compose) {
        const composePath = await dockerUtils.generateDockerComposeOverride(info.basePath || process.cwd(), info);
        console.log(chalk.green('✅ Docker Compose override generated:'));
        console.log(`   ${chalk.cyan(composePath)}`);
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Start Docker services
 */
program
  .command('docker-start [project]')
  .description('Start Docker Compose services')
  .alias('ds')
  .action(async (project) => {
    try {
      if (!project) {
        // Start all projects with Docker
        const projects = getAllProjects();
        for (const p of projects) {
          if (p.basePath) {
            const hasDocker = await dockerUtils.hasDockerFiles(p.basePath);
            if (hasDocker.hasDockerCompose) {
              console.log(chalk.dim(`Starting ${p.name}...`));
              const result = await dockerUtils.startDockerServices(p.basePath);
              if (result.success) {
                console.log(chalk.green(`✅ ${p.name} started`));
              } else {
                console.log(chalk.red(`❌ ${p.name}: ${result.error}`));
              }
            }
          }
        }
      } else {
        const info = getProject(project);
        if (!info || !info.basePath) {
          console.log(chalk.yellow(`⚠️  Project '${chalk.cyan(project)}' not found`));
          process.exit(1);
        }
        const result = await dockerUtils.startDockerServices(info.basePath);
        if (result.success) {
          console.log(chalk.green('✅ Docker services started'));
        } else {
          console.log(chalk.red(`❌ ${result.error}`));
          process.exit(1);
        }
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Stop Docker services
 */
program
  .command('docker-stop [project]')
  .description('Stop Docker Compose services')
  .alias('dstop')
  .action(async (project) => {
    try {
      if (!project) {
        const projects = getAllProjects();
        for (const p of projects) {
          if (p.basePath) {
            const hasDocker = await dockerUtils.hasDockerFiles(p.basePath);
            if (hasDocker.hasDockerCompose) {
              console.log(chalk.dim(`Stopping ${p.name}...`));
              await dockerUtils.stopDockerServices(p.basePath);
              console.log(chalk.green(`✅ ${p.name} stopped`));
            }
          }
        }
      } else {
        const info = getProject(project);
        if (!info || !info.basePath) {
          console.log(chalk.yellow(`⚠️  Project '${chalk.cyan(project)}' not found`));
          process.exit(1);
        }
        await dockerUtils.stopDockerServices(info.basePath);
        console.log(chalk.green('✅ Docker services stopped'));
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Check Docker availability
 */
program
  .command('docker-check')
  .description('Check Docker and Docker Compose availability')
  .alias('dc')
  .action(async () => {
    try {
      const dockerAvailable = await dockerUtils.isDockerAvailable();
      const composeAvailable = await dockerUtils.isDockerComposeAvailable();
      
      console.log(chalk.green('\n🐳 Docker Status:\n'));
      console.log(`   ${dockerAvailable ? '✅' : '❌'} Docker: ${dockerAvailable ? 'Available' : 'Not found'}`);
      console.log(`   ${composeAvailable ? '✅' : '❌'} Docker Compose: ${composeAvailable ? 'Available' : 'Not found'}`);
      
      if (!dockerAvailable) {
        console.log(chalk.yellow('\n⚠️  Install Docker: https://docs.docker.com/get-docker/'));
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// BACKUP/RESTORE COMMANDS
// ============================================================================

/**
 * Show registry location
 */
program
  .command('registry')
  .description('Show registry file location')
  .action(() => {
    const effectivePath = getRegistryPath();
    const loadedSettings = settings.loadSettingsSync();
    
    console.log(chalk.green('📁 Registry Configuration:\n'));
    
    // Show priority/override info
    if (registryPath) {
      console.log(chalk.yellow('   ⚡ CLI override: --registry'));
    } else if (process.env.DEVPORT_REGISTRY) {
      console.log(chalk.yellow('   ⚡ Environment override: DEVPORT_REGISTRY'));
    }
    
    console.log(`   ${chalk.bold('Effective registry:')} ${chalk.cyan(effectivePath)}`);
    console.log(`   ${chalk.bold('Settings file:')} ${chalk.cyan(settings.getSettingsPath())}`);
    console.log(`   ${chalk.bold('Configured path:')} ${chalk.cyan(loadedSettings.registryPath)}`);
    
    console.log(chalk.green('\n📁 Hosts file:'));
    console.log(`   ${chalk.cyan(getHostsFilePath())}`);
    console.log(chalk.green('\n🖥️  Current OS:'));
    console.log(`   ${chalk.cyan(os.platform())} ${chalk.dim(`(${os.arch()})`)}`);
    console.log(chalk.green('\n👤 User:'));
    console.log(`   ${chalk.cyan(os.userInfo().username)}`);
    console.log();
  });

/**
 * Export registry
 */
program
  .command('export [output]')
  .description('Export registry to a file')
  .alias('exp')
  .action(async (output) => {
    try {
      const outputPath = output || path.join(process.cwd(), 'registry-export.json');
      await exportRegistry(outputPath);
      console.log(chalk.green(`✅ Registry exported to:`));
      console.log(`   ${chalk.cyan(outputPath)}`);
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Import registry
 */
program
  .command('import <input>')
  .description('Import registry from a file')
  .alias('imp')
  .option('-m, --merge', 'Merge with existing registry instead of replacing')
  .action(async (input, options) => {
    try {
      const inputPath = path.resolve(input);
      if (!fs.existsSync(inputPath)) {
        throw new Error(`File not found: ${inputPath}`);
      }
      const data = await importRegistry(inputPath, options.merge);
      const count = Object.keys(data).length;
      console.log(chalk.green(`✅ Registry imported (${count} projects)`));
      console.log(`   ${chalk.cyan(inputPath)}`);
      if (options.merge) {
        console.log(chalk.dim('   Merged with existing registry'));
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Create backup
 */
program
  .command('backup')
  .description('Create a timestamped backup of the registry')
  .action(async () => {
    try {
      const backupPath = await backupRegistry();
      console.log(chalk.green('✅ Registry backup created:'));
      console.log(`   ${chalk.cyan(backupPath)}`);
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Restore from backup
 */
program
  .command('restore')
  .description('Restore registry from latest backup')
  .action(async () => {
    try {
      const latestBackup = await getLatestBackup();
      if (!latestBackup) {
        console.log(chalk.yellow('⚠️  No backups found'));
        return;
      }
      await restoreRegistry(latestBackup.path);
      console.log(chalk.green('✅ Registry restored from:'));
      console.log(`   ${chalk.cyan(latestBackup.path)}`);
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * List backups
 */
program
  .command('backups')
  .description('List all registry backups')
  .action(async () => {
    try {
      const backups = await listBackups();
      
      if (backups.length === 0) {
        console.log(chalk.yellow('No backups found'));
        return;
      }
      
      console.log(chalk.green('\n📦 Registry Backups:\n'));
      backups.forEach((b, i) => {
        console.log(`   ${chalk.cyan(String(i + 1).padEnd(3))} ${b.filename}`);
        console.log(`       ${chalk.dim(b.path)}`);
      });
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// UTILITY COMMANDS
// ============================================================================

/**
 * Check if a port is available
 */
program
  .command('check <port>')
  .description('Check if a port is available')
  .action(async (port) => {
    try {
      const portNum = parseInt(port, 10);
      if (isNaN(portNum)) {
        throw new Error('Invalid port number');
      }
      
      const available = await isPortAvailable(portNum);
      if (available) {
        console.log(chalk.green(`✅ Port ${portNum} is available`));
      } else {
        console.log(chalk.red(`❌ Port ${portNum} is in use`));
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Detect project type
 */
program
  .command('detect [path]')
  .description('Detect project type in a directory')
  .action((projPath) => {
    try {
      const targetPath = projPath ? path.resolve(projPath) : process.cwd();
      const type = detectProjectType(targetPath);
      console.log(chalk.green('\n📁 Project Detection:\n'));
      console.log(`   ${chalk.bold('Path:')} ${chalk.cyan(targetPath)}`);
      console.log(`   ${chalk.bold('Type:')} ${chalk.dim(`[${type}]`)}`);
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// SETTINGS COMMANDS
// ============================================================================

/**
 * Show settings
 */
program
  .command('settings')
  .description('Show current settings')
  .alias('config')
  .action(async () => {
    try {
      const loadedSettings = await settings.loadSettings();
      const validation = settings.validateSettings(loadedSettings);
      
      console.log(chalk.green('\n⚙️  Dev Port Manager Settings:\n'));
      console.log(`   ${chalk.bold('Settings file:')} ${chalk.cyan(settings.getSettingsPath())}`);
      console.log(`   ${chalk.bold('Registry path:')} ${chalk.cyan(loadedSettings.registryPath)}`);
      console.log(`   ${chalk.bold('Port range:')} ${chalk.yellow(loadedSettings.portRange[0])}-${chalk.yellow(loadedSettings.portRange[1])}`);
      console.log(`   ${chalk.bold('Use localtest.me:')} ${loadedSettings.useLocaltestMe ? chalk.green('Yes') : chalk.yellow('No')}`);
      console.log(`   ${chalk.bold('Auto backup:')} ${loadedSettings.autoBackup ? chalk.green('Yes') : chalk.yellow('No')}`);
      console.log(`   ${chalk.bold('Backup count:')} ${loadedSettings.backupCount}`);
      console.log(`   ${chalk.bold('Theme:')} ${loadedSettings.theme}`);
      console.log(`   ${chalk.bold('Language:')} ${loadedSettings.language}`);
      
      if (loadedSettings.baseScanDirs && loadedSettings.baseScanDirs.length > 0) {
        console.log(`\n   ${chalk.bold('Base scan directories:')}`);
        loadedSettings.baseScanDirs.forEach(dir => console.log(`     - ${chalk.cyan(dir)}`));
      }
      
      if (!validation.valid) {
        console.log(chalk.red('\n⚠️  Validation errors:'));
        validation.errors.forEach(err => console.log(`   - ${err}`));
      }
      
      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        validation.warnings.forEach(warn => console.log(`   - ${warn}`));
      }
      
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Set a setting
 */
program
  .command('set <key> <value>')
  .description('Set a setting value')
  .action(async (key, value) => {
    try {
      // Parse value based on type
      let parsedValue;
      if (value.toLowerCase() === 'true') {
        parsedValue = true;
      } else if (value.toLowerCase() === 'false') {
        parsedValue = false;
      } else if (/^\d+$/.test(value)) {
        parsedValue = parseInt(value, 10);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Array value like [9000,9999]
        parsedValue = JSON.parse(value);
      } else {
        parsedValue = value;
      }
      
      await settings.setSetting(key, parsedValue);
      console.log(chalk.green(`✅ Setting '${chalk.cyan(key)}' set to: ${chalk.yellow(parsedValue)}`));
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Reset settings to defaults
 */
program
  .command('settings-reset')
  .description('Reset settings to defaults')
  .action(async () => {
    try {
      await settings.resetSettings();
      console.log(chalk.green('✅ Settings reset to defaults'));
      console.log(`   Settings file: ${chalk.cyan(settings.getSettingsPath())}`);
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Export settings
 */
program
  .command('settings-export [output]')
  .description('Export settings to a file')
  .action(async (output) => {
    try {
      const outputPath = output || path.join(process.cwd(), 'dev-port-settings.json');
      await settings.exportSettings(outputPath);
      console.log(chalk.green(`✅ Settings exported to:`));
      console.log(`   ${chalk.cyan(outputPath)}`);
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Import settings
 */
program
  .command('settings-import <input>')
  .description('Import settings from a file')
  .action(async (input) => {
    try {
      const inputPath = path.resolve(input);
      if (!fs.existsSync(inputPath)) {
        throw new Error(`File not found: ${inputPath}`);
      }
      const imported = await settings.importSettings(inputPath);
      console.log(chalk.green('✅ Settings imported:'));
      console.log(`   ${chalk.cyan(inputPath)}`);
      console.log(`   Registry path: ${chalk.cyan(imported.registryPath)}`);
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// START WEB DASHBOARD
// ============================================================================

/**
 * Start web dashboard
 */
program
  .command('dashboard [port]')
  .description('Start the web dashboard')
  .alias('web')
  .alias('ui')
  .action((port) => {
    const dashboardPort = port ? parseInt(port, 10) : 4000;
    console.log(chalk.green('🚀 Starting web dashboard...'));
    console.log(chalk.dim(`   Port: ${dashboardPort}`));
    console.log(chalk.dim(`   URL: http://localhost:${dashboardPort}`));
    console.log(chalk.dim('\n   Press Ctrl+C to stop\n'));

    // Start the server
    const server = require('../server');
    server.start(dashboardPort);
  });

// ============================================================================
// PORT MANAGEMENT COMMANDS
// ============================================================================

/**
 * Kill process on port
 */
program
  .command('kill <port>')
  .description('Kill process running on a port')
  .alias('kill-port')
  .action(async (port) => {
    try {
      const portNum = parseInt(port, 10);
      if (isNaN(portNum)) {
        throw new Error('Invalid port number');
      }
      
      const result = await portScanner.killProcessOnPort(portNum);
      
      if (result.success) {
        console.log(chalk.green(`✅ ${result.message}`));
      } else {
        console.log(chalk.yellow(`⚠️  ${result.error}`));
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Suggest port for project
 */
program
  .command('suggest [projectType]')
  .description('Suggest an available port for a project')
  .alias('suggest-port')
  .option('-p, --port <port>', 'Preferred port')
  .action(async (projectType, options) => {
    try {
      const preferredPort = options.port ? parseInt(options.port, 10) : null;
      const result = await portScanner.suggestPort(projectType, preferredPort);
      
      if (result.success) {
        console.log(chalk.green('\n💡 Port Suggestion:\n'));
        console.log(`   ${chalk.bold('Suggested Port:')} ${chalk.yellow(result.port)}`);
        console.log(`   ${chalk.bold('Reason:')} ${result.reason}`);
        
        if (result.alternatives && result.alternatives.length > 0) {
          console.log(`\n   ${chalk.bold('Alternatives:')} ${result.alternatives.join(', ')}`);
        }
        console.log();
      } else {
        console.log(chalk.red(`\n❌ ${result.error}\n`));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// PORT SYNC COMMANDS
// ============================================================================

/**
 * Sync actual ports from config files
 */
program
  .command('sync-ports')
  .description('Sync registry with actual running ports from config files')
  .alias('sync')
  .action(async () => {
    try {
      console.log(chalk.blue('\n🔍 Scanning projects for actual ports from config files...\n'));
      
      const { getAllProjects } = require('../lib/project');
      const { readRegistrySync, writeRegistrySync } = require('../lib/registry');
      
      const registry = readRegistrySync();
      const projects = getAllProjects();
      let updated = 0;
      let checked = 0;
      
      for (const project of projects) {
        if (!project.basePath || project.basePath === 'N/A') continue;
        
        checked++;
        // Detect actual port from config files
        const configFiles = await configEditor.findConfigFiles(project.basePath);
        for (const file of configFiles) {
          if (file.hasPort && file.port && file.port !== project.port) {
            console.log(`📍 ${project.name}: ${project.port} → ${file.port} (${file.name})`);
            registry[project.name].port = file.port;
            registry[project.name].url = `http://${project.host}:${file.port}`;
            // Also update localhostUrl
            registry[project.name].localhostUrl = `http://localhost:${file.port}`;
            updated++;
            break;
          }
        }
      }
      
      if (updated > 0) {
        writeRegistrySync(registry);
        console.log(chalk.green(`\n✅ Synced ${updated} project(s) out of ${checked} checked!\n`));
        console.log(chalk.yellow('\n💡 Tip: Run "dev-port status" to see what\'s actually running\n'));
      } else {
        console.log(chalk.yellow(`\n⚠️  All ${checked} projects are in sync\n`));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}\n`));
      process.exit(1);
    }
  });

/**
 * Check running status of all projects
 */
program
  .command('status')
  .description('Check which projects are actually running and on what ports')
  .action(async () => {
    try {
      console.log(chalk.blue('\n📊 Checking actual running status...\n'));
      
      const { getAllProjects } = require('../lib/project');
      const projects = getAllProjects();
      
      console.log(chalk.bold('PROJECT'.padEnd(30) + 'REGISTERED'.padEnd(15) + 'RUNNING'.padEnd(15) + 'STATUS'));
      console.log('─'.repeat(80));
      
      for (const project of projects) {
        if (!project.basePath || project.basePath === 'N/A') {
          console.log(chalk.cyan(project.name.padEnd(30)) + chalk.yellow(String(project.port).padEnd(15)) + chalk.gray('N/A'.padEnd(15)) + '⚠️  No path');
          continue;
        }
        
        const portStatus = await portScanner.scanProjectPort(project.basePath, project.port);
        
        const registeredStr = String(project.port);
        const runningStr = portStatus.runningPort ? String(portStatus.runningPort) : 'Not running';
        const statusIcon = portStatus.runningPort ? '🟢 Running' : (portStatus.configPort ? '🔴 Stopped' : '❓ Unknown');
        
        console.log(
          chalk.cyan(project.name.padEnd(30)) +
          chalk.yellow(registeredStr.padEnd(15)) +
          (portStatus.runningPort ? chalk.green(runningStr.padEnd(15)) : chalk.gray(runningStr.padEnd(15))) +
          (portStatus.runningPort ? chalk.green(statusIcon) : chalk.yellow(statusIcon))
        );
        
        if (portStatus.processName) {
          console.log(chalk.dim(`   └─ Process: ${portStatus.processName} (PID: ${portStatus.pid})`));
        }
        if (portStatus.configPort && portStatus.configPort !== portStatus.runningPort) {
          console.log(chalk.dim(`   └─ Config: ${portStatus.configPort} (${portStatus.configSource})`));
        }
      }
      
      console.log();
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// CONFIG EDITING COMMANDS
// ============================================================================

/**
 * List config files for a project
 */
program
  .command('config-list [projectPath]')
  .description('List config files for a project')
  .alias('configs')
  .action(async (projectPath) => {
    try {
      const targetPath = projectPath ? path.resolve(projectPath) : process.cwd();
      const files = await configEditor.findConfigFiles(targetPath);
      
      console.log(chalk.green('\n📁 Config Files:\n'));
      if (files.length === 0) {
        console.log(chalk.yellow('   No config files found\n'));
      } else {
        files.forEach(f => {
          const portInfo = f.hasPort ? chalk.yellow(` (port: ${f.port})`) : '';
          console.log(`   ${chalk.cyan(f.name)}${portInfo}`);
          console.log(`      ${chalk.dim(f.path)}`);
        });
        console.log();
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Edit config file port
 */
program
  .command('config-edit <file> <port>')
  .description('Edit port in config file (auto-backups)')
  .alias('edit-config')
  .action(async (file, port) => {
    try {
      const filePath = path.resolve(file);
      const portNum = parseInt(port, 10);
      
      if (isNaN(portNum)) {
        throw new Error('Invalid port number');
      }
      
      const result = await configEditor.updateConfigPort(filePath, portNum);
      
      if (result.success) {
        console.log(chalk.green(`\n✅ ${result.message}`));
        if (result.backup) {
          console.log(chalk.dim(`   Backup: ${result.backup}\n`));
        }
      } else {
        console.log(chalk.yellow(`\n⚠️  ${result.error}\n`));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * List config backups
 */
program
  .command('config-backups')
  .description('List config file backups')
  .alias('config-restore')
  .action(async () => {
    try {
      const backups = await configEditor.listConfigBackups();
      
      console.log(chalk.green('\n💾 Config Backups:\n'));
      if (backups.length === 0) {
        console.log(chalk.yellow('   No backups found\n'));
      } else {
        backups.forEach((b, i) => {
          console.log(`   ${chalk.cyan(String(i + 1).padEnd(3))} ${b.filename}`);
          console.log(`       ${chalk.dim(b.path)}`);
          console.log(`       ${chalk.gray(new Date(b.timestamp).toLocaleString())}`);
        });
        console.log();
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// NPM COMMANDS
// ============================================================================

/**
 * Run npm command
 */
program
  .command('npm-run [projectPath] [command...]')
  .description('Run npm command in project')
  .alias('npm')
  .option('-w, --watch', 'Watch output')
  .action(async (projectPath, command, options) => {
    try {
      const targetPath = projectPath ? path.resolve(projectPath) : process.cwd();
      const cmd = command.join(' ') || 'run dev';
      
      console.log(chalk.green(`\n🚀 Running: npm ${cmd}`));
      console.log(chalk.dim(`   in ${targetPath}\n`));
      
      const result = await npmExecutor.runNpmCommand(targetPath, `npm ${cmd}`);
      
      if (result.success) {
        console.log(chalk.green('\n✅ Command completed successfully\n'));
      } else {
        console.log(chalk.yellow(`\n⚠️  Command exited with code ${result.exitCode}\n`));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * List npm scripts
 */
program
  .command('npm-scripts [projectPath]')
  .description('List available npm scripts')
  .alias('scripts')
  .action(async (projectPath) => {
    try {
      const targetPath = projectPath ? path.resolve(projectPath) : process.cwd();
      const scripts = await npmExecutor.detectNpmScripts(targetPath);

      console.log(chalk.green('\n📜 Available NPM Scripts:\n'));
      if (scripts.length === 0) {
        console.log(chalk.yellow('   No scripts found (no package.json)\n'));
      } else {
        scripts.forEach(s => {
          const badge = s.isCommon ? chalk.green('[COMMON] ') : '';
          console.log(`   ${chalk.cyan(s.name.padEnd(15))} ${badge}${chalk.dim(s.command)}`);
        });
        console.log();
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Start a project (npm start or npm run dev)
 */
program
  .command('start [project]')
  .description('Start a project (auto-detects start/dev script)')
  .option('-p, --port <port>', 'Port to check for existing process')
  .action(async (project, options) => {
    try {
      const { getProject, getAllProjects } = require('../lib/project');
      
      let targetPath;
      let projectName;

      // Find project
      if (project) {
        const proj = getProject(project);
        if (!proj) {
          throw new Error(`Project '${project}' not found in registry`);
        }
        targetPath = proj.basePath;
        projectName = proj.name;
      } else {
        targetPath = process.cwd();
        // Try to find project in current directory
        const allProjects = getAllProjects();
        const currentProj = allProjects.find(p => p.basePath === targetPath);
        projectName = currentProj ? currentProj.name : path.basename(targetPath);
      }

      // Check if something is already running on the port
      if (!options.port) {
        const proj = getProject(project) || getAllProjects().find(p => p.basePath === targetPath);
        if (proj && proj.port) {
          options.port = proj.port;
        }
      }

      if (options.port) {
        const port = parseInt(options.port, 10);
        const inUse = await portScanner.isPortInUse(port);
        if (inUse) {
          const pid = await portScanner.getProcessOnPort(port);
          const processName = await portScanner.getProcessName(pid);
          console.log(chalk.yellow(`⚠️  Port ${port} is already in use`));
          console.log(chalk.dim(`   Process: ${processName || 'unknown'} (PID: ${pid})`));
          console.log(chalk.dim(`   Stop it first: dev-port stop ${projectName || ''}\n`));
          process.exit(1);
        }
      }

      // Detect available scripts
      const scripts = await npmExecutor.detectNpmScripts(targetPath);
      const hasDev = scripts.some(s => s.name === 'dev');
      const hasStart = scripts.some(s => s.name === 'start');

      // Choose command: prefer 'dev' for development, fallback to 'start'
      const command = hasDev ? 'run dev' : (hasStart ? 'start' : 'run serve');

      console.log(chalk.green(`\n🚀 Starting ${projectName || 'project'}...`));
      console.log(chalk.dim(`   Command: npm ${command}`));
      console.log(chalk.dim(`   Directory: ${targetPath}\n`));

      const result = await npmExecutor.runNpmCommand(targetPath, `npm ${command}`);

      if (result.success) {
        console.log(chalk.green('\n✅ Project started successfully\n'));
      } else {
        console.log(chalk.yellow(`\n⚠️  Project exited with code ${result.exitCode}\n`));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * Stop a project (kill process on port)
 */
program
  .command('stop [project]')
  .description('Stop a running project (kill process on port)')
  .alias('kill')
  .action(async (project) => {
    try {
      const { getProject, getAllProjects } = require('../lib/project');
      
      let targetPort;
      let projectName;

      // Find project
      if (project) {
        const proj = getProject(project);
        if (!proj) {
          throw new Error(`Project '${project}' not found in registry`);
        }
        targetPort = proj.port;
        projectName = proj.name;
      } else {
        // Use current directory project
        const allProjects = getAllProjects();
        const currentProj = allProjects.find(p => p.basePath === process.cwd());
        if (!currentProj) {
          throw new Error('No project found in current directory. Provide project name or run from project folder.');
        }
        targetPort = currentProj.port;
        projectName = currentProj.name;
      }

      console.log(chalk.cyan(`\n🔍 Checking port ${targetPort}...`));

      // Check if port is in use
      const inUse = await portScanner.isPortInUse(targetPort);
      if (!inUse) {
        console.log(chalk.yellow(`⚠️  Nothing is running on port ${targetPort}\n`));
        process.exit(0);
      }

      // Get process info
      const pid = await portScanner.getProcessOnPort(targetPort);
      const processName = await portScanner.getProcessName(pid);

      console.log(chalk.yellow(`🛑 Stopping ${projectName}...`));
      console.log(chalk.dim(`   Process: ${processName || 'unknown'}`));
      console.log(chalk.dim(`   PID: ${pid}`));
      console.log(chalk.dim(`   Port: ${targetPort}\n`));

      // Kill the process
      const killResult = await npmExecutor.killProcess(pid);

      if (killResult.success) {
        console.log(chalk.green(`✅ ${projectName} stopped successfully\n`));
      } else {
        console.log(chalk.red(`❌ Failed to stop process: ${killResult.error || 'unknown error'}`));
        console.log(chalk.dim(`   Try manually: ${process.platform === 'win32' ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`}\n`));
        process.exit(1);
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

/**
 * List running processes
 */
program
  .command('ps')
  .description('List all running processes managed by dev-port')
  .alias('processes')
  .action(async () => {
    try {
      const { getAllProjects } = require('../lib/project');
      
      console.log(chalk.green('\n📊 Running Processes:\n'));

      const projects = getAllProjects();
      let runningCount = 0;

      for (const proj of projects) {
        const inUse = await portScanner.isPortInUse(proj.port);
        if (inUse) {
          runningCount++;
          const pid = await portScanner.getProcessOnPort(proj.port);
          const processName = await portScanner.getProcessName(pid);
          
          console.log(`   ${chalk.green('●')} ${chalk.cyan(proj.name.padEnd(25))} ${chalk.dim(`:${proj.port}`)} ${chalk.yellow(`(${processName || 'unknown'})`)}`);
        }
      }

      if (runningCount === 0) {
        console.log(chalk.yellow('   No processes running\n'));
      } else {
        console.log(chalk.dim(`\n   Total: ${runningCount} process(es) running\n`));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Error: ${err.message}`));
      process.exit(1);
    }
  });

// ============================================================================
// PARSE COMMANDS
// ============================================================================

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
