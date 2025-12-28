import { useState } from 'react'
import { motion } from 'framer-motion'
import './PaymentForm.css'

// Payment method configurations
const PAYMENT_METHODS = {
  cash: { icon: '💵', label: 'Naqd', color: '#22c55e' },
  card: { icon: '💳', label: 'Karta', color: '#6366f1' },
  transfer: { icon: '🏦', label: "O'tkazma", color: '#f59e0b' }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm"
}

// Payment Form Component
function PaymentForm({
  child,
  balance = 0,
  onSubmit,
  onCancel,
  loading = false,
  paymentMethods = ['cash', 'card', 'transfer']
}) {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'cash',
    reference: '',
    notes: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "To'lov miqdorini kiriting"
    }
    
    if (formData.method === 'transfer' && !formData.reference) {
      newErrors.reference = "O'tkazma raqamini kiriting"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    await onSubmit({
      childId: child.id,
      amount: parseFloat(formData.amount),
      method: formData.method,
      reference: formData.reference,
      notes: formData.notes
    })
  }

  const handleQuickAmount = (amount) => {
    handleChange('amount', amount.toString())
  }

  return (
    <motion.div
      className="payment-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Child Info */}
      <div className="payment-child-info">
        <div className="payment-child-avatar">
          {child.photo ? (
            <img src={child.photo} alt={child.firstName} />
          ) : (
            <span>{child.firstName?.[0]}{child.lastName?.[0]}</span>
          )}
        </div>
        <div className="payment-child-details">
          <h3 className="payment-child-name">{child.firstName} {child.lastName}</h3>
          <span className="payment-child-group">{child.groupName}</span>
        </div>
        <div className="payment-balance">
          <span className="balance-label">Joriy balans:</span>
          <span className={`balance-value ${balance < 0 ? 'negative' : 'positive'}`}>
            {formatCurrency(balance)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        {/* Amount */}
        <div className="form-group">
          <label className="form-label">To'lov miqdori</label>
          <div className="amount-input-wrapper">
            <input
              type="number"
              className={`form-input amount-input ${errors.amount ? 'error' : ''}`}
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="0"
              min="0"
              step="1000"
            />
            <span className="amount-suffix">so'm</span>
          </div>
          {errors.amount && <span className="form-error">{errors.amount}</span>}
          
          {/* Quick amounts */}
          <div className="quick-amounts">
            {[500000, 1000000, 1500000, 2000000].map(amount => (
              <button
                key={amount}
                type="button"
                className="quick-amount-btn"
                onClick={() => handleQuickAmount(amount)}
              >
                {formatCurrency(amount)}
              </button>
            ))}
            {balance < 0 && (
              <button
                type="button"
                className="quick-amount-btn quick-amount-btn--full"
                onClick={() => handleQuickAmount(Math.abs(balance))}
              >
                To'liq: {formatCurrency(Math.abs(balance))}
              </button>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label className="form-label">To'lov usuli</label>
          <div className="payment-methods">
            {paymentMethods.map(method => {
              const config = PAYMENT_METHODS[method]
              return (
                <button
                  key={method}
                  type="button"
                  className={`payment-method-btn ${formData.method === method ? 'active' : ''}`}
                  onClick={() => handleChange('method', method)}
                  style={{ '--method-color': config.color }}
                >
                  <span className="method-icon">{config.icon}</span>
                  <span className="method-label">{config.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Reference (for transfer) */}
        {formData.method === 'transfer' && (
          <div className="form-group">
            <label className="form-label">O'tkazma raqami</label>
            <input
              type="text"
              className={`form-input ${errors.reference ? 'error' : ''}`}
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              placeholder="Tranzaksiya ID yoki raqami"
            />
            {errors.reference && <span className="form-error">{errors.reference}</span>}
          </div>
        )}

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Izoh (ixtiyoriy)</label>
          <textarea
            className="form-input form-textarea"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Qo'shimcha ma'lumot..."
            rows={3}
          />
        </div>

        {/* Summary */}
        {formData.amount && (
          <div className="payment-summary">
            <div className="summary-row">
              <span>To'lov miqdori:</span>
              <span className="summary-value">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
            </div>
            <div className="summary-row">
              <span>To'lov usuli:</span>
              <span>{PAYMENT_METHODS[formData.method]?.label}</span>
            </div>
            <div className="summary-row summary-row--total">
              <span>Yangi balans:</span>
              <span className={balance + parseFloat(formData.amount || 0) >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(balance + parseFloat(formData.amount || 0))}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.amount}
          >
            {loading ? 'Saqlanmoqda...' : "💰 To'lovni saqlash"}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// Payment Receipt Component
export function PaymentReceipt({ payment, child, onPrint, onClose }) {
  const handlePrint = () => {
    window.print()
    onPrint?.()
  }

  return (
    <motion.div
      className="payment-receipt"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="receipt-header">
        <span className="receipt-logo">🏫</span>
        <h2 className="receipt-title">Play Kids</h2>
        <p className="receipt-subtitle">To'lov kvitansiyasi</p>
      </div>

      <div className="receipt-body">
        <div className="receipt-row">
          <span>Kvitansiya №:</span>
          <span>{payment.id}</span>
        </div>
        <div className="receipt-row">
          <span>Sana:</span>
          <span>{new Date(payment.createdAt).toLocaleDateString('uz-UZ')}</span>
        </div>
        <div className="receipt-divider" />
        <div className="receipt-row">
          <span>Bola:</span>
          <span>{child.firstName} {child.lastName}</span>
        </div>
        <div className="receipt-row">
          <span>Guruh:</span>
          <span>{child.groupName}</span>
        </div>
        <div className="receipt-divider" />
        <div className="receipt-row receipt-row--amount">
          <span>To'lov miqdori:</span>
          <span>{formatCurrency(payment.amount)}</span>
        </div>
        <div className="receipt-row">
          <span>To'lov usuli:</span>
          <span>{PAYMENT_METHODS[payment.method]?.label}</span>
        </div>
        {payment.reference && (
          <div className="receipt-row">
            <span>Referans:</span>
            <span>{payment.reference}</span>
          </div>
        )}
      </div>

      <div className="receipt-footer">
        <p>Rahmat! Sizning to'lovingiz qabul qilindi.</p>
      </div>

      <div className="receipt-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Yopish
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          🖨️ Chop etish
        </button>
      </div>
    </motion.div>
  )
}

// Payment History Item
export function PaymentHistoryItem({ payment, onClick }) {
  const method = PAYMENT_METHODS[payment.method]
  
  return (
    <div className="payment-history-item" onClick={() => onClick?.(payment)}>
      <div className="payment-history-icon" style={{ backgroundColor: method?.color + '20' }}>
        <span>{method?.icon}</span>
      </div>
      <div className="payment-history-info">
        <span className="payment-history-amount">{formatCurrency(payment.amount)}</span>
        <span className="payment-history-date">
          {new Date(payment.createdAt).toLocaleDateString('uz-UZ')}
        </span>
      </div>
      <span className={`payment-history-status payment-history-status--${payment.status}`}>
        {payment.status === 'completed' ? '✓' : payment.status === 'pending' ? '⏳' : '✕'}
      </span>
    </div>
  )
}

export default PaymentForm
export { PAYMENT_METHODS, formatCurrency }
