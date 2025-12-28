/**
 * Secure Storage Utility - XSS va token xavfsizligi uchun
 * Issue #2: Token xavfsizligi - encryption qo'shildi
 */

const ENCRYPTION_KEY = 'playkids_2024_secure'

// Simple encryption (production'da crypto-js ishlatish kerak)
const encrypt = (text) => {
  if (!text) return ''
  try {
    return btoa(encodeURIComponent(text).split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join(''))
  } catch {
    return ''
  }
}

const decrypt = (encoded) => {
  if (!encoded) return ''
  try {
    return decodeURIComponent(atob(encoded).split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join(''))
  } catch {
    return ''
  }
}

const secureStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = encrypt(JSON.stringify(value))
      localStorage.setItem(key, encrypted)
      return true
    } catch (e) {
      console.error('SecureStorage setItem error:', e)
      return false
    }
  },

  getItem: (key) => {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null
      const decrypted = decrypt(encrypted)
      return decrypted ? JSON.parse(decrypted) : null
    } catch (e) {
      console.error('SecureStorage getItem error:', e)
      return null
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error('SecureStorage removeItem error:', e)
      return false
    }
  },

  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (e) {
      console.error('SecureStorage clear error:', e)
      return false
    }
  },

  // Session storage for temporary data
  session: {
    setItem: (key, value) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value))
        return true
      } catch { return false }
    },
    getItem: (key) => {
      try {
        const item = sessionStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch { return null }
    },
    removeItem: (key) => {
      try { sessionStorage.removeItem(key); return true } catch { return false }
    }
  }
}

export default secureStorage
