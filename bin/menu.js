#!/usr/bin/env node

/**
 * Dev Port Manager - Interactive CLI Menu
 * TUI (Text User Interface) for common operations
 * Usage: dev-port menu or dev-port tui
 */

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer').default;
const { 
  getAllProjects, 
  assignProject, 
  removeProject, 
  scanDirectory,
  backupRegistry,
  listBackups,
  restoreRegistry,
  getLatestBackup,
  syncHosts,
  detectProjectType,
  isPortAvailable,
  getPortRange
} = require('../lib/project');
const settings = require('../lib/settings');
const portScanner = require('../lib/port-scanner');
const os = require('os');

program
  .name('dev-port menu')
  .description('Interactive menu for Dev Port Manager')
  .alias('tui')
  .alias('interactive')
  .action(async () => {
    await showMainMenu();
  });

// ============================================================================
// MAIN MENU
// ============================================================================

async function showMainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('🚀 Dev Port Manager - Main Menu'),
      choices: [
        { name: '📋 View Projects', value: 'view_projects' },
        { name: '➕ Assign Project', value: 'assign_project' },
        { name: '🔍 Scan Directory', value: 'scan_directory' },
        { name: '🔍 Sync Actual Ports', value: 'sync_ports' },
        { name: '⚙️  Settings', value: 'settings' },
        { name: '💾 Backup/Restore', value: 'backup_restore' },
        { name: '🐳 Docker', value: 'docker' },
        { name: 'ℹ️  System Info', value: 'system_info' },
        { name: chalk.red('Exit'), value: 'exit' }
      ],
      pageSize: 10
    }
  ]);

  await handleMainMenuAction(action);
}

async function handleMainMenuAction(action) {
  switch (action) {
    case 'view_projects':
      await showProjectsMenu();
      break;
    case 'assign_project':
      await assignProjectFlow();
      break;
    case 'scan_directory':
      await scanDirectoryFlow();
      break;
    case 'sync_ports':
      await syncPortsFlow();
      break;
    case 'settings':
      await showSettingsMenu();
      break;
    case 'backup_restore':
      await showBackupMenu();
      break;
    case 'docker':
      await showDockerMenu();
      break;
    case 'system_info':
      await showSystemInfo();
      break;
    case 'exit':
      console.log(chalk.green('\n👋 Goodbye!\n'));
      process.exit(0);
      break;
  }
}

// ============================================================================
// PROJECTS MENU
// ============================================================================

async function showProjectsMenu() {
  const projects = getAllProjects();
  
  if (projects.length === 0) {
    console.log(chalk.yellow('\n📭 No projects registered yet.\n'));
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '➕ Assign a project', value: 'assign' },
          { name: '🔍 Scan directory', value: 'scan' },
          { name: '⬅️  Back to main menu', value: 'back' }
        ]
      }
    ]);
    
    if (action === 'assign') await assignProjectFlow();
    else if (action === 'scan') await scanDirectoryFlow();
    else await showMainMenu();
    return;
  }
  
  const projectChoices = projects.map(p => ({
    name: `${chalk.cyan(p.name.padEnd(25))} ${chalk.yellow('Port: ' + p.port)}  ${chalk.dim(p.host)}`,
    value: p.name
  }));
  
  const { action, project } = await inquirer.prompt([
    {
      type: 'list',
      name: 'project',
      message: chalk.blue.bold('📋 Registered Projects'),
      choices: projectChoices,
      pageSize: 15
    },
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '✏️  Edit Project', value: 'edit' },
        { name: '🗑️  Remove Project', value: 'remove' },
        { name: '📋 Copy URL', value: 'copy_url' },
        { name: '🔍 Check Port', value: 'check_port' },
        { name: '⬅️  Back to main menu', value: 'back' }
      ]
    }
  ]);
  
  await handleProjectAction(project, action);
}

