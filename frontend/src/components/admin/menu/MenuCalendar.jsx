import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MenuCalendar.css'

// Meal Types
const MEAL_TYPES = [
  { id: 'breakfast', name: 'Nonushta', icon: '🍳', time: '08:00' },
  { id: 'lunch', name: 'Tushlik', icon: '🍲', time: '12:00' },
  { id: 'snack', name: 'Poldnik', icon: '🍎', time: '15:30' }
]

// Days of week
const WEEKDAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']
const WEEKDAYS_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

// Allergen Icons
const ALLERGEN_ICONS = {
  milk: '🥛',
  eggs: '🥚',
  nuts: '🥜',
  gluten: '🌾',
  fish: '🐟',
  soy: '🫘'
}

// Meal Card Component
function MealCard({ meal, onEdit, onDelete, allergenWarnings = [] }) {
  const hasWarnings = allergenWarnings.length > 0

  return (
    <motion.div
      className={`meal-card ${hasWarnings ? 'has-warnings' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="meal-card-header">
        <span className="meal-name">{meal.name}</span>
        <div className="meal-actions">
          <button className="meal-action-btn" onClick={() => onEdit?.(meal)}>✏️</button>
          <button className="meal-action-btn delete" onClick={() => onDelete?.(meal)}>🗑️</button>
        </div>
      </div>

      {meal.description && (
        <p className="meal-description">{meal.description}</p>
      )}

      <div className="meal-info">
        {meal.calories && (
          <span className="meal-calories">🔥 {meal.calories} kkal</span>
        )}
        {meal.cost && (
          <span className="meal-cost">💰 {meal.cost.toLocaleString()} so'm</span>
        )}
      </div>

      {meal.allergens && meal.allergens.length > 0 && (
        <div className="meal-allergens">
          {meal.allergens.map(allergen => (
            <span key={allergen} className="allergen-tag" title={allergen}>
              {ALLERGEN_ICONS[allergen] || '⚠️'}
            </span>
          ))}
        </div>
      )}

      {hasWarnings && (
        <div className="meal-warnings">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">{allergenWarnings.length} ta bola allergiyasi bor</span>
        </div>
      )}
    </motion.div>
  )
}

// Meal Slot Component
function MealSlot({ mealType, meal, date, onAddMeal, onEditMeal, onDeleteMeal, allergenWarnings }) {
  const isEmpty = !meal

  return (
    <div className={`meal-slot ${isEmpty ? 'empty' : ''}`}>
      <div className="meal-slot-header">
        <span className="meal-type-icon">{mealType.icon}</span>
        <span className="meal-type-name">{mealType.name}</span>
        <span className="meal-type-time">{mealType.time}</span>
      </div>

      <div className="meal-slot-content">
        {meal ? (
          <MealCard
            meal={meal}
            onEdit={onEditMeal}
            onDelete={onDeleteMeal}
            allergenWarnings={allergenWarnings}
          />
        ) : (
          <button 
            className="add-meal-btn"
            onClick={() => onAddMeal?.(date, mealType.id)}
          >
            <span className="add-icon">+</span>
            <span>Taom qo'shish</span>
          </button>
        )}
      </div>
    </div>
  )
}

// Day Column Component
function DayColumn({ date, dayName, meals, onAddMeal, onEditMeal, onDeleteMeal, childrenAllergens }) {
  const isToday = new Date().toDateString() === date.toDateString()

  // Check allergen warnings for each meal
  const getAllergenWarnings = (meal) => {
    if (!meal?.allergens || !childrenAllergens) return []
    return childrenAllergens.filter(child => 
      child.allergens.some(a => meal.allergens.includes(a))
    )
  }

  return (
    <div className={`day-column ${isToday ? 'today' : ''}`}>
      <div className="day-header">
        <span className="day-name">{dayName}</span>
        <span className="day-date">{date.getDate()}</span>
      </div>

      <div className="day-meals">
        {MEAL_TYPES.map(mealType => (
          <MealSlot
            key={mealType.id}
            mealType={mealType}
            meal={meals?.[mealType.id]}
            date={date}
            onAddMeal={onAddMeal}
            onEditMeal={onEditMeal}
            onDeleteMeal={onDeleteMeal}
            allergenWarnings={getAllergenWarnings(meals?.[mealType.id])}
          />
        ))}
      </div>
    </div>
  )
}

// Nutritional Summary Component
function NutritionalSummary({ weekMeals }) {
  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0, cost = 0
    
    Object.values(weekMeals || {}).forEach(dayMeals => {
      Object.values(dayMeals || {}).forEach(meal => {
        if (meal) {
          calories += meal.calories || 0
          protein += meal.protein || 0
          carbs += meal.carbs || 0
          fat += meal.fat || 0
          cost += meal.cost || 0
        }
      })
    })

    return { calories, protein, carbs, fat, cost }
  }, [weekMeals])

  return (
    <div className="nutritional-summary">
      <h4 className="summary-title">Haftalik ko'rsatkichlar</h4>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-icon">🔥</span>
          <span className="summary-value">{totals.calories.toLocaleString()}</span>
          <span className="summary-label">kkal</span>
        </div>
        <div className="summary-item">
          <span className="summary-icon">🥩</span>
          <span className="summary-value">{totals.protein}g</span>
          <span className="summary-label">Oqsil</span>
        </div>
        <div className="summary-item">
          <span className="summary-icon">🍞</span>
          <span className="summary-value">{totals.carbs}g</span>
          <span className="summary-label">Uglevod</span>
        </div>
        <div className="summary-item">
          <span className="summary-icon">🧈</span>
          <span className="summary-value">{totals.fat}g</span>
          <span className="summary-label">Yog'</span>
        </div>
        <div className="summary-item">
          <span className="summary-icon">💰</span>
          <span className="summary-value">{totals.cost.toLocaleString()}</span>
          <span className="summary-label">so'm</span>
        </div>
      </div>
    </div>
  )
}

// Meal Form Modal
function MealFormModal({ meal, mealType, date, recipes, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: meal?.name || '',
    description: meal?.description || '',
    recipeId: meal?.recipeId || '',
    calories: meal?.calories || '',
    protein: meal?.protein || '',
    carbs: meal?.carbs || '',
    fat: meal?.fat || '',
    cost: meal?.cost || '',
    allergens: meal?.allergens || []
  })

  const handleRecipeSelect = (recipeId) => {
    const recipe = recipes?.find(r => r.id === recipeId)
    if (recipe) {
      setFormData({
        ...formData,
        recipeId,
        name: recipe.name,
        description: recipe.description,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        cost: recipe.cost,
        allergens: recipe.allergens || []
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave?.({
      ...formData,
      date,
      mealType
    })
  }

  const toggleAllergen = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
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
        className="meal-form-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{meal ? 'Taomni tahrirlash' : 'Yangi taom'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="meal-form">
          {recipes && recipes.length > 0 && (
            <div className="form-group">
              <label>Retseptdan tanlash</label>
              <select
                value={formData.recipeId}
                onChange={e => handleRecipeSelect(e.target.value)}
              >
                <option value="">Tanlang...</option>
                {recipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Taom nomi *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Tavsif</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kaloriya (kkal)</label>
              <input
                type="number"
                value={formData.calories}
                onChange={e => setFormData(prev => ({ ...prev, calories: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Narx (so'm)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Oqsil (g)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={e => setFormData(prev => ({ ...prev, protein: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Uglevod (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={e => setFormData(prev => ({ ...prev, carbs: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Yog' (g)</label>
              <input
                type="number"
                value={formData.fat}
                onChange={e => setFormData(prev => ({ ...prev, fat: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Allergenlar</label>
            <div className="allergen-selector">
              {Object.entries(ALLERGEN_ICONS).map(([key, icon]) => (
                <button
                  key={key}
                  type="button"
                  className={`allergen-btn ${formData.allergens.includes(key) ? 'active' : ''}`}
                  onClick={() => toggleAllergen(key)}
                >
                  {icon} {key}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary">
              Saqlash
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Telegram Send Modal
function TelegramSendModal({ weekMeals, weekDates, onClose, onSend }) {
  const [selectedDays, setSelectedDays] = useState([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [includeNutrition, setIncludeNutrition] = useState(true)

  const toggleDay = (dateKey) => {
    setSelectedDays(prev => 
      prev.includes(dateKey) 
        ? prev.filter(d => d !== dateKey)
        : [...prev, dateKey]
    )
  }

  const selectAll = () => {
    const allDays = weekDates.map(d => d.toISOString().split('T')[0])
    setSelectedDays(allDays)
  }

  const generateMessage = () => {
    let msg = '🍽️ *Haftalik Menyu*\n\n'
    
    selectedDays.sort().forEach(dateKey => {
      const date = new Date(dateKey)
      const dayName = WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
      const dayMeals = weekMeals[dateKey]
      
      msg += `📅 *${dayName} (${date.getDate()}.${date.getMonth() + 1})*\n`
      
      MEAL_TYPES.forEach(mealType => {
        const meal = dayMeals?.[mealType.id]
        if (meal) {
          msg += `${mealType.icon} ${mealType.name}: ${meal.name}\n`
          if (includeNutrition && meal.calories) {
            msg += `   🔥 ${meal.calories} kkal\n`
          }
        }
      })
      msg += '\n'
    })

    if (message) {
      msg += `\n💬 ${message}`
    }

    return msg
  }

  const handleSend = async () => {
    if (selectedDays.length === 0) return
    
    setSending(true)
    try {
      const menuMessage = generateMessage()
      await onSend?.(menuMessage, selectedDays)
      onClose()
    } catch (error) {
      console.error('Telegram yuborishda xato:', error)
    } finally {
      setSending(false)
    }
  }

  const previewMessage = selectedDays.length > 0 ? generateMessage() : ''

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="telegram-send-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📱 Telegramga yuborish</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="telegram-send-content">
          {/* Day Selection */}
          <div className="day-selection">
            <div className="day-selection-header">
              <label>Kunlarni tanlang:</label>
              <button type="button" className="select-all-btn" onClick={selectAll}>
                Hammasini tanlash
              </button>
            </div>
            <div className="day-checkboxes">
              {weekDates.map((date, idx) => {
                const dateKey = date.toISOString().split('T')[0]
                const hasMeals = weekMeals[dateKey] && Object.keys(weekMeals[dateKey]).length > 0
                return (
                  <label 
                    key={dateKey} 
                    className={`day-checkbox ${!hasMeals ? 'no-meals' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(dateKey)}
                      onChange={() => toggleDay(dateKey)}
                      disabled={!hasMeals}
                    />
                    <span className="day-label">
                      {WEEKDAYS_SHORT[idx]}
                      <small>{date.getDate()}</small>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Options */}
          <div className="telegram-options">
            <label className="option-checkbox">
              <input
                type="checkbox"
                checked={includeNutrition}
                onChange={e => setIncludeNutrition(e.target.checked)}
              />
              <span>Kaloriya ma'lumotlarini qo'shish</span>
            </label>
          </div>

          {/* Additional Message */}
          <div className="form-group">
            <label>Qo'shimcha xabar (ixtiyoriy):</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ota-onalarga qo'shimcha xabar..."
              rows={2}
            />
          </div>

          {/* Preview */}
          {previewMessage && (
            <div className="message-preview">
              <label>Ko'rinishi:</label>
              <pre className="preview-text">{previewMessage}</pre>
            </div>
          )}
        </div>

        <div className="telegram-send-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button 
            type="button" 
            className="btn-telegram"
            onClick={handleSend}
            disabled={selectedDays.length === 0 || sending}
          >
            {sending ? '⏳ Yuborilmoqda...' : '📤 Yuborish'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Shopping List Generator
function ShoppingList({ weekMeals, onClose }) {
  const ingredients = useMemo(() => {
    const list = {}
    
    Object.values(weekMeals || {}).forEach(dayMeals => {
      Object.values(dayMeals || {}).forEach(meal => {
        if (meal?.ingredients) {
          meal.ingredients.forEach(ing => {
            if (list[ing.name]) {
              list[ing.name].amount += ing.amount
            } else {
              list[ing.name] = { ...ing }
            }
          })
        }
      })
    })

    return Object.values(list).sort((a, b) => a.category?.localeCompare(b.category))
  }, [weekMeals])

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="shopping-list-modal"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>🛒 Xarid ro'yxati</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="shopping-list">
          {ingredients.length > 0 ? (
            ingredients.map((ing, idx) => (
              <div key={idx} className="shopping-item">
                <input type="checkbox" id={`ing-${idx}`} />
                <label htmlFor={`ing-${idx}`}>
                  <span className="ing-name">{ing.name}</span>
                  <span className="ing-amount">{ing.amount} {ing.unit}</span>
                </label>
              </div>
            ))
          ) : (
            <div className="empty-list">
              <span>📋</span>
              <p>Menyu bo'sh</p>
            </div>
          )}
        </div>

        <div className="shopping-actions">
          <button className="btn-secondary" onClick={() => window.print()}>
            🖨️ Chop etish
          </button>
          <button className="btn-primary" onClick={onClose}>
            Yopish
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Menu Calendar Component
function MenuCalendar({
  weekMeals = {},
  recipes = [],
  childrenAllergens = [],
  onSaveMeal,
  onDeleteMeal,
  onPublish,
  onCopyWeek
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(today.setDate(diff))
  })
  const [showMealForm, setShowMealForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedMealType, setSelectedMealType] = useState(null)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [showTelegramSend, setShowTelegramSend] = useState(false)

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart)
      date.setDate(date.getDate() + i)
      return date
    })
  }, [currentWeekStart])

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeekStart(newDate)
  }

  const handleAddMeal = (date, mealType) => {
    setSelectedDate(date)
    setSelectedMealType(mealType)
    setEditingMeal(null)
    setShowMealForm(true)
  }

  const handleEditMeal = (meal) => {
    setEditingMeal(meal)
    setShowMealForm(true)
  }

  const handleSaveMeal = (mealData) => {
    onSaveMeal?.(mealData)
    setShowMealForm(false)
    setEditingMeal(null)
  }

  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    const startStr = `${start.getDate()} ${start.toLocaleString('uz-UZ', { month: 'short' })}`
    const endStr = `${end.getDate()} ${end.toLocaleString('uz-UZ', { month: 'short' })}`
    return `${startStr} - ${endStr}`
  }

  return (
    <div className="menu-calendar">
      {/* Header */}
      <div className="menu-header">
        <div className="week-navigation">
          <button className="nav-btn" onClick={() => navigateWeek(-1)}>←</button>
          <h2 className="week-title">{formatWeekRange()}</h2>
          <button className="nav-btn" onClick={() => navigateWeek(1)}>→</button>
        </div>

        <div className="menu-actions">
          <button className="action-btn" onClick={() => setShowShoppingList(true)}>
            🛒 Xarid ro'yxati
          </button>
          <button className="action-btn" onClick={onCopyWeek}>
            📋 Nusxa olish
          </button>
          <button className="action-btn telegram" onClick={() => setShowTelegramSend(true)}>
            📱 Telegramga yuborish
          </button>
          <button className="action-btn primary" onClick={onPublish}>
            📤 E'lon qilish
          </button>
        </div>
      </div>

      {/* Nutritional Summary */}
      <NutritionalSummary weekMeals={weekMeals} />

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {weekDates.map((date, idx) => {
          const dateKey = date.toISOString().split('T')[0]
          return (
            <DayColumn
              key={dateKey}
              date={date}
              dayName={WEEKDAYS[idx]}
              meals={weekMeals[dateKey]}
              onAddMeal={handleAddMeal}
              onEditMeal={handleEditMeal}
              onDeleteMeal={onDeleteMeal}
              childrenAllergens={childrenAllergens}
            />
          )
        })}
      </div>

      {/* Meal Form Modal */}
      <AnimatePresence>
        {showMealForm && (
          <MealFormModal
            meal={editingMeal}
            mealType={selectedMealType}
            date={selectedDate}
            recipes={recipes}
            onSave={handleSaveMeal}
            onClose={() => { setShowMealForm(false); setEditingMeal(null) }}
          />
        )}
      </AnimatePresence>

      {/* Shopping List Modal */}
      <AnimatePresence>
        {showShoppingList && (
          <ShoppingList
            weekMeals={weekMeals}
            onClose={() => setShowShoppingList(false)}
          />
        )}
      </AnimatePresence>

      {/* Telegram Send Modal */}
      <AnimatePresence>
        {showTelegramSend && (
          <TelegramSendModal
            weekMeals={weekMeals}
            weekDates={weekDates}
            onClose={() => setShowTelegramSend(false)}
            onSend={(message, days) => {
              console.log('Telegram xabar:', message, days)
              // TODO: Backend API ga yuborish
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default MenuCalendar
export { 
  MealCard, 
  MealSlot, 
  DayColumn, 
  NutritionalSummary, 
  MealFormModal, 
  ShoppingList,
  TelegramSendModal,
  MEAL_TYPES,
  WEEKDAYS,
  WEEKDAYS_SHORT,
  ALLERGEN_ICONS
}
