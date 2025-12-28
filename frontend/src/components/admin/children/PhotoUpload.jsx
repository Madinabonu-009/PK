import { useState, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import './PhotoUpload.css'

export default function PhotoUpload({ 
  currentPhoto,
  onUpload,
  onRemove,
  aspectRatio = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) {
  const [preview, setPreview] = useState(null)
  const [cropMode, setCropMode] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef(null)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)

  const handleFileSelect = useCallback((file) => {
    setError(null)

    if (!acceptedTypes.includes(file.type)) {
      setError('Faqat JPG, PNG yoki WebP formatdagi rasmlar qabul qilinadi')
      return
    }

    if (file.size > maxSize) {
      setError(`Rasm hajmi ${maxSize / 1024 / 1024}MB dan oshmasligi kerak`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      setCropMode(true)
      // Reset crop area
      setCropArea({ x: 0, y: 0, width: 100, height: 100 })
    }
    reader.readAsDataURL(file)
  }, [acceptedTypes, maxSize])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragging(false)
  }, [])

  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const cropImage = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = imageRef.current

    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const cropX = (cropArea.x / 100) * img.width * scaleX
    const cropY = (cropArea.y / 100) * img.height * scaleY
    const cropWidth = (cropArea.width / 100) * img.width * scaleX
    const cropHeight = (cropArea.height / 100) * img.height * scaleY

    // Set canvas size (output size)
    const outputSize = 400
    canvas.width = outputSize
    canvas.height = outputSize / aspectRatio

    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, canvas.width, canvas.height
    )

    return canvas.toDataURL('image/jpeg', 0.9)
  }, [cropArea, aspectRatio])

  const handleSaveCrop = async () => {
    setUploading(true)
    try {
      const croppedImage = cropImage()
      if (croppedImage && onUpload) {
        await onUpload(croppedImage)
      }
      setCropMode(false)
      setPreview(null)
    } catch (err) {
      setError('Rasmni saqlashda xatolik yuz berdi')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (onRemove) {
      await onRemove()
    }
  }

  return (
    <div className="photo-upload">
      {currentPhoto ? (
        <div className="photo-upload__preview">
          <img src={currentPhoto} alt="Profile" />
          <div className="photo-upload__preview-overlay">
            <button 
              className="photo-upload__preview-btn"
              onClick={() => fileInputRef.current?.click()}
              title="O'zgartirish"
            >
              📷
            </button>
            <button 
              className="photo-upload__preview-btn"
              onClick={handleRemove}
              title="O'chirish"
            >
              🗑️
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`photo-upload__dropzone ${dragging ? 'photo-upload__dropzone--dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <span className="photo-upload__dropzone-icon">📷</span>
          <span className="photo-upload__dropzone-text">
            Rasm yuklash
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="photo-upload__input"
      />

      <canvas ref={canvasRef} className="photo-upload__canvas" />

      {error && <p className="photo-upload__error">{error}</p>}

      <AnimatePresence>
        {cropMode && preview && (
          <motion.div
            className="photo-upload__crop-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="photo-upload__crop-backdrop" onClick={() => setCropMode(false)} />
            
            <motion.div
              className="photo-upload__crop-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="photo-upload__crop-header">
                <h3 className="photo-upload__crop-title">Rasmni kesish</h3>
                <button 
                  className="photo-upload__crop-close"
                  onClick={() => setCropMode(false)}
                >
                  ×
                </button>
              </div>

              <div className="photo-upload__crop-area">
                <img 
                  ref={imageRef}
                  src={preview} 
                  alt="Crop preview"
                  className="photo-upload__crop-image"
                />
                <div 
                  className="photo-upload__crop-overlay"
                  style={{
                    left: `${cropArea.x}%`,
                    top: `${cropArea.y}%`,
                    width: `${cropArea.width}%`,
                    height: `${cropArea.height}%`,
                    borderRadius: aspectRatio === 1 ? '50%' : '0'
                  }}
                >
                  <div className="photo-upload__crop-handle photo-upload__crop-handle--nw" />
                  <div className="photo-upload__crop-handle photo-upload__crop-handle--ne" />
                  <div className="photo-upload__crop-handle photo-upload__crop-handle--sw" />
                  <div className="photo-upload__crop-handle photo-upload__crop-handle--se" />
                </div>
              </div>

              <div className="photo-upload__crop-controls">
                <div className="photo-upload__crop-slider">
                  <label>Hajm:</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={cropArea.width}
                    onChange={(e) => {
                      const size = Number(e.target.value)
                      setCropArea(prev => ({
                        ...prev,
                        width: size,
                        height: size / aspectRatio,
                        x: Math.min(prev.x, 100 - size),
                        y: Math.min(prev.y, 100 - size / aspectRatio)
                      }))
                    }}
                  />
                </div>
              </div>

              <div className="photo-upload__crop-footer">
                <button 
                  className="photo-upload__crop-btn photo-upload__crop-btn--cancel"
                  onClick={() => setCropMode(false)}
                >
                  Bekor qilish
                </button>
                <button 
                  className="photo-upload__crop-btn photo-upload__crop-btn--save"
                  onClick={handleSaveCrop}
                  disabled={uploading}
                >
                  {uploading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

PhotoUpload.propTypes = {
  currentPhoto: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  aspectRatio: PropTypes.number,
  maxSize: PropTypes.number,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string)
}