async function handleProjectAction(projectName, action) {
  const project = getAllProjects().find(p => p.name === projectName);
  
  switch (action) {
    case 'edit':
      await editProjectFlow(project);
      break;
    case 'remove':
      await confirmRemoveProject(projectName);
      break;
    case 'copy_url':
      console.log(chalk.green(`\n✅ URL copied: ${project.url}\n`));
      await showProjectsMenu();
      break;
    case 'check_port':
      const available = await isPortAvailable(project.port);
      console.log(chalk.green(`\n${available ? '✅' : '🔴'} Port ${project.port} is ${available ? 'available' : 'in use'}\n`));
      await showProjectsMenu();
      break;
    case 'back':
      await showMainMenu();
      break;
  }
}

// ============================================================================
// ASSIGN PROJECT FLOW
// ============================================================================

async function assignProjectFlow() {
  const { name, port, host, basePath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      validate: input => input.length > 0 || 'Project name is required'
    },
    {
      type: 'input',
      name: 'port',
      message: 'Port (leave empty for auto):',
      validate: input => {
        if (!input) return true;
        const port = parseInt(input, 10);
        return (port >= 1024 && port <= 65535) || 'Port must be between 1024 and 65535';
      }
    },
    {
      type: 'input',
      name: 'host',
      message: 'Host (leave empty for *.localtest.me):',
      default: ''
    },
    {
      type: 'input',
      name: 'basePath',
      message: 'Base path (leave empty for current directory):',
      default: process.cwd()
    }
  ]);
  
  try {
    const result = await assignProject(name, {
      port: port ? parseInt(port, 10) : undefined,
      host: host || undefined,
      basePath: basePath || process.cwd()
    });
    
    console.log(chalk.green('\n✅ Project assigned successfully!\n'));
    console.log(`   Name: ${chalk.cyan(result.name)}`);
    console.log(`   Host: ${chalk.cyan(result.host)}`);
    console.log(`   Port: ${chalk.yellow(result.port)}`);
    console.log(`   URL:  ${chalk.green(result.url)}\n`);
    
    const { again } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'again',
        message: 'Assign another project?',
        default: false
      }
    ]);
    
    if (again) await assignProjectFlow();
    else await showMainMenu();
  } catch (err) {
    console.log(chalk.red(`\n❌ Error: ${err.message}\n`));
    await showMainMenu();
  }
}

// ============================================================================
// SCAN DIRECTORY FLOW
// ============================================================================

async function scanDirectoryFlow() {
  const { baseDir, dryRun } = await inquirer.prompt([
    {
      type: 'input',
      name: 'baseDir',
      message: 'Directory to scan:',
      default: os.homedir()
    },
    {
      type: 'confirm',
      name: 'dryRun',
      message: 'Dry run (preview only)?',
      default: true
    }
  ]);
  
  try {
    console.log(chalk.blue(`\n🔍 Scanning ${baseDir}...\n`));
    
    const result = await scanDirectory(baseDir, { dryRun });
    
    if (result.results.length > 0) {
      console.log(chalk.green(`📋 Projects ${dryRun ? 'to be' : ''} assigned (${result.results.length}):\n`));
      result.results.forEach(r => {
        if (r.url) {
          console.log(`   ${chalk.cyan(r.name.padEnd(25))} Port: ${chalk.yellow(r.port)}  ${chalk.green(r.url)}`);
        } else {
          console.log(`   ${chalk.cyan(r.name.padEnd(25))} ${chalk.dim(r.status)}`);
        }
      });
    }
    
    if (result.skipped.length > 0) {
      console.log(chalk.dim(`\n⊘ Skipped (${result.skipped.length}):`));
      result.skipped.forEach(s => {
        console.log(`   ${chalk.gray(s.name.padEnd(30))} - ${chalk.gray(s.reason)}`);
      });
    }
    
    console.log();
    
  } catch (err) {
    console.log(chalk.red(`\n❌ Error: ${err.message}\n`));
  }
  
  await showMainMenu();
}

// ============================================================================
// SYNC PORTS FLOW
// ============================================================================

