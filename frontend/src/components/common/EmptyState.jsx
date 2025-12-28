/**
 * Empty State Component
 * Issue #33: Bo'sh ro'yxatlar uchun placeholder
 */

import { memo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import './EmptyState.css'

const defaultTexts = {
  uz: {
    noData: "Ma'lumot topilmadi",
    noResults: "Natija topilmadi",
    noItems: "Hozircha hech narsa yo'q",
    startAdding: "Qo'shishni boshlang"
  },
  ru: {
    noData: "Данные не найдены",
    noResults: "Результаты не найдены",
    noItems: "Пока ничего нет",
    startAdding: "Начните добавлять"
  },
  en: {
    noData: "No data found",
    noResults: "No results found",
    noItems: "Nothing here yet",
    startAdding: "Start adding"
  }
}

const EmptyState = memo(function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  actionLabel,
  type = 'default', // 'default', 'search', 'error'
  size = 'medium' // 'small', 'medium', 'large'
}) {
  const { language } = useLanguage()
  const texts = defaultTexts[language] || defaultTexts.en

  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: '🔍',
          title: texts.noResults,
          description: language === 'uz' ? "Boshqa so'z bilan qidirib ko'ring" :
                       language === 'ru' ? "Попробуйте другой запрос" :
                       "Try a different search term"
        }
      case 'error':
        return {
          icon: '😕',
          title: texts.noData,
          description: language === 'uz' ? "Xatolik yuz berdi" :
                       language === 'ru' ? "Произошла ошибка" :
                       "An error occurred"
        }
      default:
        return {
          icon: '📭',
          title: texts.noItems,
          description: texts.startAdding
        }
    }
  }

  const defaults = getDefaultContent()

  return (
    <div className={`empty-state empty-state--${size}`} role="status">
      <span className="empty-state__icon">{icon || defaults.icon}</span>
      <h3 className="empty-state__title">{title || defaults.title}</h3>
      {(description || defaults.description) && (
        <p className="empty-state__description">{description || defaults.description}</p>
      )}
      {action && actionLabel && (
        <button className="empty-state__action" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  )
})

export default EmptyState
