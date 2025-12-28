import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import './ThemeToggle.css'

const ThemeToggle = () => {
  const { theme, cycleTheme, themeInfo } = useTheme()
  const { language } = useLanguage()

  const currentTheme = themeInfo[theme]

  return (
    <button 
      className="theme-toggle" 
      onClick={cycleTheme}
      title={currentTheme.name[language]}
      aria-label={`Mavzu o'zgartirish: ${currentTheme.name[language]}`}
    >
      {currentTheme.icon}
    </button>
  )
}

export default ThemeToggle
