#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const path = require('path');

const Registry = require('../lib/registry');
const PortManager = require('../lib/port-manager');
const HostsManager = require('../lib/hosts-manager');
const ConfigGenerator = require('../lib/config-generator');

const registryPath = path.join(process.env.HOME || process.env.USERPROFILE, '.dpm', 'registry.json');

const main = yargs(hideBin(process.argv))
  .command(
    'assign <project>',
    'Assign a port to a project and generate config',
    (yargs) => {
      return yargs
        .positional('project', {
          describe: 'Project name (e.g., jenkins-local, api-service)',
          type: 'string'
        })
        .option('host', {
          alias: 'h',
          describe: 'Hostname (e.g., jenkins-local.local or use *.localtest.me)',
          type: 'string',
          default: null
        })
        .option('port', {
          alias: 'p',
          describe: 'Specify port manually (optional, auto-assign if not provided)',
          type: 'number',
          default: null
        })
        .option('output', {
          alias: 'o',
          describe: 'Output directory for .project-dev.json',
          type: 'string',
          default: process.cwd()
        })
        .option('vscode',
          {
          alias: 'v',
          describe: 'Generate .vscode/settings.json',
          type: 'boolean',
          default: false
        })
        .option('docker', {
          alias: 'd',
          describe: 'Generate .env for docker-compose',
          type: 'boolean',
          default: false
        });
    },
    async (argv) => {
      try {
        const registry = new Registry(registryPath);
        await registry.load();

        const portManager = new PortManager(registry);
        let assignedPort = argv.port;

        if (!assignedPort) {
          assignedPort = await portManager.getNextAvailablePort();
        } else {
          const conflict = portManager.findConflict(assignedPort);
          if (conflict) {
            console.error(chalk.red(`✗ Port ${assignedPort} already assigned to project: ${conflict}`));
            process.exit(1);
          }
        }

        const hostname = argv.host || `${argv.project}.localtest.me`;
        
        registry.addProject(argv.project, assignedPort, hostname);
        await registry.save();

        const configGen = new ConfigGenerator();
        const projectConfig = configGen.generateProjectConfig(
          argv.project,
          assignedPort,
          hostname
        );

        await configGen.writeProjectConfig(argv.output, projectConfig);

        if (argv.vscode) {
          await configGen.generateVSCodeSettings(argv.output, assignedPort);
        }

        if (argv.docker) {
          await configGen.generateDockerEnv(argv.output, projectConfig);
        }

        console.log(chalk.green(`✓ Project '${argv.project}' assigned to port ${assignedPort}`));
        console.log(chalk.blue(`  Host: ${hostname}`));
        console.log(chalk.blue(`  URL: http://${hostname}:${assignedPort}`));
        console.log(chalk.blue(`  Config: ${path.join(argv.output, '.project-dev.json')}`));

      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )
  .command(
    'sync',
    'Sync /etc/hosts file from registry (remove stale entries)',
    (yargs) => {
      return yargs
        .option('remove-stale', {
          alias: 'r',
          describe: 'Remove entries for projects no longer in registry',
          type: 'boolean',
          default: true
        })
        .option('backup', {
          alias: 'b',
          describe: 'Create backup of hosts file before sync',
          type: 'boolean',
          default: true
        });
    },
    async (argv) => {
      try {
        const registry = new Registry(registryPath);
        await registry.load();

        const hostsManager = new HostsManager();

        if (argv.backup) {
          await hostsManager.backup();
          console.log(chalk.gray('  Backup created'));
        }

        const entries = registry.getProjectsForHosts();
        await hostsManager.updateHosts(entries, argv.removeStale);

        console.log(chalk.green(`✓ /etc/hosts synced with ${entries.length} entries`));
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )
  .command(
    'list [filter]',
    'List all registered projects with ports and URLs',
    (yargs) => {
      return yargs
        .positional('filter', {
          describe: 'Filter by project name (substring match)',
          type: 'string',
          default: null
        })
        .option('json', {
          describe: 'Output as JSON',
          type: 'boolean',
          default: false
        })
        .option('active-only', {
          alias: 'a',
          describe: 'Show only projects with running processes',
          type: 'boolean',
          default: false
        });
    },
    async (argv) => {
      try {
        const registry = new Registry(registryPath);
        await registry.load();

        const projects = registry.listProjects(argv.filter);

        if (projects.length === 0) {
          console.log(chalk.yellow('No projects found'));
          return;
        }

        if (argv.json) {
          console.log(JSON.stringify(projects, null, 2));
        } else {
          const { table } = require('table');
          const data = [
            ['Project', 'Host', 'Port', 'URL'],
            ...projects.map(p => [
              chalk.cyan(p.name),
              p.host,
              chalk.yellow(p.port.toString()),
              `http://${p.host}:${p.port}`
            ])
          ];

          const output = table(data, {
            style: { border: ['cyan'] }
          });

          console.log(output);
        }
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )
  .command(
    'remove <project>',
    'Remove a project from registry',
    (yargs) => {
      return yargs.positional('project', {
        describe: 'Project name to remove',
        type: 'string'
      });
    },
    async (argv) => {
      try {
        const registry = new Registry(registryPath);
        await registry.load();

        registry.removeProject(argv.project);
        await registry.save();

        console.log(chalk.green(`✓ Project '${argv.project}' removed from registry`));
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )
  .command(
    'init',
    'Initialize dev-port-manager registry and settings',
    async (argv) => {
      try {
        const registry = new Registry(registryPath);
        await registry.initialize();
        console.log(chalk.green(`✓ Registry initialized at ${registryPath}`));
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )
  .command(
    'status',
    'Show registry and system status',
    async (argv) => {
      try {
        const registry = new Registry(registryPath);
        await registry.load();

        const projects = registry.listProjects();
        const { stats } = require('../lib/port-manager');

        console.log(chalk.blue('=== Dev Port Manager Status ===\n'));
        console.log(`Registry: ${registryPath}`);
        console.log(`Total projects: ${projects.length}`);
        console.log(`Port range: 9000–9999`);
        console.log(`Used ports: ${projects.length}`);
        console.log(`Available ports: ${1000 - projects.length}\n`);

        if (projects.length > 0) {
          console.log('Registered projects:');
          projects.forEach(p => {
            console.log(`  • ${chalk.cyan(p.name)} → ${p.host}:${p.port}`);
          });
        }
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${error.message}`));
        process.exit(1);
      }
    }
  )
  .option('verbose', {
    alias: 'v',
    describe: 'Verbose output',
    type: 'boolean'
  })
  .help()
  .alias('help', 'h')
  .alias('version', 'V')
  .parse();
