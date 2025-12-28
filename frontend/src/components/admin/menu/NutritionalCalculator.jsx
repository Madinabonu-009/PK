import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import './NutritionalCalculator.css'

// Recommended daily values for children (3-6 years)
const RECOMMENDED_VALUES = {
  calories: { min: 1200, max: 1600, unit: 'kkal', label: 'Kaloriya' },
  protein: { min: 13, max: 19, unit: 'g', label: 'Oqsil' },
  carbs: { min: 130, max: 180, unit: 'g', label: 'Uglevod' },
  fat: { min: 30, max: 50, unit: 'g', label: 'Yog\'' },
  fiber: { min: 14, max: 20, unit: 'g', label: 'Tola' },
  sugar: { min: 0, max: 25, unit: 'g', label: 'Shakar' },
  sodium: { min: 0, max: 1500, unit: 'mg', label: 'Natriy' },
  calcium: { min: 500, max: 800, unit: 'mg', label: 'Kaltsiy' },
  iron: { min: 7, max: 10, unit: 'mg', label: 'Temir' },
  vitaminA: { min: 300, max: 400, unit: 'mcg', label: 'Vitamin A' },
  vitaminC: { min: 15, max: 25, unit: 'mg', label: 'Vitamin C' },
  vitaminD: { min: 10, max: 15, unit: 'mcg', label: 'Vitamin D' }
}

// Nutrient Icons
const NUTRIENT_ICONS = {
  calories: '🔥',
  protein: '🥩',
  carbs: '🍞',
  fat: '🧈',
  fiber: '🌾',
  sugar: '🍬',
  sodium: '🧂',
  calcium: '🦴',
  iron: '💪',
  vitaminA: '🥕',
  vitaminC: '🍊',
  vitaminD: '☀️'
}

// Compliance Status
function getComplianceStatus(value, recommended) {
  if (!value || !recommended) return 'unknown'
  
  const percentage = (value / recommended.max) * 100
  
  if (value < recommended.min) return 'low'
  if (value > recommended.max) return 'high'
  return 'optimal'
}

// Nutrient Progress Bar
function NutrientBar({ nutrient, value, recommended, showDetails = false }) {
  const status = getComplianceStatus(value, recommended)
  const percentage = Math.min((value / recommended.max) * 100, 150)
  const optimalStart = (recommended.min / recommended.max) * 100
  
  return (
    <div className={`nutrient-bar ${status}`}>
      <div className="nutrient-header">
        <span className="nutrient-icon">{NUTRIENT_ICONS[nutrient]}</span>
        <span className="nutrient-name">{recommended.label}</span>
        <span className="nutrient-value">
          {value?.toFixed(1) || 0} {recommended.unit}
        </span>
      </div>
      
      <div className="bar-container">
        <div className="optimal-zone" style={{ left: `${optimalStart}%`, width: `${100 - optimalStart}%` }} />
        <motion.div 
          className="bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {percentage > 100 && (
          <motion.div 
            className="bar-overflow"
            initial={{ width: 0 }}
            animate={{ width: `${percentage - 100}%` }}
            style={{ left: '100%' }}
          />
        )}
      </div>
      
      {showDetails && (
        <div className="nutrient-details">
          <span className="range">
            Tavsiya: {recommended.min}-{recommended.max} {recommended.unit}
          </span>
          <span className={`status-text ${status}`}>
            {status === 'low' && '⬇️ Kam'}
            {status === 'optimal' && '✅ Optimal'}
            {status === 'high' && '⬆️ Ko\'p'}
          </span>
        </div>
      )}
    </div>
  )
}

