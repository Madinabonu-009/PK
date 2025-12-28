# Play Kids Admin Panel - Production Deployment

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)
- Nginx (reverse proxy)
- SSL certificate

## Environment Configuration

### Backend (.env.production)

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/playkids

# JWT
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token

# File Storage
UPLOAD_DIR=/var/www/playkids/uploads
MAX_FILE_SIZE=10485760

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.playkids.uz
VITE_WS_URL=wss://api.playkids.uz
```

## Build Process

### Frontend Build

```bash
cd frontend
npm ci
npm run build
```

Output: `frontend/dist/`

### Backend Build

```bash
cd backend
npm ci
npm run build  # if using TypeScript
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name playkids.uz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name playkids.uz;

    ssl_certificate /etc/letsencrypt/live/playkids.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/playkids.uz/privkey.pem;

    # Frontend
    location / {
        root /var/www/playkids/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Uploads
    location /uploads {
        alias /var/www/playkids/uploads;
        expires 30d;
    }
}
```

## PM2 Process Manager

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'playkids-api',
    script: 'backend/src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Docker Deployment

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: playkids
      POSTGRES_USER: playkids
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Database Migration

```bash
# Run migrations
npm run migrate:prod

# Seed initial data
npm run seed:prod
```

## Monitoring

### Health Check Endpoint

```
GET /api/health
```

### Logging

- Application logs: `/var/log/playkids/app.log`
- Access logs: `/var/log/nginx/playkids.access.log`
- Error logs: `/var/log/nginx/playkids.error.log`

### Monitoring Tools

- PM2 monitoring: `pm2 monit`
- Server metrics: Prometheus + Grafana
- Error tracking: Sentry

## Backup Strategy

### Database Backup

```bash
# Daily backup script
pg_dump -U playkids playkids > /backups/playkids_$(date +%Y%m%d).sql

# Restore
psql -U playkids playkids < backup.sql
```

### File Backup

```bash
# Sync uploads to backup server
rsync -avz /var/www/playkids/uploads/ backup-server:/backups/uploads/
```

## SSL Certificate

```bash
# Using Certbot
certbot --nginx -d playkids.uz -d www.playkids.uz

# Auto-renewal
certbot renew --dry-run
```

## Security Checklist

- [ ] SSL/TLS enabled
- [ ] HTTP to HTTPS redirect
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Firewall rules configured
- [ ] Regular security updates

## Rollback Procedure

```bash
# Keep previous builds
mv /var/www/playkids/frontend/dist /var/www/playkids/frontend/dist.backup

# Deploy new version
cp -r new-build/* /var/www/playkids/frontend/dist/

# Rollback if needed
rm -rf /var/www/playkids/frontend/dist
mv /var/www/playkids/frontend/dist.backup /var/www/playkids/frontend/dist
```

## Support

- Technical issues: devops@playkids.uz
- Emergency: +998 XX XXX XX XX
