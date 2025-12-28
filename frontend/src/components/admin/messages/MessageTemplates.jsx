import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MessageTemplates.css'

// Template Categories
const TEMPLATE_CATEGORIES = {
  attendance: { label: 'Davomat', icon: '📋', color: '#3b82f6' },
  payment: { label: "To'lov", icon: '💰', color: '#10b981' },
  event: { label: 'Tadbirlar', icon: '🎉', color: '#8b5cf6' },
  general: { label: 'Umumiy', icon: '📝', color: '#6b7280' },
  emergency: { label: 'Shoshilinch', icon: '🚨', color: '#ef4444' }
}

// Template Variables
const TEMPLATE_VARIABLES = [
  { key: '{{child_name}}', label: 'Bola ismi', example: 'Ali' },
  { key: '{{parent_name}}', label: 'Ota-ona ismi', example: 'Akbar' },
  { key: '{{group_name}}', label: 'Guruh nomi', example: "Quyosh" },
  { key: '{{date}}', label: 'Sana', example: '25.12.2025' },
  { key: '{{time}}', label: 'Vaqt', example: '09:00' },
  { key: '{{amount}}', label: "To'lov summasi", example: '500,000' },
  { key: '{{kindergarten_name}}', label: "Bog'cha nomi", example: 'Play Kids' }
]

// Template Card
function TemplateCard({ template, onEdit, onDelete, onUse }) {
  const category = TEMPLATE_CATEGORIES[template.category] || TEMPLATE_CATEGORIES.general

  return (
    <motion.div
      className="template-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="template-header">
        <span 
          className="category-badge"
          style={{ backgroundColor: `${category.color}20`, color: category.color }}
        >
          {category.icon} {category.label}
        </span>
        {template.isDefault && (
          <span className="default-badge">Standart</span>
        )}
      </div>

      <h3 className="template-title">{template.title}</h3>
      <p className="template-preview">{template.content}</p>

      <div className="template-meta">
        <span className="usage-count">
          📊 {template.usageCount || 0} marta ishlatilgan
        </span>
      </div>

      <div className="template-actions">
        <button className="action-btn use" onClick={() => onUse?.(template)}>
          ✨ Ishlatish
        </button>
        <button className="action-btn edit" onClick={() => onEdit?.(template)}>
          ✏️
        </button>
        {!template.isDefault && (
          <button className="action-btn delete" onClick={() => onDelete?.(template)}>
            🗑️
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Template Editor Modal
function TemplateEditorModal({ template, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: template?.title || '',
    category: template?.category || 'general',
    content: template?.content || '',
    isDefault: template?.isDefault || false
  })
  const [previewMode, setPreviewMode] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) return
    onSave?.({ ...template, ...formData })
    onClose()
  }

  const insertVariable = (variable) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + variable
    }))
  }

  const getPreviewContent = () => {
    let preview = formData.content
    TEMPLATE_VARIABLES.forEach(v => {
      preview = preview.replace(new RegExp(v.key.replace(/[{}]/g, '\\$&'), 'g'), v.example)
    })
    return preview
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
        className="template-editor-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{template ? '✏️ Shablonni tahrirlash' : '➕ Yangi shablon'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="template-form">
          <div className="form-row">
            <div className="form-group">
              <label>Shablon nomi *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Masalan: Davomat xabarnomasi"
                required
              />
            </div>

            <div className="form-group">
              <label>Kategoriya</label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                {Object.entries(TEMPLATE_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="content-header">
              <label>Xabar matni *</label>
              <div className="view-toggle">
                <button
                  type="button"
                  className={!previewMode ? 'active' : ''}
                  onClick={() => setPreviewMode(false)}
                >
                  Tahrirlash
                </button>
                <button
                  type="button"
                  className={previewMode ? 'active' : ''}
                  onClick={() => setPreviewMode(true)}
                >
                  Ko'rish
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="content-preview">
                {getPreviewContent()}
              </div>
            ) : (
              <textarea
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Xabar matnini kiriting..."
                rows={6}
                required
              />
            )}
          </div>

          <div className="variables-section">
            <label>O'zgaruvchilar</label>
            <p className="variables-hint">
              Quyidagi o'zgaruvchilarni xabarga qo'shish uchun bosing
            </p>
            <div className="variables-list">
              {TEMPLATE_VARIABLES.map(v => (
                <button
                  key={v.key}
                  type="button"
                  className="variable-btn"
                  onClick={() => insertVariable(v.key)}
                  title={`Misol: ${v.example}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
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


// Variable Substitution Helper
function substituteVariables(content, data) {
  let result = content
  if (data.childName) result = result.replace(/{{child_name}}/g, data.childName)
  if (data.parentName) result = result.replace(/{{parent_name}}/g, data.parentName)
  if (data.groupName) result = result.replace(/{{group_name}}/g, data.groupName)
  if (data.date) result = result.replace(/{{date}}/g, data.date)
  if (data.time) result = result.replace(/{{time}}/g, data.time)
  if (data.amount) result = result.replace(/{{amount}}/g, data.amount)
  if (data.kindergartenName) result = result.replace(/{{kindergarten_name}}/g, data.kindergartenName)
  return result
}

// Main Message Templates Component
function MessageTemplates({
  templates = [],
  suggestedTemplates = [],
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onUseTemplate
}) {
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const handleSave = (templateData) => {
    if (editingTemplate) {
      onUpdateTemplate?.(templateData)
    } else {
      onCreateTemplate?.(templateData)
    }
  }

  const handleDelete = (template) => {
    if (window.confirm(`"${template.title}" shablonini o'chirmoqchimisiz?`)) {
      onDeleteTemplate?.(template.id)
    }
  }

  return (
    <div className="message-templates">
      {/* Header */}
      <div className="templates-header">
        <div className="header-info">
          <h2>📝 Xabar shablonlari</h2>
          <p>{templates.length} ta shablon mavjud</p>
        </div>

        <button className="create-btn" onClick={handleCreate}>
          ➕ Yangi shablon
        </button>
      </div>

      {/* Suggested Templates */}
      {suggestedTemplates.length > 0 && (
        <div className="suggested-section">
          <h3>✨ Tavsiya etilgan shablonlar</h3>
          <div className="suggested-list">
            {suggestedTemplates.map(template => (
              <div key={template.id} className="suggested-item">
                <span className="suggested-icon">
                  {TEMPLATE_CATEGORIES[template.category]?.icon || '📝'}
                </span>
                <span className="suggested-title">{template.title}</span>
                <button 
                  className="use-btn"
                  onClick={() => onUseTemplate?.(template)}
                >
                  Ishlatish
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="templates-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Shablon qidirish..."
          />
        </div>

        <div className="category-filters">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Barchasi
          </button>
          {Object.entries(TEMPLATE_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              className={`filter-btn ${selectedCategory === key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(key)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        <AnimatePresence>
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUse={onUseTemplate}
            />
          ))}
        </AnimatePresence>

        {filteredTemplates.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>Shablonlar topilmadi</h3>
            <p>
              {searchQuery || selectedCategory !== 'all'
                ? "Qidiruv natijasi bo'sh"
                : "Hali shablonlar yaratilmagan"}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button className="create-btn" onClick={handleCreate}>
                ➕ Birinchi shablonni yarating
              </button>
            )}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <TemplateEditorModal
            template={editingTemplate}
            onSave={handleSave}
            onClose={() => setShowEditor(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessageTemplates
export {
  TemplateCard,
  TemplateEditorModal,
  substituteVariables,
  TEMPLATE_CATEGORIES,
  TEMPLATE_VARIABLES
}
