import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './TwoFactorAuth.css'

// 2FA Methods
const TWO_FA_METHODS = {
  totp: { label: 'Authenticator ilovasi', icon: '📱', description: 'Google Authenticator yoki shunga o\'xshash ilova' },
  sms: { label: 'SMS', icon: '💬', description: 'Telefon raqamingizga kod yuboriladi' },
  email: { label: 'Email', icon: '📧', description: 'Email manzilingizga kod yuboriladi' }
}

// Setup Step Component
function SetupStep({ step, title, description, isActive, isCompleted, children }) {
  return (
    <div className={`setup-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="step-header">
        <span className="step-number">
          {isCompleted ? '✓' : step}
        </span>
        <div className="step-info">
          <span className="step-title">{title}</span>
          <span className="step-description">{description}</span>
        </div>
      </div>
      {isActive && (
        <motion.div
          className="step-content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

// QR Code Display
function QRCodeDisplay({ qrCode, secret }) {
  const [showSecret, setShowSecret] = useState(false)

  return (
    <div className="qr-code-display">
      <div className="qr-code-image">
        {qrCode ? (
          <img src={qrCode} alt="QR Code" />
        ) : (
          <div className="qr-placeholder">
            <span>📱</span>
            <p>QR kod yuklanmoqda...</p>
          </div>
        )}
      </div>

      <div className="secret-section">
        <p className="secret-hint">
          QR kodni skanerlash imkoni bo'lmasa, quyidagi kodni qo'lda kiriting:
        </p>
        <div className="secret-display">
          <code className={showSecret ? '' : 'hidden'}>
            {showSecret ? secret : '••••••••••••••••'}
          </code>
          <button 
            className="toggle-secret"
            onClick={() => setShowSecret(!showSecret)}
          >
            {showSecret ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Verification Code Input
function VerificationCodeInput({ length = 6, value, onChange, error }) {
  const handleChange = (index, digit) => {
    if (!/^\d*$/.test(digit)) return
    
    const newValue = value.split('')
    newValue[index] = digit
    const result = newValue.join('')
    onChange?.(result)

    // Auto-focus next input
    if (digit && index < length - 1) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange?.(pastedData)
  }

  return (
    <div className="verification-code-input">
      <div className="code-inputs">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            data-index={i}
            value={value[i] || ''}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={error ? 'error' : ''}
          />
        ))}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

// Recovery Codes Display
function RecoveryCodesDisplay({ codes, onDownload, onCopy }) {
  return (
    <div className="recovery-codes-display">
      <div className="codes-warning">
        <span className="warning-icon">⚠️</span>
        <p>
          Bu kodlarni xavfsiz joyda saqlang. Agar authenticator ilovangizga kirish imkoni bo'lmasa, 
          bu kodlar yordamida hisobingizga kirishingiz mumkin.
        </p>
      </div>

      <div className="codes-grid">
        {codes.map((code, index) => (
          <div key={index} className="code-item">
            <span className="code-number">{index + 1}.</span>
            <code>{code}</code>
          </div>
        ))}
      </div>

      <div className="codes-actions">
        <button className="action-btn" onClick={onDownload}>
          📥 Yuklab olish
        </button>
        <button className="action-btn" onClick={onCopy}>
          📋 Nusxa olish
        </button>
      </div>
    </div>
  )
}


// Main Two Factor Auth Component
function TwoFactorAuth({
  isEnabled = false,
  method = null,
  qrCode = null,
  secret = null,
  recoveryCodes = [],
  onEnable,
  onDisable,
  onVerify,
  onRegenerateRecoveryCodes
}) {
  const [setupStep, setSetupStep] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState('totp')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)

  const handleStartSetup = () => {
    onEnable?.(selectedMethod)
    setSetupStep(2)
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setVerificationError("6 ta raqam kiriting")
      return
    }

    try {
      await onVerify?.(verificationCode)
      setSetupStep(3)
      setVerificationError('')
    } catch {
      setVerificationError("Kod noto'g'ri. Qaytadan urinib ko'ring.")
    }
  }

  const handleComplete = () => {
    setSetupStep(1)
    setVerificationCode('')
  }

  const handleDisable = () => {
    onDisable?.()
    setShowDisableConfirm(false)
  }

  const handleDownloadCodes = () => {
    const content = recoveryCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recovery-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
  }

  if (isEnabled) {
    return (
      <div className="two-factor-auth enabled">
        <div className="status-card">
          <div className="status-icon">🔒</div>
          <div className="status-info">
            <h3>Ikki bosqichli autentifikatsiya yoqilgan</h3>
            <p>
              Hisobingiz {TWO_FA_METHODS[method]?.label || 'authenticator'} orqali himoyalangan
            </p>
          </div>
        </div>

        <div className="enabled-actions">
          <button 
            className="action-btn secondary"
            onClick={() => setShowRecoveryCodes(true)}
          >
            🔑 Tiklash kodlari
          </button>
          <button 
            className="action-btn danger"
            onClick={() => setShowDisableConfirm(true)}
          >
            🚫 O'chirish
          </button>
        </div>

        {/* Recovery Codes Modal */}
        <AnimatePresence>
          {showRecoveryCodes && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecoveryCodes(false)}
            >
              <motion.div
                className="recovery-modal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
              >
                <h3>🔑 Tiklash kodlari</h3>
                <RecoveryCodesDisplay
                  codes={recoveryCodes}
                  onDownload={handleDownloadCodes}
                  onCopy={handleCopyCodes}
                />
                <div className="modal-footer">
                  <button 
                    className="btn-secondary"
                    onClick={onRegenerateRecoveryCodes}
                  >
                    🔄 Yangi kodlar
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowRecoveryCodes(false)}
                  >
                    Yopish
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disable Confirmation Modal */}
        <AnimatePresence>
          {showDisableConfirm && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisableConfirm(false)}
            >
              <motion.div
                className="confirm-modal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
              >
                <span className="confirm-icon">⚠️</span>
                <h3>Ikki bosqichli autentifikatsiyani o'chirish</h3>
                <p>
                  Bu hisobingiz xavfsizligini kamaytiradi. Davom etishni xohlaysizmi?
                </p>
                <div className="confirm-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowDisableConfirm(false)}
                  >
                    Bekor qilish
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={handleDisable}
                  >
                    O'chirish
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="two-factor-auth setup">
      <div className="setup-header">
        <h2>🔐 Ikki bosqichli autentifikatsiya</h2>
        <p>Hisobingizni qo'shimcha himoya qatlami bilan ta'minlang</p>
      </div>

      <div className="setup-steps">
        <SetupStep
          step={1}
          title="Usulni tanlang"
          description="Autentifikatsiya usulini tanlang"
          isActive={setupStep === 1}
          isCompleted={setupStep > 1}
        >
          <div className="method-options">
            {Object.entries(TWO_FA_METHODS).map(([key, method]) => (
              <button
                key={key}
                className={`method-btn ${selectedMethod === key ? 'selected' : ''}`}
                onClick={() => setSelectedMethod(key)}
              >
                <span className="method-icon">{method.icon}</span>
                <div className="method-info">
                  <span className="method-label">{method.label}</span>
                  <span className="method-desc">{method.description}</span>
                </div>
              </button>
            ))}
          </div>
          <button className="continue-btn" onClick={handleStartSetup}>
            Davom etish →
          </button>
        </SetupStep>

        <SetupStep
          step={2}
          title="Sozlash"
          description="Authenticator ilovasini sozlang"
          isActive={setupStep === 2}
          isCompleted={setupStep > 2}
        >
          <QRCodeDisplay qrCode={qrCode} secret={secret} />
          <div className="verify-section">
            <p>Ilovadagi 6 ta raqamli kodni kiriting:</p>
            <VerificationCodeInput
              value={verificationCode}
              onChange={setVerificationCode}
              error={verificationError}
            />
            <button 
              className="verify-btn"
              onClick={handleVerify}
              disabled={verificationCode.length !== 6}
            >
              ✓ Tasdiqlash
            </button>
          </div>
        </SetupStep>

        <SetupStep
          step={3}
          title="Tiklash kodlari"
          description="Zaxira kodlarni saqlang"
          isActive={setupStep === 3}
          isCompleted={false}
        >
          <RecoveryCodesDisplay
            codes={recoveryCodes}
            onDownload={handleDownloadCodes}
            onCopy={handleCopyCodes}
          />
          <button className="complete-btn" onClick={handleComplete}>
            ✓ Tugatish
          </button>
        </SetupStep>
      </div>
    </div>
  )
}

export default TwoFactorAuth
export {
  SetupStep,
  QRCodeDisplay,
  VerificationCodeInput,
  RecoveryCodesDisplay,
  TWO_FA_METHODS
}
