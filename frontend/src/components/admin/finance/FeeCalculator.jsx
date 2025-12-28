import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './FeeCalculator.css'

// Fee types configuration
const FEE_TYPES = {
  monthly: { label: 'Oylik', icon: '📅', color: '#6366f1' },
  food: { label: 'Ovqat', icon: '🍽️', color: '#f59e0b' },
  transport: { label: 'Transport', icon: '🚌', color: '#22c55e' },
  extra: { label: 'Qo\'shimcha', icon: '➕', color: '#8b5cf6' },
  discount: { label: 'Chegirma', icon: '🏷️', color: '#ef4444' }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm"
}

// Calculate working days in month
function getWorkingDays(year, month) {
  const date = new Date(year, month, 1)
  let workingDays = 0
  
  while (date.getMonth() === month) {
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++
    }
    date.setDate(date.getDate() + 1)
  }
  
  return workingDays
}

// Fee Item Component
function FeeItem({ fee, onUpdate, onRemove, editable = true }) {
  const config = FEE_TYPES[fee.type] || FEE_TYPES.extra
  
  return (
    <motion.div 
      className={`fee-item fee-item--${fee.type}`}
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="fee-item-icon" style={{ backgroundColor: config.color + '20' }}>
        <span>{config.icon}</span>
      </div>
      
      <div className="fee-item-info">
        <span className="fee-item-label">{fee.label || config.label}</span>
        {fee.description && (
          <span className="fee-item-desc">{fee.description}</span>
        )}
      </div>
      
      <div className="fee-item-amount">
        {editable ? (
          <input
            type="number"
            value={fee.amount}
            onChange={e => onUpdate({ ...fee, amount: parseFloat(e.target.value) || 0 })}
            className="fee-amount-input"
          />
        ) : (
          <span className={fee.type === 'discount' ? 'discount-amount' : ''}>
            {fee.type === 'discount' ? '-' : ''}{formatCurrency(fee.amount)}
          </span>
        )}
      </div>
      
      {editable && onRemove && (
        <button className="fee-item-remove" onClick={() => onRemove(fee.id)}>
          ×
        </button>
      )}
    </motion.div>
  )
}