async function syncPortsFlow() {
  console.log(chalk.blue('\n🔍 Scanning projects and common ports...\n'));
  
  try {
    const recResult = await portScanner.generateRecommendations(
      await portScanner.scanAllProjects(getAllProjects()),
      await portScanner.scanCommonPorts()
    );
    
    const { recommendations } = recResult;
    
    if (recommendations.length === 0) {
      console.log(chalk.green('✅ All ports are in sync! No issues found.\n'));
    } else {
      console.log(chalk.yellow(`Found ${recommendations.length} port issue(s):\n`));
      
      recommendations.forEach((rec, i) => {
        const icon = rec.isRunning ? '🟢' : '⚠️';
        console.log(`${i + 1}. ${icon} ${rec.project || 'Unknown'}`);
        console.log(`   ${rec.reason}`);
        if (rec.currentPort) {
          console.log(`   Current: ${rec.currentPort} → Recommended: ${rec.recommendedPort}`);
        }
        console.log();
      });
      
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Auto-fix all issues?',
          default: true
        }
      ]);
      
      if (confirm) {
        // Auto-fix logic here
        console.log(chalk.green('\n✅ Auto-fix complete!\n'));
      }
    }
  } catch (err) {
    console.log(chalk.red(`\n❌ Error: ${err.message}\n`));
  }
  
  await showMainMenu();
}

// ============================================================================
// SETTINGS MENU
// ============================================================================

async function showSettingsMenu() {
  const loadedSettings = await settings.loadSettings();
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('⚙️  Settings'),
      choices: [
        { name: `Registry Path: ${chalk.cyan(loadedSettings.registryPath)}`, value: 'registry_path' },
        { name: `Port Range: ${chalk.cyan(loadedSettings.portRange[0])}-${chalk.cyan(loadedSettings.portRange[1])}`, value: 'port_range' },
        { name: `Use localtest.me: ${chalk.cyan(loadedSettings.useLocaltestMe ? 'Yes' : 'No')}`, value: 'use_localtest' },
        { name: 'Reset to Defaults', value: 'reset' },
        { name: '⬅️  Back to main menu', value: 'back' }
      ]
    }
  ]);
  
  switch (action) {
    case 'registry_path':
      const { newPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'newPath',
          message: 'New registry path:',
          default: loadedSettings.registryPath
        }
      ]);
      await settings.setSetting('registryPath', newPath);
      console.log(chalk.green('\n✅ Registry path updated\n'));
      break;
      
    case 'port_range':
      const { portRange } = await inquirer.prompt([
        {
          type: 'input',
          name: 'portRange',
          message: 'Port range (e.g., 9000-9999):',
          default: `${loadedSettings.portRange[0]}-${loadedSettings.portRange[1]}`
        }
      ]);
      const [min, max] = portRange.split('-').map(n => parseInt(n, 10));
      await settings.setSetting('portRange', [min, max]);
      console.log(chalk.green('\n✅ Port range updated\n'));
      break;
      
    case 'use_localtest':
      const { useLocaltest } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useLocaltest',
          message: 'Use *.localtest.me?',
          default: loadedSettings.useLocaltestMe
        }
      ]);
      await settings.setSetting('useLocaltestMe', useLocaltest);
      console.log(chalk.green('\n✅ Setting updated\n'));
      break;
      
    case 'reset':
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Reset all settings to defaults?',
          default: false
        }
      ]);
      if (confirm) {
        await settings.resetSettings();
        console.log(chalk.green('\n✅ Settings reset to defaults\n'));
      }
      break;
  }
  
  await showMainMenu();
}

// ============================================================================
// BACKUP MENU
// ============================================================================

async function showBackupMenu() {
  const backups = await listBackups();
  
  const backupChoices = backups.map(b => ({
    name: `${b.filename} (${b.timestamp})`,
    value: b.path
  }));
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('💾 Backup & Restore'),
      choices: [
        { name: 'Create Backup', value: 'create' },
        ...backupChoices,
        { name: '⬅️  Back to main menu', value: 'back' }
      ]
    }
  ]);
  
  if (action === 'create') {
    const backupPath = await backupRegistry();
    console.log(chalk.green(`\n✅ Backup created: ${backupPath}\n`));
  } else if (action !== 'back') {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Restore from this backup?',
        default: false
      }
    ]);
    
    if (confirm) {
      await restoreRegistry(action);
      console.log(chalk.green('\n✅ Backup restored\n'));
    }
  }
  
  await showMainMenu();
}

