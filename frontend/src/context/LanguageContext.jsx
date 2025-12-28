import { createContext, useContext, useState, useEffect } from 'react'
import allTranslations, { getSectionTranslations } from '../i18n/translations'

const LanguageContext = createContext()

const languages = [
  { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: 'EN' }
]

// Secure storage helper
const storage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Ignore
    }
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return storage.getItem('pk_language') || 'uz'
  })

  useEffect(() => {
    storage.setItem('pk_language', language)
    document.documentElement.lang = language
  }, [language])

  // Tarjima funksiyasi - section va key bo'yicha
  const t = (section, key, params = {}) => {
    const sectionData = allTranslations[section]
    let text = sectionData?.[language]?.[key] || sectionData?.uz?.[key] || key
    
    // Parametrlarni almashtirish
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param])
    })
    
    return text
  }

  // Tilni o'zgartirish
  const changeLanguage = (lang) => {
    if (languages.find(l => l.code === lang)) {
      setLanguage(lang)
    }
  }

  // Get translations for a section
  const getTranslations = (section) => {
    return getSectionTranslations(section, language)
  }

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: changeLanguage, 
      t, 
      languages,
      getTranslations,
      translations: allTranslations
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
