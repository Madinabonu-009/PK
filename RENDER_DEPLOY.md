# 🚀 Render.com ga Deploy Qilish

## Siz Qilishingiz Kerak Bo'lgan Qadamlar

### 1️⃣ GitHub'ga Push Qilish
Terminal/CMD da quyidagi buyruqlarni bajaring:

```bash
git add .
git commit -m "Production ready - Play Kids"
git push origin main
```

### 2️⃣ Render.com da Yangi Service Yaratish
1. [render.com](https://render.com) saytiga kiring (GitHub bilan login qiling)
2. Dashboard'da **"New +"** tugmasini bosing
3. **"Blueprint"** tanlang
4. GitHub repository'ni tanlang (play-kids yoki loyiha nomi)
5. `render.yaml` fayli avtomatik aniqlanadi
6. **"Apply"** tugmasini bosing

### 3️⃣ Environment Variables (Ixtiyoriy)
Render Dashboard → Service → Environment bo'limida:

| O'zgaruvchi | Qiymat | Talab |
|-------------|--------|-------|
| `TELEGRAM_BOT_TOKEN` | Bot tokeningiz | Telegram uchun |
| `TELEGRAM_CHAT_ID` | Chat ID | Telegram uchun |
| `VITE_OPENWEATHER_API_KEY` | OpenWeather API | Ob-havo uchun |

> ⚠️ Bu o'zgaruvchilar ixtiyoriy. Ularsiz ham loyiha ishlaydi.

### 4️⃣ Deploy Tugashini Kutish
- Deploy jarayoni 5-10 daqiqa davom etadi
- Status "Live" bo'lganda tayyor

---

## 📋 Loyiha Ma'lumotlari

**Manzil:** Buxoro viloyati, G'ijduvon tumani  
**Telefon:** +998 94 514 09 49  
**Email:** boymurodovamadinabonuf9@gmail.com  
**Ish vaqti:** Dushanba-Juma 9:00-18:00, Shanba 9:00-16:00  
**Oylik to'lov:** 500,000 so'm

---

## 🔐 Admin Panel

**URL:** `https://[your-app].onrender.com/admin/login`  
**Login:** `itsme`  
**Parol:** `admin123`

---

## ✅ Tayyor Funksiyalar

- ✅ Health check endpoint (`/api/health`)
- ✅ Barcha API routes
- ✅ Settings va Users API
- ✅ Data persistence (Render disk)
- ✅ Weather widget (mock data bilan)
- ✅ Google Maps (API kerak emas)
- ✅ Telegram (token bo'lmasa ham xato bermaydi)

---

## 🐛 Muammolar Bo'lsa

### "Service Unavailable"
- Render Logs'ni tekshiring
- 5-10 daqiqa kutib turing

### Data yo'qoldi
- Render disk mount tekshiring
- `backend/data/` papkasi mavjudligini tekshiring

### Telegram ishlamayapti
1. @BotFather dan bot yarating
2. Bot tokenini oling
3. Guruh yarating, botni qo'shing
4. Chat ID ni oling
5. Render Environment'ga qo'shing

---

## 📞 Yordam

- Telegram: [@Boymurodova_Madinabonu](https://t.me/Boymurodova_Madinabonu)
- Email: boymurodovamadinabonu009@gmail.com
