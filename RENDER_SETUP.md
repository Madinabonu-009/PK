# Render.com Deploy Qo'llanmasi

## 1. GitHub'ga Push qilish

```bash
git add .
git commit -m "Production ready"
git push origin main
```

## 2. Render.com'da Deploy

1. [render.com](https://render.com) ga kiring
2. "New" → "Blueprint" tanlang
3. GitHub repo'ni ulang
4. `render.yaml` avtomatik aniqlanadi
5. "Apply" bosing

## 3. Environment Variables (Avtomatik o'rnatiladi)

render.yaml'da barcha kerakli o'zgaruvchilar mavjud:
- `JWT_SECRET` - avtomatik generatsiya
- `TELEGRAM_BOT_TOKEN` - 8046634314:AAGdOOkGMG_V0wuYa1TQYmu2_xrOYdxkZ_M
- `TELEGRAM_CHAT_ID` - 8058402292

## 4. Keep-Alive (Uyquga ketmaslik uchun)

Render free plan 15 daqiqa inactivity'dan keyin uyquga ketadi. Buning oldini olish uchun:

### Variant A: UptimeRobot (Tavsiya etiladi)
1. [uptimerobot.com](https://uptimerobot.com) ga ro'yxatdan o'ting (bepul)
2. "Add New Monitor" bosing
3. Sozlamalar:
   - Monitor Type: HTTP(s)
   - Friendly Name: Play Kids
   - URL: `https://play-kids.onrender.com/api/health`
   - Monitoring Interval: 5 minutes
4. "Create Monitor" bosing

### Variant B: Cron-job.org
1. [cron-job.org](https://cron-job.org) ga ro'yxatdan o'ting (bepul)
2. "Create cronjob" bosing
3. Sozlamalar:
   - Title: Play Kids Keep-Alive
   - URL: `https://play-kids.onrender.com/api/health`
   - Schedule: Every 5 minutes
4. "Create" bosing

## 5. Disk Persistence

render.yaml'da disk mount sozlangan:
- Mount path: `/opt/render/project/src/backend/data`
- Size: 1GB

Bu barcha JSON ma'lumotlar saqlanishini ta'minlaydi.

## 6. Deploy tekshirish

Deploy tugagandan keyin:
1. `https://play-kids.onrender.com` - Bosh sahifa
2. `https://play-kids.onrender.com/api/health` - Health check
3. `https://play-kids.onrender.com/admin/login` - Admin panel

## 7. Admin kirish

- Username: `admin`
- Password: `admin123`

⚠️ **Muhim**: Birinchi kirishdan keyin parolni o'zgartiring!

## 8. Muammolarni hal qilish

### Oq sahifa ko'rinsa:
1. Render Logs'ni tekshiring
2. Browser Console'ni tekshiring (F12)
3. `/api/health` endpoint'ini tekshiring

### 502 Bad Gateway:
1. Render dashboard'da "Manual Deploy" qiling
2. Logs'da xatoni tekshiring

### Data yo'qolsa:
1. Disk mount to'g'ri sozlanganini tekshiring
2. `/opt/render/project/src/backend/data` mavjudligini tekshiring