// Meal Breakdown Card
function MealBreakdownCard({ meal, mealType }) {
  const mealTypeInfo = {
    breakfast: { icon: '🍳', name: 'Nonushta', targetPercent: 25 },
    lunch: { icon: '🍲', name: 'Tushlik', targetPercent: 40 },
    snack: { icon: '🍎', name: 'Poldnik', targetPercent: 15 },
    dinner: { icon: '🍽️', name: 'Kechki ovqat', targetPercent: 20 }
  }

  const info = mealTypeInfo[mealType] || { icon: '🍽️', name: mealType, targetPercent: 25 }

  return (
    <div className="meal-breakdown-card">
      <div className="meal-header">
        <span className="meal-icon">{info.icon}</span>
        <div className="meal-info">
          <h4>{info.name}</h4>
          <p>{meal?.name || 'Belgilanmagan'}</p>
        </div>
        <span className="target-percent">{info.targetPercent}%</span>
      </div>
      
      {meal && (
        <div className="meal-nutrients">
          <div className="nutrient-mini">
            <span>🔥</span>
            <span>{meal.calories || 0} kkal</span>
          </div>
          <div className="nutrient-mini">
            <span>🥩</span>
            <span>{meal.protein || 0}g</span>
          </div>
          <div className="nutrient-mini">
            <span>🍞</span>
            <span>{meal.carbs || 0}g</span>
          </div>
          <div className="nutrient-mini">
            <span>🧈</span>
            <span>{meal.fat || 0}g</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Compliance Summary
function ComplianceSummary({ totals, recommended }) {
  const compliance = useMemo(() => {
    const nutrients = Object.keys(recommended)
    let optimal = 0, low = 0, high = 0

    nutrients.forEach(nutrient => {
      const status = getComplianceStatus(totals[nutrient], recommended[nutrient])
      if (status === 'optimal') optimal++
      else if (status === 'low') low++
      else if (status === 'high') high++
    })

    const total = nutrients.length
    const score = Math.round((optimal / total) * 100)

    return { optimal, low, high, total, score }
  }, [totals, recommended])

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="compliance-summary">
      <div className="score-circle" style={{ '--score-color': getScoreColor(compliance.score) }}>
        <svg viewBox="0 0 100 100">
          <circle className="bg" cx="50" cy="50" r="45" />
          <motion.circle 
            className="progress"
            cx="50" 
            cy="50" 
            r="45"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (283 * compliance.score / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="score-value">
          <span className="number">{compliance.score}</span>
          <span className="percent">%</span>
        </div>
      </div>
      
      <div className="compliance-details">
        <h3>Muvofiqlik ko'rsatkichi</h3>
        <div className="compliance-stats">
          <div className="stat optimal">
            <span className="count">{compliance.optimal}</span>
            <span className="label">Optimal</span>
          </div>
          <div className="stat low">
            <span className="count">{compliance.low}</span>
            <span className="label">Kam</span>
          </div>
          <div className="stat high">
            <span className="count">{compliance.high}</span>
            <span className="label">Ko'p</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Nutritional Calculator Component
function NutritionalCalculator({
  meals = {},
  date,
  ageGroup = '3-6',
  onUpdateMeal
}) {
  const [showAllNutrients, setShowAllNutrients] = useState(false)
  const [selectedView, setSelectedView] = useState('overview') // overview | breakdown | comparison

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      calcium: 0,
      iron: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0
    }

    Object.values(meals).forEach(meal => {
      if (meal) {
        Object.keys(totals).forEach(nutrient => {
          totals[nutrient] += meal[nutrient] || 0
        })
      }
    })

    return totals
  }, [meals])

  // Get recommended values based on age group
  const recommended = useMemo(() => {
    // Could be extended to support different age groups
    return RECOMMENDED_VALUES
  }, [ageGroup])

  // Primary nutrients (always shown)
  const primaryNutrients = ['calories', 'protein', 'carbs', 'fat']
  
  // Secondary nutrients (shown when expanded)
  const secondaryNutrients = ['fiber', 'sugar', 'sodium', 'calcium', 'iron', 'vitaminA', 'vitaminC', 'vitaminD']

  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    return date.toLocaleDateString('uz-UZ', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  return (
    <div className="nutritional-calculator">
      {/* Header */}
      <div className="calc-header">
        <div className="header-info">
          <h2>📊 Ozuqaviy qiymat kalkulyatori</h2>
          {date && <span className="date-label">{formatDate(date)}</span>}
        </div>
        
        <div className="view-tabs">
          <button 
            className={`tab ${selectedView === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedView('overview')}
          >
            Umumiy
          </button>
          <button 
            className={`tab ${selectedView === 'breakdown' ? 'active' : ''}`}
            onClick={() => setSelectedView('breakdown')}
          >
            Tafsilot
          </button>
          <button 
            className={`tab ${selectedView === 'comparison' ? 'active' : ''}`}
            onClick={() => setSelectedView('comparison')}
          >
            Taqqoslash
          </button>
        </div>
      </div>

      {/* Compliance Summary */}
      <ComplianceSummary totals={dailyTotals} recommended={recommended} />

      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="overview-section">
          {/* Primary Nutrients */}
          <div className="nutrients-section">
            <h3>Asosiy ko'rsatkichlar</h3>
            <div className="nutrients-grid primary">
              {primaryNutrients.map(nutrient => (
                <NutrientBar
                  key={nutrient}
                  nutrient={nutrient}
                  value={dailyTotals[nutrient]}
                  recommended={recommended[nutrient]}
                  showDetails
                />
              ))}
            </div>
          </div>

          {/* Secondary Nutrients */}
          <div className="nutrients-section">
            <div className="section-header">
              <h3>Qo'shimcha ko'rsatkichlar</h3>
              <button 
                className="toggle-btn"
                onClick={() => setShowAllNutrients(!showAllNutrients)}
              >
                {showAllNutrients ? 'Yopish' : 'Ko\'proq ko\'rish'}
              </button>
            </div>
            
            {showAllNutrients && (
              <motion.div 
                className="nutrients-grid secondary"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {secondaryNutrients.map(nutrient => (
                  <NutrientBar
                    key={nutrient}
                    nutrient={nutrient}
                    value={dailyTotals[nutrient]}
                    recommended={recommended[nutrient]}
                    showDetails
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Breakdown View */}
      {selectedView === 'breakdown' && (
        <div className="breakdown-section">
          <h3>Ovqatlar bo'yicha taqsimot</h3>
          <div className="meals-breakdown">
            <MealBreakdownCard meal={meals.breakfast} mealType="breakfast" />
            <MealBreakdownCard meal={meals.lunch} mealType="lunch" />
            <MealBreakdownCard meal={meals.snack} mealType="snack" />
          </div>

          {/* Pie Chart Visualization */}
          <div className="distribution-chart">
            <h4>Kaloriya taqsimoti</h4>
            <div className="pie-chart">
              {Object.entries(meals).map(([type, meal], idx) => {
                if (!meal) return null
                const percentage = dailyTotals.calories > 0 
                  ? (meal.calories / dailyTotals.calories) * 100 
                  : 0
                return (
                  <div 
                    key={type}
                    className="pie-segment"
                    style={{
                      '--percentage': percentage,
                      '--offset': idx * 120
                    }}
                  >
                    <span className="segment-label">
                      {type === 'breakfast' ? '🍳' : type === 'lunch' ? '🍲' : '🍎'}
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Comparison View */}
      {selectedView === 'comparison' && (
        <div className="comparison-section">
          <h3>Tavsiya bilan taqqoslash</h3>
          <div className="comparison-table">
            <div className="table-header">
              <span>Ko'rsatkich</span>
              <span>Hozirgi</span>
              <span>Tavsiya</span>
              <span>Farq</span>
            </div>
            {Object.entries(recommended).map(([nutrient, rec]) => {
              const current = dailyTotals[nutrient] || 0
              const target = (rec.min + rec.max) / 2
              const diff = current - target
              const diffPercent = ((diff / target) * 100).toFixed(0)
              
              return (
                <div key={nutrient} className="table-row">
                  <span className="nutrient-cell">
                    {NUTRIENT_ICONS[nutrient]} {rec.label}
                  </span>
                  <span className="value-cell">
                    {current.toFixed(1)} {rec.unit}
                  </span>
                  <span className="target-cell">
                    {rec.min}-{rec.max} {rec.unit}
                  </span>
                  <span className={`diff-cell ${diff > 0 ? 'positive' : diff < 0 ? 'negative' : ''}`}>
                    {diff > 0 ? '+' : ''}{diffPercent}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="recommendations-section">
        <h3>💡 Tavsiyalar</h3>
        <div className="recommendations-list">
          {dailyTotals.calories < recommended.calories.min && (
            <div className="recommendation warning">
              <span className="rec-icon">⚠️</span>
              <p>Kunlik kaloriya miqdori kam. Ko'proq energiya beruvchi taomlar qo'shing.</p>
            </div>
          )}
          {dailyTotals.protein < recommended.protein.min && (
            <div className="recommendation warning">
              <span className="rec-icon">🥩</span>
              <p>Oqsil miqdori yetarli emas. Go'sht, tuxum yoki dukkaklilar qo'shing.</p>
            </div>
          )}
          {dailyTotals.fiber < recommended.fiber.min && (
            <div className="recommendation info">
              <span className="rec-icon">🥬</span>
              <p>Tola miqdorini oshirish uchun ko'proq sabzavot va mevalar qo'shing.</p>
            </div>
          )}
          {dailyTotals.sugar > recommended.sugar.max && (
            <div className="recommendation danger">
              <span className="rec-icon">🍬</span>
              <p>Shakar miqdori yuqori. Shirinliklarni kamaytiring.</p>
            </div>
          )}
          {Object.values(dailyTotals).every(v => v === 0) && (
            <div className="recommendation info">
              <span className="rec-icon">📋</span>
              <p>Menyu hali to'ldirilmagan. Taomlarni qo'shishni boshlang.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NutritionalCalculator
export {
  NutrientBar,
  MealBreakdownCard,
  ComplianceSummary,
  RECOMMENDED_VALUES,
  NUTRIENT_ICONS,
  getComplianceStatus
}
