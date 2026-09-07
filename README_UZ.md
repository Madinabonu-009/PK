# Play Kids - Bog'cha Boshqaruv Tizimi

## 🎯 Loyiha Haqida

Play Kids - zamonaviy bog'cha uchun to'liq boshqaruv tizimi. Ota-onalar uchun public website va admin panel.

**Domen:** https://pk-skus.onrender.com

---

## 📚 Asosiy Imkoniyatlar

### 🌐 Ommaviy Sahifalar (Public)
- 🏠 Bosh sahifa - Hero, Afzalliklar, Kundalik tartibi
- ℹ️ Biz haqimizda - Bog'cha tarixi va jamoasi
- 📖 O'quv dasturi - Ta'lim yo'nalishi
- 🖼️ Galereya - Rasmlar va videolar
- 🍽️ Menyu - Kunlik ovqatlar
- 👥 Xodimlar - O'qituvchilar va xizmatchilar
- 👶 Bizning bolalar - Bolalar ro'yxati
- 📝 Ro'yxatdan o'tish - Ariza berish
- 💬 Fikr-mulohaza - Ota-onalar sharhlari
- 📞 Aloqa - Bog'lanish ma'lumotlari

### 🎮 Interaktiv Bo'limlar
- **O'yinlar Markazi** (8 ta o'yin):
  - Xotira o'yini 🧠
  - Viktorina ❓
  - Puzzle 🧩
  - Rasm chizish 🎨
  - Ranglar 🌈
  - Harflar 🔤
  - Raqamlar 🔢
  - Shakllar ⭕

- **Elektron Kutubxona** (12 ta ertak):
  - Uch ayiq va Oltinsoch 🐻
  - Qizil qalpoqcha 🧒
  - Irkit o'rdakcha 🦢
  - Sher va sichqon 🦁
  - Toshbaqa va quyon 🐢
  - va boshqalar...

### 🔐 Admin Panel
**Kirish:** `/admin` - Login: `itsme` / Parol: `admin123`

- 📊 Dashboard - Statistika va grafiklar
- 👶 Bolalar - Bola ma'lumotlari CRUD
- 👥 Guruhlar - Guruhlar boshqaruvi
- 🍽️ Menyu - Ovqatlar jadvali
- 📝 Arizalar - Ro'yxatga olish
- 💳 To'lovlar - Payme/Click integratsiya
- 💰 Qarzdorlik - Qarzlar tracking + Telegram
- ✅ Davomat - Attendance marking
- 📋 Hisobotlar - Kundalik hisobotlar
- 🖼️ Galereya - Media boshqaruvi
- 💬 Fikrlar - Feedback moderatsiya
- 👨‍🏫 O'qituvchilar - Teacher management
- 👤 Foydalanuvchilar - Users CRUD
- ⚙️ Sozlamalar - Tizim sozlamalari
- 📱 Telegram - Bot integratsiya

---

## 🚀 Texnologiyalar

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database (Atlas)
- **Mongoose** - ODM
- **JWT** - Authentication
- **Winston** - Logging

### Xavfsizlik
- Helmet - Security headers
- CORS - Origin kontroli
- Rate Limiting - DDoS himoya
- Bcrypt - Password hashing
- Input Validation - XSS himoya

### Deployment
- **Frontend + Backend:** Render.com
- **Database:** MongoDB Atlas
- **File Storage:** Render persistent disk
- **Git:** GitHub Desktop

---

## 📦 Fayllar Tuzilishi

```
play-kids/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── pages/        # Sahifalar
│   │   ├── components/   # Komponentlar
│   │   ├── context/      # Context (Auth, Theme, etc.)
│   │   └── services/     # API services
│   └── public/           # Static files
│
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── models/      # MongoDB models
│   │   ├── middleware/  # Middleware
│   │   ├── config/      # Configuration
│   │   └── data/        # JSON fallback
│   └── logs/            # Winston logs
│
├── render.yaml          # Render.com config
├── SITE_ANALYSIS.md     # To'liq tahlil
├── DEPLOY_READY.md      # Deploy qo'llanma
└── README_UZ.md         # Bu fayl
```

---

## ⚙️ Muhit O'zgaruvchilari (Environment Variables)

### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://Mdindin:Mdindin2009@cluster0...

# JWT
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=24h

