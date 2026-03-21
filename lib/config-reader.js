/**
 * Config Reader Module - Read project configuration files
 * Detects and reads config from various frameworks
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Read package.json and extract port config
 * @param {string} projectPath - Project base path
 * @returns {Promise<Object|null>} Port config or null
 */
async function readPackageJsonConfig(projectPath) {
  try {
    const pkgPath = path.join(projectPath, 'package.json');
    if (!await fs.pathExists(pkgPath)) return null;
    
    const pkg = await fs.readJson(pkgPath);
    const config = {
      scripts: pkg.scripts || {},
      port: null,
      env: {}
    };
    
    // Extract port from scripts
    for (const [name, script] of Object.entries(config.scripts)) {
      const portMatch = script.match(/-p\s*(\d+)/) || script.match(/--port[=\s](\d+)/);
      if (portMatch) {
        config.port = parseInt(portMatch[1], 10);
        break;
      }
    }
    
    // Check for config in package.json
    if (pkg.devPort) config.port = pkg.devPort;
    if (pkg.port) config.port = pkg.port;
    
    return config;
  } catch (err) {
    console.error('Error reading package.json:', err);
    return null;
  }
}

/**
 * Read Vite config
 * @param {string} projectPath - Project base path
 * @returns {Promise<Object|null>} Vite config or null
 */