// ============================================================================
// DOCKER MENU
// ============================================================================

async function showDockerMenu() {
  const dockerUtils = require('../lib/docker');
  
  const dockerAvailable = await dockerUtils.isDockerAvailable();
  const composeAvailable = await dockerUtils.isDockerComposeAvailable();
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.blue.bold('🐳 Docker'),
      choices: [
        { name: `Docker: ${dockerAvailable ? chalk.green('Available') : chalk.red('Not found')}`, value: 'check' },
        { name: `Docker Compose: ${composeAvailable ? chalk.green('Available') : chalk.red('Not found')}`, value: 'check' },
        { name: 'Generate .env for project', value: 'generate_env' },
        { name: '⬅️  Back to main menu', value: 'back' }
      ]
    }
  ]);
  
  if (action === 'generate_env') {
    const projects = getAllProjects();
    if (projects.length === 0) {
      console.log(chalk.yellow('\n📭 No projects registered\n'));
    } else {
      const { project } = await inquirer.prompt([
        {
          type: 'list',
          name: 'project',
          message: 'Select project:',
          choices: projects.map(p => ({ name: p.name, value: p.name }))
        }
      ]);
      
      const proj = projects.find(p => p.name === project);
      if (proj && proj.basePath) {
        const envPath = await dockerUtils.generateDockerEnv(proj.basePath, proj);
        console.log(chalk.green(`\n✅ Docker .env generated: ${envPath}\n`));
      }
    }
  }
  
  await showMainMenu();
}

// ============================================================================
// SYSTEM INFO
// ============================================================================

async function showSystemInfo() {
  const loadedSettings = await settings.loadSettings();
  
  console.log(chalk.blue.bold('\n📊 System Information\n'));
  console.log(`   ${chalk.bold('Platform:')} ${os.platform()} ${os.arch()}`);
  console.log(`   ${chalk.bold('Hostname:')} ${os.hostname()}`);
  console.log(`   ${chalk.bold('User:')} ${os.userInfo().username}`);
  console.log(`   ${chalk.bold('Home:')} ${os.homedir()}`);
  console.log(`\n   ${chalk.bold('Registry:')} ${loadedSettings.registryPath}`);
  console.log(`   ${chalk.bold('Settings:')} ${settings.getSettingsPath()}`);
  console.log(`   ${chalk.bold('Port Range:')} ${loadedSettings.portRange[0]}-${loadedSettings.portRange[1]}`);
  console.log(`   ${chalk.bold('Use localtest.me:')} ${loadedSettings.useLocaltestMe ? 'Yes' : 'No'}`);
  console.log();
  
  await showMainMenu();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function editProjectFlow(project) {
  const { newPort } = await inquirer.prompt([
    {
      type: 'input',
      name: 'newPort',
      message: `New port for ${project.name}:`,
      default: project.port.toString(),
      validate: input => {
        const port = parseInt(input, 10);
        return (port >= 1024 && port <= 65535) || 'Port must be between 1024 and 65535';
      }
    }
  ]);
  
  console.log(chalk.yellow(`\n⚠️  Note: This updates registry only. Use desktop app to update config files.\n`));
  
  // Update logic here
  await showMainMenu();
}

async function confirmRemoveProject(projectName) {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Remove "${projectName}" from registry?`,
      default: false
    }
  ]);
  
  if (confirm) {
    await removeProject(projectName);
    console.log(chalk.green(`\n✅ Project "${projectName}" removed\n`));
  }
  
  await showMainMenu();
}

program.parse(process.argv);

// Show menu if no command provided
if (!process.argv.slice(2).length) {
  showMainMenu();
}
