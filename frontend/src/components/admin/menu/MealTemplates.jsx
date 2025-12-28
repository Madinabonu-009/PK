import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MealTemplates.css'

// Template Categories
const TEMPLATE_CATEGORIES = [
  { id: 'weekly', name: 'Haftalik', icon: '📅', description: 'To\'liq haftalik menyu' },
  { id: 'daily', name: 'Kunlik', icon: '☀️', description: 'Bir kunlik menyu' },
  { id: 'meal', name: 'Taom', icon: '🍽️', description: 'Bitta taom' },
  { id: 'seasonal', name: 'Mavsumiy', icon: '🍂', description: 'Mavsumga mos menyu' }
]

// Meal Types
const MEAL_TYPES = [
  { id: 'breakfast', name: 'Nonushta', icon: '🍳' },
  { id: 'lunch', name: 'Tushlik', icon: '🍲' },
  { id: 'snack', name: 'Poldnik', icon: '🍎' }
]

// Template Card Component
function TemplateCard({ template, onApply, onEdit, onDelete, onDuplicate, onFavorite }) {
  const [showPreview, setShowPreview] = useState(false)
  
  const categoryInfo = TEMPLATE_CATEGORIES.find(c => c.id === template.category)

  return (
    <motion.div
      className={`template-card ${template.isFavorite ? 'favorite' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <div className="template-header">
        <div className="template-icon">
          {categoryInfo?.icon || '📋'}
        </div>
        <div className="template-info">
          <h3>{template.name}</h3>
          <span className="template-category">{categoryInfo?.name}</span>
        </div>
        <button 
          className={`favorite-btn ${template.isFavorite ? 'active' : ''}`}
          onClick={() => onFavorite?.(template)}
        >
          {template.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {template.description && (
        <p className="template-description">{template.description}</p>
      )}

      <div className="template-meta">
        {template.meals && (
          <span className="meta-item">
            🍽️ {Object.keys(template.meals).length} taom
          </span>
        )}
        {template.totalCalories && (
          <span className="meta-item">
            🔥 {template.totalCalories} kkal
          </span>
        )}
        {template.usageCount !== undefined && (
          <span className="meta-item">
            📊 {template.usageCount} marta ishlatilgan
          </span>
        )}
      </div>

      <div className="template-actions">
        <button 
          className="action-btn preview"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? '📖 Yopish' : '👁️ Ko\'rish'}
        </button>
        <button className="action-btn" onClick={() => onDuplicate?.(template)}>
          📋
        </button>
        <button className="action-btn" onClick={() => onEdit?.(template)}>
          ✏️
        </button>
        <button className="action-btn delete" onClick={() => onDelete?.(template)}>
          🗑️
        </button>
        <button className="action-btn apply" onClick={() => onApply?.(template)}>
          ✓ Qo'llash
        </button>
      </div>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="template-preview"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {template.category === 'weekly' && template.weekMeals && (
              <div className="week-preview">
                {Object.entries(template.weekMeals).map(([day, meals]) => (
                  <div key={day} className="day-preview">
                    <span className="day-name">{day}</span>
                    <div className="day-meals">
                      {MEAL_TYPES.map(type => (
                        <span key={type.id} className="meal-preview">
                          {type.icon} {meals[type.id]?.name || '-'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {template.category === 'daily' && template.meals && (
              <div className="daily-preview">
                {MEAL_TYPES.map(type => (
                  <div key={type.id} className="meal-item">
                    <span className="meal-type">{type.icon} {type.name}</span>
                    <span className="meal-name">{template.meals[type.id]?.name || 'Belgilanmagan'}</span>
                  </div>
                ))}
              </div>
            )}

            {template.category === 'meal' && template.meal && (
              <div className="meal-preview-detail">
                <h4>{template.meal.name}</h4>
                {template.meal.ingredients && (
                  <div className="ingredients-preview">
                    <span className="label">Ingredientlar:</span>
                    <span>{template.meal.ingredients.map(i => i.name).join(', ')}</span>
                  </div>
                )}
                <div className="nutrition-preview">
                  <span>🔥 {template.meal.calories || 0} kkal</span>
                  <span>🥩 {template.meal.protein || 0}g</span>
                  <span>🍞 {template.meal.carbs || 0}g</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Template Form Modal
function TemplateFormModal({ template, weekMeals, onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: template?.id || null,
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'daily',
    meals: template?.meals || {},
    weekMeals: template?.weekMeals || weekMeals || {},
    meal: template?.meal || null,
    isFavorite: template?.isFavorite || false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Calculate total calories
    let totalCalories = 0
    if (formData.category === 'weekly' && formData.weekMeals) {
      Object.values(formData.weekMeals).forEach(dayMeals => {
        Object.values(dayMeals).forEach(meal => {
          totalCalories += meal?.calories || 0
        })
      })
    } else if (formData.category === 'daily' && formData.meals) {
      Object.values(formData.meals).forEach(meal => {
        totalCalories += meal?.calories || 0
      })
    } else if (formData.category === 'meal' && formData.meal) {
      totalCalories = formData.meal.calories || 0
    }

    onSave?.({
      ...formData,
      id: formData.id || `template-${Date.now()}`,
      totalCalories,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
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
        className="template-form-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{template ? '✏️ Shablonni tahrirlash' : '➕ Yangi shablon'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="template-form">
          <div className="form-group">
            <label>Shablon nomi *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Masalan: Yozgi menyu, Bolalar sevgan taomlar..."
              required
            />
          </div>

          <div className="form-group">
            <label>Tavsif</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Shablon haqida qisqacha..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Kategoriya</label>
            <div className="category-selector">
              {TEMPLATE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-btn ${formData.category === cat.id ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-desc">{cat.description}</span>
                </button>
              ))}
            </div>
          </div>

          {formData.category === 'weekly' && (
            <div className="form-info">
              <span className="info-icon">ℹ️</span>
              <p>Hozirgi haftalik menyu shablon sifatida saqlanadi</p>
            </div>
          )}

          {formData.category === 'daily' && (
            <div className="form-info">
              <span className="info-icon">ℹ️</span>
              <p>Bugungi menyu shablon sifatida saqlanadi</p>
            </div>
          )}

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

// Apply Template Modal
function ApplyTemplateModal({ template, onApply, onClose }) {
  const [targetDate, setTargetDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [applyMode, setApplyMode] = useState('replace') // replace | merge

  const handleApply = () => {
    onApply?.({
      template,
      targetDate: new Date(targetDate),
      mode: applyMode
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
        className="apply-template-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📋 Shablonni qo'llash</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="apply-content">
          <div className="template-summary">
            <span className="template-icon">
              {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.icon}
            </span>
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
            </div>
          </div>

          <div className="form-group">
            <label>Qaysi sanadan boshlab?</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Qo'llash usuli</label>
            <div className="mode-selector">
              <button
                type="button"
                className={`mode-btn ${applyMode === 'replace' ? 'active' : ''}`}
                onClick={() => setApplyMode('replace')}
              >
                <span className="mode-icon">🔄</span>
                <span className="mode-name">Almashtirish</span>
                <span className="mode-desc">Mavjud menyuni o'chiradi</span>
              </button>
              <button
                type="button"
                className={`mode-btn ${applyMode === 'merge' ? 'active' : ''}`}
                onClick={() => setApplyMode('merge')}
              >
                <span className="mode-icon">➕</span>
                <span className="mode-name">Qo'shish</span>
                <span className="mode-desc">Bo'sh joylarga qo'shadi</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button type="button" className="btn-primary" onClick={handleApply}>
            ✓ Qo'llash
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Copy from Previous Week Modal
function CopyWeekModal({ onCopy, onClose }) {
  const [weeksBack, setWeeksBack] = useState(1)

  const getWeekLabel = (weeks) => {
    const date = new Date()
    date.setDate(date.getDate() - (weeks * 7))
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay() + 1)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.getDate()}.${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}.${endOfWeek.getMonth() + 1}`
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
        className="copy-week-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📋 Oldingi haftadan nusxa olish</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="copy-content">
          <div className="week-selector">
            {[1, 2, 3, 4].map(weeks => (
              <button
                key={weeks}
                className={`week-btn ${weeksBack === weeks ? 'active' : ''}`}
                onClick={() => setWeeksBack(weeks)}
              >
                <span className="week-number">{weeks} hafta oldin</span>
                <span className="week-dates">{getWeekLabel(weeks)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button 
            type="button" 
            className="btn-primary"
            onClick={() => { onCopy?.(weeksBack); onClose() }}
          >
            📋 Nusxa olish
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Meal Templates Component
function MealTemplates({
  templates = [],
  currentWeekMeals = {},
  currentDayMeals = {},
  onSaveTemplate,
  onDeleteTemplate,
  onApplyTemplate,
  onCopyFromWeek
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [applyingTemplate, setApplyingTemplate] = useState(null)
  const [showCopyWeek, setShowCopyWeek] = useState(false)

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory)
    }

    if (showFavoritesOnly) {
      result = result.filter(t => t.isFavorite)
    }

    // Sort: favorites first, then by usage count
    result.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      return (b.usageCount || 0) - (a.usageCount || 0)
    })

    return result
  }, [templates, searchQuery, selectedCategory, showFavoritesOnly])

  const handleSaveTemplate = (templateData) => {
    onSaveTemplate?.(templateData)
    setShowTemplateForm(false)
    setEditingTemplate(null)
  }

  const handleDeleteTemplate = (template) => {
    if (window.confirm(`"${template.name}" shablonini o'chirmoqchimisiz?`)) {
      onDeleteTemplate?.(template.id)
    }
  }

  const handleDuplicateTemplate = (template) => {
    setEditingTemplate({
      ...template,
      id: null,
      name: `${template.name} (nusxa)`,
      isFavorite: false
    })
    setShowTemplateForm(true)
  }

  const handleToggleFavorite = (template) => {
    onSaveTemplate?.({
      ...template,
      isFavorite: !template.isFavorite
    })
  }

  const handleSaveCurrentAsTemplate = (category) => {
    setEditingTemplate({
      category,
      meals: category === 'daily' ? currentDayMeals : null,
      weekMeals: category === 'weekly' ? currentWeekMeals : null
    })
    setShowTemplateForm(true)
  }

  return (
    <div className="meal-templates">
      {/* Header */}
      <div className="templates-header">
        <div className="header-title">
          <h2>📋 Menyu shablonlari</h2>
          <span className="template-count">{filteredTemplates.length} ta shablon</span>
        </div>

        <div className="header-actions">
          <button 
            className="action-btn"
            onClick={() => setShowCopyWeek(true)}
          >
            📅 Oldingi haftadan
          </button>
          <button 
            className="action-btn"
            onClick={() => handleSaveCurrentAsTemplate('daily')}
          >
            ☀️ Bugunni saqlash
          </button>
          <button 
            className="action-btn"
            onClick={() => handleSaveCurrentAsTemplate('weekly')}
          >
            📅 Haftani saqlash
          </button>
          <button 
            className="action-btn primary"
            onClick={() => { setEditingTemplate(null); setShowTemplateForm(true) }}
          >
            ➕ Yangi shablon
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="templates-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Shablon qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Barchasi
          </button>
          {TEMPLATE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <button
          className={`favorites-toggle ${showFavoritesOnly ? 'active' : ''}`}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          ⭐ Sevimlilar
        </button>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onApply={() => setApplyingTemplate(template)}
                onEdit={() => { setEditingTemplate(template); setShowTemplateForm(true) }}
                onDelete={() => handleDeleteTemplate(template)}
                onDuplicate={() => handleDuplicateTemplate(template)}
                onFavorite={() => handleToggleFavorite(template)}
              />
            ))
          ) : (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="empty-icon">📋</span>
              <h3>Shablon topilmadi</h3>
              <p>Birinchi shablonni yarating yoki filtrlarni o'zgartiring</p>
              <button
                className="btn-primary"
                onClick={() => { setEditingTemplate(null); setShowTemplateForm(true) }}
              >
                ➕ Shablon yaratish
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTemplateForm && (
          <TemplateFormModal
            template={editingTemplate}
            weekMeals={currentWeekMeals}
            onSave={handleSaveTemplate}
            onClose={() => { setShowTemplateForm(false); setEditingTemplate(null) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {applyingTemplate && (
          <ApplyTemplateModal
            template={applyingTemplate}
            onApply={onApplyTemplate}
            onClose={() => setApplyingTemplate(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCopyWeek && (
          <CopyWeekModal
            onCopy={onCopyFromWeek}
            onClose={() => setShowCopyWeek(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default MealTemplates
export {
  TemplateCard,
  TemplateFormModal,
  ApplyTemplateModal,
  CopyWeekModal,
  TEMPLATE_CATEGORIES
}
