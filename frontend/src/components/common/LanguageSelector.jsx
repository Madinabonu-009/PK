import { useLanguage } from '../../context/LanguageContext'
import './LanguageSelector.css'

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage()

  const languages = [
    { code: 'uz', flag: '🇺🇿', name: 'O\'zbek' },
    { code: 'ru', flag: '🇷🇺', name: 'Русский' },
    { code: 'en', flag: 'EN', name: 'English' }
  ]

  return (
    <div className="language-selector">
      {languages.map(lang => (
        <button
          key={lang.code}
          className={`lang-btn ${language === lang.code ? 'active' : ''}`}
          onClick={() => setLanguage(lang.code)}
          title={lang.name}
          aria-label={`Tilni o'zgartirish: ${lang.name}`}
          aria-pressed={language === lang.code}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  )
}

export default LanguageSelector
