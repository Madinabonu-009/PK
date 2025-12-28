/**
 * PWA Install Prompt Component
 */

import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './InstallPrompt.css'

const translations = {
  uz: {
    title: "Ilovani o'rnating",
    description: "Play Kids ilovasini telefoningizga o'rnating va offline rejimda ham foydalaning!",
    install: "O'rnatish",
    later: "Keyinroq",
    installed: "O'rnatildi!"
  },
  ru: {
    title: "Установите приложение",
    description: "Установите Play Kids на телефон и пользуйтесь офлайн!",
    install: "Установить",
    later: "Позже",
    installed: "Установлено!"
  },
  en: {
    title: "Install App",
    description: "Install Play Kids on your phone and use it offline!",
    install: "Install",
    later: "Later",
    installed: "Installed!"
  }
}

function InstallPrompt() {
  const { language } = useLanguage()
  const t = translations[language] || translations.uz
  
  // PWA state - inline instead of hook to avoid React duplicate issues
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  // Setup PWA listeners
  useState(() => {
    // Check if already installed
    const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches
    const isIOSStandalone = window.navigator?.standalone === true
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  })

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    setInstalling(true)
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (err) {
      console.error('Install failed:', err)
    }
    setInstalling(false)
  }

  if (!isInstallable || dismissed || isInstalled) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="install-prompt"
      >
        <div className="install-icon">📱</div>
        <div className="install-content">
          <h3>{t.title}</h3>
          <p>{t.description}</p>
        </div>
        <div className="install-actions">
          <button 
            className="later-btn" 
            onClick={() => setDismissed(true)}
          >
            {t.later}
          </button>
          <button 
            className="install-btn" 
            onClick={handleInstall}
            disabled={installing}
          >
            {installing ? '...' : t.install}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default memo(InstallPrompt)
