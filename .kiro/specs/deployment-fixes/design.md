# Design Document: Deployment Fixes

## Overview

Bu dizayn hujjati deploy qilingan loyihadagi muammolarni tuzatish uchun texnik yechimlarni taqdim etadi. Asosiy muammolar:

1. **FeedbackPage.jsx** - hardcoded `http://localhost:3000` URL ishlatilgan
2. **GalleryPage.jsx** - media URL lar ba'zan noto'g'ri resolve qilinadi
3. **Library.jsx** - YouTube videolari ochilmayapti (embed URL formati)
4. **MobileBottomNav.jsx** - `/today`, `/calendar`, `/blog`, `/more` route lari mavjud emas

## Architecture

### Muammo Tahlili

```
┌─────────────────────────────────────────────────────────────┐
│                    MUAMMOLAR XARITASI                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. FeedbackPage.jsx                                        │
│     ├── fetch('http://localhost:3000/api/feedback')         │
│     └── Production da ishlamaydi ❌                         │
│                                                             │
│  2. GalleryPage.jsx                                         │
│     ├── API_BASE = VITE_API_URL?.replace('/api', '')        │
│     └── Production da /api → '' bo'ladi ❌                  │
│                                                             │
│  3. Library.jsx                                             │
│     ├── YouTube embed URL: /embed/VIDEO_ID                  │
│     └── Ba'zi videolar noto'g'ri ID bilan ❌                │
│                                                             │
│  4. MobileBottomNav.jsx                                     │
│     ├── /today route - mavjud emas ❌                       │
│     ├── /calendar route - mavjud emas ❌                    │
│     ├── /blog route - mavjud emas ❌                        │
│     └── /more route - mavjud emas ❌                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. FeedbackPage.jsx Tuzatish

**Muammo:** Hardcoded localhost URL
```javascript
// NOTO'G'RI ❌
const response = await fetch('http://localhost:3000/api/feedback')

// TO'G'RI ✅
import api from '../../services/api'
const response = await api.get('/feedback')
```

### 2. GalleryPage.jsx Tuzatish

**Muammo:** API_BASE noto'g'ri hisoblanyapti
```javascript
// NOTO'G'RI ❌
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'
// Production da: '/api'.replace('/api', '') = '' (bo'sh string)

// TO'G'RI ✅
const API_BASE = import.meta.env.VITE_BACKEND_URL || 
                 (import.meta.env.DEV ? 'http://localhost:3000' : '')
```

### 3. Library.jsx YouTube URL Tuzatish

**Muammo:** Ba'zi YouTube videolar noto'g'ri embed formatda
```javascript
// Tekshirish kerak bo'lgan videolar:
// - https://www.youtube.com/embed/VIDEO_ID - TO'G'RI
// - https://www.youtube.com/watch?v=VIDEO_ID - NOTO'G'RI (embed emas)
```

### 4. MobileBottomNav.jsx Route Tuzatish

**Muammo:** Mavjud bo'lmagan route larga yo'naltirish
```javascript
// NOTO'G'RI ❌
{ path: '/today', icon: '📖', label: txt.today }     // Route mavjud emas
{ path: '/calendar', icon: '📅', label: txt.calendar } // Route mavjud emas

// TO'G'RI ✅
{ path: '/daily-life', icon: '📖', label: txt.today }  // Mavjud route
{ path: '/curriculum', icon: '📅', label: txt.calendar } // Mavjud route
```

## Data Models

### Environment Variables

```
# .env.production
VITE_API_URL=/api                    # API endpoint (relative)
VITE_BACKEND_URL=                    # Backend URL (for media files)
VITE_WS_URL=wss://playk.onrender.com # WebSocket URL
```

### API Response Format

```typescript
// Feedback API
interface FeedbackResponse {
  id: string
  type: 'feedback' | 'question'
  rating: number
  comment: string
  parentName: string
  isApproved: boolean
  createdAt: string
}

// Gallery API
interface GalleryItem {
  id: string
  type: 'image' | 'video'
  url: string
  title: string
  album: string
  thumbnail?: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API URL Resolution

*For any* API request made by the Feedback_System, the request URL SHALL NOT contain 'localhost' when running in production environment.

**Validates: Requirements 1.1, 1.2**

### Property 2: Media URL Completeness

*For any* media item in the Gallery_System, if the URL starts with '/uploads/', the resolved URL SHALL be a complete URL that includes the backend server address.

**Validates: Requirements 2.1, 2.2**

### Property 3: YouTube Embed Format

*For any* YouTube video in the Library_System, the embed URL SHALL match the pattern `https://www.youtube.com/embed/[VIDEO_ID]`.

**Validates: Requirements 3.1, 3.2**

### Property 4: Mobile Navigation Route Validity

*For any* navigation item in the Mobile_Navigation, the target path SHALL exist in the application's route configuration.

**Validates: Requirements 4.1, 4.2, 4.3**

## Error Handling

### API Errors
- Network errors: Retry 3 marta, keyin xato xabarini ko'rsatish
- 404 errors: Fallback data ishlatish (galereya uchun)
- 500 errors: User-friendly xato xabari

### Media Loading Errors
- Image load error: Placeholder ko'rsatish
- Video load error: Error message ko'rsatish
- YouTube unavailable: Alternative message

## Testing Strategy

### Unit Tests
- API URL generation funksiyalarini test qilish
- Media URL resolution funksiyalarini test qilish
- Route validation funksiyalarini test qilish

### Property-Based Tests
- API URL lar localhost bo'lmasligini tekshirish
- Media URL lar to'liq bo'lishini tekshirish
- YouTube URL formati to'g'riligini tekshirish

### Integration Tests
- Feedback form submission
- Gallery media loading
- Library video playback
- Mobile navigation routing
