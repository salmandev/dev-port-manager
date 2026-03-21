# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**DO NOT** open public issues for security vulnerabilities.

### How to Report

Email: security@devportmanager.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)
- Your GitHub username (for credit)

### What to Expect

- **Initial Response**: Within 48 hours
- **Status Update**: Within 1 week
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: 1 month

### Process

1. **Submit Report**: Email security@devportmanager.com
2. **Acknowledgment**: We'll confirm receipt within 48 hours
3. **Assessment**: We'll evaluate the vulnerability
4. **Fix Development**: We'll work on a fix
5. **Release**: We'll publish a security advisory
6. **Credit**: You'll be credited (unless you prefer anonymity)

### Security Best Practices for Users

#### Keep Updated
- Enable auto-updates in desktop app
- Regularly check for CLI updates: `npm update -g dev-port-manager`
- Watch GitHub releases

#### Secure Your Registry
- Use cloud sync (Google Drive, Dropbox) for backup
- Don't commit `.project-dev.json` to version control
- Use strong passwords if syncing manually

#### Port Security
- Default range (9000-9999) is safe for local development
- Avoid using privileged ports (< 1024)
- Check port conflicts before starting services

#### Network Security
- Uses `*.localtest.me` (resolves to 127.0.0.1)
- No external network calls by default
- Firewall rules not required for local use

### Known Security Considerations

#### What We Protect Against
✅ Port conflicts and collisions
✅ Data corruption (backup/restore)
✅ Path traversal attacks
✅ Injection attacks in CLI
✅ Electron security hardening

#### What Users Should Know
⚠️ Don't run as administrator/root unless necessary
⚠️ Review generated Docker files before use
⚠️ Be cautious with custom registry paths
⚠️ Don't share `.project-dev.json` publicly

### Security Features

#### Built-in Protections
- Input validation on all CLI commands
- Path sanitization
- Port availability checking
- Registry backup before modifications
- Electron sandbox mode

#### Enterprise Features
- MSI installer with code signing (Windows)
- Notarized builds (macOS)
- Checksums for all releases
- Signed Git tags

### Vulnerability Disclosure Policy

We follow a coordinated disclosure process:

1. Reporter submits vulnerability privately
2. We assess and develop fix
3. We notify users via security advisory
4. Fix is released
5. Public disclosure after users have time to update

We appreciate responsible disclosure and will credit researchers (with permission).

### Contact

- **Security Email**: security@devportmanager.com
- **PGP Key**: Available on request
- **Response Time**: Within 48 hours

---

**Thank you for helping keep Dev Port Manager secure! 🔒**
