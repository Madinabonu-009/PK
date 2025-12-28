import { useState, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './MediaGallery.css'

// File type icons
const FILE_ICONS = {
  image: '🖼️',
  video: '🎬',
  document: '📄',
  audio: '🎵',
  other: '📎'
}

// Get file type from mime type
const getFileType = (mimeType) => {
  if (mimeType?.startsWith('image/')) return 'image'
  if (mimeType?.startsWith('video/')) return 'video'
  if (mimeType?.startsWith('audio/')) return 'audio'
  if (mimeType?.includes('pdf') || mimeType?.includes('document')) return 'document'
  return 'other'
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Media Uploader Component
function MediaUploader({ onUpload, onProgress, maxSize = 10 * 1024 * 1024, accept = 'image/*,video/*' }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} hajmi juda katta (max ${formatFileSize(maxSize)})`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)
    const progress = {}
    validFiles.forEach(f => { progress[f.name] = 0 })
    setUploadProgress(progress)

    try {
      for (const file of validFiles) {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(r => setTimeout(r, 50))
          setUploadProgress(prev => ({ ...prev, [file.name]: i }))
          onProgress?.(file.name, i)
        }
      }
      
      await onUpload?.(validFiles)
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }

  return (
    <div
      className={`media-uploader ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !uploading && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        hidden
      />

      {uploading ? (
        <div className="upload-progress">
          <div className="progress-icon">📤</div>
          <p>Yuklanmoqda...</p>
          <div className="progress-list">
            {Object.entries(uploadProgress).map(([name, progress]) => (
              <div key={name} className="progress-item">
                <span className="progress-name">{name}</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-percent">{progress}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="upload-placeholder">
          <div className="upload-icon">📁</div>
          <p className="upload-text">Fayllarni bu yerga tashlang</p>
          <p className="upload-hint">yoki bosib tanlang</p>
          <span className="upload-formats">Rasm, Video (max {formatFileSize(maxSize)})</span>
        </div>
      )}
    </div>
  )
}

// Media Card Component
function MediaCard({ media, selected, onSelect, onClick, onDelete }) {
  const fileType = getFileType(media.type)
  const isImage = fileType === 'image'
  const isVideo = fileType === 'video'

  return (
    <motion.div
      className={`media-card ${selected ? 'selected' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="media-select" onClick={(e) => { e.stopPropagation(); onSelect?.(media) }}>
        <input type="checkbox" checked={selected} readOnly />
      </div>

      <div className="media-preview" onClick={() => onClick?.(media)}>
        {isImage && (
          <img src={media.thumbnail || media.url} alt={media.name} loading="lazy" />
        )}
        {isVideo && (
          <>
            <img src={media.thumbnail} alt={media.name} loading="lazy" />
            <span className="video-indicator">▶</span>
            {media.duration && <span className="video-duration">{media.duration}</span>}
          </>
        )}
        {!isImage && !isVideo && (
          <div className="file-icon">{FILE_ICONS[fileType]}</div>
        )}
      </div>

      <div className="media-info">
        <span className="media-name" title={media.name}>{media.name}</span>
        <div className="media-meta">
          <span className="media-size">{formatFileSize(media.size)}</span>
          <span className="media-date">
            {new Date(media.createdAt).toLocaleDateString('uz-UZ')}
          </span>
        </div>
      </div>

      <div className="media-actions">
        <button className="media-action-btn" onClick={() => window.open(media.url, '_blank')}>
          📥
        </button>
        <button className="media-action-btn delete" onClick={() => onDelete?.(media)}>
          🗑️
        </button>
      </div>

      {media.tags && media.tags.length > 0 && (
        <div className="media-tags">
          {media.tags.slice(0, 3).map(tag => (
            <span key={tag} className="media-tag">{tag}</span>
          ))}
          {media.tags.length > 3 && (
            <span className="media-tag more">+{media.tags.length - 3}</span>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Lightbox Component
function Lightbox({ media, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const fileType = getFileType(media?.type)

  if (!media) return null

  return (
    <motion.div
      className="lightbox-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className="lightbox-close" onClick={onClose}>✕</button>

      {hasPrev && (
        <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); onPrev?.() }}>
          ←
        </button>
      )}

      <motion.div
        className="lightbox-content"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        {fileType === 'image' && (
          <img src={media.url} alt={media.name} />
        )}
        {fileType === 'video' && (
          <video src={media.url} controls autoPlay />
        )}
      </motion.div>

      {hasNext && (
        <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); onNext?.() }}>
          →
        </button>
      )}

      <div className="lightbox-info">
        <span className="lightbox-name">{media.name}</span>
        <span className="lightbox-meta">
          {formatFileSize(media.size)} • {new Date(media.createdAt).toLocaleDateString('uz-UZ')}
        </span>
      </div>
    </motion.div>
  )
}

// Album Card Component
function AlbumCard({ album, onClick }) {
  return (
    <motion.div
      className="album-card"
      onClick={() => onClick?.(album)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="album-cover">
        {album.coverUrl ? (
          <img src={album.coverUrl} alt={album.name} />
        ) : (
          <div className="album-placeholder">📁</div>
        )}
        <span className="album-count">{album.mediaCount} ta</span>
      </div>
      <div className="album-info">
        <span className="album-name">{album.name}</span>
        <span className="album-date">
          {new Date(album.createdAt).toLocaleDateString('uz-UZ')}
        </span>
      </div>
    </motion.div>
  )
}

// Share Modal Component
function ShareModal({ media, groups, onShare, onClose }) {
  const [selectedGroups, setSelectedGroups] = useState([])
  const [message, setMessage] = useState('')

  const toggleGroup = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const handleShare = () => {
    onShare?.({
      mediaIds: media.map(m => m.id),
      groupIds: selectedGroups,
      message
    })
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
        className="share-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📤 Ulashish ({media.length} ta fayl)</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="share-content">
          <div className="share-preview">
            {media.slice(0, 4).map(m => (
              <div key={m.id} className="share-preview-item">
                {getFileType(m.type) === 'image' ? (
                  <img src={m.thumbnail || m.url} alt={m.name} />
                ) : (
                  <span>{FILE_ICONS[getFileType(m.type)]}</span>
                )}
              </div>
            ))}
            {media.length > 4 && (
              <div className="share-preview-more">+{media.length - 4}</div>
            )}
          </div>

          <div className="share-groups">
            <label>Guruhlarni tanlang</label>
            <div className="group-list">
              {groups?.map(group => (
                <button
                  key={group.id}
                  className={`group-btn ${selectedGroups.includes(group.id) ? 'selected' : ''}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span className="group-icon">👥</span>
                  <span className="group-name">{group.name}</span>
                  {selectedGroups.includes(group.id) && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="share-message">
            <label>Xabar (ixtiyoriy)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ota-onalarga xabar..."
              rows={3}
            />
          </div>
        </div>

        <div className="share-actions">
          <button className="btn-secondary" onClick={onClose}>Bekor qilish</button>
          <button 
            className="btn-primary" 
            onClick={handleShare}
            disabled={selectedGroups.length === 0}
          >
            📤 Yuborish
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Media Gallery Component
function MediaGallery({
  media = [],
  albums = [],
  groups = [],
  onUpload,
  onDelete,
  onShare,
  onCreateAlbum,
  loading = false
}) {
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [selectedMedia, setSelectedMedia] = useState([])
  const [lightboxMedia, setLightboxMedia] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentAlbum, setCurrentAlbum] = useState(null)

  const filteredMedia = useMemo(() => {
    let result = media

    // Filter by album
    if (currentAlbum) {
      result = result.filter(m => m.albumId === currentAlbum.id)
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(m => getFileType(m.type) === filterType)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.tags?.some(t => t.toLowerCase().includes(query))
      )
    }

    return result
  }, [media, currentAlbum, filterType, searchQuery])

  const toggleSelect = (item) => {
    setSelectedMedia(prev => 
      prev.some(m => m.id === item.id)
        ? prev.filter(m => m.id !== item.id)
        : [...prev, item]
    )
  }

  const selectAll = () => {
    if (selectedMedia.length === filteredMedia.length) {
      setSelectedMedia([])
    } else {
      setSelectedMedia([...filteredMedia])
    }
  }

  const openLightbox = (item) => {
    setLightboxMedia(item)
  }

  const navigateLightbox = (direction) => {
    const currentIndex = filteredMedia.findIndex(m => m.id === lightboxMedia.id)
    const newIndex = currentIndex + direction
    if (newIndex >= 0 && newIndex < filteredMedia.length) {
      setLightboxMedia(filteredMedia[newIndex])
    }
  }

  const handleDelete = () => {
    if (selectedMedia.length > 0 && confirm(`${selectedMedia.length} ta faylni o'chirmoqchimisiz?`)) {
      onDelete?.(selectedMedia)
      setSelectedMedia([])
    }
  }

  return (
    <div className="media-gallery">
      {/* Header */}
      <div className="gallery-header">
        <div className="gallery-breadcrumb">
          <button 
            className={`breadcrumb-item ${!currentAlbum ? 'active' : ''}`}
            onClick={() => setCurrentAlbum(null)}
          >
            🏠 Galereya
          </button>
          {currentAlbum && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">{currentAlbum.name}</span>
            </>
          )}
        </div>

        <div className="gallery-actions">
          <input
            type="text"
            className="gallery-search"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <select
            className="gallery-filter"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">Barchasi</option>
            <option value="image">Rasmlar</option>
            <option value="video">Videolar</option>
          </select>

          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              ▦
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Selection Toolbar */}
      <AnimatePresence>
        {selectedMedia.length > 0 && (
          <motion.div
            className="selection-toolbar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="selection-count">{selectedMedia.length} ta tanlangan</span>
            <div className="selection-actions">
              <button onClick={selectAll}>
                {selectedMedia.length === filteredMedia.length ? 'Bekor qilish' : 'Hammasini tanlash'}
              </button>
              <button onClick={() => setShowShareModal(true)}>📤 Ulashish</button>
              <button className="delete" onClick={handleDelete}>🗑️ O'chirish</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploader */}
      <MediaUploader onUpload={onUpload} />

      {/* Albums (only show when not in album) */}
      {!currentAlbum && albums.length > 0 && (
        <div className="albums-section">
          <h3 className="section-title">📁 Albomlar</h3>
          <div className="albums-grid">
            {albums.map(album => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={setCurrentAlbum}
              />
            ))}
            <button className="create-album-btn" onClick={onCreateAlbum}>
              <span>+</span>
              <span>Yangi albom</span>
            </button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="media-section">
        <h3 className="section-title">
          {currentAlbum ? currentAlbum.name : '🖼️ Barcha fayllar'}
          <span className="media-count">({filteredMedia.length})</span>
        </h3>

        <div className={`media-grid ${viewMode}`}>
          <AnimatePresence>
            {filteredMedia.map(item => (
              <MediaCard
                key={item.id}
                media={item}
                selected={selectedMedia.some(m => m.id === item.id)}
                onSelect={toggleSelect}
                onClick={openLightbox}
                onDelete={(m) => onDelete?.([m])}
              />
            ))}
          </AnimatePresence>

          {filteredMedia.length === 0 && (
            <div className="empty-gallery">
              <span className="empty-icon">📷</span>
              <p>Hozircha fayllar yo'q</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxMedia && (
          <Lightbox
            media={lightboxMedia}
            onClose={() => setLightboxMedia(null)}
            onPrev={() => navigateLightbox(-1)}
            onNext={() => navigateLightbox(1)}
            hasPrev={filteredMedia.findIndex(m => m.id === lightboxMedia.id) > 0}
            hasNext={filteredMedia.findIndex(m => m.id === lightboxMedia.id) < filteredMedia.length - 1}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal
            media={selectedMedia}
            groups={groups}
            onShare={(data) => { onShare?.(data); setShowShareModal(false); setSelectedMedia([]) }}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default MediaGallery
export {
  MediaUploader,
  MediaCard,
  Lightbox,
  AlbumCard,
  ShareModal,
  FILE_ICONS,
  getFileType,
  formatFileSize
}
