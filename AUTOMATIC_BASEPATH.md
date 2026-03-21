# Auto basePath Capture - Present & Future

## ✅ What's Fixed

### For Existing Projects
```javascript
// lib/project.js - getAllProjects()
// Now automatically:
// 1. Searches for .project-dev.json
// 2. Reads basePath from it
// 3. Updates registry automatically
// 4. Returns projects with basePath
```

### For Future Projects
```javascript
// lib/project.js - scanDirectory()
// Already captures basePath automatically:
assignProject(folder, { basePath: fullPath })
```

---

## 🚀 How It Works

### Existing Projects (Auto-Fix)
```
1. Desktop app calls getProjects()
2. lib/project.js reads registry
3. For projects without basePath:
   - Searches ~/Projects/<name>/.project-dev.json
   - Searches ~/projects/<name>/.project-dev.json
   - Searches ~/dev/<name>/.project-dev.json
   - Searches ~/src/<name>/.project-dev.json
   - Searches ~/<name>/.project-dev.json
4. Finds .project-dev.json
5. Reads basePath from it
6. Updates registry automatically
7. Returns project with basePath ✅
```

### New Projects (Auto-Capture)
```
1. Run: dev-port scan ~/Projects
2. For each project found:
   - Detects project type
   - Calls: assignProject(folder, { basePath: fullPath })
   - basePath saved to registry ✅
   - basePath saved to .project-dev.json ✅
```

---

## 📊 Timeline

### Past (Before Fix)
```bash
# Projects assigned without basePath
dev-port assign my-app
# ❌ basePath not captured
```

### Present (After Fix)
```bash
# Auto-detect from .project-dev.json
npm start → Tools tab
# ✅ basePath auto-loaded

# New projects via scan
dev-port scan ~/Projects
# ✅ basePath auto-captured
```

### Future (Recommended)
```bash
# Always assign from project directory
cd my-app
dev-port assign my-app
# ✅ basePath always captured
```

---

## ✅ What's Automatic Now

### Desktop App
- ✅ Auto-searches for .project-dev.json
- ✅ Reads basePath automatically
- ✅ Updates registry silently
- ✅ Shows path in Tools tab

### CLI Scan
- ✅ Captures basePath for all new projects
- ✅ Stores in registry
- ✅ Stores in .project-dev.json

### CLI Assign
- ✅ Captures basePath when run from project directory
- ✅ Stores everywhere

---

## 🐛 Why Some Projects Still Show N/A

### Reason
The .project-dev.json file doesn't exist or doesn't have basePath.

### Solution
```bash
# Re-assign from project directory
cd d:\Dev\GitHub\mdcat-pulse-practice
dev-port assign mdcat-pulse-practice

# This will:
# 1. Create/update .project-dev.json
# 2. Capture basePath
# 3. Update registry
```

---

## 🎯 Best Practices

### For New Projects
```bash
# ✅ Always assign from project directory
cd my-project
dev-port assign my-project

# OR specify basePath explicitly
dev-port assign my-project --basePath C:\Projects\my-project
```

### For Existing Projects
```bash
# Batch fix all
for /d %i in (C:\Projects\*) do @if exist "%i\.project-dev.json" (cd "%i" && dev-port assign %~ni)

# Or let auto-detect work
# Desktop app will find .project-dev.json automatically
```

---

## 📝 Code Changes

### lib/project.js - getAllProjects()
```javascript
// Added auto-detection:
function getAllProjects() {
  const registry = fs.readJsonSync(REGISTRY_FILE);
  let registryUpdated = false;
  
  const projects = Object.entries(registry).map(([name, info]) => {
    let basePath = info.basePath;
    
    if (!basePath) {
      // Search for .project-dev.json
      const possiblePaths = [
        path.join(os.homedir(), 'Projects', name, '.project-dev.json'),
        path.join(os.homedir(), 'projects', name, '.project-dev.json'),
        path.join(os.homedir(), 'dev', name, '.project-dev.json'),
        path.join(os.homedir(), 'src', name, '.project-dev.json'),
        path.join(os.homedir(), name, '.project-dev.json')
      ];
      
      for (const projPath of possiblePaths) {
        if (fs.existsSync(projPath)) {
          const projConfig = fs.readJsonSync(projPath);
          if (projConfig.basePath) {
            basePath = projConfig.basePath;
            info.basePath = basePath;
            registryUpdated = true;
            break;
          }
        }
      }
    }
    
    return { name, ...info, basePath: basePath || 'N/A' };
  });
  
  if (registryUpdated) {
    writeRegistrySync(registry);  // Save updates
  }
  
  return projects;
}
```

---

## ✅ Summary

| Scenario | basePath Handling |
|----------|------------------|
| **Existing projects** | ✅ Auto-detect from .project-dev.json |
| **New projects (scan)** | ✅ Auto-capture in assignProject |
| **New projects (assign)** | ✅ Auto-capture if run from directory |
| **Desktop Tools tab** | ✅ Auto-load from .project-dev.json |
| **Registry** | ✅ Auto-update when found |

---

**Future projects will automatically capture basePath! 🎉**

Existing projects will auto-detect from .project-dev.json!