// Child Fee Summary
function ChildFeeSummary({ child, fees, attendance, onCalculate }) {
  const summary = useMemo(() => {
    const baseFee = fees.find(f => f.type === 'monthly')?.amount || 0
    const foodFee = fees.find(f => f.type === 'food')?.amount || 0
    const transportFee = fees.find(f => f.type === 'transport')?.amount || 0
    const extraFees = fees.filter(f => f.type === 'extra').reduce((sum, f) => sum + f.amount, 0)
    const discounts = fees.filter(f => f.type === 'discount').reduce((sum, f) => sum + f.amount, 0)
    
    // Calculate attendance-based deduction
    const workingDays = attendance?.workingDays || 22
    const presentDays = attendance?.presentDays || workingDays
    const absentDays = workingDays - presentDays
    const dailyRate = baseFee / workingDays
    const attendanceDeduction = absentDays > 3 ? (absentDays - 3) * dailyRate * 0.5 : 0
    
    const subtotal = baseFee + foodFee + transportFee + extraFees
    const total = subtotal - discounts - attendanceDeduction
    
    return {
      baseFee,
      foodFee,
      transportFee,
      extraFees,
      discounts,
      attendanceDeduction,
      subtotal,
      total,
      presentDays,
      absentDays,
      workingDays
    }
  }, [fees, attendance])

  return (
    <div className="child-fee-summary">
      <div className="fee-summary-header">
        <div className="fee-child-info">
          <div className="fee-child-avatar">
            {child.photo ? (
              <img src={child.photo} alt={child.firstName} />
            ) : (
              <span>{child.firstName?.[0]}{child.lastName?.[0]}</span>
            )}
          </div>
          <div>
            <h4>{child.firstName} {child.lastName}</h4>
            <span className="fee-child-group">{child.groupName}</span>
          </div>
        </div>
        <div className="fee-summary-total">
          <span className="total-label">Jami</span>
          <span className="total-amount">{formatCurrency(summary.total)}</span>
        </div>
      </div>

      <div className="fee-summary-breakdown">
        <div className="breakdown-row">
          <span>Asosiy to'lov</span>
          <span>{formatCurrency(summary.baseFee)}</span>
        </div>
        {summary.foodFee > 0 && (
          <div className="breakdown-row">
            <span>Ovqat</span>
            <span>{formatCurrency(summary.foodFee)}</span>
          </div>
        )}
        {summary.transportFee > 0 && (
          <div className="breakdown-row">
            <span>Transport</span>
            <span>{formatCurrency(summary.transportFee)}</span>
          </div>
        )}
        {summary.extraFees > 0 && (
          <div className="breakdown-row">
            <span>Qo'shimcha</span>
            <span>{formatCurrency(summary.extraFees)}</span>
          </div>
        )}
        {summary.discounts > 0 && (
          <div className="breakdown-row discount">
            <span>Chegirma</span>
            <span>-{formatCurrency(summary.discounts)}</span>
          </div>
        )}
        {summary.attendanceDeduction > 0 && (
          <div className="breakdown-row discount">
            <span>Davomat ({summary.absentDays} kun)</span>
            <span>-{formatCurrency(Math.round(summary.attendanceDeduction))}</span>
          </div>
        )}
      </div>

      <div className="fee-attendance-info">
        <div className="attendance-stat">
          <span className="stat-value">{summary.presentDays}</span>
          <span className="stat-label">Kelgan</span>
        </div>
        <div className="attendance-stat">
          <span className="stat-value">{summary.absentDays}</span>
          <span className="stat-label">Kelmagan</span>
        </div>
        <div className="attendance-stat">
          <span className="stat-value">{summary.workingDays}</span>
          <span className="stat-label">Ish kuni</span>
        </div>
      </div>

      <button className="fee-calculate-btn" onClick={() => onCalculate(child, summary)}>
        📄 Hisob-faktura yaratish
      </button>
    </div>
  )
}

