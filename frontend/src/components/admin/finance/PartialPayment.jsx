import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './PartialPayment.css'

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm"
}

// Payment status configurations
const PAYMENT_STATUSES = {
  pending: { label: 'Kutilmoqda', color: '#f59e0b', icon: '⏳' },
  partial: { label: 'Qisman', color: '#6366f1', icon: '📊' },
  paid: { label: "To'langan", color: '#22c55e', icon: '✓' },
  overdue: { label: "Muddati o'tgan", color: '#ef4444', icon: '⚠️' }
}

// Single Payment Item in History
function PaymentHistoryItem({ payment, isLast }) {
  return (
    <div className={`partial-history-item ${isLast ? 'last' : ''}`}>
      <div className="history-item-dot" />
      <div className="history-item-content">
        <div className="history-item-header">
          <span className="history-item-amount">{formatCurrency(payment.amount)}</span>
          <span className="history-item-date">
            {new Date(payment.date).toLocaleDateString('uz-UZ')}
          </span>
        </div>
        <div className="history-item-details">
          <span className="history-item-method">
            {payment.method === 'cash' ? '💵 Naqd' : 
             payment.method === 'card' ? '💳 Karta' : '🏦 O\'tkazma'}
          </span>
          {payment.reference && (
            <span className="history-item-ref">#{payment.reference}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Debt Card with Payment History
function DebtCard({ 
  debt, 
  payments = [], 
  onPayment, 
  expanded, 
  onToggle 
}) {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = debt.amount - totalPaid
  const progress = (totalPaid / debt.amount) * 100
  
  const status = remaining <= 0 ? 'paid' : 
                 totalPaid > 0 ? 'partial' : 
                 new Date(debt.dueDate) < new Date() ? 'overdue' : 'pending'
  
  const statusConfig = PAYMENT_STATUSES[status]

  return (
    <motion.div 
      className={`debt-card debt-card--${status}`}
      layout
    >
      <div className="debt-card-header" onClick={onToggle}>
        <div className="debt-card-info">
          <div className="debt-card-period">
            <span className="debt-period-icon">📅</span>
            <span>{debt.period}</span>
          </div>
          <div className="debt-card-amount">
            <span className="debt-total">{formatCurrency(debt.amount)}</span>
            {remaining > 0 && (
              <span className="debt-remaining">
                Qoldi: {formatCurrency(remaining)}
              </span>
            )}
          </div>
        </div>
        
        <div className="debt-card-status">
          <span 
            className="debt-status-badge"
            style={{ 
              backgroundColor: statusConfig.color + '20',
              color: statusConfig.color
            }}
          >
            {statusConfig.icon} {statusConfig.label}
          </span>
          <span className={`debt-expand-icon ${expanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="debt-progress-container">
        <div className="debt-progress-bar">
          <motion.div 
            className="debt-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            style={{ backgroundColor: statusConfig.color }}
          />
        </div>
        <span className="debt-progress-text">{Math.round(progress)}%</span>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="debt-card-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Payment History */}
            {payments.length > 0 && (
              <div className="debt-payment-history">
                <h4 className="history-title">To'lov tarixi</h4>
                <div className="history-timeline">
                  {payments.map((payment, idx) => (
                    <PaymentHistoryItem 
                      key={payment.id} 
                      payment={payment}
                      isLast={idx === payments.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Payment Action */}
            {remaining > 0 && (
              <div className="debt-card-actions">
                <button 
                  className="debt-pay-btn debt-pay-btn--partial"
                  onClick={() => onPayment(debt, 'partial')}
                >
                  📊 Qisman to'lash
                </button>
                <button 
                  className="debt-pay-btn debt-pay-btn--full"
                  onClick={() => onPayment(debt, 'full', remaining)}
                >
                  ✓ To'liq to'lash ({formatCurrency(remaining)})
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Main Partial Payment Component
function PartialPayment({
  child,
  debts = [],
  paymentHistory = {},
  onPayment,
  onClose,
  loading = false
}) {
  const [expandedDebt, setExpandedDebt] = useState(null)
  const [paymentMode, setPaymentMode] = useState(null) // { debt, type, suggestedAmount }
  const [paymentAmount, setPaymentAmount] = useState('')

  // Calculate totals
  const totals = useMemo(() => {
    let totalDebt = 0
    let totalPaid = 0
    
    debts.forEach(debt => {
      totalDebt += debt.amount
      const payments = paymentHistory[debt.id] || []
      totalPaid += payments.reduce((sum, p) => sum + p.amount, 0)
    })
    
    return {
      totalDebt,
      totalPaid,
      remaining: totalDebt - totalPaid,
      paidPercent: totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0
    }
  }, [debts, paymentHistory])

  const handlePaymentClick = (debt, type, suggestedAmount = null) => {
    setPaymentMode({ debt, type, suggestedAmount })
    setPaymentAmount(suggestedAmount?.toString() || '')
  }

  const handlePaymentSubmit = () => {
    if (!paymentMode || !paymentAmount) return
    
    onPayment({
      debtId: paymentMode.debt.id,
      childId: child.id,
      amount: parseFloat(paymentAmount),
      type: paymentMode.type
    })
    
    setPaymentMode(null)
    setPaymentAmount('')
  }

  const handleQuickAmount = (percent) => {
    if (!paymentMode) return
    const payments = paymentHistory[paymentMode.debt.id] || []
    const paid = payments.reduce((sum, p) => sum + p.amount, 0)
    const remaining = paymentMode.debt.amount - paid
    setPaymentAmount(Math.round(remaining * percent / 100).toString())
  }

  return (
    <div className="partial-payment-container">
      {/* Header */}
      <div className="partial-payment-header">
        <div className="partial-header-info">
          <h2>To'lovlar boshqaruvi</h2>
          {child && (
            <span className="partial-child-name">
              {child.firstName} {child.lastName}
            </span>
          )}
        </div>
        {onClose && (
          <button className="partial-close-btn" onClick={onClose}>×</button>
        )}
      </div>

      {/* Summary */}
      <div className="partial-summary">
        <div className="summary-item">
          <span className="summary-label">Jami qarz</span>
          <span className="summary-value">{formatCurrency(totals.totalDebt)}</span>
        </div>
        <div className="summary-item summary-item--paid">
          <span className="summary-label">To'langan</span>
          <span className="summary-value">{formatCurrency(totals.totalPaid)}</span>
        </div>
        <div className="summary-item summary-item--remaining">
          <span className="summary-label">Qoldiq</span>
          <span className="summary-value">{formatCurrency(totals.remaining)}</span>
        </div>
        <div className="summary-progress">
          <div className="summary-progress-bar">
            <div 
              className="summary-progress-fill"
              style={{ width: `${totals.paidPercent}%` }}
            />
          </div>
          <span className="summary-progress-text">
            {Math.round(totals.paidPercent)}% to'langan
          </span>
        </div>
      </div>

      {/* Debts List */}
      <div className="partial-debts-list">
        {loading ? (
          <div className="partial-loading">
            <div className="partial-spinner" />
            <span>Yuklanmoqda...</span>
          </div>
        ) : debts.length === 0 ? (
          <div className="partial-empty">
            <span className="partial-empty-icon">✓</span>
            <p>Qarz yo'q</p>
          </div>
        ) : (
          debts.map(debt => (
            <DebtCard
              key={debt.id}
              debt={debt}
              payments={paymentHistory[debt.id] || []}
              expanded={expandedDebt === debt.id}
              onToggle={() => setExpandedDebt(
                expandedDebt === debt.id ? null : debt.id
              )}
              onPayment={handlePaymentClick}
            />
          ))
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentMode && (
          <motion.div
            className="partial-payment-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaymentMode(null)}
          >
            <motion.div
              className="partial-payment-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3>
                {paymentMode.type === 'full' ? "To'liq to'lov" : "Qisman to'lov"}
              </h3>
              <p className="modal-debt-info">
                {paymentMode.debt.period} - {formatCurrency(paymentMode.debt.amount)}
              </p>

              <div className="modal-amount-input">
                <label>To'lov miqdori</label>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                  />
                  <span>so'm</span>
                </div>
              </div>

              {paymentMode.type === 'partial' && (
                <div className="modal-quick-amounts">
                  {[25, 50, 75].map(percent => (
                    <button
                      key={percent}
                      className="quick-amount-btn"
                      onClick={() => handleQuickAmount(percent)}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="modal-btn modal-btn--cancel"
                  onClick={() => setPaymentMode(null)}
                >
                  Bekor qilish
                </button>
                <button 
                  className="modal-btn modal-btn--confirm"
                  onClick={handlePaymentSubmit}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  💰 To'lash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PartialPayment
export { DebtCard, PaymentHistoryItem, PAYMENT_STATUSES, formatCurrency }
