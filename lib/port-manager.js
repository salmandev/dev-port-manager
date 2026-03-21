const net = require('net');

class PortManager {
  constructor(registry) {
    this.registry = registry;
    this.MIN_PORT = 9000;
    this.MAX_PORT = 9999;
  }

  // Predefined port blocks for organization
  getPortRanges() {
    return {
      'core-infra': { min: 9000, max: 9099, description: 'Core infrastructure' },
      'project-dev': { min: 9100, max: 9499, description: 'Project dev services' },
      'experimental': { min: 9500, max: 9999, description: 'Experimental & Docker' }
    };
  }

  findConflict(port) {
    const projects = this.registry.listProjects();
    const conflict = projects.find(p => p.port === port);
    return conflict ? conflict.name : null;
  }

  isPortInUse(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      server.once('listening', () => {
        server.close();
        resolve(false);
      });
      server.listen(port, '127.0.0.1');
    });
  }

  async getNextAvailablePort(preferredBlock = 'project-dev') {
    const usedPorts = new Set(this.registry.getAllPorts());
    const ranges = this.getPortRanges();
    const range = ranges[preferredBlock] || ranges['project-dev'];

    // Try to find a port in preferred block first
    for (let port = range.min; port <= range.max; port++) {
      if (!usedPorts.has(port) && !(await this.isPortInUse(port))) {
        return port;
      }
    }

    // If preferred block full, try other blocks
    for (const [blockName, blockRange] of Object.entries(ranges)) {
      if (blockName === preferredBlock) continue;

      for (let port = blockRange.min; port <= blockRange.max; port++) {
        if (!usedPorts.has(port) && !(await this.isPortInUse(port))) {
          return port;
        }
      }
    }

    throw new Error('No available ports in range 9000-9999');
  }

  getPortStats() {
    const projects = this.registry.listProjects();
    const usedPorts = projects.length;
    const totalPorts = this.MAX_PORT - this.MIN_PORT + 1;
    const availablePorts = totalPorts - usedPorts;

    return {
      totalPorts,
      usedPorts,
      availablePorts,
      percentageUsed: ((usedPorts / totalPorts) * 100).toFixed(2)
    };
  }

  validatePortRange(port) {
    if (port < this.MIN_PORT || port > this.MAX_PORT) {
      throw new Error(`Port must be between ${this.MIN_PORT} and ${this.MAX_PORT}`);
    }
  }

  getCategoryForPort(port) {
    const ranges = this.getPortRanges();
    for (const [category, range] of Object.entries(ranges)) {
      if (port >= range.min && port <= range.max) {
        return { category, ...range };
      }
    }
    return null;
  }
}

module.exports = PortManager;
