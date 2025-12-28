import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import './PaymentHistory.css'

const PAYMENT_METHODS = {
  cash: { icon: '💵', label: 'Naqd' },
  card: { icon: '💳', label: 'Karta' },
  transfer: { icon: '🏦', label: "O'tkazma" },
  click: { icon: '📱', label: 'Click' },
  payme: { icon: '📲', label: 'Payme' }
}

const STATUS_CONFIG = {
  completed: { color: '#22c55e', label: 'Muvaffaqiyatli' },
  pending: { color: '#f59e0b', label: 'Kutilmoqda' },
  failed: { color: '#ef4444', label: 'Xato' },
  refunded: { color: '#8b5cf6', label: 'Qaytarilgan' }
}

export default function PaymentHistory({ 
  payments = [], 
  onViewDetails,
  onExport,
  loading = false 
}) {
  const [filter, setFilter] = useState({ method: '', status: '', dateRange: 'all' })
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedPayment, setSelectedPayment] = useState(null)

  const filteredPayments = useMemo(() => {
    let result = [...payments]

    // Filter by method
    if (filter.method) {
      result = result.filter(p => p.method === filter.method)
    }

    // Filter by status
    if (filter.status) {
      result = result.filter(p => p.status === filter.status)
    }

    // Filter by date range
    if (filter.dateRange !== 'all') {
      const now = new Date()
      const ranges = {
        today: 0,
        week: 7,
        month: 30,
        quarter: 90
      }
      const days = ranges[filter.dateRange]
      const cutoff = new Date(now.setDate(now.getDate() - days))
      result = result.filter(p => new Date(p.date) >= cutoff)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = new Date(a.date) - new Date(b.date)
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [payments, filter, sortBy, sortOrder])

  const stats = useMemo(() => {
    const total = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
    const completed = filteredPayments.filter(p => p.status === 'completed')
    const completedSum = completed.reduce((sum, p) => sum + p.amount, 0)
    return { total, count: filteredPayments.length, completedSum, completedCount: completed.length }
  }, [filteredPayments])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm"
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="payment-history">
        <div className="payment-history__loading">
          <div className="payment-history__spinner" />
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-history">
      <div className="payment-history__header">
        <h3 className="payment-history__title">To'lovlar tarixi</h3>
        <div className="payment-history__actions">
          {onExport && (
            <button className="payment-history__export-btn" onClick={() => onExport(filteredPayments)}>
              📥 Export
            </button>
          )}
        </div>
      </div>

      <div className="payment-history__filters">
        <select
          className="payment-history__filter"
          value={filter.method}
          onChange={(e) => setFilter(f => ({ ...f, method: e.target.value }))}
        >
          <option value="">Barcha usullar</option>
          {Object.entries(PAYMENT_METHODS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          className="payment-history__filter"
          value={filter.status}
          onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">Barcha holatlar</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          className="payment-history__filter"
          value={filter.dateRange}
          onChange={(e) => setFilter(f => ({ ...f, dateRange: e.target.value }))}
        >
          <option value="all">Barcha vaqt</option>
          <option value="today">Bugun</option>
          <option value="week">Oxirgi hafta</option>
          <option value="month">Oxirgi oy</option>
          <option value="quarter">Oxirgi 3 oy</option>
        </select>

        <select
          className="payment-history__filter"
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-')
            setSortBy(by)
            setSortOrder(order)
          }}
        >
          <option value="date-desc">Yangi avval</option>
          <option value="date-asc">Eski avval</option>
          <option value="amount-desc">Katta summa</option>
          <option value="amount-asc">Kichik summa</option>
        </select>
      </div>

      <div className="payment-history__list">
        {filteredPayments.length === 0 ? (
          <div className="payment-history__empty">
            <div className="payment-history__empty-icon">💳</div>
            <p>To'lovlar topilmadi</p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const method = PAYMENT_METHODS[payment.method] || PAYMENT_METHODS.cash
            const status = STATUS_CONFIG[payment.status] || STATUS_CONFIG.completed
            
            return (
              <motion.div
                key={payment.id}
                className="payment-history__item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="payment-history__method">{method.icon}</div>
                <div className="payment-history__info">
                  <div className="payment-history__child">{payment.childName}</div>
                  <div className="payment-history__meta">
                    <span>{method.label}</span>
                    <span>•</span>
                    <span>{formatDate(payment.date)}</span>
                  </div>
                </div>
                <div className="payment-history__amount">
                  <div className="payment-history__sum">{formatCurrency(payment.amount)}</div>
                  <span 
                    className="payment-history__status"
                    style={{ background: `${status.color}20`, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            className="payment-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="payment-detail__backdrop" onClick={() => setSelectedPayment(null)} />
            <motion.div
              className="payment-detail__content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="payment-detail__header">
                <h3 className="payment-detail__title">To'lov tafsilotlari</h3>
                <button className="payment-detail__close" onClick={() => setSelectedPayment(null)}>×</button>
              </div>
              <div className="payment-detail__body">
                <div className="payment-detail__row">
                  <span className="payment-detail__label">Bola</span>
                  <span className="payment-detail__value">{selectedPayment.childName}</span>
                </div>
                <div className="payment-detail__row">
                  <span className="payment-detail__label">Summa</span>
                  <span className="payment-detail__value">{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="payment-detail__row">
                  <span className="payment-detail__label">Usul</span>
                  <span className="payment-detail__value">{PAYMENT_METHODS[selectedPayment.method]?.label}</span>
                </div>
                <div className="payment-detail__row">
                  <span className="payment-detail__label">Sana</span>
                  <span className="payment-detail__value">{formatDate(selectedPayment.date)}</span>
                </div>
                <div className="payment-detail__row">
                  <span className="payment-detail__label">Holat</span>
                  <span className="payment-detail__value">{STATUS_CONFIG[selectedPayment.status]?.label}</span>
                </div>
                {selectedPayment.receiptNumber && (
                  <div className="payment-detail__row">
                    <span className="payment-detail__label">Kvitansiya</span>
                    <span className="payment-detail__value">#{selectedPayment.receiptNumber}</span>
                  </div>
                )}
              </div>
              <div className="payment-detail__footer">
                <button className="payment-detail__btn payment-detail__btn--print" onClick={() => onViewDetails?.(selectedPayment)}>
                  🖨️ Chop etish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

PaymentHistory.propTypes = {
  payments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    childName: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    method: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    receiptNumber: PropTypes.string
  })),
  onViewDetails: PropTypes.func,
  onExport: PropTypes.func,
  loading: PropTypes.bool
}
