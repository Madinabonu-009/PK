import { useLanguage } from '../../context/LanguageContext'
import './MenuTable.css'

const MenuTable = ({ menuData, loading, error }) => {
  const { language } = useLanguage()

  const dayNames = {
    uz: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
    ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }

  const headers = {
    uz: { day: 'Kun', breakfast: 'Nonushta', lunch: 'Tushlik', snack: 'Poldnik' },
    ru: { day: 'День', breakfast: 'Завтрак', lunch: 'Обед', snack: 'Полдник' },
    en: { day: 'Day', breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack' }
  }

  const texts = {
    uz: { loading: 'Menyu yuklanmoqda...', allergyTitle: "Allergiya ma'lumotlari" },
    ru: { loading: 'Загрузка меню...', allergyTitle: 'Информация об аллергенах' },
    en: { loading: 'Loading menu...', allergyTitle: 'Allergy Information' }
  }

  const allergyLabels = {
    uz: { sut: 'Sut', gluten: 'Gluten', tuxum: 'Tuxum', baliq: 'Baliq' },
    ru: { sut: 'Молоко', gluten: 'Глютен', tuxum: 'Яйца', baliq: 'Рыба' },
    en: { sut: 'Milk', gluten: 'Gluten', tuxum: 'Egg', baliq: 'Fish' }
  }

  const txt = texts[language]
  const h = headers[language]
  const days = dayNames[language]
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  if (loading) {
    return (
      <div className="menu-loading">
        <div className="loading-spinner"></div>
        <p>{txt.loading}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="menu-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
      </div>
    )
  }

  if (!menuData) return null

  const getMealName = (day, mealType) => {
    return menuData[day]?.[mealType]?.name || '—'
  }

  const getAllergies = (day, mealType) => {
    return menuData[day]?.[mealType]?.allergies || []
  }

  return (
    <div className="menu-table-container">
      <div className="menu-table-wrapper">
        <table className="menu-table">
          <thead>
            <tr>
              <th>{h.day}</th>
              <th>🥣 {h.breakfast}<br /><small>08:30</small></th>
              <th>🍲 {h.lunch}<br /><small>12:30</small></th>
              <th>🥛 {h.snack}<br /><small>15:30</small></th>
            </tr>
          </thead>
          <tbody>
            {dayKeys.map((dayKey, idx) => (
              <tr key={dayKey}>
                <td className="day-cell">{days[idx]}</td>
                <td>
                  <span className="meal-name">{getMealName(dayKey, 'breakfast')}</span>
                  {getAllergies(dayKey, 'breakfast').length > 0 && (
                    <div className="allergy-tags">
                      {getAllergies(dayKey, 'breakfast').map((a, i) => (
                        <span key={i} className="allergy-tag">{allergyLabels[language][a] || a}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <span className="meal-name">{getMealName(dayKey, 'lunch')}</span>
                  {getAllergies(dayKey, 'lunch').length > 0 && (
                    <div className="allergy-tags">
                      {getAllergies(dayKey, 'lunch').map((a, i) => (
                        <span key={i} className="allergy-tag">{allergyLabels[language][a] || a}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <span className="meal-name">{getMealName(dayKey, 'snack')}</span>
                  {getAllergies(dayKey, 'snack').length > 0 && (
                    <div className="allergy-tags">
                      {getAllergies(dayKey, 'snack').map((a, i) => (
                        <span key={i} className="allergy-tag">{allergyLabels[language][a] || a}</span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="allergy-legend">
        <h4 className="legend-title">⚠️ {txt.allergyTitle}</h4>
        <div className="legend-items">
          {Object.entries(allergyLabels[language]).map(([key, label]) => (
            <span key={key} className="allergy-tag">{label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MenuTable
