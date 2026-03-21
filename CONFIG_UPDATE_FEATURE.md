# Dev Port Manager - Config Update Feature

## ✨ New Feature: Edit Project Configuration

You can now **update project configurations** after scanning/assignment!

---

## 🎯 Problem Solved

**Before:**
- Assigned port 9001 to project
- But Vite config still has port 8080
- Manual editing required
- Config files out of sync

**Now:**
- Click edit button (✏️) on any project
- See current assigned port AND detected config port
- Update both registry AND config files automatically
- Keeps everything in sync!

---

## 🚀 How to Use

### Desktop App

1. **Open Desktop App**
   ```bash
   npm start
   ```

2. **Find your project** in the list

3. **Click Edit button** (✏️ icon)

4. **Edit port** in the dialog:
   ```
   Edit port for my-app:
   
   Current assigned port: 9001
   Detected config port: 8080
   
   Enter new port: [9001]
   ```

5. **Choose to update config files**:
   ```
   Update config files to use port 9001?
   
   This will update:
   - package.json (devPort field)
   - .env file (PORT variable)
   - vite.config.js/ts (if exists)
   
   [OK] [Cancel]
   ```

6. **Done!** ✅ Both registry and config files updated

---

## 📋 What Gets Updated

### package.json
```json
{
  "name": "my-app",
  "devPort": 9001,  // ← Added/updated
  "scripts": { ... }
}
```

### .env
```env
PORT=9001  # ← Added/updated
```

### vite.config.js/ts
```js
export default {
  server: {
    port: 9001  // ← Updated
  }
}
```

---

## 🔍 Config Detection

Automatically reads and detects port from:

| Framework | Config Files |
|-----------|-------------|
| **Node.js** | package.json |
| **Vite** | vite.config.js/ts/mjs |
| **Next.js** | next.config.js |
| **Nuxt** | nuxt.config.js |
| **Angular** | angular.json |
| **Env** | .env, .env.local |

---

## 💡 Use Cases

### 1. Fix Port Mismatch
```
Assigned: 9001
Vite config: 8080
→ Edit and update both to 9001
```

### 2. Change All Projects to Custom Range
```
Default range: 9000-9999
Your range: 8000-8999
→ Edit each project and update configs
```

### 3. Sync with Existing Config
```
Project already uses port 3000
→ Edit and set to 3000
→ Registry updates to match
```

---

## 🎮 Manual vs Automatic

### Manual Edit (Registry Only)
- Click Cancel when asked to update configs
- Only registry.json updates
- Config files unchanged

### Automatic Update (Recommended)
- Click OK to update configs
- Registry + config files all sync
- Everything consistent ✅

---

## 📊 Example Workflow

### Scenario: Vite App Running on Wrong Port

**Before:**
```bash
# Registry says
my-app → port 9001

# But vite.config.ts says
export default {
  server: { port: 5173 }  # Vite default
}

# Result: Port conflict or wrong port used
```

**After Edit:**
1. Click ✏️ on my-app
2. See detected port: 5173
3. Change to: 9001
4. Click OK to update configs
5. Both registry AND vite.config.ts now say 9001

**Result:** ✅ Everything in sync!

---

## 🛠️ CLI Alternative

You can also update from CLI:

```bash
# View current project
dev-port info my-app

# Remove and re-assign with correct port
dev-port remove my-app
dev-port assign my-app --port 9001

# Or manually edit config files
cd ~/projects/my-app
# Edit package.json, .env, vite.config.ts manually
```

But **Desktop App is easier!** ✨

---

## 🔒 Safety Features

### Backup Before Edit
- Registry backed up automatically
- Can restore if needed

### Confirmation Dialog
- Always asks before updating
- Shows what will change
- Can cancel anytime

### Non-Destructive
- Only updates specific fields
- Doesn't overwrite entire files
- Preserves your other config

---

## 🎯 Benefits

| Feature | Benefit |
|---------|---------|
| **Auto-detect** | Finds existing port config |
| **One-click update** | No manual editing |
| **Multiple files** | Updates all config files |
| **Safe** | Confirmation dialogs |
| **Reversible** | Can edit again anytime |

---

## 📝 Notes

### Supported Config Files
- ✅ package.json (devPort field)
- ✅ .env (PORT variable)
- ✅ vite.config.js/ts (server.port)
- 🔄 More coming soon...

### Limitations
- Some frameworks may need manual config
- Custom config formats not detected
- Always review changes before applying

---

## 🚀 Coming Soon

### Enhanced Config Editor
- Visual config editor (not just prompts)
- Edit host, not just port
- Edit multiple projects at once
- Config file preview

### Smart Detection
- More framework support
- Custom config patterns
- Port conflict warnings
- Auto-fix suggestions

### Integration
- Start/stop services from UI
- Live port monitoring
- Health checks
- Auto-restart on config change

---

## 💬 Feedback

Found a bug? Have a suggestion?

- Open an issue on GitHub
- Join Discord community
- Email: support@devportmanager.com

---

**Keep your configs in sync! 🎉**

Edit project configurations with a single click.
