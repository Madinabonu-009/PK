# 🚀 Quick Reference - Play Kids

Quick reference for common tasks and commands.

---

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd play-kids

# Quick setup
make setup

# Or manual setup
make install
cp backend/.env.example backend/.env
cp bot/.env.example bot/.env
# Edit .env files
```

---

## 🏃 Running

### Development
```bash
# All services (separate terminals)
make dev

# Individual services
cd backend && npm run dev
cd frontend && npm run dev
cd bot && npm run dev
```

### Production
```bash
# Docker (recommended)
docker-compose up -d

# Manual
cd backend && npm start
cd frontend && npm run build && npx serve -s dist
cd bot && npm start
```

---

## 🧪 Testing

```bash
# All tests
make test

# With coverage
make test-coverage

# Integration tests
make test-all

# Individual
cd backend && npm test
cd frontend && npm test
```

---

## 🐳 Docker

```bash
# Build
make docker-build

# Start
make docker-up

# Stop
make docker-down

# Logs
make docker-logs

# Restart
make docker-restart
```

---

## 🔄 Database

```bash
# Run migrations
make migrate

# Or
cd backend && npm run migrate

# Seed data
cd backend && npm run seed

# Clear and reseed
cd backend && npm run seed:clear
```

---

## 📊 Monitoring

### Health Checks
```bash
# Basic
curl http://localhost:3000/api/health

# Detailed
curl http://localhost:3000/api/health/detailed

# Readiness
curl http://localhost:3000/api/health/ready

# Liveness
curl http://localhost:3000/api/health/live
```

### Metrics
```bash
# Performance metrics
curl http://localhost:3000/api/metrics

# Or use Makefile
make health
```

### Logs
```bash
# View logs
make logs

# Or directly
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Docker logs
docker-compose logs -f backend
```

---

## 💾 Backup & Restore

```bash
# Create backup
make backup

# Or
cd backend && npm run backup

# Restore (manual)
tar -xzf backups/backup-YYYYMMDD-HHMMSS.tar.gz
```

---

## 🔒 Security

### Generate Secrets
```bash
# JWT secret (64 chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Session secret (32 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Security Audit
```bash
make security-audit

# Or
npm audit
npm audit fix
```

---

## 📚 Documentation

### API Docs
```bash
# Start backend, then visit:
http://localhost:3000/api-docs

# JSON spec
http://localhost:3000/api-docs.json
```

### Guides
- [Quick Start](QUICK_START.md) - 5-minute setup
- [Deployment](DEPLOYMENT.md) - Production deployment
- [Security](SECURITY.md) - Security guidelines
- [Contributing](CONTRIBUTING.md) - How to contribute
- [Setup Checklist](SETUP_CHECKLIST.md) - Complete setup
- [Production Checklist](PRODUCTION_CHECKLIST.md) - Pre-launch
- [Improvements](IMPROVEMENTS_SUMMARY.md) - All 45 improvements

---

## 🛠️ Common Tasks

### Add New Route
```javascript
// backend/src/routes/myroute.js
import express from 'express'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Hello' })
})

export default router

// backend/src/index.js
import myRoutes from './routes/myroute.js'
app.use('/api/myroute', myRoutes)
```

### Add Validation
```javascript
import { validateRequest } from '../middleware/validation.js'
import Joi from 'joi'

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required()
})

router.post('/', validateRequest(schema), handler)
```

### Add Migration
```javascript
// backend/src/migrations/004_my_migration.js
export default {
  id: '004_my_migration',
  description: 'My migration description',
  
  async up() {
    // Migration logic
  },
  
  async down() {
    // Rollback logic
  }
}

// Register in backend/src/migrations/index.js
import migration004 from './004_my_migration.js'
migrationRunner.register(migration004)
```

### Add React Component
```javascript
// frontend/src/components/MyComponent.jsx
import React from 'react'
import PropTypes from 'prop-types'

const MyComponent = ({ title }) => {
  return <div>{title}</div>
}

MyComponent.propTypes = {
  title: PropTypes.string.required
}

export default MyComponent
```

### Use Custom Hook
```javascript
import { useFetch } from '../hooks/useFetch'

const MyComponent = () => {
  const { data, loading, error } = useFetch('/api/endpoint')
  
  if (loading) return <Loading />
  if (error) return <div>Error: {error}</div>
  
  return <div>{JSON.stringify(data)}</div>
}
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3000
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>
```

### Clear Cache
```bash
# Node modules
make clean
make install

# Docker
docker-compose down -v
docker system prune -a
```

### Reset Database
```bash
# JSON files
rm -rf backend/data/*.json
cd backend && npm run seed

# MongoDB
mongo playkids --eval "db.dropDatabase()"
```

### View Errors
```bash
# Backend errors
tail -f backend/logs/error.log

# Frontend console
# Open browser DevTools (F12)

# Docker errors
docker-compose logs backend
```

---

## 📞 Endpoints

### Authentication
```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Health & Monitoring
```bash
GET /api/health
GET /api/health/detailed
GET /api/health/ready
GET /api/health/live
GET /api/metrics
```

### Migrations
```bash
GET  /api/migrations/status
POST /api/migrations/run
POST /api/migrations/rollback
```

### Error Tracking
```bash
POST /api/errors
GET  /api/errors (admin only)
```

### Resources
```bash
GET    /api/children
POST   /api/children
GET    /api/children/:id
PUT    /api/children/:id
DELETE /api/children/:id

# Similar for:
# /api/groups
# /api/teachers
# /api/payments
# /api/attendance
# /api/menu
# etc.
```

---

## 🌐 URLs

### Development
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

### Docker
- Frontend: http://localhost:80
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

### Production
- Frontend: https://yourdomain.com
- Backend: https://api.yourdomain.com
- API Docs: https://api.yourdomain.com/api-docs

---

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development|production
PORT=3000
JWT_SECRET=<64-char-secret>
MONGODB_URI=mongodb://localhost:27017/playkids
ALLOWED_ORIGINS=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### Bot (.env)
```env
BOT_TOKEN=<telegram-bot-token>
API_URL=http://localhost:3000
```

---

## 📊 Performance Targets

- Initial Load: < 3s
- API Response: < 500ms
- Bundle Size: < 500KB
- Test Coverage: > 50%
- Lighthouse Score: > 90

---

## 🎯 Quick Commands

```bash
# Setup
make setup

# Development
make dev

# Testing
make test

# Docker
make docker-up

# Migrations
make migrate

# Backup
make backup

# Health
make health

# Security
make security-audit

# Production
make production

# Help
make help
```

---

## 📱 Contact

- **Email:** boymurodovamadinabonuf9@gmail.com
- **Telegram:** @BMM_dina09
- **Phone:** +998 94 514 09 49

---

**Version:** 1.1.0  
**Last Updated:** December 19, 2024
