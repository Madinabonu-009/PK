import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import './CostTracker.css'

// Cost Categories
const COST_CATEGORIES = [
  { id: 'ingredients', name: 'Ingredientlar', icon: '🥬', color: '#10b981' },
  { id: 'labor', name: 'Ish haqi', icon: '👨‍🍳', color: '#3b82f6' },
  { id: 'utilities', name: 'Kommunal', icon: '⚡', color: '#f59e0b' },
  { id: 'other', name: 'Boshqa', icon: '📦', color: '#8b5cf6' }
]

// Budget Status
function getBudgetStatus(spent, budget) {
  if (!budget || budget === 0) return 'unknown'
  const percentage = (spent / budget) * 100
  if (percentage < 70) return 'good'
  if (percentage < 90) return 'warning'
  return 'danger'
}

// Cost Summary Card
function CostSummaryCard({ title, icon, value, budget, trend, period }) {
  const status = getBudgetStatus(value, budget)
  const percentage = budget ? Math.round((value / budget) * 100) : 0

  return (
    <motion.div
      className={`cost-summary-card ${status}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <div className="card-info">
          <h3>{title}</h3>
          <span className="period">{period}</span>
        </div>
      </div>

      <div className="card-value">
        <span className="amount">{value.toLocaleString()}</span>
        <span className="currency">so'm</span>
      </div>

      {budget && (
        <div className="budget-progress">
          <div className="progress-header">
            <span>Byudjet: {budget.toLocaleString()} so'm</span>
            <span className={`percentage ${status}`}>{percentage}%</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {trend && (
        <div className={`trend ${trend.direction}`}>
          <span className="trend-icon">
            {trend.direction === 'up' ? '📈' : '📉'}
          </span>
          <span className="trend-value">
            {trend.direction === 'up' ? '+' : ''}{trend.value}%
          </span>
          <span className="trend-label">oldingi haftaga nisbatan</span>
        </div>
      )}
    </motion.div>
  )
}

// Meal Cost Card
function MealCostCard({ meal, mealType, onEdit }) {
  const mealTypeInfo = {
    breakfast: { icon: '🍳', name: 'Nonushta' },
    lunch: { icon: '🍲', name: 'Tushlik' },
    snack: { icon: '🍎', name: 'Poldnik' }
  }

  const info = mealTypeInfo[mealType] || { icon: '🍽️', name: mealType }

  return (
    <div className="meal-cost-card">
      <div className="meal-header">
        <span className="meal-icon">{info.icon}</span>
        <div className="meal-info">
          <h4>{info.name}</h4>
          <p>{meal?.name || 'Belgilanmagan'}</p>
        </div>
      </div>

      {meal && (
        <>
          <div className="cost-breakdown">
            <div className="cost-item">
              <span className="label">Ingredientlar</span>
              <span className="value">{(meal.ingredientsCost || 0).toLocaleString()}</span>
            </div>
            <div className="cost-item">
              <span className="label">Tayyorlash</span>
              <span className="value">{(meal.laborCost || 0).toLocaleString()}</span>
            </div>
            <div className="cost-item total">
              <span className="label">Jami</span>
              <span className="value">{(meal.cost || 0).toLocaleString()} so'm</span>
            </div>
          </div>

          <div className="per-serving">
            <span>1 porsiya: </span>
            <strong>{Math.round((meal.cost || 0) / (meal.servings || 1)).toLocaleString()} so'm</strong>
          </div>
        </>
      )}

      {!meal && (
        <div className="empty-meal">
          <span>Taom belgilanmagan</span>
        </div>
      )}
    </div>
  )
}

// Cost Chart Component
function CostChart({ data, type = 'bar' }) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="cost-chart">
      {type === 'bar' && (
        <div className="bar-chart">
          {data.map((item, idx) => (
            <div key={idx} className="bar-item">
              <div className="bar-label">{item.label}</div>
              <div className="bar-container">
                <motion.div
                  className="bar-fill"
                  style={{ backgroundColor: item.color || '#4f46e5' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                />
                <span className="bar-value">{item.value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {type === 'pie' && (
        <div className="pie-chart-container">
          <div className="pie-legend">
            {data.map((item, idx) => (
              <div key={idx} className="legend-item">
                <span 
                  className="legend-color" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="legend-label">{item.label}</span>
                <span className="legend-value">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Budget Settings Modal
function BudgetSettingsModal({ budgets, onSave, onClose }) {
  const [formData, setFormData] = useState({
    daily: budgets?.daily || '',
    weekly: budgets?.weekly || '',
    monthly: budgets?.monthly || '',
    perChild: budgets?.perChild || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave?.({
      daily: Number(formData.daily) || 0,
      weekly: Number(formData.weekly) || 0,
      monthly: Number(formData.monthly) || 0,
      perChild: Number(formData.perChild) || 0
    })
    onClose()
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="budget-settings-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>💰 Byudjet sozlamalari</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label>Kunlik byudjet (so'm)</label>
            <input
              type="number"
              value={formData.daily}
              onChange={e => setFormData(prev => ({ ...prev, daily: e.target.value }))}
              placeholder="Masalan: 500000"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Haftalik byudjet (so'm)</label>
            <input
              type="number"
              value={formData.weekly}
              onChange={e => setFormData(prev => ({ ...prev, weekly: e.target.value }))}
              placeholder="Masalan: 3000000"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Oylik byudjet (so'm)</label>
            <input
              type="number"
              value={formData.monthly}
              onChange={e => setFormData(prev => ({ ...prev, monthly: e.target.value }))}
              placeholder="Masalan: 12000000"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Har bir bola uchun kunlik (so'm)</label>
            <input
              type="number"
              value={formData.perChild}
              onChange={e => setFormData(prev => ({ ...prev, perChild: e.target.value }))}
              placeholder="Masalan: 15000"
              min="0"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary">
              💾 Saqlash
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Main Cost Tracker Component
function CostTracker({
  weekMeals = {},
  childrenCount = 0,
  budgets = {},
  onUpdateBudgets,
  onExportReport
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('week') // day | week | month
  const [showBudgetSettings, setShowBudgetSettings] = useState(false)

  // Calculate costs
  const costs = useMemo(() => {
    let dailyCosts = {}
    let totalIngredients = 0
    let totalLabor = 0
    let totalOther = 0
    let mealCount = 0

    Object.entries(weekMeals).forEach(([date, meals]) => {
      let dayCost = 0
      Object.values(meals || {}).forEach(meal => {
        if (meal) {
          dayCost += meal.cost || 0
          totalIngredients += meal.ingredientsCost || (meal.cost * 0.7) || 0
          totalLabor += meal.laborCost || (meal.cost * 0.2) || 0
          totalOther += (meal.cost * 0.1) || 0
          mealCount++
        }
      })
      dailyCosts[date] = dayCost
    })

    const totalCost = Object.values(dailyCosts).reduce((sum, cost) => sum + cost, 0)
    const avgDailyCost = Object.keys(dailyCosts).length > 0 
      ? totalCost / Object.keys(dailyCosts).length 
      : 0
    const avgMealCost = mealCount > 0 ? totalCost / mealCount : 0
    const costPerChild = childrenCount > 0 ? totalCost / childrenCount : 0

    return {
      total: totalCost,
      daily: dailyCosts,
      avgDaily: avgDailyCost,
      avgMeal: avgMealCost,
      perChild: costPerChild,
      byCategory: [
        { label: 'Ingredientlar', value: Math.round(totalIngredients), color: '#10b981' },
        { label: 'Ish haqi', value: Math.round(totalLabor), color: '#3b82f6' },
        { label: 'Boshqa', value: Math.round(totalOther), color: '#8b5cf6' }
      ],
      mealCount
    }
  }, [weekMeals, childrenCount])

  // Daily costs for chart
  const dailyCostsChart = useMemo(() => {
    const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
    return Object.entries(costs.daily).map(([date, value], idx) => ({
      label: days[idx] || date,
      value,
      color: '#4f46e5'
    }))
  }, [costs.daily])

  // Get current date's meals
  const todayKey = new Date().toISOString().split('T')[0]
  const todayMeals = weekMeals[todayKey] || {}

  return (
    <div className="cost-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-title">
          <h2>💰 Xarajatlar hisobi</h2>
          <div className="period-selector">
            <button
              className={`period-btn ${selectedPeriod === 'day' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('day')}
            >
              Kunlik
            </button>
            <button
              className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('week')}
            >
              Haftalik
            </button>
            <button
              className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              Oylik
            </button>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="action-btn"
            onClick={() => setShowBudgetSettings(true)}
          >
            ⚙️ Byudjet
          </button>
          <button 
            className="action-btn"
            onClick={onExportReport}
          >
            📊 Hisobot
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <CostSummaryCard
          title="Jami xarajat"
          icon="💵"
          value={costs.total}
          budget={budgets.weekly}
          period="Bu hafta"
          trend={{ value: 5, direction: 'up' }}
        />
        <CostSummaryCard
          title="O'rtacha kunlik"
          icon="📅"
          value={Math.round(costs.avgDaily)}
          budget={budgets.daily}
          period="Hafta davomida"
        />
        <CostSummaryCard
          title="Har bir bola"
          icon="👶"
          value={Math.round(costs.perChild / 7)}
          budget={budgets.perChild}
          period="Kuniga"
        />
        <CostSummaryCard
          title="Taom narxi"
          icon="🍽️"
          value={Math.round(costs.avgMeal)}
          period="O'rtacha"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>📊 Kunlik xarajatlar</h3>
          <CostChart data={dailyCostsChart} type="bar" />
        </div>

        <div className="chart-card">
          <h3>📈 Kategoriya bo'yicha</h3>
          <CostChart data={costs.byCategory} type="pie" />
        </div>
      </div>

      {/* Today's Meals Cost */}
      <div className="today-costs">
        <h3>☀️ Bugungi xarajatlar</h3>
        <div className="meals-cost-grid">
          <MealCostCard meal={todayMeals.breakfast} mealType="breakfast" />
          <MealCostCard meal={todayMeals.lunch} mealType="lunch" />
          <MealCostCard meal={todayMeals.snack} mealType="snack" />
        </div>

        <div className="today-total">
          <span>Bugungi jami:</span>
          <strong>
            {Object.values(todayMeals).reduce((sum, m) => sum + (m?.cost || 0), 0).toLocaleString()} so'm
          </strong>
        </div>
      </div>

      {/* Cost Tips */}
      <div className="cost-tips">
        <h3>💡 Tavsiyalar</h3>
        <div className="tips-list">
          {costs.total > (budgets.weekly || Infinity) && (
            <div className="tip warning">
              <span className="tip-icon">⚠️</span>
              <p>Haftalik byudjet oshib ketdi. Arzonroq ingredientlarni ko'rib chiqing.</p>
            </div>
          )}
          {costs.avgMeal > 20000 && (
            <div className="tip info">
              <span className="tip-icon">💡</span>
              <p>O'rtacha taom narxi yuqori. Mavsumiy mahsulotlardan foydalaning.</p>
            </div>
          )}
          {costs.byCategory[0]?.value > costs.total * 0.8 && (
            <div className="tip info">
              <span className="tip-icon">🥬</span>
              <p>Ingredientlar xarajatlarning 80% dan ko'prog'ini tashkil qiladi.</p>
            </div>
          )}
          {Object.keys(costs.daily).length < 5 && (
            <div className="tip info">
              <span className="tip-icon">📋</span>
              <p>To'liq haftalik menyu rejalashtiring - bu xarajatlarni optimallashtiradi.</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Settings Modal */}
      {showBudgetSettings && (
        <BudgetSettingsModal
          budgets={budgets}
          onSave={onUpdateBudgets}
          onClose={() => setShowBudgetSettings(false)}
        />
      )}
    </div>
  )
}

export default CostTracker
export {
  CostSummaryCard,
  MealCostCard,
  CostChart,
  BudgetSettingsModal,
  COST_CATEGORIES,
  getBudgetStatus
}
