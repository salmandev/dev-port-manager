# localtest.me - How It Works

## ⚠️ Important Clarification

### What localtest.me DOES ✅

`*.localtest.me` is a **wildcard DNS service** that:
- Resolves ALL subdomains to `127.0.0.1`
- Works immediately, no configuration needed
- No `/etc/hosts` editing required

**Example:**
```
my-app.localtest.me     → 127.0.0.1
jenkins.localtest.me    → 127.0.0.1
anything.localtest.me   → 127.0.0.1
```

### What localtest.me Does NOT Do ❌

**It does NOT do port forwarding!**

Each port must be accessed explicitly:

```
✅ my-app.localtest.me:9000  → Works (if server running on port 9000)
❌ my-app.localtest.me        → Doesn't work (no default port)
❌ my-app.localtest.me:80    → Doesn't work (nothing on port 80)
```

---

## 🎯 How It Actually Works

### DNS Resolution Only

```
User types: http://my-app.localtest.me:9000

1. DNS resolves: my-app.localtest.me → 127.0.0.1
2. Browser connects to: 127.0.0.1:9000
3. If server is running on 9000 → ✅ Works
4. If nothing on 9000 → ❌ ERR_CONNECTION_REFUSED
```

### No Port Forwarding

Unlike Docker or nginx, localtest.me does **NOT**:
- Forward port 80 to 9000
- Forward port 443 to 9443
- Any automatic port mapping

**You must specify the exact port:**
```
http://my-app.localtest.me:9000  ← Port 9000 explicitly
```

---

## 🔧 Solutions for Easier Access

### Option 1: Always Use Full URL (Current Behavior)

```
http://my-app.localtest.me:9000
http://jenkins.localtest.me:9001
http://react-app.localtest.me:3000
```

**Pros:**
- Simple, no setup
- Works immediately

**Cons:**
- Must remember/type port numbers

---

### Option 2: Use Browser Bookmarks

Bookmark all your projects:
- `Dev - My App` → http://my-app.localtest.me:9000
- `Dev - Jenkins` → http://jenkins.localtest.me:9001

**Pros:**
- One-click access
- No extra software

**Cons:**
- Manual bookmark management

---

### Option 3: Setup Port Forwarding (Advanced)

#### Windows (with netsh)
```cmd
# Forward port 80 to 9000 for specific app
netsh interface portproxy add v4tov4 listenport=80 connectport=9000 connectaddress=127.0.0.1
```

#### macOS/Linux (with iptables/socat)
```bash
# Forward port 80 to 9000
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 9000

# Or with socat
sudo socat TCP-LISTEN:80,fork TCP:127.0.0.1:9000
```

#### Docker Desktop (has built-in forwarding)
Docker Desktop automatically forwards ports, but this is Docker-specific.

---

### Option 4: Use a Local Proxy/Reverse Proxy

#### nginx Configuration
```nginx
server {
    listen 80;
    server_name my-app.localtest.me;
    
    location / {
        proxy_pass http://127.0.0.1:9000;
    }
}
```

Then access: `http://my-app.localtest.me` (no port needed!)

#### Caddy (easier than nginx)
```Caddyfile
my-app.localtest.me {
    reverse_proxy localhost:9000
}
```

---

## 📊 Comparison

| Method | Example URL | Setup Required |
|--------|-------------|----------------|
| **Direct (current)** | `my-app.localtest.me:9000` | None ✅ |
| **Bookmarks** | `my-app.localtest.me:9000` | Manual bookmarks |
| **Port Forwarding** | `my-app.localtest.me` | Admin rights, config |
| **Reverse Proxy** | `my-app.localtest.me` | Proxy server setup |

---

## 💡 Dev Port Manager Approach

We use **Option 1 (Direct)** because:

✅ **Pros:**
- Zero configuration
- Works on all platforms immediately
- No admin/sudo required
- No extra processes running
- Cross-platform compatible

❌ **Cons:**
- Must include port in URL

---

## 🚀 Future Enhancement (Coming Soon)

### Built-in Reverse Proxy

We're considering adding an optional reverse proxy feature:

```bash
# Enable reverse proxy mode
dev-port proxy enable

# Now access without ports:
http://my-app.localtest.me  → proxies to :9000
http://jenkins.localtest.me → proxies to :9001
```

**Status:** Planned for v1.2.0

---

## 🎯 Current Workflow

### Access Your Projects

1. **Open Desktop App or Web Dashboard**
   ```bash
   npm start
   # or
   npm run server  # then http://localhost:4000
   ```

2. **Click project URL** in the list
   - Opens in your browser
   - URL includes port: `http://my-app.localtest.me:9000`

3. **If connection fails:**
   - Check if server is actually running on that port
   - Use `dev-port check 9000` to verify port is free
   - Start your application first!

---

## ❓ FAQ

### Q: Why doesn't localtest.me work without port?
**A:** localtest.me only does DNS resolution, not port forwarding. You must specify the port.

### Q: Can I access without typing port?
**A:** Yes, setup a reverse proxy (nginx, Caddy) or use browser bookmarks.

### Q: Will you add port forwarding?
**A:** Considering it as an optional feature. Vote on GitHub Issues.

### Q: Docker does port forwarding, why not this?
**A:** Docker runs a VM with networking. localtest.me is just DNS. Different technologies.

### Q: How do I manage 100+ projects without typing ports?
**A:** Use the Desktop App or Web Dashboard - click URLs directly from the list!

---

## 🔗 Resources

- **localtest.me Info:** https://github.com/lukechilds/localtest.me
- **Reverse Proxy Setup:** https://nginx.org/en/docs/
- **Caddy Server:** https://caddyserver.com/

---

**Summary:** localtest.me resolves domains to 127.0.0.1, but you still need to specify the port. For easier access, use the Desktop App, bookmarks, or setup a reverse proxy.
