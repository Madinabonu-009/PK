import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './TelegramIntegration.css'

// Connection Status
const CONNECTION_STATUS = {
  connected: { label: 'Ulangan', icon: '✅', color: '#10b981' },
  disconnected: { label: 'Uzilgan', icon: '❌', color: '#ef4444' },
  connecting: { label: 'Ulanmoqda...', icon: '⏳', color: '#f59e0b' }
}

// Telegram Chat Item
function TelegramChatItem({ chat, onSelect, selected }) {
  return (
    <div 
      className={`telegram-chat-item ${selected ? 'selected' : ''}`}
      onClick={() => onSelect?.(chat)}
    >
      <div className="chat-avatar">
        {chat.photo ? (
          <img src={chat.photo} alt={chat.name} />
        ) : (
          <span>{chat.name?.charAt(0) || '?'}</span>
        )}
      </div>
      <div className="chat-info">
        <span className="chat-name">{chat.name}</span>
        <span className="chat-username">@{chat.username}</span>
      </div>
      {chat.unreadCount > 0 && (
        <span className="unread-badge">{chat.unreadCount}</span>
      )}
    </div>
  )
}

// Message Item
function TelegramMessageItem({ message, isOwn }) {
  return (
    <div className={`telegram-message ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        <p>{message.text}</p>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit'
          })}
          {isOwn && message.status === 'read' && ' ✓✓'}
          {isOwn && message.status === 'delivered' && ' ✓'}
        </span>
      </div>
    </div>
  )
}

// Sync Settings Modal
function SyncSettingsModal({ settings, onSave, onClose }) {
  const [formData, setFormData] = useState({
    autoSync: settings?.autoSync ?? true,
    syncInterval: settings?.syncInterval || 30,
    notifyOnMessage: settings?.notifyOnMessage ?? true,
    saveHistory: settings?.saveHistory ?? true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave?.(formData)
    onClose()
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
        className="sync-settings-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>⚙️ Sinxronizatsiya sozlamalari</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="setting-item">
            <label className="toggle-label">
              <span>Avtomatik sinxronizatsiya</span>
              <input
                type="checkbox"
                checked={formData.autoSync}
                onChange={e => setFormData(prev => ({ ...prev, autoSync: e.target.checked }))}
              />
              <span className="toggle-switch"></span>
            </label>
          </div>

          {formData.autoSync && (
            <div className="form-group">
              <label>Sinxronizatsiya oralig'i (soniya)</label>
              <select
                value={formData.syncInterval}
                onChange={e => setFormData(prev => ({ ...prev, syncInterval: Number(e.target.value) }))}
              >
                <option value={15}>15 soniya</option>
                <option value={30}>30 soniya</option>
                <option value={60}>1 daqiqa</option>
                <option value={300}>5 daqiqa</option>
              </select>
            </div>
          )}

          <div className="setting-item">
            <label className="toggle-label">
              <span>Yangi xabar haqida xabar berish</span>
              <input
                type="checkbox"
                checked={formData.notifyOnMessage}
                onChange={e => setFormData(prev => ({ ...prev, notifyOnMessage: e.target.checked }))}
              />
              <span className="toggle-switch"></span>
            </label>
          </div>

          <div className="setting-item">
            <label className="toggle-label">
              <span>Tarixni saqlash</span>
              <input
                type="checkbox"
                checked={formData.saveHistory}
                onChange={e => setFormData(prev => ({ ...prev, saveHistory: e.target.checked }))}
              />
              <span className="toggle-switch"></span>
            </label>
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

// Main Telegram Integration Component
function TelegramIntegration({
  connectionStatus = 'disconnected',
  botInfo = null,
  chats = [],
  messages = [],
  selectedChat = null,
  syncSettings = {},
  onConnect,
  onDisconnect,
  onSelectChat,
  onSendMessage,
  onSync,
  onUpdateSettings
}) {
  const [showSettings, setShowSettings] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const status = CONNECTION_STATUS[connectionStatus] || CONNECTION_STATUS.disconnected

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      onSendMessage?.(selectedChat.id, newMessage)
      setNewMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="telegram-integration">
      {/* Header */}
      <div className="integration-header">
        <div className="header-info">
          <h2>📱 Telegram integratsiyasi</h2>
          <span className="status-badge" style={{ color: status.color }}>
            {status.icon} {status.label}
          </span>
        </div>

        <div className="header-actions">
          <button 
            className="action-btn"
            onClick={() => setShowSettings(true)}
          >
            ⚙️
          </button>
          <button 
            className="action-btn"
            onClick={onSync}
            disabled={connectionStatus !== 'connected'}
          >
            🔄 Sinxronlash
          </button>
          {connectionStatus === 'connected' ? (
            <button className="disconnect-btn" onClick={onDisconnect}>
              Uzish
            </button>
          ) : (
            <button className="connect-btn" onClick={onConnect}>
              Ulash
            </button>
          )}
        </div>
      </div>

      {/* Bot Info */}
      {botInfo && connectionStatus === 'connected' && (
        <div className="bot-info-card">
          <span className="bot-avatar">🤖</span>
          <div className="bot-details">
            <span className="bot-name">{botInfo.name}</span>
            <span className="bot-username">@{botInfo.username}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {connectionStatus === 'connected' ? (
        <div className="chat-container">
          {/* Chat List */}
          <div className="chat-list-panel">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Qidirish..."
              />
            </div>

            <div className="chat-list">
              {filteredChats.map(chat => (
                <TelegramChatItem
                  key={chat.id}
                  chat={chat}
                  selected={selectedChat?.id === chat.id}
                  onSelect={onSelectChat}
                />
              ))}

              {filteredChats.length === 0 && (
                <div className="empty-chats">
                  <p>Chatlar topilmadi</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="chat-view-panel">
            {selectedChat ? (
              <>
                <div className="chat-header">
                  <div className="chat-avatar">
                    {selectedChat.photo ? (
                      <img src={selectedChat.photo} alt={selectedChat.name} />
                    ) : (
                      <span>{selectedChat.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="chat-info">
                    <span className="chat-name">{selectedChat.name}</span>
                    <span className="chat-status">
                      {selectedChat.online ? '🟢 Online' : '⚪ Offline'}
                    </span>
                  </div>
                </div>

                <div className="messages-container">
                  {messages.map(msg => (
                    <TelegramMessageItem
                      key={msg.id}
                      message={msg}
                      isOwn={msg.isOwn}
                    />
                  ))}
                </div>

                <div className="message-input">
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Xabar yozing..."
                    rows={1}
                  />
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    📤
                  </button>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <span>💬</span>
                <p>Chatni tanlang</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="not-connected">
          <span className="icon">📱</span>
          <h3>Telegram ulanmagan</h3>
          <p>Telegram bot bilan bog'lanish uchun "Ulash" tugmasini bosing</p>
          <button className="connect-btn large" onClick={onConnect}>
            🔗 Telegram ga ulash
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SyncSettingsModal
            settings={syncSettings}
            onSave={onUpdateSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default TelegramIntegration
export {
  TelegramChatItem,
  TelegramMessageItem,
  SyncSettingsModal,
  CONNECTION_STATUS
}
