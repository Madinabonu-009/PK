# Design Document: Admin Panel UI & Weather Fixes

## Overview

Bu dizayn hujjati Play Kids admin panelida aniqlangan UI/dizayn muammolari va ob-havo widgetini haqiqiy API bilan ishlashini ta'minlash uchun mo'ljallangan. Asosiy o'zgarishlar:

1. **WeatherWidget** - OpenWeatherMap API orqali G'ijduvon uchun haqiqiy ob-havo ma'lumotlarini olish
2. **SettingsPage** - CSS layout muammolarini tuzatish
3. **UsersPage** - Karta dizaynini yaxshilash
4. **ChatPage** - Ikki ustunli layout tuzatish
5. **EnrollmentsPage** - Jadval dizaynini yaxshilash
6. **GroupsPage** - Modal dizaynini tuzatish

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Tuzatilishi kerak:                                          │
│  ├── WeatherWidget.jsx - Real API integration                │
│  ├── WeatherWidget.css - Responsive styling                  │
│  ├── SettingsPage.css - Grid layout fixes                    │
│  ├── UsersPage.css - Card overflow fixes                     │
│  ├── ChatPage.css - Two-column layout fixes                  │
│  ├── EnrollmentsPage.css - Table styling                     │
│  └── GroupsPage.css - Modal centering                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL API                              │
├─────────────────────────────────────────────────────────────┤
│  OpenWeatherMap API                                          │
│  ├── Endpoint: api.openweathermap.org/data/2.5/weather       │
│  ├── Coordinates: lat=39.6722, lon=64.6853 (G'ijduvon)       │
│  └── API Key: Environment variable                           │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. WeatherWidget Component

**Muammo:** Mock data ishlatilmoqda, "O'zbekiston" ko'rsatilmoqda

**Yechim:**
```javascript
// OpenWeatherMap API integration
const GIJDUVAN_COORDS = {
  lat: 39.6722,
  lon: 64.6853
}

const fetchWeatherData = async () => {
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${GIJDUVAN_COORDS.lat}&lon=${GIJDUVAN_COORDS.lon}&appid=${API_KEY}&units=metric&lang=uz`
  
  const response = await fetch(url)
  const data = await response.json()
  
  return {
    current: {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: mapWeatherCondition(data.weather[0].main),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6) // m/s to km/h
    },
    location: "G'ijduvon",
    lastUpdated: new Date()
  }
}
```

### 2. SettingsPage Layout

**Muammo:** Kartalar ustma-ust chiqmoqda

**Yechim:** CSS Grid layout tuzatish
```css
.settings-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

.settings-content {
  min-width: 0; /* Prevent overflow */
  overflow: hidden;
}
```

### 3. UsersPage Cards

**Muammo:** Matn kesilmoqda, kartalar notekis

**Yechim:**
```css
.user-card {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.credential-value {
  word-break: break-all;
}
```

### 4. ChatPage Layout

**Muammo:** Ikki ustunli layout buzilgan

**Yechim:**
```css
.chat-page {
  display: grid;
  grid-template-columns: 380px 1fr;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.chat-sidebar {
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.chat-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
```

### 5. EnrollmentsPage Table

**Muammo:** Jadval ustunlari notekis

**Yechim:**
```css
.enrollments-table {
  width: 100%;
  table-layout: fixed;
}

.enrollments-table th,
.enrollments-table td {
  padding: 12px 16px;
  text-align: left;
  vertical-align: middle;
}

.enrollments-table th:nth-child(1) { width: 20%; }
.enrollments-table th:nth-child(2) { width: 8%; }
.enrollments-table th:nth-child(3) { width: 15%; }
.enrollments-table th:nth-child(4) { width: 12%; }
.enrollments-table th:nth-child(5) { width: 12%; }
.enrollments-table th:nth-child(6) { width: 10%; }
.enrollments-table th:nth-child(7) { width: 10%; }
.enrollments-table th:nth-child(8) { width: 13%; }
```

### 6. GroupsPage Modal

**Muammo:** Modal markazda emas, orqa fon to'g'ri qoraytirilmagan

**Yechim:**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--card-bg);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
```

## Data Models

### Weather API Response

```typescript
interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    condition: 'clear' | 'partly_cloudy' | 'cloudy' | 'rain' | 'snow' | 'fog';
    humidity: number;
    wind: number;
  };
  location: string;
  forecast?: ForecastDay[];
  lastUpdated: Date;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
}
```

### Weather Condition Mapping

```javascript
const mapWeatherCondition = (apiCondition) => {
  const mapping = {
    'Clear': 'clear',
    'Clouds': 'partly_cloudy',
    'Rain': 'rain',
    'Drizzle': 'rain',
    'Thunderstorm': 'thunderstorm',
    'Snow': 'snow',
    'Mist': 'fog',
    'Fog': 'fog',
    'Haze': 'fog'
  }
  return mapping[apiCondition] || 'clear'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Weather API Coordinates
*For any* weather data fetch request, the API call SHALL use G'ijduvon coordinates (lat=39.6722, lon=64.6853).
**Validates: Requirements 1.1**

### Property 2: Weather Data Display Completeness
*For any* valid weather data response, the widget SHALL display temperature, condition, humidity, and wind speed fields.
**Validates: Requirements 1.2**

### Property 3: User Card Data Display
*For any* user object with name, role, and contact fields, the user card SHALL display all three fields without truncation that hides information.
**Validates: Requirements 3.2**

### Property 4: User Tab Filtering
*For any* set of users and selected tab filter, the displayed users SHALL match the filter criteria and the count badge SHALL show the correct number.
**Validates: Requirements 3.3**

### Property 5: Message Display Completeness
*For any* message object, the chat display SHALL show sender info, timestamp, and message content.
**Validates: Requirements 4.2**

## Error Handling

### Weather API Error Handling

```javascript
const fetchWeatherData = async () => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Weather API error')
    }
    const data = await response.json()
    // Cache successful response
    localStorage.setItem('weatherCache', JSON.stringify({
      data: processedData,
      timestamp: Date.now()
    }))
    return processedData
  } catch (error) {
    // Try to use cached data
    const cached = localStorage.getItem('weatherCache')
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      // Use cache if less than 1 hour old
      if (Date.now() - timestamp < 3600000) {
        return { ...data, fromCache: true }
      }
    }
    // Return fallback
    return getMockWeatherData()
  }
}
```

### CSS Overflow Prevention

```css
/* Prevent text overflow in all cards */
.card-content {
  min-width: 0;
  overflow: hidden;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
```

## Testing Strategy

### Unit Testing
- Weather API response parsing
- Weather condition mapping
- User filtering logic
- Date/time formatting

### Property-Based Testing (fast-check)
- Weather data display completeness
- User filtering correctness
- Message display completeness

### Visual Testing
- Layout responsiveness
- Modal centering
- Card overflow handling

### Integration Testing
- Weather API integration
- Real-time data updates
- Error fallback behavior

