import { useState } from 'react'
import { motion } from 'framer-motion'
import './PasswordPolicies.css'

// Password Strength Levels
const STRENGTH_LEVELS = {
  weak: { label: 'Zaif', color: '#ef4444', width: '25%' },
  fair: { label: "O'rtacha", color: '#f59e0b', width: '50%' },
  good: { label: 'Yaxshi', color: '#3b82f6', width: '75%' },
  strong: { label: 'Kuchli', color: '#10b981', width: '100%' }
}

// Policy Rule Component
function PolicyRule({ rule, isEnabled, onToggle }) {
  return (
    <div className={`policy-rule ${isEnabled ? 'enabled' : ''}`}>
      <div className="rule-info">
        <span className="rule-icon">{rule.icon}</span>
        <div className="rule-text">
          <span className="rule-name">{rule.name}</span>
          <span className="rule-description">{rule.description}</span>
        </div>
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={() => onToggle?.(rule.id)}
        />
        <span className="slider"></span>
      </label>
    </div>
  )
}

// Password Strength Indicator
function PasswordStrengthIndicator({ password, policies }) {
  const calculateStrength = () => {
    if (!password) return null
    
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return 'weak'
    if (score <= 3) return 'fair'
    if (score <= 4) return 'good'
    return 'strong'
  }

  const strength = calculateStrength()
  const level = strength ? STRENGTH_LEVELS[strength] : null

  const checkRequirements = () => {
    const requirements = []
    
    if (policies.minLength) {
      requirements.push({
        label: `Kamida ${policies.minLength} ta belgi`,
        met: password.length >= policies.minLength
      })
    }
    if (policies.requireUppercase) {
      requirements.push({
        label: 'Katta harf',
        met: /[A-Z]/.test(password)
      })
    }
    if (policies.requireLowercase) {
      requirements.push({
        label: 'Kichik harf',
        met: /[a-z]/.test(password)
      })
    }
    if (policies.requireNumbers) {
      requirements.push({
        label: 'Raqam',
        met: /[0-9]/.test(password)
      })
    }
    if (policies.requireSpecial) {
      requirements.push({
        label: 'Maxsus belgi',
        met: /[^A-Za-z0-9]/.test(password)
      })
    }

    return requirements
  }

  const requirements = checkRequirements()

  return (
    <div className="password-strength">
      {password && (
        <>
          <div className="strength-bar">
            <div 
              className="strength-fill"
              style={{ 
                width: level?.width || '0%',
                backgroundColor: level?.color 
              }}
            />
          </div>
          <span className="strength-label" style={{ color: level?.color }}>
            {level?.label}
          </span>
        </>
      )}

      <div className="requirements-list">
        {requirements.map((req, index) => (
          <div 
            key={index}
            className={`requirement ${req.met ? 'met' : ''}`}
          >
            <span className="req-icon">{req.met ? '✓' : '○'}</span>
            <span className="req-label">{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Force Password Change Modal
function ForcePasswordChangeModal({ user, onForce, onClose }) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onForce?.(user.id, reason)
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
        className="force-change-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
      >
        <h3>🔐 Parolni o'zgartirishga majburlash</h3>
        <p>
          <strong>{user?.name}</strong> keyingi kirishda parolini o'zgartirishi kerak bo'ladi.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Sabab (ixtiyoriy)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Masalan: Xavfsizlik sababli..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-primary">
              Majburlash
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}


// Default Policy Rules
const DEFAULT_POLICY_RULES = [
  { id: 'minLength', name: 'Minimal uzunlik', description: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak', icon: '📏' },
  { id: 'requireUppercase', name: 'Katta harf', description: 'Kamida bitta katta harf bo\'lishi kerak', icon: '🔠' },
  { id: 'requireLowercase', name: 'Kichik harf', description: 'Kamida bitta kichik harf bo\'lishi kerak', icon: '🔡' },
  { id: 'requireNumbers', name: 'Raqamlar', description: 'Kamida bitta raqam bo\'lishi kerak', icon: '🔢' },
  { id: 'requireSpecial', name: 'Maxsus belgilar', description: 'Kamida bitta maxsus belgi bo\'lishi kerak (!@#$%)', icon: '✨' },
  { id: 'preventReuse', name: 'Qayta ishlatishni taqiqlash', description: 'Oxirgi 5 ta parolni qayta ishlatish mumkin emas', icon: '🚫' },
  { id: 'expiry', name: 'Muddati tugashi', description: 'Parol ma\'lum vaqtdan keyin o\'zgartirilishi kerak', icon: '⏰' }
]

// Main Password Policies Component
function PasswordPolicies({
  policies = {},
  users = [],
  onUpdatePolicies,
  onForcePasswordChange
}) {
  const [localPolicies, setLocalPolicies] = useState({
    minLength: policies.minLength || 8,
    requireUppercase: policies.requireUppercase ?? true,
    requireLowercase: policies.requireLowercase ?? true,
    requireNumbers: policies.requireNumbers ?? true,
    requireSpecial: policies.requireSpecial ?? false,
    preventReuse: policies.preventReuse ?? true,
    reuseCount: policies.reuseCount || 5,
    expiry: policies.expiry ?? false,
    expiryDays: policies.expiryDays || 90
  })
  const [testPassword, setTestPassword] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggleRule = (ruleId) => {
    setLocalPolicies(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onUpdatePolicies?.(localPolicies)
    setHasChanges(false)
  }

  const usersNeedingChange = users.filter(u => u.passwordExpired || u.forcePasswordChange)

  return (
    <div className="password-policies">
      {/* Header */}
      <div className="policies-header">
        <div className="header-info">
          <h2>🔐 Parol siyosatlari</h2>
          <p>Xavfsiz parol talablarini sozlang</p>
        </div>

        {hasChanges && (
          <button className="save-btn" onClick={handleSave}>
            💾 O'zgarishlarni saqlash
          </button>
        )}
      </div>

      {/* Policy Rules */}
      <div className="policies-section">
        <h3>📋 Qoidalar</h3>
        <div className="rules-list">
          {DEFAULT_POLICY_RULES.map(rule => (
            <PolicyRule
              key={rule.id}
              rule={rule}
              isEnabled={localPolicies[rule.id]}
              onToggle={handleToggleRule}
            />
          ))}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="policies-section">
        <h3>⚙️ Qo'shimcha sozlamalar</h3>
        
        <div className="settings-grid">
          <div className="setting-item">
            <label>Minimal uzunlik</label>
            <input
              type="number"
              value={localPolicies.minLength}
              onChange={e => {
                setLocalPolicies(prev => ({ ...prev, minLength: Number(e.target.value) }))
                setHasChanges(true)
              }}
              min={6}
              max={32}
            />
          </div>

          {localPolicies.preventReuse && (
            <div className="setting-item">
              <label>Qayta ishlatish taqiqi (oxirgi N ta)</label>
              <input
                type="number"
                value={localPolicies.reuseCount}
                onChange={e => {
                  setLocalPolicies(prev => ({ ...prev, reuseCount: Number(e.target.value) }))
                  setHasChanges(true)
                }}
                min={1}
                max={24}
              />
            </div>
          )}

          {localPolicies.expiry && (
            <div className="setting-item">
              <label>Amal qilish muddati (kun)</label>
              <select
                value={localPolicies.expiryDays}
                onChange={e => {
                  setLocalPolicies(prev => ({ ...prev, expiryDays: Number(e.target.value) }))
                  setHasChanges(true)
                }}
              >
                <option value={30}>30 kun</option>
                <option value={60}>60 kun</option>
                <option value={90}>90 kun</option>
                <option value={180}>180 kun</option>
                <option value={365}>1 yil</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Password Tester */}
      <div className="policies-section">
        <h3>🧪 Parolni tekshirish</h3>
        <div className="password-tester">
          <input
            type="text"
            value={testPassword}
            onChange={e => setTestPassword(e.target.value)}
            placeholder="Parolni sinab ko'ring..."
          />
          <PasswordStrengthIndicator
            password={testPassword}
            policies={localPolicies}
          />
        </div>
      </div>

      {/* Users Needing Password Change */}
      {usersNeedingChange.length > 0 && (
        <div className="policies-section">
          <h3>⚠️ Parol o'zgartirishi kerak bo'lgan foydalanuvchilar</h3>
          <div className="users-list">
            {usersNeedingChange.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-reason">
                    {user.passwordExpired ? 'Muddati tugagan' : 'Majburiy o\'zgartirish'}
                  </span>
                </div>
                <button 
                  className="remind-btn"
                  onClick={() => setSelectedUser(user)}
                >
                  📧 Eslatma yuborish
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Force Password Change Modal */}
      {selectedUser && (
        <ForcePasswordChangeModal
          user={selectedUser}
          onForce={onForcePasswordChange}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}

export default PasswordPolicies
export {
  PolicyRule,
  PasswordStrengthIndicator,
  ForcePasswordChangeModal,
  DEFAULT_POLICY_RULES,
  STRENGTH_LEVELS
}
