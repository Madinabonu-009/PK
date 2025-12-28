import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MessageComposer.css'

// Message templates
const MESSAGE_TEMPLATES = [
  { id: 1, title: "To'lov eslatmasi", content: "Hurmatli ota-ona, {child_name} uchun oylik to'lov muddati yaqinlashmoqda. Iltimos, to'lovni amalga oshiring." },
  { id: 2, title: 'Davomat haqida', content: "Hurmatli ota-ona, {child_name} bugun bog'chaga kelmadi. Iltimos, sabab haqida xabar bering." },
  { id: 3, title: 'Tadbir haqida', content: "Hurmatli ota-onalar, {date} kuni bog'chamizda {event_name} tadbirimiz bo'lib o'tadi. Sizni kutamiz!" },
  { id: 4, title: "Tug'ilgan kun tabrigi", content: "Hurmatli ota-ona, {child_name}ning tug'ilgan kuni bilan tabriklaymiz! 🎂" },
]

// Recipient types
const RECIPIENT_TYPES = {
  individual: { icon: '👤', label: 'Shaxsiy' },
  group: { icon: '👥', label: 'Guruh' },
  all: { icon: '📢', label: 'Barchaga' }
}

// Recipient Picker
function RecipientPicker({ recipients, selected, onChange }) {
  const [search, setSearch] = useState('')

  const filtered = recipients.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (recipient) => {
    const isSelected = selected.some(s => s.id === recipient.id)
    if (isSelected) {
      onChange(selected.filter(s => s.id !== recipient.id))
    } else {
      onChange([...selected, recipient])
    }
  }

  return (
    <div className="recipient-picker">
      <input
        type="text"
        className="recipient-search"
        placeholder="Qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="recipient-list">
        {filtered.map(recipient => (
          <div
            key={recipient.id}
            className={`recipient-item ${selected.some(s => s.id === recipient.id) ? 'selected' : ''}`}
            onClick={() => handleToggle(recipient)}
          >
            <div className="recipient-avatar">
              {recipient.avatar ? (
                <img src={recipient.avatar} alt={recipient.name} />
              ) : (
                <span>{recipient.name.charAt(0)}</span>
              )}
            </div>
            <div className="recipient-info">
              <span className="recipient-name">{recipient.name}</span>
              {recipient.phone && (
                <span className="recipient-phone">{recipient.phone}</span>
              )}
            </div>
            <span className="recipient-check">
              {selected.some(s => s.id === recipient.id) ? '✓' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Template Selector
function TemplateSelector({ templates, onSelect }) {
  return (
    <div className="template-selector">
      <h4 className="template-title">Shablonlar</h4>
      <div className="template-list">
        {templates.map(template => (
          <button
            key={template.id}
            className="template-item"
            onClick={() => onSelect(template)}
          >
            <span className="template-name">{template.title}</span>
            <span className="template-preview">{template.content.slice(0, 50)}...</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Attachment Preview
function AttachmentPreview({ attachments, onRemove }) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="attachment-preview">
      {attachments.map((file, index) => (
        <div key={index} className="attachment-item">
          <span className="attachment-icon">
            {file.type.startsWith('image/') ? '🖼️' : '📎'}
          </span>
          <span className="attachment-name">{file.name}</span>
          <button 
            className="attachment-remove"
            onClick={() => onRemove(index)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

// Main Message Composer Component
function MessageComposer({
  recipients = [],
  groups = [],
  templates = MESSAGE_TEMPLATES,
  onSend,
  onSchedule,
  onCancel,
  loading = false,
  defaultRecipientType = 'individual'
}) {
  const [recipientType, setRecipientType] = useState(defaultRecipientType)
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const fileInputRef = useRef(null)

  const handleTemplateSelect = (template) => {
    setContent(template.content)
    setShowTemplates(false)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(prev => [...prev, ...files])
  }

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    const messageData = {
      recipientType,
      recipients: recipientType === 'individual' ? selectedRecipients : 
                  recipientType === 'group' ? [{ id: selectedGroup }] : 
                  [{ id: 'all' }],
      subject,
      content,
      attachments
    }

    if (showSchedule && scheduleDate && scheduleTime) {
      const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`)
      await onSchedule?.(messageData, scheduledFor)
    } else {
      await onSend?.(messageData)
    }
  }

  const canSend = content.trim() && (
    (recipientType === 'individual' && selectedRecipients.length > 0) ||
    (recipientType === 'group' && selectedGroup) ||
    recipientType === 'all'
  )

  return (
    <motion.div
      className="message-composer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="composer-header">
        <h2 className="composer-title">Yangi xabar</h2>
        <button className="composer-close" onClick={onCancel}>✕</button>
      </div>

      {/* Recipient Type Selector */}
      <div className="recipient-type-selector">
        {Object.entries(RECIPIENT_TYPES).map(([key, config]) => (
          <button
            key={key}
            className={`recipient-type-btn ${recipientType === key ? 'active' : ''}`}
            onClick={() => setRecipientType(key)}
          >
            <span className="type-icon">{config.icon}</span>
            <span className="type-label">{config.label}</span>
          </button>
        ))}
      </div>

      {/* Recipients */}
      <div className="composer-section">
        {recipientType === 'individual' && (
          <>
            <label className="composer-label">Qabul qiluvchilar</label>
            <div className="selected-recipients">
              {selectedRecipients.map(r => (
                <span key={r.id} className="selected-recipient-tag">
                  {r.name}
                  <button onClick={() => setSelectedRecipients(prev => prev.filter(p => p.id !== r.id))}>✕</button>
                </span>
              ))}
            </div>
            <RecipientPicker
              recipients={recipients}
              selected={selectedRecipients}
              onChange={setSelectedRecipients}
              type="individual"
            />
          </>
        )}

        {recipientType === 'group' && (
          <>
            <label className="composer-label">Guruh tanlang</label>
            <select
              className="composer-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">Guruh tanlang...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </>
        )}

        {recipientType === 'all' && (
          <div className="all-recipients-notice">
            <span className="notice-icon">📢</span>
            <span>Xabar barcha ota-onalarga yuboriladi</span>
          </div>
        )}
      </div>

      {/* Subject */}
      <div className="composer-section">
        <label className="composer-label">Mavzu (ixtiyoriy)</label>
        <input
          type="text"
          className="composer-input"
          placeholder="Xabar mavzusi..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="composer-section">
        <div className="composer-label-row">
          <label className="composer-label">Xabar matni</label>
          <button 
            className="template-toggle"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            📝 Shablonlar
          </button>
        </div>

        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <TemplateSelector 
                templates={templates}
                onSelect={handleTemplateSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          className="composer-textarea"
          placeholder="Xabar matnini kiriting..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
        <div className="composer-char-count">
          {content.length} / 1000
        </div>
      </div>

      {/* Attachments */}
      <div className="composer-section">
        <AttachmentPreview 
          attachments={attachments}
          onRemove={handleRemoveAttachment}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFileSelect}
        />
        <button 
          className="attachment-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          📎 Fayl biriktirish
        </button>
      </div>

      {/* Schedule */}
      <div className="composer-section">
        <label className="schedule-toggle">
          <input
            type="checkbox"
            checked={showSchedule}
            onChange={(e) => setShowSchedule(e.target.checked)}
          />
          <span>Keyinroq yuborish</span>
        </label>

        <AnimatePresence>
          {showSchedule && (
            <motion.div
              className="schedule-inputs"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                type="date"
                className="composer-input"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                className="composer-input"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="composer-actions">
        <button 
          className="composer-btn composer-btn--secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Bekor qilish
        </button>
        <button 
          className="composer-btn composer-btn--primary"
          onClick={handleSend}
          disabled={!canSend || loading}
        >
          {loading ? 'Yuborilmoqda...' : showSchedule ? '📅 Rejalashtirish' : '📤 Yuborish'}
        </button>
      </div>
    </motion.div>
  )
}

// Conversation Item
export function ConversationItem({ conversation, active, onClick }) {
  const lastMessage = conversation.lastMessage
  const unread = conversation.unreadCount > 0

  return (
    <div 
      className={`conversation-item ${active ? 'active' : ''} ${unread ? 'unread' : ''}`}
      onClick={() => onClick?.(conversation)}
    >
      <div className="conversation-avatar">
        {conversation.avatar ? (
          <img src={conversation.avatar} alt={conversation.name} />
        ) : (
          <span>{conversation.name?.charAt(0)}</span>
        )}
        {unread && <span className="unread-badge">{conversation.unreadCount}</span>}
      </div>
      <div className="conversation-content">
        <div className="conversation-header">
          <span className="conversation-name">{conversation.name}</span>
          <span className="conversation-time">
            {new Date(lastMessage?.timestamp).toLocaleTimeString('uz-UZ', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        <p className="conversation-preview">{lastMessage?.content}</p>
      </div>
    </div>
  )
}

// Message Bubble
export function MessageBubble({ message, isOwn }) {
  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">{message.content}</div>
      <div className="message-meta">
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString('uz-UZ', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
        {isOwn && (
          <span className="message-status">
            {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  )
}

export default MessageComposer
export { RecipientPicker, TemplateSelector, MESSAGE_TEMPLATES, RECIPIENT_TYPES }
