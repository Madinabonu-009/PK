# 🚀 Deployment Guide

Complete guide for deploying Play Kids to production.

## 📋 Prerequisites

- Node.js 18+ or Docker
- MongoDB instance (optional)
- Domain name with SSL certificate
- Server with 2GB+ RAM

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd play-kids
```

### 2. Configure Environment Variables

Create `.env` files for each service:

#### Backend (.env)
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-strong-secret>
MONGODB_URI=mongodb://localhost:27017/playkids
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

#### Bot (.env)
```env
BOT_TOKEN=<telegram-bot-token>
API_URL=http://backend:3000
```

### 3. Generate Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🐳 Docker Deployment (Recommended)

### 1. Build Images

```bash
# Build all services
docker-compose build

# Or build individually
docker build -t playkids-backend ./backend
docker build -t playkids-frontend ./frontend
docker build -t playkids-bot ./bot
```

### 2. Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Run Migrations

```bash
# Access backend container
docker-compose exec backend sh

# Run migrations
npm run migrate
```

### 4. Health Check

```bash
# Check backend health
curl http://localhost:3000/api/health

# Check frontend
curl http://localhost:80
```

## 📦 Manual Deployment

### Backend

```bash
cd backend

# Install dependencies
npm ci --production

# Run migrations
npm run migrate

# Start server
npm start
```

### Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Serve with nginx or serve
npx serve -s dist -p 80
```

### Bot

```bash
cd bot

# Install dependencies
npm ci --production

# Start bot
npm start
```

## 🌐 Nginx Configuration

### Backend Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Frontend

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/playkids/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 🔒 SSL/TLS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## 🔄 Process Management

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start src/index.js --name playkids-backend

# Start bot
cd bot
pm2 start src/index.js --name playkids-bot

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

### PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'playkids-backend',
      cwd: './backend',
      script: 'src/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'playkids-bot',
      cwd: './bot',
      script: 'src/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

Start with: `pm2 start ecosystem.config.js`

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/api/health

# Detailed health
curl https://api.yourdomain.com/api/health/detailed

# Metrics
curl https://api.yourdomain.com/api/metrics
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f bot

# PM2 logs
pm2 logs playkids-backend
pm2 logs playkids-bot

# System logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable security headers
- [ ] Setup backup automation
- [ ] Configure monitoring alerts
- [ ] Review and update dependencies
- [ ] Enable audit logging
- [ ] Setup intrusion detection

## 💾 Backup Strategy

### Automated Backups

```bash
# Run backup script
cd backend
npm run backup

# Schedule with cron
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/backend && npm run backup
```

### Manual Backup

```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz backend/data

# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/playkids" --out=backup-$(date +%Y%m%d)
```

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild Docker images
docker-compose build

# Restart services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate
```

### Database Migrations

```bash
# Check migration status
curl -H "Authorization: Bearer <admin-token>" \
  https://api.yourdomain.com/api/migrations/status

# Run pending migrations
curl -X POST -H "Authorization: Bearer <admin-token>" \
  https://api.yourdomain.com/api/migrations/run
```

## 📈 Performance Optimization

### Enable Caching

- Configure Redis for session storage
- Enable CDN for static assets
- Setup database query caching
- Enable HTTP/2

### Database Optimization

```bash
# MongoDB indexes
mongo playkids --eval "db.children.createIndex({parentId: 1})"
mongo playkids --eval "db.payments.createIndex({childId: 1, date: -1})"
```

## 🚨 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs backend

# Check port availability
netstat -tulpn | grep 3000

# Verify environment variables
docker-compose exec backend env
```

### Database Connection Issues

```bash
# Test MongoDB connection
mongo --eval "db.adminCommand('ping')"

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Restart services
docker-compose restart

# Clear logs
docker-compose exec backend sh -c "truncate -s 0 logs/*.log"
```

## 📞 Support

For deployment issues:
- 📧 Email: boymurodovamadinabonuf9@gmail.com
- 💬 Telegram: @BMM_dina09
- 📱 Phone: +998 94 514 09 49

## 📚 Additional Resources

- [Production Checklist](PRODUCTION_CHECKLIST.md)
- [Quick Start Guide](QUICK_START.md)
- [Contributing Guide](CONTRIBUTING.md)
- [API Documentation](https://api.yourdomain.com/api-docs)

---

**Last Updated:** December 19, 2024
