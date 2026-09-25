# Production Deployment Runbook
## Korevante Studio — Multi-Cloud & Container Deployment Guide

---

**Last Updated:** September 2026  
**Platform Version:** 1.0.0  
**Supported Targets:** Docker / Docker Compose, Vercel, AWS ECS / EC2, Ubuntu VPS (Nginx + SSL)

---

## 1. Overview & Pre-requisites

Before deploying Korevante Studio into production, verify that you have:
1. **Domain Name** configured with DNS A/CNAME records.
2. **PostgreSQL 15+ Database** (Self-hosted, Neon, Supabase, AWS RDS, or Railway).
3. **Razorpay Merchant Account** (Key ID, Secret Key, and Webhook Secret for live transactions).
4. **Google Gemini API Key** (for AI suite processing).
5. **Node.js 20 LTS** or **Docker Engine 24+** with Docker Compose.

---

## 2. Environment Variables Checklist

Create a `.env.production` file (or configure environment variables in your cloud dashboard):

```env
# ==========================================
# Core Application Settings
# ==========================================
NODE_ENV="production"
PORT=3000
NEXTAUTH_URL="https://yourdomain.com"
AUTH_SECRET="generate_with_openssl_rand_hex_32"
NEXTAUTH_SECRET="generate_with_openssl_rand_hex_32"

# ==========================================
# Database Connection (PostgreSQL)
# ==========================================
DATABASE_URL="postgresql://user:password@db-host:5432/korevante_db?sslmode=require&connection_limit=20"

# ==========================================
# Payment Gateway (Razorpay Live)
# ==========================================
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="live_secret_key_here"
RAZORPAY_WEBHOOK_SECRET="live_webhook_secret_here"

# ==========================================
# AI Provider Integration
# ==========================================
GEMINI_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxx"

# ==========================================
# Optional External Integrations
# ==========================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GMAIL_USER="notifications@yourdomain.com"
GMAIL_APP_PASSWORD="smtp_app_password"
ADMIN_EMAIL="admin@yourdomain.com"
```

> [!TIP]
> Generate cryptographic secrets using:
> `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 3. Deployment Option A: Docker & Docker Compose (Recommended for VPS / Cloud VMs)

Korevante Studio includes a battle-tested multi-stage `Dockerfile` and `docker-compose.yml`.

### Step 1: Clone Repository on Server
```bash
git clone https://github.com/Anand-Kumar87/ToolBoxAI.git /opt/korevante
cd /opt/korevante
```

### Step 2: Configure Production Environment
```bash
cp .env.example .env
nano .env # Populate with live credentials
```

### Step 3: Launch Containers with Docker Compose
```bash
# Build and run containers in background
docker compose up -d --build

# Monitor live logs
docker compose logs -f app
```

### Step 4: Apply Database Migrations
```bash
docker compose exec app npx prisma db push
```

### Step 5: Verify Health Status
Test the container healthcheck endpoint:
```bash
curl -I http://localhost:3000/api/health
```
Expected output: `HTTP/1.1 200 OK` with JSON telemetry (`database: "connected"`, `status: "healthy"`).

---

## 4. Deployment Option B: Vercel (Recommended for Serverless)

1. **Import Repository:** Connect `https://github.com/Anand-Kumar87/ToolBoxAI.git` to your Vercel Dashboard.
2. **Configure Build Settings:**
   - Framework Preset: `Next.js`
   - Build Command: `prisma generate && next build`
   - Install Command: `npm install`
3. **Environment Variables:**
   - Add all keys from the `.env` checklist into Vercel **Project Settings > Environment Variables**.
   - Set `NEXTAUTH_URL` to your production domain (e.g. `https://korevante.com`).
4. **Deploy:** Click **Deploy**. Vercel will automatically build the standalone assets and deploy across edge nodes.
5. **Database Sync:** Run `npx prisma db push` from your local terminal targeting the production `DATABASE_URL`.

---

## 5. Deployment Option C: Ubuntu Linux VPS (Nginx + Let's Encrypt SSL)

For self-hosting directly on Ubuntu 22.04 / 24.04 LTS:

### Step 1: Install Node.js 20 & Nginx
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
```

### Step 2: Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/korevante`:

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and acquire SSL:
```bash
sudo ln -s /etc/nginx/sites-available/korevante /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 3: Run with PM2 Process Manager
```bash
sudo npm install -g pm2
cd /opt/korevante
npm install
npm run build
pm2 start npm --name "korevante" -- start
pm2 save
pm2 startup
```

---

## 6. Security & Go-Live Checklist

- [ ] **Strict SSL/TLS:** Enforce HTTPS redirects (Grade A on Qualys SSL Labs).
- [ ] **GDPR Cookie Banner:** Verified that the Cookie Consent Banner displays on first visit and preferences persist in `localStorage`.
- [ ] **Webhook Endpoint:** Registered Razorpay Webhook URL `https://yourdomain.com/api/webhooks/razorpay` with active webhook secret.
- [ ] **Admin Account Secured:** Changed default admin credentials (`admin@korevante.com`) to a strong, rotated password.
- [ ] **Database Connection Pool:** Configured `pgbouncer` or connection pool parameters to prevent exhaustion under traffic spikes.
- [ ] **Backups Scheduled:** Automated daily PostgreSQL backups via `pg_dump`:
  ```bash
  pg_dump -U postgres -d korevante_db -F c -b -v -f /backups/korevante_$(date +%Y%m%d).dump
  ```

---

## 7. Troubleshooting & Operational Commands

| Scenario | Command / Solution |
| :--- | :--- |
| **Check App Logs** | `docker compose logs -f --tail=100 app` or `pm2 logs korevante` |
| **Restart Application** | `docker compose restart app` or `pm2 restart korevante` |
| **Health Check Failure (503)** | Verify `DATABASE_URL` connectivity: `docker compose exec app nc -zv <db-host> 5432` |
| **Prisma Schema Update** | `npx prisma db push && docker compose restart app` |
| **Memory / CPU Stats** | `docker stats` |

---

*© 2026 Korevante Studio. Engineering & Operations Manual.*
