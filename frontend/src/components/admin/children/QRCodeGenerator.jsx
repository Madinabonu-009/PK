import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import './QRCodeGenerator.css'

// Simple QR Code generator using canvas
// In production, you'd use a library like 'qrcode' or 'qrcode.react'
function generateQRMatrix(data, size = 21) {
  // This is a simplified QR-like pattern generator
  // For real QR codes, use a proper library
  const matrix = []
  const hash = simpleHash(data)
  
  for (let y = 0; y < size; y++) {
    const row = []
    for (let x = 0; x < size; x++) {
      // Position patterns (corners)
      if (isPositionPattern(x, y, size)) {
        row.push(getPositionPatternValue(x, y, size))
      }
      // Timing patterns
      else if (x === 6 || y === 6) {
        row.push((x + y) % 2 === 0 ? 1 : 0)
      }
      // Data area
      else {
        const index = y * size + x
        row.push((hash[index % hash.length] + index) % 2)
      }
    }
    matrix.push(row)
  }
  
  return matrix
}

function simpleHash(str) {
  const result = []
  for (let i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i) % 2)
  }
  // Extend to ensure enough data
  while (result.length < 500) {
    result.push(...result.map((v, i) => (v + i) % 2))
  }
  return result
}

function isPositionPattern(x, y, size) {
  // Top-left
  if (x < 7 && y < 7) return true
  // Top-right
  if (x >= size - 7 && y < 7) return true
  // Bottom-left
  if (x < 7 && y >= size - 7) return true
  return false
}

function getPositionPatternValue(x, y, size) {
  let localX = x
  let localY = y
  
  // Adjust for top-right
  if (x >= size - 7) localX = x - (size - 7)
  // Adjust for bottom-left
  if (y >= size - 7) localY = y - (size - 7)
  
  // Outer border
  if (localX === 0 || localX === 6 || localY === 0 || localY === 6) return 1
  // Inner white
  if (localX === 1 || localX === 5 || localY === 1 || localY === 5) return 0
  // Center
  return 1
}

// QR Code Canvas Component
function QRCodeCanvas({ data, size = 200, fgColor = '#000', bgColor = '#fff' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !data) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const matrix = generateQRMatrix(data, 25)
    const moduleSize = size / matrix.length

    // Clear canvas
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)

    // Draw modules
    ctx.fillStyle = fgColor
    matrix.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillRect(
            x * moduleSize,
            y * moduleSize,
            moduleSize,
            moduleSize
          )
        }
      })
    })
  }, [data, size, fgColor, bgColor])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="qr-code-canvas"
    />
  )
}

// Main QR Code Generator Component
function QRCodeGenerator({
  childId,
  childName,
  size = 200,
  showActions = true,
  onDownload,
  onPrint
}) {
  const [downloading, setDownloading] = useState(false)
  const containerRef = useRef(null)

  const qrData = `PLAYKIDS:${childId}`

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const canvas = containerRef.current?.querySelector('canvas')
      if (canvas) {
        const link = document.createElement('a')
        link.download = `qr-${childName?.replace(/\s+/g, '-') || childId}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        onDownload?.()
      }
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    const canvas = containerRef.current?.querySelector('canvas')
    if (canvas) {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${childName || childId}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: system-ui, sans-serif;
              }
              img { max-width: 300px; }
              h2 { margin: 20px 0 5px; }
              p { color: #666; margin: 0; }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL('image/png')}" />
            <h2>${childName || 'Bola'}</h2>
            <p>ID: ${childId}</p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      onPrint?.()
    }
  }

  const handleCopy = async () => {
    try {
      const canvas = containerRef.current?.querySelector('canvas')
      if (canvas) {
        canvas.toBlob(async (blob) => {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
        })
      }
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <motion.div
      className="qr-code-generator"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="qr-code-container" ref={containerRef}>
        <QRCodeCanvas data={qrData} size={size} />
      </div>

      {childName && (
        <div className="qr-code-info">
          <span className="qr-code-name">{childName}</span>
          <span className="qr-code-id">ID: {childId}</span>
        </div>
      )}

      {showActions && (
        <div className="qr-code-actions">
          <button
            className="qr-action-btn"
            onClick={handleDownload}
            disabled={downloading}
            title="Yuklab olish"
          >
            {downloading ? '...' : '📥'} Yuklab olish
          </button>
          <button
            className="qr-action-btn"
            onClick={handlePrint}
            title="Chop etish"
          >
            🖨️ Chop etish
          </button>
          <button
            className="qr-action-btn"
            onClick={handleCopy}
            title="Nusxa olish"
          >
            📋 Nusxa
          </button>
        </div>
      )}
    </motion.div>
  )
}

// QR Code Display (read-only, smaller)
export function QRCodeDisplay({ childId, size = 80 }) {
  const qrData = `PLAYKIDS:${childId}`
  
  return (
    <div className="qr-code-display">
      <QRCodeCanvas data={qrData} size={size} />
    </div>
  )
}

// QR Code Modal
export function QRCodeModal({ isOpen, onClose, childId, childName }) {
  if (!isOpen) return null

  return (
    <motion.div
      className="qr-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="qr-modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="qr-modal-close" onClick={onClose}>✕</button>
        <h3 className="qr-modal-title">QR Kod</h3>
        <QRCodeGenerator
          childId={childId}
          childName={childName}
          size={250}
        />
      </motion.div>
    </motion.div>
  )
}

export default QRCodeGenerator
export { QRCodeCanvas, generateQRMatrix }
