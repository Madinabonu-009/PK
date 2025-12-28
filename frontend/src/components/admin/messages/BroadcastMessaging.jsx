import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './BroadcastMessaging.css'

// Recipient Types
const RECIPIENT_TYPES = [
  { id: 'all_parents', name: 'Barcha ota-onalar', icon: '👨‍👩‍👧‍👦', count: 0 },
  { id: 'group', name: 'Guruh bo\'yicha', icon: '👥', count: 0 },
  { id: 'custom', name: 'Tanlangan', icon: '✅', count: 0 }
]

// Message Channels
const CHANNELS = [
  { id: 'telegram', name: 'Telegram', icon: '📱', color: '#0088cc' },
  { id: 'sms', name: 'SMS', icon: '💬', color: '#10b981' },
  { id: 'push', name: 'Push', icon: '🔔', color: '#f59e0b' }
]

// Broadcast History Item
function BroadcastHistoryItem({ broadcast }) {
  const channel = CHANNELS.find(c => c.id === broadcast.channel)
  const statusColors = {
    sent: '#10b981',
    pending: '#f59e0b',
    failed: '#ef4444',
    scheduled: '#3b82f6'
  }
  const statusLabels = {
    sent: 'Yuborildi',
    pending: 'Kutilmoqda',
    failed: 'Xato',
    scheduled: 'Rejalashtirilgan'
  }

  return (
    <div className="broadcast-history-item">
      <span className="history-channel" style={{ color: channel?.color }}>
        {channel?.icon}
      </span>
      <div className="history-info">
        <span className="history-subject">{broadcast.subject || 'Xabar'}</span>
        <span className="history-time">
          {new Date(broadcast.sentAt).toLocaleString('uz-UZ')}
        </span>
      </div>
      <span className="history-recipients">
        {broadcast.recipientCount} ta
      </span>
      <span 
        className="history-status"
        style={{ color: statusColors[broadcast.status] }}
      >
        {statusLabels[broadcast.status]}
      </span>
    </div>
  )
}

