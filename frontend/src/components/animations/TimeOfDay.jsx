// 🌀 7. TIME-OF-DAY ANIMATION - Sayt vaqt bilan yashaydi
import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const TimeContext = createContext()

const getTimeOfDay = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'   // 5:00 - 11:59
  if (hour >= 12 && hour < 17) return 'afternoon' // 12:00 - 16:59
  if (hour >= 17 && hour < 21) return 'evening'   // 17:00 - 20:59
  return 'night' // 21:00 - 4:59
}

export const TimeProvider = ({ children }) => {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay)

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Animation settings based on time
  const animationSettings = useMemo(() => {
    switch (timeOfDay) {
      case 'morning':
        return {
          speed: 0.8,        // Yumshoq, sekin
          intensity: 0.7,    // Kam intensiv
          shadowDepth: 0.3,  // Yengil soya
          colorSaturation: 0.9,
          greeting: '🌅',
          mood: 'calm'
        }
      case 'afternoon':
        return {
          speed: 1.0,        // Normal tezlik
          intensity: 1.0,    // To'liq intensiv
          shadowDepth: 0.5,  // O'rtacha soya
          colorSaturation: 1.0,
          greeting: '☀️',
          mood: 'energetic'
        }
      case 'evening':
        return {
          speed: 0.9,        // Biroz sekinroq
          intensity: 0.85,   // Biroz kamroq
          shadowDepth: 0.6,  // Chuqurroq soya
          colorSaturation: 0.95,
          greeting: '🌆',
          mood: 'relaxed'
        }
      case 'night':
        return {
          speed: 0.7,        // Juda sekin
          intensity: 0.6,    // Kam intensiv
          shadowDepth: 0.8,  // Chuqur soya
          colorSaturation: 0.85,
          greeting: '🌙',
          mood: 'peaceful'
        }
      default:
        return {
          speed: 1.0,
          intensity: 1.0,
          shadowDepth: 0.5,
          colorSaturation: 1.0,
          greeting: '👋',
          mood: 'neutral'
        }
    }
  }, [timeOfDay])

  // Get adjusted duration
  const getAdjustedDuration = (baseDuration) => {
    return baseDuration / animationSettings.speed
  }

  // Get adjusted delay
  const getAdjustedDelay = (baseDelay) => {
    return baseDelay / animationSettings.speed
  }

  return (
    <TimeContext.Provider value={{
      timeOfDay,
      ...animationSettings,
      getAdjustedDuration,
      getAdjustedDelay
    }}>
      {children}
    </TimeContext.Provider>
  )
}

export const useTimeOfDay = () => {
  const context = useContext(TimeContext)
  if (!context) {
    return {
      timeOfDay: 'afternoon',
      speed: 1,
      intensity: 1,
      shadowDepth: 0.5,
      colorSaturation: 1,
      greeting: '👋',
      mood: 'neutral',
      getAdjustedDuration: (d) => d,
      getAdjustedDelay: (d) => d
    }
  }
  return context
}

// Time-aware greeting component
export const TimeGreeting = ({ name }) => {
  const { timeOfDay, greeting } = useTimeOfDay()

  const greetings = {
    morning: { uz: 'Xayrli tong', ru: 'Доброе утро', en: 'Good morning' },
    afternoon: { uz: 'Xayrli kun', ru: 'Добрый день', en: 'Good afternoon' },
    evening: { uz: 'Xayrli kech', ru: 'Добрый вечер', en: 'Good evening' },
    night: { uz: 'Xayrli tun', ru: 'Доброй ночи', en: 'Good night' }
  }

  return (
    <span className="time-greeting">
      {greeting} {greetings[timeOfDay]?.uz || 'Salom'}{name ? `, ${name}` : ''}!
    </span>
  )
}