async function readViteConfig(projectPath) {
  try {
    const vitePaths = [
      'vite.config.js',
      'vite.config.ts',
      'vite.config.mjs',
      'vite.config.cjs'
    ];
    
    for (const vitePath of vitePaths) {
      const fullPath = path.join(projectPath, vitePath);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        
        // Extract port from config
        const portMatch = content.match(/port:\s*(\d+)/);
        const hostMatch = content.match(/host:\s*['"](0\.0\.0\.0|localhost|::)['"]/);
        
        if (portMatch || hostMatch) {
          return {
            file: vitePath,
            port: portMatch ? parseInt(portMatch[1], 10) : null,
            host: hostMatch ? hostMatch[1] : null,
            content: content
          };
        }
      }
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Read Next.js config
 * @param {string} projectPath - Project base path
 * @returns {Promise<Object|null>} Next.js config or null
 */
async function readNextConfig(projectPath) {
  try {
    const nextPaths = [
      'next.config.js',
      'next.config.mjs',
      'next.config.cjs'
    ];
    
    for (const nextPath of nextPaths) {
      const fullPath = path.join(projectPath, nextPath);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        
        // Extract port from config
        const portMatch = content.match(/port:\s*(\d+)/);
        
        return {
          file: nextPath,
          port: portMatch ? parseInt(portMatch[1], 10) : 3000, // Next.js default
          content: content
        };
      }
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Read Nuxt config
 * @param {string} projectPath - Project base path
 * @returns {Promise<Object|null>} Nuxt config or null
 */
async function readNuxtConfig(projectPath) {
  try {
    const nuxtPaths = [
      'nuxt.config.js',
      'nuxt.config.ts'
    ];
    
    for (const nuxtPath of nuxtPaths) {
      const fullPath = path.join(projectPath, nuxtPath);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        
        const portMatch = content.match(/port:\s*(\d+)/);
        
        return {
          file: nuxtPath,
          port: portMatch ? parseInt(portMatch[1], 10) : 3000,
          content: content
        };
      }
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Read Angular config
 * @param {string} projectPath - Project base path
 * @returns {Promise<Object|null>} Angular config or null
 */
async function readAngularConfig(projectPath) {
  try {
    const angularPath = path.join(projectPath, 'angular.json');
    if (!await fs.pathExists(angularPath)) return null;
    
    const angular = await fs.readJson(angularPath);
    
    // Extract default port from architect options
    if (angular.projects) {
      for (const [name, project] of Object.entries(angular.projects)) {
        if (project.architect?.serve?.options?.port) {
          return {
            file: 'angular.json',
            port: project.architect.serve.options.port,
            project: name
          };
        }
      }
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Read .env file
 * @param {string} projectPath - Project base path
 * @returns {Promise<Object|null>} Env vars or null
 */
async function readEnvFile(projectPath) {
  try {
    const envPaths = ['.env', '.env.local', '.env.development'];
    
    for (const envPath of envPaths) {
      const fullPath = path.join(projectPath, envPath);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        const env = {};
        
        content.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length) {
            env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        });
        
        return {
          file: envPath,
          vars: env,
          port: env.PORT ? parseInt(env.PORT, 10) : null
        };
      }
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Read all config files for a project
 * @param {string} projectPath - Project base path
 * @returns {Promise<Object>} Combined config
 */
async function readAllConfigs(projectPath) {
  const [
    packageConfig,
    viteConfig,
    nextConfig,
    nuxtConfig,
    angularConfig,
    envConfig
  ] = await Promise.all([
    readPackageJsonConfig(projectPath),
    readViteConfig(projectPath),
    readNextConfig(projectPath),
    readNuxtConfig(projectPath),
    readAngularConfig(projectPath),
    readEnvFile(projectPath)
  ]);
  
  return {
    package: packageConfig,
    vite: viteConfig,
    next: nextConfig,
    nuxt: nuxtConfig,
    angular: angularConfig,
    env: envConfig,
    detectedPort: viteConfig?.port || nextConfig?.port || nuxtConfig?.port || 
                  angularConfig?.port || envConfig?.port || packageConfig?.port
  };
}

/**
 * Update package.json with new port
 * @param {string} projectPath - Project base path
 * @param {number} port - New port
 * @returns {Promise<boolean>} Success
 */
async function updatePackageJsonPort(projectPath, port) {
  try {
    const pkgPath = path.join(projectPath, 'package.json');
    if (!await fs.pathExists(pkgPath)) return false;
    
    const pkg = await fs.readJson(pkgPath);
    pkg.devPort = port;
    
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    return true;
  } catch (err) {
    console.error('Error updating package.json:', err);
    return false;
  }
}

/**
 * Update .env file with new port
 * @param {string} projectPath - Project base path
 * @param {number} port - New port
 * @returns {Promise<boolean>} Success
 */
async function updateEnvPort(projectPath, port) {
  try {
    const envPath = path.join(projectPath, '.env');
    let content = '';
    
    if (await fs.pathExists(envPath)) {
      content = await fs.readFile(envPath, 'utf8');
      // Replace existing PORT value
      if (content.includes('PORT=')) {
        content = content.replace(/PORT=.*/, `PORT=${port}`);
      } else {
        content += `\nPORT=${port}`;
      }
    } else {
      content = `PORT=${port}\n`;
    }
    
    await fs.writeFile(envPath, content);
    return true;
  } catch (err) {
    console.error('Error updating .env:', err);
    return false;
  }
}

/**
 * Update Vite config with new port
 * @param {string} projectPath - Project base path
 * @param {number} port - New port
 * @returns {Promise<boolean>} Success
 */
async function updateVitePort(projectPath, port) {
  try {
    const vitePaths = [
      'vite.config.js',
      'vite.config.ts',
      'vite.config.mjs'
    ];
    
    for (const vitePath of vitePaths) {
      const fullPath = path.join(projectPath, vitePath);
      if (await fs.pathExists(fullPath)) {
        let content = await fs.readFile(fullPath, 'utf8');
        
        // Replace or add port
        if (content.includes('port:')) {
          content = content.replace(/port:\s*\d+/, `port: ${port}`);
        } else {
          // Add port to server config
          content = content.replace(
            /server:\s*\{/,
            `server: {\n    port: ${port},`
          );
        }
        
        await fs.writeFile(fullPath, content);
        return true;
      }
    }
    
    return false;
  } catch (err) {
    console.error('Error updating Vite config:', err);
    return false;
  }
}

module.exports = {
  readPackageJsonConfig,
  readViteConfig,
  readNextConfig,
  readNuxtConfig,
  readAngularConfig,
  readEnvFile,
  readAllConfigs,
  updatePackageJsonPort,
  updateEnvPort,
  updateVitePort
};