// Recipient Selector Component
function RecipientSelector({ 
  groups = [], 
  parents = [], 
  selectedType, 
  selectedGroups, 
  selectedParents,
  onTypeChange,
  onGroupToggle,
  onParentToggle,
  onSelectAllParents
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredParents = useMemo(() => {
    if (!searchQuery) return parents
    const query = searchQuery.toLowerCase()
    return parents.filter(p => 
      p.name?.toLowerCase().includes(query) ||
      p.childName?.toLowerCase().includes(query) ||
      p.phone?.includes(query)
    )
  }, [parents, searchQuery])

  return (
    <div className="recipient-selector">
      {/* Type Selection */}
      <div className="type-selection">
        {RECIPIENT_TYPES.map(type => (
          <button
            key={type.id}
            className={`type-btn ${selectedType === type.id ? 'active' : ''}`}
            onClick={() => onTypeChange(type.id)}
          >
            <span className="type-icon">{type.icon}</span>
            <span className="type-name">{type.name}</span>
          </button>
        ))}
      </div>

      {/* Group Selection */}
      {selectedType === 'group' && (
        <div className="group-selection">
          <h4>Guruhlarni tanlang</h4>
          <div className="group-list">
            {groups.map(group => (
              <label key={group.id} className="group-item">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => onGroupToggle(group.id)}
                />
                <span className="checkbox-mark">✓</span>
                <span className="group-name">{group.name}</span>
                <span className="group-count">{group.childrenCount || 0} ta</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Custom Selection */}
      {selectedType === 'custom' && (
        <div className="custom-selection">
          <div className="selection-header">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Qidirish..."
              />
            </div>
            <button 
              className="select-all-btn"
              onClick={onSelectAllParents}
            >
              {selectedParents.length === parents.length ? 'Bekor qilish' : 'Hammasini tanlash'}
            </button>
          </div>

          <div className="parent-list">
            {filteredParents.map(parent => (
              <label key={parent.id} className="parent-item">
                <input
                  type="checkbox"
                  checked={selectedParents.includes(parent.id)}
                  onChange={() => onParentToggle(parent.id)}
                />
                <span className="checkbox-mark">✓</span>
                <div className="parent-info">
                  <span className="parent-name">{parent.name}</span>
                  <span className="parent-child">👶 {parent.childName}</span>
                </div>
                <span className="parent-phone">{parent.phone}</span>
              </label>
            ))}
          </div>

          <div className="selection-count">
            {selectedParents.length} ta tanlangan
          </div>
        </div>
      )}
    </div>
  )
}


// Main Broadcast Messaging Component
function BroadcastMessaging({
  groups = [],
  parents = [],
  broadcastHistory = [],
  onSendBroadcast,
  onScheduleBroadcast
}) {
  const [recipientType, setRecipientType] = useState('all_parents')
  const [selectedGroups, setSelectedGroups] = useState([])
  const [selectedParents, setSelectedParents] = useState([])
  const [selectedChannels, setSelectedChannels] = useState(['telegram'])
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Calculate recipient count
  const recipientCount = useMemo(() => {
    if (recipientType === 'all_parents') {
      return parents.length
    }
    if (recipientType === 'group') {
      return groups
        .filter(g => selectedGroups.includes(g.id))
        .reduce((sum, g) => sum + (g.childrenCount || 0), 0)
    }
    return selectedParents.length
  }, [recipientType, selectedGroups, selectedParents, groups, parents])

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const handleParentToggle = (parentId) => {
    setSelectedParents(prev => 
      prev.includes(parentId)
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    )
  }

  const handleSelectAllParents = () => {
    if (selectedParents.length === parents.length) {
      setSelectedParents([])
    } else {
      setSelectedParents(parents.map(p => p.id))
    }
  }

  const handleChannelToggle = (channelId) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }

  const handleSend = async () => {
    if (!message.trim() || selectedChannels.length === 0 || recipientCount === 0) return

    setIsSending(true)
    try {
      const broadcastData = {
        subject,
        message,
        channels: selectedChannels,
        recipientType,
        selectedGroups: recipientType === 'group' ? selectedGroups : [],
        selectedParents: recipientType === 'custom' ? selectedParents : [],
        recipientCount
      }

      if (scheduleTime) {
        await onScheduleBroadcast?.({ ...broadcastData, scheduleTime })
      } else {
        await onSendBroadcast?.(broadcastData)
      }

      // Reset form
      setMessage('')
      setSubject('')
      setScheduleTime('')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="broadcast-messaging">
      {/* Header */}
      <div className="broadcast-header">
        <h2>📢 Ommaviy xabar</h2>
        <span className="recipient-badge">
          {recipientCount} ta qabul qiluvchi
        </span>
      </div>

      <div className="broadcast-content">
        {/* Left - Compose */}
        <div className="compose-section">
          {/* Recipients */}
          <div className="form-section">
            <h3>👥 Qabul qiluvchilar</h3>
            <RecipientSelector
              groups={groups}
              parents={parents}
              selectedType={recipientType}
              selectedGroups={selectedGroups}
              selectedParents={selectedParents}
              onTypeChange={setRecipientType}
              onGroupToggle={handleGroupToggle}
              onParentToggle={handleParentToggle}
              onSelectAllParents={handleSelectAllParents}
            />
          </div>

          {/* Channels */}
          <div className="form-section">
            <h3>📱 Yuborish kanallari</h3>
            <div className="channel-options">
              {CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  className={`channel-btn ${selectedChannels.includes(channel.id) ? 'active' : ''}`}
                  onClick={() => handleChannelToggle(channel.id)}
                  style={{ '--channel-color': channel.color }}
                >
                  <span>{channel.icon}</span>
                  <span>{channel.name}</span>
                  {selectedChannels.includes(channel.id) && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="form-section">
            <h3>✉️ Xabar</h3>
            <div className="form-group">
              <label>Mavzu (ixtiyoriy)</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Xabar mavzusi"
              />
            </div>
            <div className="form-group">
              <label>Xabar matni *</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Xabar matnini kiriting..."
                rows={6}
              />
              <span className="char-count">{message.length} belgi</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="form-section">
            <h3>⏰ Rejalashtirish (ixtiyoriy)</h3>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={e => setScheduleTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Actions */}
          <div className="action-buttons">
            <button 
              className="btn-send"
              onClick={handleSend}
              disabled={isSending || !message.trim() || selectedChannels.length === 0 || recipientCount === 0}
            >
              {isSending ? (
                '⏳ Yuborilmoqda...'
              ) : scheduleTime ? (
                `📅 Rejalashtirish (${recipientCount})`
              ) : (
                `📤 Yuborish (${recipientCount})`
              )}
            </button>
          </div>
        </div>

        {/* Right - History */}
        <div className="history-section">
          <h3>📜 Yuborish tarixi</h3>
          {broadcastHistory.length > 0 ? (
            <div className="history-list">
              {broadcastHistory.slice(0, 10).map((broadcast, idx) => (
                <BroadcastHistoryItem key={broadcast.id || idx} broadcast={broadcast} />
              ))}
            </div>
          ) : (
            <div className="empty-history">
              <span>📭</span>
              <p>Hali xabar yuborilmagan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BroadcastMessaging
export {
  BroadcastHistoryItem,
  RecipientSelector,
  RECIPIENT_TYPES,
  CHANNELS
}
