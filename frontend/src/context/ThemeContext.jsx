import { createContext, useContext, useState, useEffect } from 'react'
import secureStorage from '../utils/secureStorage'

const ThemeContext = createContext()

// Faqat colorful theme
const themes = ['colorful']

const themeInfo = {
  colorful: { icon: '🌈', name: { uz: 'Rang-barang', ru: 'Красочная', en: 'Colorful' } }
}

export function ThemeProvider({ children }) {
  const [theme] = useState('colorful')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'colorful')
  }, [])

  const cycleTheme = () => {
    // Faqat bitta theme - hech narsa qilmaydi
  }

  const setTheme = () => {
    // Faqat bitta theme - hech narsa qilmaydi
  }

  const darkMode = false

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes, themeInfo, darkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
