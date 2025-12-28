import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ShoppingListGenerator.css'

// Ingredient Categories
const INGREDIENT_CATEGORIES = [
  { id: 'vegetables', name: 'Sabzavotlar', icon: '🥬', color: '#10b981' },
  { id: 'fruits', name: 'Mevalar', icon: '🍎', color: '#f59e0b' },
  { id: 'meat', name: 'Go\'sht', icon: '🥩', color: '#ef4444' },
  { id: 'dairy', name: 'Sut mahsulotlari', icon: '🧀', color: '#3b82f6' },
  { id: 'grains', name: 'Don mahsulotlari', icon: '🌾', color: '#a855f7' },
  { id: 'spices', name: 'Ziravorlar', icon: '🧂', color: '#ec4899' },
  { id: 'oils', name: 'Yog\'lar', icon: '🫒', color: '#84cc16' },
  { id: 'other', name: 'Boshqa', icon: '📦', color: '#6b7280' }
]

// Shopping Item Component
function ShoppingItem({ item, checked, onToggle, onUpdateQuantity, onRemove }) {
  const category = INGREDIENT_CATEGORIES.find(c => c.id === item.category)

  return (
    <motion.div
      className={`shopping-item ${checked ? 'checked' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      <label className="item-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle?.(item.id)}
        />
        <span className="checkmark">✓</span>
      </label>

      <span className="item-category" style={{ color: category?.color }}>
        {category?.icon || '📦'}
      </span>

      <div className="item-info">
        <span className="item-name">{item.name}</span>
        {item.notes && <span className="item-notes">{item.notes}</span>}
      </div>

      <div className="item-quantity">
        <button 
          className="qty-btn"
          onClick={() => onUpdateQuantity?.(item.id, Math.max(0, item.amount - 1))}
        >
          -
        </button>
        <span className="qty-value">{item.amount}</span>
        <span className="qty-unit">{item.unit}</span>
        <button 
          className="qty-btn"
          onClick={() => onUpdateQuantity?.(item.id, item.amount + 1)}
        >
          +
        </button>
      </div>

      {item.estimatedCost && (
        <span className="item-cost">
          ~{item.estimatedCost.toLocaleString()} so'm
        </span>
      )}

      <button className="remove-btn" onClick={() => onRemove?.(item.id)}>
        ✕
      </button>
    </motion.div>
  )
}

// Category Section Component
function CategorySection({ category, items, checkedItems, onToggle, onUpdateQuantity, onRemove, onToggleAll }) {
  const allChecked = items.every(item => checkedItems.includes(item.id))
  const someChecked = items.some(item => checkedItems.includes(item.id))

  return (
    <div className="category-section">
      <div className="category-header">
        <label className="category-checkbox">
          <input
            type="checkbox"
            checked={allChecked}
            ref={el => el && (el.indeterminate = someChecked && !allChecked)}
            onChange={() => onToggleAll?.(category.id, !allChecked)}
          />
          <span className="checkmark">✓</span>
        </label>
        <span className="category-icon" style={{ color: category.color }}>
          {category.icon}
        </span>
        <h3>{category.name}</h3>
        <span className="item-count">{items.length} ta</span>
      </div>

      <div className="category-items">
        <AnimatePresence>
          {items.map(item => (
            <ShoppingItem
              key={item.id}
              item={item}
              checked={checkedItems.includes(item.id)}
              onToggle={onToggle}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Add Item Modal
function AddItemModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    unit: 'kg',
    category: 'other',
    notes: ''
  })

  const units = ['kg', 'g', 'l', 'ml', 'dona', 'bog\'lam', 'quti', 'paket']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.amount) {
      onAdd?.({
        ...formData,
        id: `item-${Date.now()}`,
        amount: Number(formData.amount)
      })
      onClose()
    }
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
        className="add-item-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>➕ Mahsulot qo'shish</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-group">
            <label>Mahsulot nomi *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Masalan: Sabzi, Kartoshka..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Miqdor *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0"
                min="0"
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label>Birlik</label>
              <select
                value={formData.unit}
                onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Kategoriya</label>
            <div className="category-grid">
              {INGREDIENT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-btn ${formData.category === cat.id ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  style={{ '--cat-color': cat.color }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Izoh (ixtiyoriy)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Masalan: Yangi, Organik..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary">
              ➕ Qo'shish
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Print View Component
function PrintView({ items, weekRange, onClose }) {
  const groupedItems = useMemo(() => {
    const groups = {}
    items.forEach(item => {
      const cat = item.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    })
    return groups
  }, [items])

  const handlePrint = () => {
    window.print()
  }

  return (
    <motion.div
      className="modal-overlay print-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="print-view-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="print-header no-print">
          <h2>🖨️ Chop etish</h2>
          <div className="print-actions">
            <button className="btn-secondary" onClick={onClose}>Yopish</button>
            <button className="btn-primary" onClick={handlePrint}>🖨️ Chop etish</button>
          </div>
        </div>

        <div className="print-content">
          <div className="print-title">
            <h1>🛒 Xarid ro'yxati</h1>
            <p>{weekRange}</p>
          </div>

          {Object.entries(groupedItems).map(([catId, catItems]) => {
            const category = INGREDIENT_CATEGORIES.find(c => c.id === catId)
            return (
              <div key={catId} className="print-category">
                <h3>{category?.icon} {category?.name || catId}</h3>
                <table>
                  <tbody>
                    {catItems.map(item => (
                      <tr key={item.id}>
                        <td className="check-col">☐</td>
                        <td className="name-col">{item.name}</td>
                        <td className="qty-col">{item.amount} {item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}

          <div className="print-footer">
            <p>Jami: {items.length} ta mahsulot</p>
            <p>Sana: {new Date().toLocaleDateString('uz-UZ')}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Shopping List Generator Component
function ShoppingListGenerator({
  weekMeals = {},
  weekRange = '',
  onSaveList,
  onExportList
}) {
  const [checkedItems, setCheckedItems] = useState([])
  const [additionalItems, setAdditionalItems] = useState([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [showPrintView, setShowPrintView] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')

  // Generate shopping list from menu
  const generatedItems = useMemo(() => {
    const itemsMap = {}

    Object.values(weekMeals).forEach(dayMeals => {
      Object.values(dayMeals || {}).forEach(meal => {
        if (meal?.ingredients) {
          meal.ingredients.forEach(ing => {
            const key = `${ing.name}-${ing.unit}`
            if (itemsMap[key]) {
              itemsMap[key].amount += ing.amount || 0
            } else {
              itemsMap[key] = {
                id: key,
                name: ing.name,
                amount: ing.amount || 0,
                unit: ing.unit || 'kg',
                category: ing.category || 'other',
                estimatedCost: ing.cost
              }
            }
          })
        }
      })
    })

    return Object.values(itemsMap).sort((a, b) => a.name.localeCompare(b.name))
  }, [weekMeals])

  // Combine generated and additional items
  const allItems = useMemo(() => {
    return [...generatedItems, ...additionalItems]
  }, [generatedItems, additionalItems])

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (filterCategory === 'all') return allItems
    return allItems.filter(item => item.category === filterCategory)
  }, [allItems, filterCategory])

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = {}
    filteredItems.forEach(item => {
      const cat = item.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    })
    return groups
  }, [filteredItems])

  // Statistics
  const stats = useMemo(() => {
    const total = allItems.length
    const checked = checkedItems.length
    const remaining = total - checked
    const estimatedTotal = allItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)

    return { total, checked, remaining, estimatedTotal }
  }, [allItems, checkedItems])

  const handleToggleItem = (itemId) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleToggleCategory = (categoryId, checked) => {
    const categoryItems = allItems.filter(item => item.category === categoryId)
    const categoryIds = categoryItems.map(item => item.id)

    if (checked) {
      setCheckedItems(prev => [...new Set([...prev, ...categoryIds])])
    } else {
      setCheckedItems(prev => prev.filter(id => !categoryIds.includes(id)))
    }
  }

  const handleUpdateQuantity = (itemId, newAmount) => {
    // Update in additional items if exists there
    setAdditionalItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, amount: newAmount } : item
      )
    )
  }

  const handleRemoveItem = (itemId) => {
    setAdditionalItems(prev => prev.filter(item => item.id !== itemId))
    setCheckedItems(prev => prev.filter(id => id !== itemId))
  }

  const handleAddItem = (item) => {
    setAdditionalItems(prev => [...prev, item])
  }

  const handleClearChecked = () => {
    setAdditionalItems(prev => prev.filter(item => !checkedItems.includes(item.id)))
    setCheckedItems([])
  }

  const handleExport = (format) => {
    const uncheckedItems = allItems.filter(item => !checkedItems.includes(item.id))
    onExportList?.(uncheckedItems, format)
  }

  return (
    <div className="shopping-list-generator">
      {/* Header */}
      <div className="generator-header">
        <div className="header-title">
          <h2>🛒 Xarid ro'yxati</h2>
          {weekRange && <span className="week-range">{weekRange}</span>}
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={() => setShowAddItem(true)}>
            ➕ Qo'shish
          </button>
          <button className="action-btn" onClick={() => setShowPrintView(true)}>
            🖨️ Chop etish
          </button>
          <button className="action-btn" onClick={() => handleExport('excel')}>
            📊 Excel
          </button>
          <button className="action-btn primary" onClick={() => onSaveList?.(allItems)}>
            💾 Saqlash
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="list-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Jami</span>
        </div>
        <div className="stat-item checked">
          <span className="stat-value">{stats.checked}</span>
          <span className="stat-label">Sotib olingan</span>
        </div>
        <div className="stat-item remaining">
          <span className="stat-value">{stats.remaining}</span>
          <span className="stat-label">Qolgan</span>
        </div>
        {stats.estimatedTotal > 0 && (
          <div className="stat-item cost">
            <span className="stat-value">~{stats.estimatedTotal.toLocaleString()}</span>
            <span className="stat-label">so'm</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${stats.total > 0 ? (stats.checked / stats.total) * 100 : 0}%` }}
          />
        </div>
        <span className="progress-text">
          {stats.total > 0 ? Math.round((stats.checked / stats.total) * 100) : 0}% bajarildi
        </span>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          Barchasi
        </button>
        {INGREDIENT_CATEGORIES.map(cat => {
          const count = allItems.filter(item => item.category === cat.id).length
          if (count === 0) return null
          return (
            <button
              key={cat.id}
              className={`filter-btn ${filterCategory === cat.id ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat.id)}
            >
              {cat.icon} {count}
            </button>
          )
        })}
      </div>

      {/* Shopping List */}
      <div className="shopping-list">
        {Object.entries(groupedItems).map(([catId, items]) => {
          const category = INGREDIENT_CATEGORIES.find(c => c.id === catId) || {
            id: catId,
            name: catId,
            icon: '📦',
            color: '#6b7280'
          }
          return (
            <CategorySection
              key={catId}
              category={category}
              items={items}
              checkedItems={checkedItems}
              onToggle={handleToggleItem}
              onToggleAll={handleToggleCategory}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          )
        })}

        {filteredItems.length === 0 && (
          <div className="empty-list">
            <span className="empty-icon">📋</span>
            <h3>Ro'yxat bo'sh</h3>
            <p>Menyu asosida avtomatik yaratiladi yoki qo'lda qo'shing</p>
            <button className="btn-primary" onClick={() => setShowAddItem(true)}>
              ➕ Mahsulot qo'shish
            </button>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      {checkedItems.length > 0 && (
        <motion.div
          className="actions-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>{checkedItems.length} ta tanlangan</span>
          <button className="clear-btn" onClick={handleClearChecked}>
            🗑️ Tanlanganlarni o'chirish
          </button>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddItem && (
          <AddItemModal
            onAdd={handleAddItem}
            onClose={() => setShowAddItem(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrintView && (
          <PrintView
            items={allItems.filter(item => !checkedItems.includes(item.id))}
            weekRange={weekRange}
            onClose={() => setShowPrintView(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ShoppingListGenerator
export {
  ShoppingItem,
  CategorySection,
  AddItemModal,
  PrintView,
  INGREDIENT_CATEGORIES
}
