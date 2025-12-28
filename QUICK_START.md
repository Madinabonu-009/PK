# 🚀 Quick Start Guide

Get Play Kids up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git

## 🏃 Quick Setup (Development)

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd play-kids

# Install all dependencies
make install
# OR manually:
cd backend && npm install
cd ../frontend && npm install
cd ../bot && npm install
```

### 2. Configure Environment

```bash
# Setup environment files
make setup

# This creates:
# - backend/.env
# - frontend/.env
# - bot/.env
```

### 3. Edit Environment Files

**backend/.env:**
```env
# Generate strong secret:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_generated_secret_here

# Get from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

**bot/.env:**
```env
BOT_TOKEN=same_as_backend_token
```

### 4. Start Development

```bash
# Start all services
make dev

# OR start individually:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Bot
cd bot && npm run dev
```

### 5. Access Application

- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:3000
- 📚 API Docs: http://localhost:3000/api-docs
- 🤖 Bot: Open Telegram and find your bot

## 🎯 Default Credentials

### Admin Login
```
Username: admin
Password: Admin123!
```

### Teacher Login
```
Username: teacher1
Password: Teacher123!
```

## 📦 Using Docker

```bash
# Build and start all services
make docker-up

# OR
docker-compose up -d

# View logs
make docker-logs

# Stop services
make docker-down
```

## 🧪 Running Tests

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Watch mode
cd frontend && npm run test:watch
```

## 🔍 Useful Commands

```bash
# Show all available commands
make help

# Build for production
make build

# Run linter
make lint

# Fix linting issues
make lint-fix

# Create backup
cd backend && npm run backup

# Check health
make health

# Security audit
make security-audit
```

## 📁 Project Structure

```
play-kids/
├── backend/          # Express.js API
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   └── data/         # JSON database
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── public/
├── bot/              # Telegram bot
│   └── src/
└── docker-compose.yml
```

## 🎨 Key Features

### For Parents
- View child's daily activities
- Check attendance
- See menu and meals
- Track progress
- Receive notifications

### For Teachers
- Mark attendance
- Create daily reports
- Upload photos/videos
- Communicate with parents
- Manage groups

### For Admins
- Manage children & groups
- Handle enrollments
- Track payments
- View analytics
- System configuration

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Dependencies Issues

```bash
# Clean install
make clean
make install
```

### Database Issues

```bash
# Reset database
cd backend
npm run seed:clear
npm run seed
```

## 📚 Next Steps

1. **Read Documentation**
   - [API Documentation](http://localhost:3000/api-docs)
   - [Contributing Guide](CONTRIBUTING.md)
   - [Security Guide](SECURITY.md)

2. **Explore Features**
   - Try different user roles
   - Test real-time updates
   - Upload media files
   - Generate reports

3. **Customize**
   - Update branding
   - Configure features
   - Add custom fields
   - Integrate services

## 🆘 Getting Help

### Documentation
- 📖 [Full Documentation](README.md)
- 🔒 [Security Guide](SECURITY.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- ✅ [Production Checklist](PRODUCTION_CHECKLIST.md)

### Support
- 📧 Email: boymurodovamadinabonuf9@gmail.com
- 💬 Telegram: @BMM_dina09
- 📱 Phone: +998 94 514 09 49

### Common Issues
- Check [ISSUES_REPORT.md](ISSUES_REPORT.md) for known issues
- Search existing GitHub issues
- Create new issue with details

## 🎉 You're Ready!

Your Play Kids system is now running. Start exploring and customizing!

**Happy coding! 🌱**

---

**Version:** 1.1.0
**Last Updated:** December 19, 2024
