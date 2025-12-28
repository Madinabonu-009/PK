import { useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import './CustomizableWidgets.css'

// Widget Types
const WIDGET_TYPES = {
  kpi: { label: 'KPI', icon: '📊', minWidth: 1, minHeight: 1 },
  chart: { label: 'Grafik', icon: '📈', minWidth: 2, minHeight: 2 },
  table: { label: 'Jadval', icon: '📋', minWidth: 2, minHeight: 2 },
  list: { label: "Ro'yxat", icon: '📝', minWidth: 1, minHeight: 2 },
  calendar: { label: 'Kalendar', icon: '📅', minWidth: 2, minHeight: 2 },
  map: { label: 'Xarita', icon: '🗺️', minWidth: 2, minHeight: 2 }
}

// Widget Sizes
const WIDGET_SIZES = {
  small: { label: 'Kichik', cols: 1, rows: 1 },
  medium: { label: "O'rta", cols: 2, rows: 1 },
  large: { label: 'Katta', cols: 2, rows: 2 },
  wide: { label: 'Keng', cols: 3, rows: 1 },
  tall: { label: 'Baland', cols: 1, rows: 2 }
}

// Widget Component
function Widget({ widget, isEditing, onRemove, onResize, onSettings, children }) {
  const [showMenu, setShowMenu] = useState(false)
  const widgetType = WIDGET_TYPES[widget.type] || WIDGET_TYPES.kpi

  return (
    <motion.div
      className={`widget widget-${widget.size || 'medium'} ${isEditing ? 'editing' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="widget-header">
        <span className="widget-icon">{widgetType.icon}</span>
        <span className="widget-title">{widget.title}</span>
        
        {isEditing && (
          <div className="widget-actions">
            <button 
              className="action-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋮
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  className="widget-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button onClick={() => { onSettings?.(widget); setShowMenu(false); }}>
                    ⚙️ Sozlamalar
                  </button>
                  <div className="menu-divider" />
                  <span className="menu-label">O'lcham</span>
                  {Object.entries(WIDGET_SIZES).map(([key, size]) => (
                    <button 
                      key={key}
                      className={widget.size === key ? 'active' : ''}
                      onClick={() => { onResize?.(widget.id, key); setShowMenu(false); }}
                    >
                      {size.label}
                    </button>
                  ))}
                  <div className="menu-divider" />
                  <button className="danger" onClick={() => { onRemove?.(widget.id); setShowMenu(false); }}>
                    🗑️ O'chirish
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="widget-content">
        {children || (
          <div className="widget-placeholder">
            <span>{widgetType.icon}</span>
            <p>{widget.title}</p>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="widget-drag-handle">
          <span>⋮⋮</span>
        </div>
      )}
    </motion.div>
  )
}

// Widget Picker Modal
function WidgetPickerModal({ onSelect, onClose }) {
  const [selectedType, setSelectedType] = useState(null)
  const [widgetTitle, setWidgetTitle] = useState('')
  const [widgetSize, setWidgetSize] = useState('medium')

  const handleAdd = () => {
    if (selectedType && widgetTitle.trim()) {
      onSelect?.({
        id: Date.now().toString(),
        type: selectedType,
        title: widgetTitle,
        size: widgetSize
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
        className="widget-picker-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>➕ Widget qo'shish</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="picker-content">
          <div className="form-group">
            <label>Widget turi</label>
            <div className="widget-types-grid">
              {Object.entries(WIDGET_TYPES).map(([key, type]) => (
                <button
                  key={key}
                  className={`type-btn ${selectedType === key ? 'selected' : ''}`}
                  onClick={() => setSelectedType(key)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Widget nomi</label>
            <input
              type="text"
              value={widgetTitle}
              onChange={e => setWidgetTitle(e.target.value)}
              placeholder="Masalan: Kunlik davomat"
            />
          </div>

          <div className="form-group">
            <label>O'lcham</label>
            <div className="size-options">
              {Object.entries(WIDGET_SIZES).map(([key, size]) => (
                <button
                  key={key}
                  className={`size-btn ${widgetSize === key ? 'selected' : ''}`}
                  onClick={() => setWidgetSize(key)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button 
            className="btn-primary"
            onClick={handleAdd}
            disabled={!selectedType || !widgetTitle.trim()}
          >
            ➕ Qo'shish
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}


// Main Customizable Widgets Component
function CustomizableWidgets({
  widgets = [],
  layouts = [],
  currentLayout = 'default',
  onAddWidget,
  onRemoveWidget,
  onResizeWidget,
  onReorderWidgets,
  onSaveLayout,
  onLoadLayout,
  onDeleteLayout,
  renderWidget
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [showLayoutModal, setShowLayoutModal] = useState(false)
  const [layoutName, setLayoutName] = useState('')

  const handleReorder = useCallback((newOrder) => {
    onReorderWidgets?.(newOrder)
  }, [onReorderWidgets])

  const handleSaveLayout = () => {
    if (layoutName.trim()) {
      onSaveLayout?.(layoutName, widgets)
      setLayoutName('')
      setShowLayoutModal(false)
    }
  }

  return (
    <div className="customizable-widgets">
      {/* Toolbar */}
      <div className="widgets-toolbar">
        <div className="toolbar-left">
          <h3>📊 Dashboard</h3>
          
          {layouts.length > 0 && (
            <select
              value={currentLayout}
              onChange={e => onLoadLayout?.(e.target.value)}
              className="layout-select"
            >
              <option value="default">Standart</option>
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id}>
                  {layout.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="toolbar-right">
          {isEditing && (
            <>
              <button 
                className="toolbar-btn"
                onClick={() => setShowPicker(true)}
              >
                ➕ Widget
              </button>
              <button 
                className="toolbar-btn"
                onClick={() => setShowLayoutModal(true)}
              >
                💾 Saqlash
              </button>
            </>
          )}
          
          <button
            className={`toolbar-btn ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '✓ Tayyor' : '✏️ Tahrirlash'}
          </button>
        </div>
      </div>

      {/* Widgets Grid */}
      <Reorder.Group
        axis="y"
        values={widgets}
        onReorder={handleReorder}
        className="widgets-grid"
      >
        <AnimatePresence>
          {widgets.map(widget => (
            <Reorder.Item
              key={widget.id}
              value={widget}
              dragListener={isEditing}
            >
              <Widget
                widget={widget}
                isEditing={isEditing}
                onRemove={onRemoveWidget}
                onResize={onResizeWidget}
              >
                {renderWidget?.(widget)}
              </Widget>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {widgets.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>Widgetlar yo'q</h3>
          <p>Dashboard'ni sozlash uchun widget qo'shing</p>
          <button 
            className="add-btn"
            onClick={() => { setIsEditing(true); setShowPicker(true); }}
          >
            ➕ Widget qo'shish
          </button>
        </div>
      )}

      {/* Widget Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <WidgetPickerModal
            onSelect={onAddWidget}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Save Layout Modal */}
      <AnimatePresence>
        {showLayoutModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLayoutModal(false)}
          >
            <motion.div
              className="save-layout-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <h3>💾 Layoutni saqlash</h3>
              <input
                type="text"
                value={layoutName}
                onChange={e => setLayoutName(e.target.value)}
                placeholder="Layout nomi"
                autoFocus
              />
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowLayoutModal(false)}
                >
                  Bekor qilish
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleSaveLayout}
                  disabled={!layoutName.trim()}
                >
                  Saqlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CustomizableWidgets
export {
  Widget,
  WidgetPickerModal,
  WIDGET_TYPES,
  WIDGET_SIZES
}
