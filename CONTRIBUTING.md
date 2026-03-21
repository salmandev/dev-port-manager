# Contributing to Dev Port Manager

Thank you for your interest in contributing to Dev Port Manager! This document provides guidelines and instructions for contributing.

## 🌟 How to Contribute

### 1. Fork the Repository
```bash
# Click "Fork" on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/dev-port-manager
cd dev-port-manager
```

### 2. Create a Branch
```bash
# Create a feature branch
git checkout -b feature/my-awesome-feature

# Or for bug fixes
git checkout -b fix/issue-123
```

### 3. Make Your Changes
- Follow the existing code style
- Add tests if applicable
- Update documentation if needed

### 4. Test Your Changes
```bash
# Run all tests
npm run test:all

# Test CLI
dev-port --help

# Test desktop app
npm start
```

### 5. Commit Your Changes
```bash
# Use conventional commits
git add .
git commit -m "feat: add awesome feature"

# or
git commit -m "fix: resolve issue with port assignment"
```

### 6. Push and Open a Pull Request
```bash
git push origin feature/my-awesome-feature
```

Then open a Pull Request on GitHub.

---

## 📋 Contribution Guidelines

### Code Style
- Use 2 spaces for indentation
- Follow ESLint rules (if configured)
- Add comments for complex logic
- Use meaningful variable names

### Commit Messages
We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build/config changes

Examples:
```
feat: add Docker Compose generation
fix: resolve port conflict in scan
docs: update README with examples
refactor: simplify registry loading
```

### Pull Request Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated (if needed)
- [ ] No sensitive data committed
- [ ] Commit messages are clear

---

## 🐛 Reporting Bugs

### Before Reporting
- Check existing issues (open and closed)
- Try latest version
- Check documentation

### Bug Report Template
```markdown
### Describe the bug
Clear description of what the bug is

### To Reproduce
Steps to reproduce:
1. Run `dev-port ...`
2. See error

### Expected behavior
What you expected to happen

### Screenshots
If applicable, add screenshots

### Environment
- OS: [e.g., Windows 11]
- Node version: [e.g., v18.0.0]
- Dev Port Manager version: [e.g., v1.0.0]

### Additional context
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template
```markdown
### Feature description
Clear description of the feature

### Use case
Why is this feature useful?

### Examples
How would this work?

### Alternatives considered
Any alternative solutions you've considered
```

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# API tests
npm run test:api

# All tests
npm run test:all
```

### Write Tests
- Add tests in `test/` directory
- Follow existing test patterns
- Aim for good coverage
- Test edge cases

---

## 📖 Documentation

### Update Documentation When:
- Adding new features
- Changing existing behavior
- Fixing bugs that affect usage
- Adding configuration options

### Documentation Files
- `README.md` - Main documentation
- `docs/` - Detailed guides
- `examples/` - Usage examples

---

## 🔒 Security

### Reporting Security Issues
**DO NOT** open public issues for security vulnerabilities.

Email: security@devportmanager.com

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours.

---

## 💬 Community

### Code of Conduct
Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Communication
- GitHub Issues - Bugs and features
- GitHub Discussions - Questions and ideas
- Discord - Real-time chat (link in README)

---

## 🎯 Areas Needing Help

### High Priority
- [ ] More tests (especially integration)
- [ ] Documentation examples
- [ ] Plugin system design
- [ ] Mobile app concept

### Medium Priority
- [ ] CI/CD improvements
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Translations

### Nice to Have
- [ ] More project type detectors
- [ ] Docker service management
- [ ] Team collaboration features
- [ ] Analytics dashboard

---

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Added to CONTRIBUTORS file
- Recognized in Discord

---

## ❓ Questions?

- Check [FAQ](docs/faq.md)
- Ask in [Discussions](https://github.com/your-org/dev-port-manager/discussions)
- Join Discord community

---

**Thank you for contributing! 🎉**

Every contribution, no matter how small, makes Dev Port Manager better.
