import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AdvancedFilters.css'

// Filter Operators
const FILTER_OPERATORS = {
  equals: { label: 'Teng', symbol: '=' },
  notEquals: { label: 'Teng emas', symbol: '≠' },
  contains: { label: "O'z ichiga oladi", symbol: '∋' },
  notContains: { label: "O'z ichiga olmaydi", symbol: '∌' },
  startsWith: { label: 'Boshlanadi', symbol: '^' },
  endsWith: { label: 'Tugaydi', symbol: '$' },
  greaterThan: { label: 'Katta', symbol: '>' },
  lessThan: { label: 'Kichik', symbol: '<' },
  between: { label: 'Orasida', symbol: '↔' },
  isEmpty: { label: "Bo'sh", symbol: '∅' },
  isNotEmpty: { label: "Bo'sh emas", symbol: '≠∅' }
}

// Field Types
const FIELD_TYPES = {
  text: { label: 'Matn', operators: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'] },
  number: { label: 'Raqam', operators: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between', 'isEmpty', 'isNotEmpty'] },
  date: { label: 'Sana', operators: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between', 'isEmpty', 'isNotEmpty'] },
  select: { label: 'Tanlash', operators: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'] },
  boolean: { label: 'Ha/Yo\'q', operators: ['equals'] }
}

// Filter Condition Component
function FilterCondition({ condition, fields, onUpdate, onRemove, isFirst }) {
  const field = fields.find(f => f.id === condition.field)
  const fieldType = FIELD_TYPES[field?.type || 'text']
  const availableOperators = fieldType.operators

  return (
    <motion.div
      className="filter-condition"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {!isFirst && (
        <select
          className="logic-select"
          value={condition.logic || 'and'}
          onChange={e => onUpdate({ ...condition, logic: e.target.value })}
        >
          <option value="and">VA</option>
          <option value="or">YOKI</option>
        </select>
      )}

      <select
        className="field-select"
        value={condition.field || ''}
        onChange={e => onUpdate({ ...condition, field: e.target.value, operator: 'equals', value: '' })}
      >
        <option value="">Maydonni tanlang</option>
        {fields.map(f => (
          <option key={f.id} value={f.id}>{f.label}</option>
        ))}
      </select>

      <select
        className="operator-select"
        value={condition.operator || 'equals'}
        onChange={e => onUpdate({ ...condition, operator: e.target.value })}
        disabled={!condition.field}
      >
        {availableOperators.map(op => (
          <option key={op} value={op}>
            {FILTER_OPERATORS[op].symbol} {FILTER_OPERATORS[op].label}
          </option>
        ))}
      </select>

      {condition.operator !== 'isEmpty' && condition.operator !== 'isNotEmpty' && (
        <>
          {field?.type === 'select' ? (
            <select
              className="value-input"
              value={condition.value || ''}
              onChange={e => onUpdate({ ...condition, value: e.target.value })}
            >
              <option value="">Tanlang</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field?.type === 'boolean' ? (
            <select
              className="value-input"
              value={condition.value || ''}
              onChange={e => onUpdate({ ...condition, value: e.target.value })}
            >
              <option value="">Tanlang</option>
              <option value="true">Ha</option>
              <option value="false">Yo'q</option>
            </select>
          ) : field?.type === 'date' ? (
            <input
              type="date"
              className="value-input"
              value={condition.value || ''}
              onChange={e => onUpdate({ ...condition, value: e.target.value })}
            />
          ) : (
            <input
              type={field?.type === 'number' ? 'number' : 'text'}
              className="value-input"
              value={condition.value || ''}
              onChange={e => onUpdate({ ...condition, value: e.target.value })}
              placeholder="Qiymat..."
            />
          )}

          {condition.operator === 'between' && (
            <>
              <span className="between-separator">va</span>
              <input
                type={field?.type === 'number' ? 'number' : field?.type === 'date' ? 'date' : 'text'}
                className="value-input"
                value={condition.value2 || ''}
                onChange={e => onUpdate({ ...condition, value2: e.target.value })}
                placeholder="Qiymat 2..."
              />
            </>
          )}
        </>
      )}

      <button className="remove-btn" onClick={onRemove}>✕</button>
    </motion.div>
  )
}

// Saved Filter Item
function SavedFilterItem({ filter, onLoad, onDelete, onShare }) {
  return (
    <div className="saved-filter-item">
      <div className="filter-info">
        <span className="filter-name">{filter.name}</span>
        <span className="filter-count">{filter.conditions?.length || 0} shart</span>
      </div>
      <div className="filter-actions">
        <button className="action-btn" onClick={() => onLoad?.(filter)}>
          📥 Yuklash
        </button>
        <button className="action-btn" onClick={() => onShare?.(filter)}>
          🔗
        </button>
        <button className="action-btn delete" onClick={() => onDelete?.(filter.id)}>
          🗑️
        </button>
      </div>
    </div>
  )
}


// Save Filter Modal
function SaveFilterModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onSave?.({ name, description })
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
        className="save-filter-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
      >
        <h3>💾 Filterni saqlash</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nomi *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Masalan: Faol bolalar"
              required
            />
          </div>
          <div className="form-group">
            <label>Tavsif</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ixtiyoriy tavsif..."
            />
          </div>
          <div className="modal-actions">
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

// Main Advanced Filters Component
function AdvancedFilters({
  fields = [],
  savedFilters = [],
  onApply,
  onSaveFilter,
  onDeleteFilter,
  onShareFilter,
  onClear
}) {
  const [conditions, setConditions] = useState([{ id: Date.now(), field: '', operator: 'equals', value: '' }])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showSavedFilters, setShowSavedFilters] = useState(false)

  const addCondition = () => {
    setConditions(prev => [
      ...prev,
      { id: Date.now(), field: '', operator: 'equals', value: '', logic: 'and' }
    ])
  }

  const updateCondition = (id, updates) => {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const removeCondition = (id) => {
    if (conditions.length > 1) {
      setConditions(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleApply = () => {
    const validConditions = conditions.filter(c => c.field && c.value)
    onApply?.(validConditions)
  }

  const handleClear = () => {
    setConditions([{ id: Date.now(), field: '', operator: 'equals', value: '' }])
    onClear?.()
  }

  const handleSave = (filterInfo) => {
    onSaveFilter?.({
      ...filterInfo,
      conditions
    })
  }

  const handleLoadFilter = (filter) => {
    setConditions(filter.conditions || [])
    setShowSavedFilters(false)
  }

  const validConditionsCount = conditions.filter(c => c.field && c.value).length

  return (
    <div className="advanced-filters">
      {/* Header */}
      <div className="filters-header">
        <h3>🔍 Kengaytirilgan filtr</h3>
        <div className="header-actions">
          <button 
            className={`toggle-btn ${showSavedFilters ? 'active' : ''}`}
            onClick={() => setShowSavedFilters(!showSavedFilters)}
          >
            📁 Saqlangan ({savedFilters.length})
          </button>
        </div>
      </div>

      {/* Saved Filters Panel */}
      <AnimatePresence>
        {showSavedFilters && (
          <motion.div
            className="saved-filters-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {savedFilters.length > 0 ? (
              <div className="saved-filters-list">
                {savedFilters.map(filter => (
                  <SavedFilterItem
                    key={filter.id}
                    filter={filter}
                    onLoad={handleLoadFilter}
                    onDelete={onDeleteFilter}
                    onShare={onShareFilter}
                  />
                ))}
              </div>
            ) : (
              <p className="empty-message">Saqlangan filtrlar yo'q</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Conditions */}
      <div className="conditions-list">
        <AnimatePresence>
          {conditions.map((condition, index) => (
            <FilterCondition
              key={condition.id}
              condition={condition}
              fields={fields}
              isFirst={index === 0}
              onUpdate={(updates) => updateCondition(condition.id, updates)}
              onRemove={() => removeCondition(condition.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add Condition Button */}
      <button className="add-condition-btn" onClick={addCondition}>
        ➕ Shart qo'shish
      </button>

      {/* Actions */}
      <div className="filters-actions">
        <button className="btn-secondary" onClick={handleClear}>
          🗑️ Tozalash
        </button>
        <button 
          className="btn-secondary"
          onClick={() => setShowSaveModal(true)}
          disabled={validConditionsCount === 0}
        >
          💾 Saqlash
        </button>
        <button 
          className="btn-primary"
          onClick={handleApply}
          disabled={validConditionsCount === 0}
        >
          ✓ Qo'llash ({validConditionsCount})
        </button>
      </div>

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <SaveFilterModal
            onSave={handleSave}
            onClose={() => setShowSaveModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdvancedFilters
export {
  FilterCondition,
  SavedFilterItem,
  SaveFilterModal,
  FILTER_OPERATORS,
  FIELD_TYPES
}
