import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './InvoiceGenerator.css'

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm"
}

// Format date
function formatDate(date) {
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Generate invoice number
function generateInvoiceNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}-${random}`
}

// Invoice Preview Component
function InvoicePreview({ invoice, kindergartenInfo, onPrint, onDownload, onSend }) {
  const invoiceRef = useRef(null)

  return (
    <div className="invoice-preview-container">
      <div className="invoice-actions">
        <button className="invoice-action-btn print" onClick={onPrint}>
          🖨️ Chop etish
        </button>
        <button className="invoice-action-btn download" onClick={onDownload}>
          📥 PDF yuklash
        </button>
        <button className="invoice-action-btn send" onClick={onSend}>
          📤 Yuborish
        </button>
      </div>

      <div className="invoice-paper" ref={invoiceRef}>
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-logo">
            {kindergartenInfo.logo ? (
              <img src={kindergartenInfo.logo} alt={kindergartenInfo.name} />
            ) : (
              <div className="logo-placeholder">🏫</div>
            )}
            <div className="kindergarten-info">
              <h1>{kindergartenInfo.name}</h1>
              <p>{kindergartenInfo.address}</p>
              <p>Tel: {kindergartenInfo.phone}</p>
            </div>
          </div>
          <div className="invoice-meta">
            <h2>HISOB-FAKTURA</h2>
            <div className="meta-row">
              <span>Raqam:</span>
              <strong>{invoice.number}</strong>
            </div>
            <div className="meta-row">
              <span>Sana:</span>
              <strong>{formatDate(invoice.date)}</strong>
            </div>
            <div className="meta-row">
              <span>Muddat:</span>
              <strong>{formatDate(invoice.dueDate)}</strong>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="invoice-client">
          <h3>Mijoz ma'lumotlari</h3>
          <div className="client-details">
            <div className="client-row">
              <span>Bola:</span>
              <strong>{invoice.child.firstName} {invoice.child.lastName}</strong>
            </div>
            <div className="client-row">
              <span>Guruh:</span>
              <strong>{invoice.child.groupName}</strong>
            </div>
            <div className="client-row">
              <span>Ota-ona:</span>
              <strong>{invoice.parent?.name || 'N/A'}</strong>
            </div>
            <div className="client-row">
              <span>Telefon:</span>
              <strong>{invoice.parent?.phone || 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Period */}
        <div className="invoice-period">
          <span className="period-label">To'lov davri:</span>
          <span className="period-value">{invoice.period}</span>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Xizmat nomi</th>
              <th>Miqdor</th>
              <th>Narx</th>
              <th>Jami</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className={item.type === 'discount' ? 'discount-row' : ''}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>{item.quantity || 1}</td>
                <td>{item.type === 'discount' ? '-' : ''}{formatCurrency(item.unitPrice)}</td>
                <td>{item.type === 'discount' ? '-' : ''}{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="subtotal-row">
              <td colSpan="4">Jami:</td>
              <td>{formatCurrency(invoice.subtotal)}</td>
            </tr>
            {invoice.discount > 0 && (
              <tr className="discount-total-row">
                <td colSpan="4">Chegirma:</td>
                <td>-{formatCurrency(invoice.discount)}</td>
              </tr>
            )}
            {invoice.previousBalance !== 0 && (
              <tr className="balance-row">
                <td colSpan="4">Oldingi qoldiq:</td>
                <td>{invoice.previousBalance > 0 ? '' : '-'}{formatCurrency(Math.abs(invoice.previousBalance))}</td>
              </tr>
            )}
            <tr className="total-row">
              <td colSpan="4">TO'LANISHI KERAK:</td>
              <td>{formatCurrency(invoice.total)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Payment Info */}
        <div className="invoice-payment-info">
          <div className="payment-methods">
            <h4>To'lov usullari:</h4>
            <ul>
              <li>💵 Naqd pul</li>
              <li>💳 Plastik karta</li>
              <li>🏦 Bank o'tkazmasi</li>
            </ul>
          </div>
          <div className="payment-qr">
            <div className="qr-placeholder">
              <span>QR</span>
            </div>
            <p>QR kod orqali to'lang</p>
          </div>
        </div>

        {/* Bank Details */}
        {kindergartenInfo.bankDetails && (
          <div className="invoice-bank-details">
            <h4>Bank rekvizitlari:</h4>
            <p>Bank: {kindergartenInfo.bankDetails.bankName}</p>
            <p>Hisob raqam: {kindergartenInfo.bankDetails.accountNumber}</p>
            <p>MFO: {kindergartenInfo.bankDetails.mfo}</p>
            <p>INN: {kindergartenInfo.bankDetails.inn}</p>
          </div>
        )}

        {/* Footer */}
        <div className="invoice-footer">
          <p>Diqqatingiz uchun rahmat!</p>
          <p className="footer-note">
            Savollar bo'lsa: {kindergartenInfo.phone} yoki {kindergartenInfo.email}
          </p>
        </div>

        {/* Watermark for unpaid */}
        {!invoice.isPaid && (
          <div className="invoice-watermark">TO'LANMAGAN</div>
        )}
      </div>
    </div>
  )
}

// Invoice Form Component
function InvoiceForm({ child, defaultItems = [], onGenerate, onCancel }) {
  const [items, setItems] = useState(defaultItems)
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 15)
    return date.toISOString().split('T')[0]
  })
  const [period, setPeriod] = useState(() => {
    const now = new Date()
    return `${now.toLocaleString('uz-UZ', { month: 'long' })} ${now.getFullYear()}`
  })
  const [notes, setNotes] = useState('')

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, type: 'service' }])
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    setItems(newItems)
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = items
      .filter(i => i.type !== 'discount')
      .reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0)
    const discount = items
      .filter(i => i.type === 'discount')
      .reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0)
    return { subtotal, discount, total: subtotal - discount }
  }

  const handleGenerate = () => {
    const totals = calculateTotals()
    onGenerate({
      number: generateInvoiceNumber(),
      date: new Date().toISOString(),
      dueDate,
      period,
      child,
      items: items.map(i => ({ ...i, total: i.quantity * i.unitPrice })),
      ...totals,
      notes,
      isPaid: false
    })
  }

  const totals = calculateTotals()

  return (
    <div className="invoice-form">
      <div className="form-header">
        <h3>📄 Yangi hisob-faktura</h3>
        <div className="form-child-info">
          <span>{child.firstName} {child.lastName}</span>
          <span className="child-group">{child.groupName}</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>To'lov davri</label>
          <input
            type="text"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            placeholder="Yanvar 2024"
          />
        </div>
        <div className="form-group">
          <label>To'lov muddati</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-items">
        <div className="items-header">
          <h4>Xizmatlar</h4>
          <button className="add-item-btn" onClick={addItem}>+ Qo'shish</button>
        </div>

        <div className="items-list">
          {items.map((item, index) => (
            <div key={index} className={`item-row ${item.type === 'discount' ? 'discount' : ''}`}>
              <select
                value={item.type}
                onChange={e => updateItem(index, 'type', e.target.value)}
                className="item-type"
              >
                <option value="service">Xizmat</option>
                <option value="discount">Chegirma</option>
              </select>
              <input
                type="text"
                value={item.description}
                onChange={e => updateItem(index, 'description', e.target.value)}
                placeholder="Tavsif"
                className="item-desc"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                min="1"
                className="item-qty"
              />
              <input
                type="number"
                value={item.unitPrice}
                onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                placeholder="Narx"
                className="item-price"
              />
              <span className="item-total">
                {item.type === 'discount' ? '-' : ''}{formatCurrency(item.quantity * item.unitPrice)}
              </span>
              <button className="remove-item-btn" onClick={() => removeItem(index)}>×</button>
            </div>
          ))}
        </div>

        <div className="items-totals">
          <div className="total-row">
            <span>Jami:</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="total-row discount">
              <span>Chegirma:</span>
              <span>-{formatCurrency(totals.discount)}</span>
            </div>
          )}
          <div className="total-row final">
            <span>To'lanishi kerak:</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Izoh</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Qo'shimcha izoh..."
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button className="cancel-btn" onClick={onCancel}>Bekor qilish</button>
        <button 
          className="generate-btn" 
          onClick={handleGenerate}
          disabled={items.length === 0 || totals.total <= 0}
        >
          📄 Yaratish
        </button>
      </div>
    </div>
  )
}

// Main Invoice Generator Component
function InvoiceGenerator({
  children = [],
  kindergartenInfo = {},
  onSave,
  onSend
}) {
  const [selectedChild, setSelectedChild] = useState(null)
  const [generatedInvoice, setGeneratedInvoice] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

  const filteredChildren = children.filter(child => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      child.firstName?.toLowerCase().includes(query) ||
      child.lastName?.toLowerCase().includes(query) ||
      child.groupName?.toLowerCase().includes(query)
    )
  })

  const handleSelectChild = (child) => {
    setSelectedChild(child)
    setShowForm(true)
  }

  const handleGenerate = (invoice) => {
    setGeneratedInvoice({
      ...invoice,
      parent: selectedChild.parent
    })
    setShowForm(false)
    onSave?.(invoice)
  }

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleDownload = useCallback(() => {
    // In real app, use jsPDF or similar
    alert('PDF yuklab olish funksiyasi')
  }, [])

  const handleSend = useCallback(() => {
    if (generatedInvoice) {
      onSend?.(generatedInvoice)
    }
  }, [generatedInvoice, onSend])

  const handleBack = () => {
    setGeneratedInvoice(null)
    setSelectedChild(null)
  }

  // Show invoice preview
  if (generatedInvoice) {
    return (
      <div className="invoice-generator">
        <button className="back-btn" onClick={handleBack}>
          ← Orqaga
        </button>
        <InvoicePreview
          invoice={generatedInvoice}
          kindergartenInfo={kindergartenInfo}
          onPrint={handlePrint}
          onDownload={handleDownload}
          onSend={handleSend}
        />
      </div>
    )
  }

  // Show form
  if (showForm && selectedChild) {
    return (
      <div className="invoice-generator">
        <InvoiceForm
          child={selectedChild}
          defaultItems={[
            { description: 'Oylik to\'lov', quantity: 1, unitPrice: 1500000, type: 'service' },
            { description: 'Ovqat', quantity: 1, unitPrice: 300000, type: 'service' }
          ]}
          onGenerate={handleGenerate}
          onCancel={() => {
            setShowForm(false)
            setSelectedChild(null)
          }}
        />
      </div>
    )
  }

  // Show child selection
  return (
    <div className="invoice-generator">
      <div className="generator-header">
        <h2>📄 Hisob-faktura yaratish</h2>
        <p>Bolani tanlang</p>
      </div>

      <div className="generator-search">
        <input
          type="text"
          placeholder="Qidirish..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="children-grid">
        {filteredChildren.map(child => (
          <motion.div
            key={child.id}
            className="child-select-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectChild(child)}
          >
            <div className="child-avatar">
              {child.photo ? (
                <img src={child.photo} alt={child.firstName} />
              ) : (
                <span>{child.firstName?.[0]}{child.lastName?.[0]}</span>
              )}
            </div>
            <div className="child-info">
              <h4>{child.firstName} {child.lastName}</h4>
              <span>{child.groupName}</span>
            </div>
            <span className="select-arrow">→</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default InvoiceGenerator
export { InvoicePreview, InvoiceForm, generateInvoiceNumber, formatCurrency, formatDate }
