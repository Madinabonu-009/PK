import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import './WeatherWidget.css'

// G'ijduvon koordinatalari
const GIJDUVAN_COORDS = {
  lat: 39.6722,
  lon: 64.6853
}

// Weather condition icons and backgrounds
const WEATHER_CONDITIONS = {
  clear: {
    icon: '☀️',
    label: 'Ochiq',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  },
  partly_cloudy: {
    icon: '⛅',
    label: 'Qisman bulutli',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
  },
  cloudy: {
    icon: '☁️',
    label: 'Bulutli',
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
  },
  rain: {
    icon: '🌧️',
    label: 'Yomg\'irli',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
  },
  thunderstorm: {
    icon: '⛈️',
    label: 'Momaqaldiroq',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
  },
  snow: {
    icon: '❄️',
    label: 'Qorli',
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
  },
  fog: {
    icon: '🌫️',
    label: 'Tumanli',
    gradient: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)'
  },
  wind: {
    icon: '💨',
    label: 'Shamollli',
    gradient: 'linear-gradient(135deg, #a5f3fc 0%, #22d3ee 100%)'
  }
}

// OpenWeatherMap condition mapping
const mapWeatherCondition = (apiCondition) => {
  const mapping = {
    'Clear': 'clear',
    'Clouds': 'cloudy',
    'Few clouds': 'partly_cloudy',
    'Scattered clouds': 'partly_cloudy',
    'Broken clouds': 'cloudy',
    'Overcast clouds': 'cloudy',
    'Rain': 'rain',
    'Light rain': 'rain',
    'Moderate rain': 'rain',
    'Heavy rain': 'rain',
    'Drizzle': 'rain',
    'Thunderstorm': 'thunderstorm',
    'Snow': 'snow',
    'Light snow': 'snow',
    'Mist': 'fog',
    'Fog': 'fog',
    'Haze': 'fog',
    'Smoke': 'fog',
    'Dust': 'fog'
  }
  return mapping[apiCondition] || 'clear'
}

