import { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import './QRScanner.css'

// Sound effects
const playSound = (type) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  if (type === 'success') {
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } else {
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }
}

export default function QRScanner({ 
  isOpen, 
  onClose, 
  onScan, 
  onManualEntry,
  children = [] 
}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)
  
  const [status, setStatus] = useState('initializing')
  const [error, setError] = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [processing, setProcessing] = useState(false)

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setStatus('initializing')
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStatus('scanning')
        startScanning()
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError(err.name === 'NotAllowedError' 
        ? 'Kameraga ruxsat berilmadi. Iltimos, brauzer sozlamalaridan ruxsat bering.'
        : 'Kamerani ishga tushirib bo\'lmadi. Qurilmangizda kamera mavjudligini tekshiring.'
      )
      setStatus('error')
    }
  }, [])

  const startScanning = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    
    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && !processing) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        // Simulate QR detection (in real app, use jsQR or similar library)
        // For demo, we'll detect based on image brightness patterns
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const detected = simulateQRDetection(imageData)
        
        if (detected) {
          handleDetection(detected)
        }
      }
      
      animationRef.current = requestAnimationFrame(scan)
    }
    
    scan()
  }, [processing])

  // Simulated QR detection - in production use jsQR library
  const simulateQRDetection = (imageData) => {
    // This is a placeholder - real implementation would use jsQR
    // For demo purposes, randomly "detect" a QR code
    if (Math.random() < 0.001) { // Very low probability for demo
      const randomChild = children[Math.floor(Math.random() * children.length)]
      if (randomChild) {
        return { childId: randomChild.id }
      }
    }
    return null
  }

  const handleDetection = async (data) => {
    if (processing) return
    
    setProcessing(true)
    
    try {
      // Find child by QR code data
      const child = children.find(c => c.id === data.childId || c.qrCode === data.code)
      
      if (child) {
        playSound('success')
        setLastResult({ success: true, child })
        
        if (onScan) {
          await onScan(child)
        }
        
        // Clear result after 3 seconds
        setTimeout(() => {
          setLastResult(null)
          setProcessing(false)
        }, 3000)
      } else {
        playSound('error')
        setLastResult({ success: false, message: 'Bola topilmadi' })
        
        setTimeout(() => {
          setLastResult(null)
          setProcessing(false)
        }, 2000)
      }
    } catch (err) {
      playSound('error')
      setLastResult({ success: false, message: err.message })
      setProcessing(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      setLastResult(null)
      setError(null)
    }

    return () => stopCamera()
  }, [isOpen, startCamera, stopCamera])

  if (!isOpen) return null

  return (
    <motion.div
      className="qr-scanner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="qr-scanner__header">
        <h2 className="qr-scanner__title">QR Kod Skanerlash</h2>
        <button className="qr-scanner__close" onClick={onClose}>×</button>
      </div>

      <div className="qr-scanner__viewport">
        <video 
          ref={videoRef} 
          className="qr-scanner__video"
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        <div className="qr-scanner__overlay">
          <div className="qr-scanner__corner qr-scanner__corner--tl" />
          <div className="qr-scanner__corner qr-scanner__corner--tr" />
          <div className="qr-scanner__corner qr-scanner__corner--bl" />
          <div className="qr-scanner__corner qr-scanner__corner--br" />
          {status === 'scanning' && (
            <div className="qr-scanner__scan-line" />
          )}
        </div>
      </div>

      <div className="qr-scanner__status">
        {status === 'initializing' && (
          <>
            <p className="qr-scanner__status-text">Kamera ishga tushmoqda...</p>
            <p className="qr-scanner__status-hint">Iltimos, kameraga ruxsat bering</p>
          </>
        )}
        {status === 'scanning' && !lastResult && (
          <>
            <p className="qr-scanner__status-text">QR kodni ramkaga joylashtiring</p>
            <p className="qr-scanner__status-hint">Avtomatik aniqlash faol</p>
          </>
        )}
      </div>

      {error && (
        <div className="qr-scanner__error">
          <div className="qr-scanner__error-icon">📷</div>
          <p className="qr-scanner__error-text">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {lastResult && (
          <motion.div
            className="qr-scanner__result"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            {lastResult.success ? (
              <div className="qr-scanner__result-card">
                <img 
                  src={lastResult.child.photo || '/default-avatar.png'} 
                  alt={lastResult.child.name}
                  className="qr-scanner__result-avatar"
                />
                <div className="qr-scanner__result-info">
                  <div className="qr-scanner__result-name">{lastResult.child.name}</div>
                  <div className="qr-scanner__result-group">{lastResult.child.group}</div>
                </div>
                <div className="qr-scanner__result-status qr-scanner__result-status--success">
                  ✓ Keldi
                </div>
              </div>
            ) : (
              <div className="qr-scanner__result-card">
                <div className="qr-scanner__result-status qr-scanner__result-status--error">
                  ✕ {lastResult.message}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {onManualEntry && (
        <div className="qr-scanner__manual">
          <button 
            className="qr-scanner__manual-btn"
            onClick={onManualEntry}
          >
            Qo'lda kiritish
          </button>
        </div>
      )}
    </motion.div>
  )
}

QRScanner.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onScan: PropTypes.func,
  onManualEntry: PropTypes.func,
  children: PropTypes.array
}