// Main Fee Calculator Component
function FeeCalculator({
  children = [],
  defaultFees = [],
  attendanceData = {},
  onGenerateInvoice,
  onBulkGenerate
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [fees, setFees] = useState(defaultFees)
  const [showAddFee, setShowAddFee] = useState(false)
  const [newFee, setNewFee] = useState({ type: 'extra', label: '', amount: 0 })
  const [selectedChildren, setSelectedChildren] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Filter children
  const filteredChildren = useMemo(() => {
    if (!searchQuery) return children
    const query = searchQuery.toLowerCase()
    return children.filter(child => 
      child.firstName?.toLowerCase().includes(query) ||
      child.lastName?.toLowerCase().includes(query) ||
      child.groupName?.toLowerCase().includes(query)
    )
  }, [children, searchQuery])

  // Calculate totals
  const totals = useMemo(() => {
    let totalAmount = 0
    let childCount = children.length
    
    children.forEach(child => {
      const childFees = fees.reduce((sum, f) => {
        if (f.type === 'discount') return sum - f.amount
        return sum + f.amount
      }, 0)
      totalAmount += childFees
    })
    
    return { totalAmount, childCount }
  }, [children, fees])

  const handleAddFee = useCallback(() => {
    if (!newFee.label || newFee.amount <= 0) return
    
    setFees(prev => [...prev, { ...newFee, id: Date.now() }])
    setNewFee({ type: 'extra', label: '', amount: 0 })
    setShowAddFee(false)
  }, [newFee])

  const handleUpdateFee = useCallback((updatedFee) => {
    setFees(prev => prev.map(f => f.id === updatedFee.id ? updatedFee : f))
  }, [])

  const handleRemoveFee = useCallback((feeId) => {
    setFees(prev => prev.filter(f => f.id !== feeId))
  }, [])

  const handleSelectChild = useCallback((childId) => {
    setSelectedChildren(prev => 
      prev.includes(childId) 
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedChildren.length === filteredChildren.length) {
      setSelectedChildren([])
    } else {
      setSelectedChildren(filteredChildren.map(c => c.id))
    }
  }, [filteredChildren, selectedChildren])

  const handleBulkGenerate = useCallback(() => {
    const selectedData = children
      .filter(c => selectedChildren.includes(c.id))
      .map(child => ({
        child,
        fees,
        attendance: attendanceData[child.id],
        month: selectedMonth
      }))
    
    onBulkGenerate?.(selectedData)
  }, [children, selectedChildren, fees, attendanceData, selectedMonth, onBulkGenerate])

  return (
    <div className="fee-calculator">
      {/* Header */}
      <div className="fee-calculator-header">
        <div className="fee-header-title">
          <h2>💰 To'lov hisoblagich</h2>
          <p>Oylik to'lovlarni avtomatik hisoblash</p>
        </div>
        
        <div className="fee-header-controls">
          <div className="month-selector">
            <label>Oy:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="fee-structure-section">
        <div className="section-header">
          <h3>📋 To'lov tuzilmasi</h3>
          <button 
            className="add-fee-btn"
            onClick={() => setShowAddFee(true)}
          >
            + Qo'shish
          </button>
        </div>

        <div className="fee-items-list">
          <AnimatePresence>
            {fees.map(fee => (
              <FeeItem
                key={fee.id}
                fee={fee}
                onUpdate={handleUpdateFee}
                onRemove={handleRemoveFee}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Add Fee Modal */}
        <AnimatePresence>
          {showAddFee && (
            <motion.div
              className="add-fee-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddFee(false)}
            >
              <motion.div
                className="add-fee-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <h3>Yangi to'lov turi</h3>
                
                <div className="add-fee-form">
                  <div className="form-group">
                    <label>Turi</label>
                    <select
                      value={newFee.type}
                      onChange={e => setNewFee(prev => ({ ...prev, type: e.target.value }))}
                    >
                      {Object.entries(FEE_TYPES).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Nomi</label>
                    <input
                      type="text"
                      value={newFee.label}
                      onChange={e => setNewFee(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="To'lov nomi"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Miqdori</label>
                    <input
                      type="number"
                      value={newFee.amount}
                      onChange={e => setNewFee(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="modal-btn cancel"
                    onClick={() => setShowAddFee(false)}
                  >
                    Bekor
                  </button>
                  <button 
                    className="modal-btn confirm"
                    onClick={handleAddFee}
                    disabled={!newFee.label || newFee.amount <= 0}
                  >
                    Qo'shish
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="fee-summary-stats">
        <div className="stat-card">
          <span className="stat-icon">👶</span>
          <div className="stat-content">
            <span className="stat-value">{totals.childCount}</span>
            <span className="stat-label">Bolalar</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💵</span>
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(totals.totalAmount)}</span>
            <span className="stat-label">Jami to'lov</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-content">
            <span className="stat-value">{selectedChildren.length}</span>
            <span className="stat-label">Tanlangan</span>
          </div>
        </div>
      </div>

      {/* Children List */}
      <div className="fee-children-section">
        <div className="section-header">
          <h3>👶 Bolalar ro'yxati</h3>
          <div className="children-controls">
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="children-search"
            />
            <button 
              className="select-all-btn"
              onClick={handleSelectAll}
            >
              {selectedChildren.length === filteredChildren.length ? 'Bekor' : 'Hammasini tanlash'}
            </button>
            {selectedChildren.length > 0 && (
              <button 
                className="bulk-generate-btn"
                onClick={handleBulkGenerate}
              >
                📄 {selectedChildren.length} ta hisob yaratish
              </button>
            )}
          </div>
        </div>

        <div className="children-fee-list">
          {filteredChildren.map(child => (
            <div 
              key={child.id}
              className={`child-fee-card ${selectedChildren.includes(child.id) ? 'selected' : ''}`}
              onClick={() => handleSelectChild(child.id)}
            >
              <ChildFeeSummary
                child={child}
                fees={fees}
                attendance={attendanceData[child.id]}
                onCalculate={(c, summary) => onGenerateInvoice?.({ child: c, fees, summary, month: selectedMonth })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeeCalculator
export { FeeItem, ChildFeeSummary, FEE_TYPES, formatCurrency, getWorkingDays }
