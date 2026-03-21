# Edit Buttons Fix - Testing Guide

## ✅ What Was Fixed

### Problem
- Edit button on config files wasn't working
- Run button on NPM scripts wasn't working
- Click handlers weren't calling the functions

### Solution
Wrapped functions in window-exposed wrappers with logging:
```javascript
window.editConfigFile = function(filePath, currentPort) {
  console.log('Edit clicked:', filePath, currentPort);
  editConfigFile(filePath, currentPort);
};

window.runNpmScript = function(scriptName, scriptCommand) {
  console.log('Run script clicked:', scriptName, scriptCommand);
  runNpmScript(scriptName, scriptCommand);
};
```

---

## 🧪 How to Test

### 1. Open Desktop App
```bash
npm start
```

### 2. Go to Tools Tab 🛠️

### 3. Select a Project
```
Dropdown: devopstoolkit (Port: 8080)

Path: d:\Dev\GitHub\devopstoolkit  ✅
Port: 8080  ✅
Type: node  ✅
```

### 4. Test Config Files Edit
```
1. Click "🔍 Load Config Files"
2. Should see list of config files
3. Each file has "✏️ Edit" button
4. Click "✏️ Edit"
5. Check browser console (Ctrl+Shift+J)
   → Should log: "Edit clicked: .env 8080"
6. Prompt should appear: "Edit port in .env:"
7. Enter new port: 8081
8. Should update file and show success
```

### 5. Test NPM Scripts Run
```
1. Click "🔍 Load Scripts"
2. Should see list of npm scripts
3. Each script has "▶️ Run" button
4. Click "▶️ Run" on "dev"
5. Check browser console (Ctrl+Shift+J)
   → Should log: "Run script clicked: dev npm run dev"
6. Terminal should show output
7. Process should start
```

---

## 🐛 Troubleshooting

### Edit Button Still Not Working

**Check Console:**
```
1. In desktop app, press Ctrl+Shift+J
2. Click "✏️ Edit" button
3. Should see: "Edit clicked: .env 8080"

If nothing:
- Function not exposed properly
- Restart desktop app
```

**Check Prompt:**
```
1. Click "✏️ Edit"
2. Prompt should appear
3. If no prompt:
   - Check if filePath is valid
   - Check if currentPort is valid
```

**Check Update:**
```
1. Enter new port in prompt
2. Should see terminal output
3. Should show: "✅ Updated .env with port 8081"
4. If error:
   - Check file permissions
   - Check file path exists
```

### Run Script Button Not Working

**Check Console:**
```
1. Press Ctrl+Shift+J
2. Click "▶️ Run" button
3. Should log: "Run script clicked: dev npm run dev"

If nothing:
- Function not exposed
- Restart app
```

**Check Terminal:**
```
1. Click "▶️ Run"
2. Terminal should show output
3. Should see npm output

If nothing:
- Check project has package.json
- Check script exists
- Check basePath is set
```

---

## ✅ Expected Behavior

### Config File Edit
```
Click "✏️ Edit" on .env (port: 8080)
↓
Prompt: "Edit port in .env: [8080]"
↓
Enter: 8081
↓
Terminal: "[5:00:00 AM] Updating .env to port 8081..."
Terminal: "[5:00:01 AM] ✅ Updated .env with port 8081"
Terminal: "[5:00:01 AM] Backup: C:\Users\...\ .env.2026-03-21T05-00-01.bak"
↓
Config list refreshes
```

### NPM Script Run
```
Click "▶️ Run" on dev
↓
Terminal: "[5:00:00 AM] 🚀 Running: npm run dev"
Terminal: "[5:00:00 AM] In: d:\Dev\GitHub\devopstoolkit"
Terminal: "[5:00:01 AM] > devopstoolkit@1.0.0 dev"
Terminal: "[5:00:01 AM] > vite"
Terminal: "[5:00:02 AM]   VITE v4.0.0  ready in 350 ms"
Terminal: "[5:00:02 AM]   ➜  Local:   http://localhost:5173/"
Terminal: "[5:00:02 AM] ✅ Process started (PID: 12345)"
↓
"⛔ Kill Process" button appears
```

---

## 📝 Notes

### Console Logging
The console.log statements are for debugging. Once confirmed working, they can be removed or kept for troubleshooting.

### Function Exposure
Functions must be exposed to window object for onclick handlers to work:
```html
<button onclick="editConfigFile('.env', 8080)">✏️ Edit</button>
```
```javascript
window.editConfigFile = function(...) { ... };
```

### Error Handling
Both functions have try-catch blocks to show errors in terminal if something goes wrong.

---

## 🎯 Success Criteria

- [ ] Edit button opens prompt
- [ ] Prompt shows current port
- [ ] Entering new port updates file
- [ ] Backup is created
- [ ] Terminal shows success message
- [ ] Run button starts npm command
- [ ] Terminal shows npm output
- [ ] Process PID is shown
- [ ] Kill button works

---

**If all above work → Buttons are fixed! ✅**
