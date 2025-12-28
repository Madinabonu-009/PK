import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './DeliveryTracker.css'

// Delivery Status Types
const DELIVERY_STATUS = {
  pending: { label: 'Kutilmoqda', icon: '⏳', color: '#f59e0b' },
  sent: { label: 'Yuborildi', icon: '📤', color: '#3b82f6' },
  delivered: { label: 'Yetkazildi', icon: '✅', color: '#10b981' },
  read: { label: "O'qildi", icon: '👁️', color: '#8b5cf6' },
  failed: { label: 'Xato', icon: '❌', color: '#ef4444' }
}

// Status Badge Component
function StatusBadge({ status }) {
  const statusInfo = DELIVERY_STATUS[status] || DELIVERY_STATUS.pending

  return (
    <span 
      className="status-badge"
      style={{ 
        background: `${statusInfo.color}20`,
        color: statusInfo.color 
      }}
    >
      {statusInfo.icon} {statusInfo.label}
    </span>
  )
}

// Delivery Item Component
function DeliveryItem({ delivery, onResend }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div 
      className="delivery-item"
      layout
    >
      <div className="delivery-header" onClick={() => setExpanded(!expanded)}>
        <div className="recipient-info">
          <span className="recipient-avatar">
            {delivery.recipientName?.charAt(0) || '?'}
          </span>
          <div className="recipient-details">
            <span className="recipient-name">{delivery.recipientName}</span>
            <span className="recipient-contact">{delivery.phone || delivery.email}</span>
          </div>
        </div>

        <StatusBadge status={delivery.status} />

        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="delivery-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="detail-row">
              <span className="detail-label">Yuborilgan vaqt:</span>
              <span className="detail-value">
                {delivery.sentAt ? new Date(delivery.sentAt).toLocaleString('uz-UZ') : '-'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Yetkazilgan vaqt:</span>
              <span className="detail-value">
                {delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleString('uz-UZ') : '-'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">O'qilgan vaqt:</span>
              <span className="detail-value">
                {delivery.readAt ? new Date(delivery.readAt).toLocaleString('uz-UZ') : '-'}
              </span>
            </div>
            {delivery.channel && (
              <div className="detail-row">
                <span className="detail-label">Kanal:</span>
                <span className="detail-value">{delivery.channel}</span>
              </div>
            )}
            {delivery.error && (
              <div className="detail-row error">
                <span className="detail-label">Xato:</span>
                <span className="detail-value">{delivery.error}</span>
              </div>
            )}

            {delivery.status === 'failed' && (
              <button 
                className="resend-btn"
                onClick={() => onResend?.(delivery.id)}
              >
                🔄 Qayta yuborish
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Delivery Report Component
function DeliveryReport({ stats }) {
  const total = stats.total || 0
  const delivered = stats.delivered || 0
  const read = stats.read || 0
  const failed = stats.failed || 0

  const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 0
  const readRate = delivered > 0 ? Math.round((read / delivered) * 100) : 0

  return (
    <div className="delivery-report">
      <h4>📊 Yetkazish hisoboti</h4>

      <div className="report-stats">
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Jami</span>
        </div>
        <div className="stat-card delivered">
          <span className="stat-value">{delivered}</span>
          <span className="stat-label">Yetkazildi</span>
        </div>
        <div className="stat-card read">
          <span className="stat-value">{read}</span>
          <span className="stat-label">O'qildi</span>
        </div>
        <div className="stat-card failed">
          <span className="stat-value">{failed}</span>
          <span className="stat-label">Xato</span>
        </div>
      </div>

      <div className="rate-bars">
        <div className="rate-item">
          <div className="rate-header">
            <span>Yetkazish darajasi</span>
            <span className="rate-value">{deliveryRate}%</span>
          </div>
          <div className="rate-bar">
            <motion.div
              className="rate-fill delivered"
              initial={{ width: 0 }}
              animate={{ width: `${deliveryRate}%` }}
            />
          </div>
        </div>

        <div className="rate-item">
          <div className="rate-header">
            <span>O'qilish darajasi</span>
            <span className="rate-value">{readRate}%</span>
          </div>
          <div className="rate-bar">
            <motion.div
              className="rate-fill read"
              initial={{ width: 0 }}
              animate={{ width: `${readRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Delivery Tracker Component
function DeliveryTracker({
  message = null,
  deliveries = [],
  onResend,
  onExport
}) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate statistics
  const stats = useMemo(() => {
    const total = deliveries.length
    const pending = deliveries.filter(d => d.status === 'pending').length
    const sent = deliveries.filter(d => d.status === 'sent').length
    const delivered = deliveries.filter(d => d.status === 'delivered' || d.status === 'read').length
    const read = deliveries.filter(d => d.status === 'read').length
    const failed = deliveries.filter(d => d.status === 'failed').length

    return { total, pending, sent, delivered, read, failed }
  }, [deliveries])

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    let filtered = deliveries

    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => d.status === filterStatus)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(d => 
        d.recipientName?.toLowerCase().includes(query) ||
        d.phone?.includes(query) ||
        d.email?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [deliveries, filterStatus, searchQuery])

  return (
    <div className="delivery-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-info">
          <h2>📬 Yetkazish kuzatuvi</h2>
          {message && <span className="message-subject">{message.subject}</span>}
        </div>

        <button className="export-btn" onClick={() => onExport?.('excel')}>
          📊 Hisobot
        </button>
      </div>

      {/* Report */}
      <DeliveryReport stats={stats} />

      {/* Filters */}
      <div className="tracker-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Qidirish..."
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Barchasi ({stats.total})
          </button>
          {Object.entries(DELIVERY_STATUS).map(([key, value]) => {
            const count = deliveries.filter(d => d.status === key).length
            if (count === 0) return null
            return (
              <button
                key={key}
                className={`filter-btn ${filterStatus === key ? 'active' : ''}`}
                onClick={() => setFilterStatus(key)}
                style={{ '--status-color': value.color }}
              >
                {value.icon} {count}
              </button>
            )
          })}
        </div>
      </div>

      {/* Delivery List */}
      <div className="delivery-list">
        {filteredDeliveries.map(delivery => (
          <DeliveryItem
            key={delivery.id}
            delivery={delivery}
            onResend={onResend}
          />
        ))}

        {filteredDeliveries.length === 0 && (
          <div className="empty-state">
            <span>📭</span>
            <p>
              {deliveries.length === 0 
                ? 'Hali xabar yuborilmagan'
                : 'Filtr bo\'yicha natija yo\'q'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryTracker
export {
  DeliveryItem,
  DeliveryReport,
  StatusBadge,
  DELIVERY_STATUS
}