// Fetch real weather data from OpenWeatherMap API
const fetchRealWeatherData = async () => {
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
  
  if (!API_KEY) {
    // API key yo'q - fallback data ishlatiladi (normal holat)
    return null
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${GIJDUVAN_COORDS.lat}&lon=${GIJDUVAN_COORDS.lon}&appid=${API_KEY}&units=metric&lang=uz`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    const weatherData = {
      current: {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: mapWeatherCondition(data.weather[0]?.main || 'Clear'),
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
        description: data.weather[0]?.description || ''
      },
      location: "G'ijduvon",
      forecast: null, // Free API doesn't include forecast
      lastUpdated: new Date(),
      fromCache: false
    }

    // Cache the data
    localStorage.setItem('weatherCache', JSON.stringify({
      data: weatherData,
      timestamp: Date.now()
    }))

    return weatherData
  } catch (error) {
    console.error('Weather API error:', error)
    return null
  }
}

// Get cached weather data
const getCachedWeatherData = () => {
  try {
    const cached = localStorage.getItem('weatherCache')
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      // Use cache if less than 30 minutes old
      if (Date.now() - timestamp < 1800000) {
        return { ...data, fromCache: true, lastUpdated: new Date(timestamp) }
      }
    }
  } catch (error) {
    console.error('Cache read error:', error)
  }
  return null
}

// Fallback mock data for G'ijduvon
const getMockWeatherData = () => {
  const month = new Date().getMonth()
  let baseTemp = 15
  
  // G'ijduvon seasonal temperatures
  if (month >= 5 && month <= 8) baseTemp = 32 // Summer (hot)
  else if (month >= 11 || month <= 2) baseTemp = 3 // Winter (cold)
  else if (month >= 3 && month <= 4) baseTemp = 18 // Spring
  else baseTemp = 15 // Fall
  
  const temp = baseTemp + Math.floor(Math.random() * 6) - 3
  const hour = new Date().getHours()
  let condition = 'clear'
  
  if (hour >= 6 && hour < 10) condition = 'partly_cloudy'
  else if (hour >= 10 && hour < 16) condition = 'clear'
  else if (hour >= 16 && hour < 19) condition = 'partly_cloudy'
  
  return {
    current: {
      temp,
      feelsLike: temp - 2,
      condition,
      humidity: 45 + Math.floor(Math.random() * 30),
      wind: 5 + Math.floor(Math.random() * 15)
    },
    location: "G'ijduvon",
    forecast: [
      { day: 'Bugun', high: temp + 2, low: temp - 6, condition },
      { day: 'Ertaga', high: temp + 4, low: temp - 4, condition: 'clear' },
      { day: 'Indinga', high: temp + 1, low: temp - 5, condition: 'partly_cloudy' }
    ],
    lastUpdated: new Date(),
    fromCache: false,
    isMock: true
  }
}

// Weather Widget Skeleton
function WeatherWidgetSkeleton() {
  return (
    <div className="weather-widget weather-widget--skeleton">
      <div className="weather-skeleton-main">
        <div className="weather-skeleton-icon" />
        <div className="weather-skeleton-temp" />
      </div>
      <div className="weather-skeleton-details">
        <div className="weather-skeleton-line" />
        <div className="weather-skeleton-line short" />
      </div>
    </div>
  )
}

function WeatherWidget({
  data: propData,
  loading = false,
  onRefresh,
  compact = false,
  showForecast = true
}) {
  const [data, setData] = useState(propData || null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadWeatherData = useCallback(async () => {
    setIsLoading(true)
    
    // Try to get real data first
    let weatherData = await fetchRealWeatherData()
    
    // If API fails, try cache
    if (!weatherData) {
      weatherData = getCachedWeatherData()
    }
    
    // If cache also fails, use mock data
    if (!weatherData) {
      weatherData = getMockWeatherData()
    }
    
    setData(weatherData)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (propData) {
      setData(propData)
      setIsLoading(false)
    } else {
      loadWeatherData()
    }
  }, [propData, loadWeatherData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    if (onRefresh) {
      await onRefresh()
    } else {
      // Fetch fresh data
      let weatherData = await fetchRealWeatherData()
      
      if (!weatherData) {
        weatherData = getMockWeatherData()
      }
      
      setData(weatherData)
    }
    
    setIsRefreshing(false)
  }

  if (loading || isLoading || !data) {
    return <WeatherWidgetSkeleton />
  }

  const currentCondition = WEATHER_CONDITIONS[data.current.condition] || WEATHER_CONDITIONS.clear

  return (
    <motion.div
      className={`weather-widget ${compact ? 'weather-widget--compact' : ''}`}
      style={{ background: currentCondition.gradient }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="weather-header">
        <div className="weather-location">
          <span className="weather-location-icon">📍</span>
          <span className="weather-location-name">{data.location}</span>
          {data.fromCache && <span className="weather-cache-badge">📦</span>}
        </div>
        <button 
          className={`weather-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Yangilash"
        >
          🔄
        </button>
      </div>

      {/* Current Weather */}
      <div className="weather-current">
        <div className="weather-main">
          <span className="weather-icon">{currentCondition.icon}</span>
          <div className="weather-temp-group">
            <span className="weather-temp">{data.current.temp}°</span>
            <span className="weather-condition">{currentCondition.label}</span>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="weather-detail">
            <span className="weather-detail-icon">🌡️</span>
            <span className="weather-detail-label">His qilish</span>
            <span className="weather-detail-value">{data.current.feelsLike}°</span>
          </div>
          <div className="weather-detail">
            <span className="weather-detail-icon">💧</span>
            <span className="weather-detail-label">Namlik</span>
            <span className="weather-detail-value">{data.current.humidity}%</span>
          </div>
          <div className="weather-detail">
            <span className="weather-detail-icon">💨</span>
            <span className="weather-detail-label">Shamol</span>
            <span className="weather-detail-value">{data.current.wind} km/s</span>
          </div>
        </div>
      </div>

      {/* Forecast */}
      {showForecast && !compact && data.forecast && (
        <div className="weather-forecast">
          {data.forecast.map((day, index) => {
            const dayCondition = WEATHER_CONDITIONS[day.condition] || WEATHER_CONDITIONS.clear
            return (
              <div key={index} className="weather-forecast-day">
                <span className="forecast-day-name">{day.day}</span>
                <span className="forecast-day-icon">{dayCondition.icon}</span>
                <div className="forecast-temps">
                  <span className="forecast-high">{day.high}°</span>
                  <span className="forecast-low">{day.low}°</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Last Updated */}
      <div className="weather-footer">
        <span className="weather-updated">
          Yangilangan: {formatTime(data.lastUpdated)}
          {data.isMock && ' (taxminiy)'}
        </span>
      </div>
    </motion.div>
  )
}

// Helper function to format time
function formatTime(date) {
  return new Date(date).toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Mini Weather Display (for header)
export function MiniWeather({ data, onClick }) {
  if (!data) return null
  
  const condition = WEATHER_CONDITIONS[data.current?.condition] || WEATHER_CONDITIONS.clear

  return (
    <motion.div 
      className="mini-weather"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="mini-weather-icon">{condition.icon}</span>
      <span className="mini-weather-temp">{data.current?.temp}°</span>
      <span className="mini-weather-location">{data.location}</span>
    </motion.div>
  )
}

export default WeatherWidget
export { WeatherWidgetSkeleton, WEATHER_CONDITIONS, getMockWeatherData, fetchRealWeatherData, GIJDUVAN_COORDS }
