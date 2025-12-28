// Time-Based UI Hook - Vaqtga qarab UI o'zgarishi
import { useState, useEffect } from 'react'

export const useTimeOfDay = () => {
  const [timeOfDay, setTimeOfDay] = useState('day')
  const [greeting, setGreeting] = useState('')
  const [theme, setTheme] = useState({})

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours()
      
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning')
        setGreeting('Xayrli tong! ☀️')
        setTheme({
          accent: '#FF9500',
          glow: 'rgba(255, 149, 0, 0.3)',
          mood: 'energetic'
        })
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('day')
        setGreeting('Xayrli kun! 🌤️')
        setTheme({
          accent: '#007AFF',
          glow: 'rgba(0, 122, 255, 0.3)',
          mood: 'productive'
        })
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening')
        setGreeting('Xayrli kech! 🌅')
        setTheme({
          accent: '#FF6B6B',
          glow: 'rgba(255, 107, 107, 0.3)',
          mood: 'relaxed'
        })
      } else {
        setTimeOfDay('night')
        setGreeting('Xayrli tun! 🌙')
        setTheme({
          accent: '#5856D6',
          glow: 'rgba(88, 86, 214, 0.3)',
          mood: 'calm'
        })
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) // Har daqiqada tekshirish
    return () => clearInterval(interval)
  }, [])

  return { timeOfDay, greeting, theme }
}

export default useTimeOfDay
