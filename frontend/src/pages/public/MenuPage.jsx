import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import MenuTable from '../../components/public/MenuTable'
import api from '../../services/api'
import './MenuPage.css'

const MenuPage = () => {
  const { language } = useLanguage()
  const [menuData, setMenuData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const texts = {
    uz: {
      menuTitle: 'Kundalik menyu',
      subtitle: 'Bolalarimiz uchun sog\'lom va mazali ovqatlar. Har bir taom diqqat bilan tayyorlanadi',
      healthyEating: 'Sog\'lom ovqatlanish',
      healthyDesc: 'Barcha taomlar bolalar uchun foydali va to\'yimli',
      professionalChefs: 'Professional oshpazlar',
      chefsDesc: 'Tajribali oshpazlar tomonidan tayyorlanadi',
      freshProducts: 'Yangi mahsulotlar',
      freshDesc: 'Faqat yangi va sifatli mahsulotlardan foydalanamiz',
      weeklySchedule: 'Haftalik ovqatlanish jadvali',
      scheduleDesc: 'Har kuni uch mahal ovqatlanish: nonushta, tushlik va tushki taom',
      aboutFood: 'Ovqatlanish haqida',
      feature1: 'Barcha taomlar bog\'cha oshxonasida tayyorlanadi',
      feature2: 'Allergiya bo\'lgan bolalar uchun alohida menyu',
      feature3: 'Kundalik yangi mevalar va sabzavotlar',
      feature4: 'Sanitariya qoidalariga to\'liq rioya qilinadi',
      loadError: 'Menyuni yuklashda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.'
    },
    ru: {
      menuTitle: 'Ежедневное меню',
      subtitle: 'Здоровая и вкусная еда для наших детей. Каждое блюдо готовится с заботой',
      healthyEating: 'Здоровое питание',
      healthyDesc: 'Все блюда полезны и питательны для детей',
      professionalChefs: 'Профессиональные повара',
      chefsDesc: 'Готовится опытными поварами',
      freshProducts: 'Свежие продукты',
      freshDesc: 'Используем только свежие и качественные продукты',
      weeklySchedule: 'Недельное расписание питания',
      scheduleDesc: 'Трехразовое питание каждый день: завтрак, обед и полдник',
      aboutFood: 'О питании',
      feature1: 'Все блюда готовятся на кухне детского сада',
      feature2: 'Отдельное меню для детей с аллергией',
      feature3: 'Ежедневно свежие фрукты и овощи',
      feature4: 'Полное соблюдение санитарных норм',
      loadError: 'Ошибка загрузки меню. Пожалуйста, попробуйте позже.'
    },
    en: {
      menuTitle: 'Daily Menu',
      subtitle: 'Healthy and delicious food for our children. Every dish is prepared with care',
      healthyEating: 'Healthy Eating',
      healthyDesc: 'All dishes are nutritious and beneficial for children',
      professionalChefs: 'Professional Chefs',
      chefsDesc: 'Prepared by experienced chefs',
      freshProducts: 'Fresh Products',
      freshDesc: 'We use only fresh and quality products',
      weeklySchedule: 'Weekly Meal Schedule',
      scheduleDesc: 'Three meals a day: breakfast, lunch and snack',
      aboutFood: 'About Meals',
      feature1: 'All dishes are prepared in the kindergarten kitchen',
      feature2: 'Separate menu for children with allergies',
      feature3: 'Daily fresh fruits and vegetables',
      feature4: 'Full compliance with sanitary standards',
      loadError: 'Error loading menu. Please try again later.'
    }
  }

  const txt = texts[language] || texts.uz

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/menu')
        
        // API may return { data: [...] } or object/array directly
        const data = response.data?.data || response.data
        
        setMenuData(data)
      } catch (err) {
        console.error('[MenuPage] Error:', err)
        console.error('[MenuPage] Error response:', err.response)
        setError(txt.loadError)
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  return (
    <div className="menu-page">
      {/* Hero Section */}
      <section className="menu-hero">
        <div className="menu-container">
          <h1 className="menu-main-title">{txt.menuTitle}</h1>
          <p className="menu-subtitle">{txt.subtitle}</p>
        </div>
      </section>

      {/* Menu Info */}
      <section className="menu-info">
        <div className="menu-container">
          <div className="info-cards">
            <div className="info-card">
              <span className="info-icon">🥗</span>
              <h3>{txt.healthyEating}</h3>
              <p>{txt.healthyDesc}</p>
            </div>
            <div className="info-card">
              <span className="info-icon">👨‍🍳</span>
              <h3>{txt.professionalChefs}</h3>
              <p>{txt.chefsDesc}</p>
            </div>
            <div className="info-card">
              <span className="info-icon">🌿</span>
              <h3>{txt.freshProducts}</h3>
              <p>{txt.freshDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Table */}
      <section className="menu-table-section">
        <div className="menu-container">
          <h2 className="section-title">{txt.weeklySchedule}</h2>
          <p className="section-subtitle">{txt.scheduleDesc}</p>
          <MenuTable menuData={menuData} loading={loading} error={error} />
        </div>
      </section>

      {/* Additional Info */}
      <section className="menu-additional">
        <div className="menu-container">
          <div className="additional-content">
            <div className="additional-text">
              <h2>{txt.aboutFood}</h2>
              <ul className="menu-features">
                <li>
                  <span className="feature-icon">✓</span>
                  {txt.feature1}
                </li>
                <li>
                  <span className="feature-icon">✓</span>
                  {txt.feature2}
                </li>
                <li>
                  <span className="feature-icon">✓</span>
                  {txt.feature3}
                </li>
                <li>
                  <span className="feature-icon">✓</span>
                  {txt.feature4}
                </li>
              </ul>
            </div>
            <div className="additional-image">
              <div className="image-placeholder">
                <span className="placeholder-icon">🍽️</span>
                <span className="placeholder-text">{txt.healthyEating}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MenuPage
