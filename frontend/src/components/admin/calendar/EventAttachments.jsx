import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './EventAttachments.css'

// File Type Icons
const FILE_ICONS = {
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  xls: '📊',
  xlsx: '📊',
  ppt: '📽️',
  pptx: '📽️',
  jpg: '🖼️',
  jpeg: '🖼️',
  png: '🖼️',
  gif: '🖼️',
  mp4: '🎬',
  mp3: '🎵',
  zip: '📦',
  rar: '📦',
  default: '📎'
}

// Get file icon based on extension
const getFileIcon = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  return FILE_ICONS[ext] || FILE_ICONS.default
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Attachment Card Component
function AttachmentCard({ file, onDownload, onDelete, onPreview }) {
  const icon = getFileIcon(file.name)
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(
    file.name.split('.').pop()?.toLowerCase()
  )

  return (
    <motion.div
      className="attachment-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      {isImage && file.url ? (
        <div 
          className="attachment-preview"
          onClick={() => onPreview?.(file)}
        >
          <img src={file.url} alt={file.name} />
          <div className="preview-overlay">
            <span>👁️ Ko'rish</span>
          </div>
        </div>
      ) : (
        <div className="attachment-icon">
          <span>{icon}</span>
        </div>
      )}

      <div className="attachment-info">
        <span className="attachment-name" title={file.name}>
          {file.name}
        </span>
        <span className="attachment-size">
          {formatFileSize(file.size)}
        </span>
      </div>

      <div className="attachment-actions">
        <button 
          className="action-btn download"
          onClick={() => onDownload?.(file)}
          title="Yuklab olish"
        >
          ⬇️
        </button>
        {onDelete && (
          <button 
            className="action-btn delete"
            onClick={() => onDelete?.(file.id)}
            title="O'chirish"
          >
            🗑️
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Upload Progress Component
function UploadProgress({ file, progress }) {
  return (
    <div className="upload-progress">
      <div className="progress-info">
        <span className="file-icon">{getFileIcon(file.name)}</span>
        <span className="file-name">{file.name}</span>
        <span className="progress-percent">{progress}%</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Image Preview Modal
function ImagePreviewModal({ file, onClose }) {
  return (
    <motion.div
      className="preview-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="preview-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="preview-close" onClick={onClose}>✕</button>
        <img src={file.url} alt={file.name} />
        <div className="preview-info">
          <span>{file.name}</span>
          <span>{formatFileSize(file.size)}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Event Attachments Component
function EventAttachments({
  attachments = [],
  onUpload,
  onDownload,
  onDelete,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = '*'
}) {
  const [uploading, setUploading] = useState([])
  const [previewFile, setPreviewFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxFileSize) {
        alert(`${file.name} hajmi juda katta (max ${formatFileSize(maxFileSize)})`)
        return false
      }
      return true
    })

    if (attachments.length + validFiles.length > maxFiles) {
      alert(`Maksimal ${maxFiles} ta fayl yuklash mumkin`)
      return
    }

    // Simulate upload with progress
    for (const file of validFiles) {
      const uploadId = `upload-${Date.now()}-${file.name}`
      setUploading(prev => [...prev, { id: uploadId, file, progress: 0 }])

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploading(prev => 
          prev.map(u => u.id === uploadId ? { ...u, progress } : u)
        )
      }

      // Complete upload
      await onUpload?.(file)
      setUploading(prev => prev.filter(u => u.id !== uploadId))
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.length) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  return (
    <div className="event-attachments">
      {/* Header */}
      <div className="attachments-header">
        <h3>📎 Biriktirmalar</h3>
        <span className="file-count">
          {attachments.length}/{maxFiles} fayl
        </span>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={e => handleFileSelect(e.target.files)}
          hidden
        />
        <div className="upload-content">
          <span className="upload-icon">📤</span>
          <p className="upload-text">
            Fayllarni bu yerga tashlang yoki <span>tanlang</span>
          </p>
          <p className="upload-hint">
            Maksimal hajm: {formatFileSize(maxFileSize)}
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading.length > 0 && (
        <div className="uploading-list">
          {uploading.map(item => (
            <UploadProgress
              key={item.id}
              file={item.file}
              progress={item.progress}
            />
          ))}
        </div>
      )}

      {/* Attachments Grid */}
      <div className="attachments-grid">
        <AnimatePresence>
          {attachments.map(file => (
            <AttachmentCard
              key={file.id}
              file={file}
              onDownload={onDownload}
              onDelete={onDelete}
              onPreview={setPreviewFile}
            />
          ))}
        </AnimatePresence>
      </div>

      {attachments.length === 0 && uploading.length === 0 && (
        <div className="empty-attachments">
          <span>📂</span>
          <p>Hali fayl yuklanmagan</p>
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <ImagePreviewModal
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default EventAttachments
export {
  AttachmentCard,
  UploadProgress,
  ImagePreviewModal,
  FILE_ICONS,
  getFileIcon,
  formatFileSize
}