# Telegram
TELEGRAM_BOT_TOKEN=8046634314:AAGdOOkGMG_V0wuYa1TQYmu2_xrOYdxkZ_M
TELEGRAM_CHAT_ID=8058402292

# Security
ALLOWED_ORIGINS=https://pk-skus.onrender.com
RATE_LIMIT_MAX_REQUESTS=100
```

### Render.com
Environment Variables dashboard'da yuqoridagi qiymatlarni qo'shing.

---

## 🧪 Lokal Ishga Tushirish

### 1. Repository'ni Clone Qilish
```bash
git clone <your-repo-url>
cd play-kids
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# .env ni tahrirlang
npm run dev
```

Backend ishga tushadi: http://localhost:3000

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend ishga tushadi: http://localhost:5173

---

## 🚀 Production'ga Deploy Qilish

### GitHub Desktop orqali:
1. GitHub Desktop'ni oching
2. Changes'ni ko'ring
3. Commit message yozing
4. "Commit to main" bosing
5. "Push origin" bosing
6. Render.com avtomatik deploy qiladi (3-5 daqiqa)

### Render.com'da Deploy Ko'rish:
1. https://dashboard.render.com ga kiring
2. "pk-skus" service'ni tanlang
3. "Events" tabida deploy statusini ko'ring
4. "Logs" da xatolarni tekshiring

---

## 🐛 Tez-tez Uchraydigan Muammolar

### 1. 502 Bad Gateway
**Sabab:** Server cold start (uxlab qolgan)  
**Yechim:** 1-2 daqiqa kuting, qayta urinib ko'ring

### 2. MongoDB Ulanmayapti
**Sabab:** IP whitelist qo'shilmagan  
**Yechim:**
1. MongoDB Atlas → Network Access
2. `0.0.0.0/0` qo'shing
3. 5 daqiqa kuting

### 3. Gallery Fayl Yuklanmayapti
**Sabab:** Multer middleware yo'q  
**Yechim:** Hozircha URL orqali qo'shing

### 4. Qarzdorlikda Child Ko'rinmayapti
**Sabab:** Eski child ID'lar  
**Yechim:** `/api/debts/regenerate` chaqiring

---

## 📊 API Endpoints

### Public Endpoints
```
GET  /api/gallery              - Galereya
GET  /api/teachers             - O'qituvchilar
GET  /api/menu                 - Menyu
GET  /api/library              - Kutubxona
GET  /api/feedback             - Fikrlar
POST /api/enrollments          - Ariza yuborish
POST /api/contact              - Xabar yuborish
```

### Admin Endpoints (Auth kerak)
```
POST /api/auth/login           - Login
GET  /api/children             - Bolalar
GET  /api/groups               - Guruhlar
GET  /api/debts                - Qarzdorlik
GET  /api/payments             - To'lovlar
GET  /api/attendance           - Davomat
POST /api/debts/regenerate     - Qarzlarni yangilash
POST /api/debts/:id/remind     - Eslatma yuborish
```

**Swagger Docs:** https://pk-skus.onrender.com/api-docs

---

## 🔒 Kirish Ma'lumotlari

### Admin
- **Username:** `itsme`
- **Password:** `admin123`

### O'qituvchilar
- **Nilufar:** `nilufar` / `teacher123`
- **Madina:** `madina` / `teacher123`
- **Dilnoza:** `dilnoza` / `teacher123`

### MongoDB
- **URI:** `mongodb+srv://Mdindin:Mdindin2009@cluster0.ne3n1dj.mongodb.net/playkids`

### Telegram
- **Bot Token:** `8046634314:AAGdOOkGMG_V0wuYa1TQYmu2_xrOYdxkZ_M`
- **Chat ID:** `8058402292`

---

## 📞 Yordam

**Hujjatlar:**
- `SITE_ANALYSIS.md` - To'liq tahlil
- `DEPLOY_READY.md` - Deploy qo'llanma
- `PRODUCTION_CHECKLIST.md` - Deploy checklist

**Linklar:**
- Production: https://pk-skus.onrender.com
- Admin: https://pk-skus.onrender.com/admin
- API Docs: https://pk-skus.onrender.com/api-docs
- Health: https://pk-skus.onrender.com/api/health

---

## 📄 Litsenziya

© 2026 Play Kids. Barcha huquqlar himoyalangan.

**Ishlab chiqaruvchi:** Kiro AI  
**Loyiha:** Play Kids Kindergarten Management System
