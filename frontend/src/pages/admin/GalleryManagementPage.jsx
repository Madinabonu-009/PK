import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import './GalleryManagementPage.css'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 
                 (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin)

const getFullUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/images/')) return url
  // Handle both /uploads/ and /data/uploads/ paths
  if (url.startsWith('/uploads/') || url.startsWith('/data/uploads/')) {
    return `${API_BASE}${url}`
  }
  return url.startsWith('/') ? `${API_BASE}${url}` : url
}

// Icons
const GalleryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const VideoIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
)

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

// Albums
const ALBUMS = [
  { id: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' } },
  { id: 'photos', label: { uz: 'Rasmlar', ru: 'Фото', en: 'Photos' } },
  { id: 'videos', label: { uz: 'Videolar', ru: 'Видео', en: 'Videos' } },
  { id: 'published', label: { uz: 'Nashr qilingan', ru: 'Опубликовано', en: 'Published' } },
  { id: 'unpublished', label: { uz: 'Nashr qilinmagan', ru: 'Не опубликовано', en: 'Unpublished' } }
]

// Texts
const TEXTS = {
  uz: {
    pageTitle: 'Galereya boshqaruvi',
    addMedia: 'Media qo\'shish',
    addImage: 'Rasm qo\'shish',
    addVideo: 'Video qo\'shish',
    uploadFile: 'Fayl yuklash',
    pasteUrl: 'URL kiritish',
    title: 'Sarlavha',
    titlePlaceholder: 'Media sarlavhasi...',
    url: 'URL manzil',
    urlPlaceholder: 'https://example.com/image.jpg',
    videoUrlPlaceholder: 'https://youtube.com/watch?v=...',
    dragDrop: 'Faylni bu yerga tashlang',
    orClick: 'yoki bosib tanlang',
    supportedFormats: 'JPG, PNG, GIF, MP4, WebM',
    maxSize: 'Maksimal hajm: 50MB',
    publish: 'Nashr qilish',
    unpublish: 'Nashrdan olish',
    delete: 'O\'chirish',
    cancel: 'Bekor qilish',
    save: 'Saqlash',
    saving: 'Saqlanmoqda...',
    uploading: 'Yuklanmoqda...',
    emptyGallery: 'Galereya bo\'sh',
    emptyGalleryDesc: 'Birinchi media faylni qo\'shing',
    deleteConfirm: 'Rostdan ham o\'chirmoqchimisiz?',
    addSuccess: 'Media muvaffaqiyatli qo\'shildi!',
    deleteSuccess: 'Media o\'chirildi!',
    publishSuccess: 'Nashr holati yangilandi!',
    error: 'Xatolik yuz berdi',
    selectType: 'Media turini tanlang',
    image: 'Rasm',
    video: 'Video'
  },
  ru: {
    pageTitle: 'Управление галереей',
    addMedia: 'Добавить медиа',
    addImage: 'Добавить фото',
    addVideo: 'Добавить видео',
    uploadFile: 'Загрузить файл',
    pasteUrl: 'Вставить URL',
    title: 'Заголовок',
    titlePlaceholder: 'Заголовок медиа...',
    url: 'URL адрес',
    urlPlaceholder: 'https://example.com/image.jpg',
    videoUrlPlaceholder: 'https://youtube.com/watch?v=...',
    dragDrop: 'Перетащите файл сюда',
    orClick: 'или нажмите для выбора',
    supportedFormats: 'JPG, PNG, GIF, MP4, WebM',
    maxSize: 'Максимальный размер: 50MB',
    publish: 'Опубликовать',
    unpublish: 'Снять с публикации',
    delete: 'Удалить',
    cancel: 'Отмена',
    save: 'Сохранить',
    saving: 'Сохранение...',
    uploading: 'Загрузка...',
    emptyGallery: 'Галерея пуста',
    emptyGalleryDesc: 'Добавьте первый медиафайл',
    deleteConfirm: 'Вы уверены, что хотите удалить?',
    addSuccess: 'Медиа успешно добавлено!',
    deleteSuccess: 'Медиа удалено!',
    publishSuccess: 'Статус публикации обновлен!',
    error: 'Произошла ошибка',
    selectType: 'Выберите тип медиа',
    image: 'Фото',
    video: 'Видео'
  },
  en: {
    pageTitle: 'Gallery Management',
    addMedia: 'Add Media',
    addImage: 'Add Image',
    addVideo: 'Add Video',
    uploadFile: 'Upload File',
    pasteUrl: 'Paste URL',
    title: 'Title',
    titlePlaceholder: 'Media title...',
    url: 'URL Address',
    urlPlaceholder: 'https://example.com/image.jpg',
    videoUrlPlaceholder: 'https://youtube.com/watch?v=...',
    dragDrop: 'Drop file here',
    orClick: 'or click to select',
    supportedFormats: 'JPG, PNG, GIF, MP4, WebM',
    maxSize: 'Max size: 50MB',
    publish: 'Publish',
    unpublish: 'Unpublish',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    uploading: 'Uploading...',
    emptyGallery: 'Gallery is empty',
    emptyGalleryDesc: 'Add your first media file',
    deleteConfirm: 'Are you sure you want to delete?',
    addSuccess: 'Media added successfully!',
    deleteSuccess: 'Media deleted!',
    publishSuccess: 'Publish status updated!',
    error: 'An error occurred',
    selectType: 'Select media type',
    image: 'Image',
    video: 'Video'
  }
}

// Add Media Modal Component
function AddMediaModal({ isOpen, onClose, onSuccess, language }) {
  const txt = TEXTS[language]
  const toast = useToast()
  const fileInputRef = useRef(null)
  
  const [mediaType, setMediaType] = useState('image')
  const [uploadMode, setUploadMode] = useState('file')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMediaType('image')
      setUploadMode('url') // Default to URL mode since file upload is not available
      setTitle('')
      setUrl('')
      setFile(null)
      setPreview(null)
    }
  }, [isOpen])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    
    const isVideo = selectedFile.type.startsWith('video/')
    const isImage = selectedFile.type.startsWith('image/')
    
    if (!isVideo && !isImage) {
      toast.error('Faqat rasm yoki video fayllar qabul qilinadi')
      return
    }
    
    setFile(selectedFile)
    setMediaType(isVideo ? 'video' : 'image')
    
    if (isImage) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview('video')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (uploadMode === 'file' && !file) {
      toast.error('Fayl tanlang yoki URL rejimiga o\'ting')
      return
    }
    
    if (uploadMode === 'url' && !url.trim()) {
      toast.error('URL kiriting')
      return
    }

    setUploading(true)
    
    try {
      let response
      
      if (uploadMode === 'file') {
        // File upload
        const formData = new FormData()
        formData.append('file', file)
        
        try {
          const uploadRes = await api.post('/upload?folder=gallery', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          
          if (uploadRes.data?.url) {
            response = await api.post('/gallery', {
              title: title.trim() || file.name || 'Media',
              url: uploadRes.data.url,
              type: mediaType,
              published: true,
              isPublished: true
            })
          } else {
            throw new Error('Fayl yuklashda xatolik')
          }
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr)
          toast.error('Fayl yuklash hozircha mavjud emas. URL orqali qo\'shing.')
          setUploadMode('url')
          setUploading(false)
          return
        }
      } else {
        response = await api.post('/gallery', {
          title: title.trim() || 'Media',
          url: url.trim(),
          type: mediaType,
          published: true,
          isPublished: true
        })
      }
      
      toast.success(txt.addSuccess)
      onSuccess()
      onClose()
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || txt.error
      toast.error(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal add-media-modal"
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>{txt.addMedia}</h2>
            <button className="close-btn" onClick={onClose} type="button">
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Media Type Selection */}
            <div className="form-group">
              <label>{txt.selectType}</label>
              <div className="media-type-toggle">
                <button
                  type="button"
                  className={`type-btn ${mediaType === 'image' ? 'active' : ''}`}
                  onClick={() => setMediaType('image')}
                >
                  <ImageIcon /> {txt.image}
                </button>
                <button
                  type="button"
                  className={`type-btn ${mediaType === 'video' ? 'active' : ''}`}
                  onClick={() => setMediaType('video')}
                >
                  <VideoIcon /> {txt.video}
                </button>
              </div>
            </div>

            {/* Upload Mode Toggle */}
            <div className="form-group">
              <div className="upload-mode-toggle">
                <button
                  type="button"
                  className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
                  onClick={() => setUploadMode('file')}
                >
                  <UploadIcon /> {txt.uploadFile}
                </button>
                <button
                  type="button"
                  className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
                  onClick={() => setUploadMode('url')}
                >
                  <LinkIcon /> {txt.pasteUrl}
                </button>
              </div>
            </div>

            {/* Title Input */}
            <div className="form-group">
              <label>{txt.title}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={txt.titlePlaceholder}
              />
            </div>

            {/* File Upload or URL Input */}
            {uploadMode === 'file' ? (
              <div className="form-group">
                <div
                  className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${preview ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <div className="upload-progress">
                      <div className="spinner"></div>
                      <span>{txt.uploading}</span>
                    </div>
                  ) : preview ? (
                    <div className="file-preview">
                      {preview === 'video' ? (
                        <div className="video-icon">
                          <VideoIcon />
                          <span>{file?.name}</span>
                        </div>
                      ) : (
                        <img src={preview} alt="Preview" />
                      )}
                      <button 
                        type="button" 
                        className="change-file"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          setPreview(null)
                        }}
                      >
                        O'zgartirish
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadIcon />
                      <span>{txt.dragDrop}</span>
                      <small>{txt.orClick}</small>
                      <small>{txt.supportedFormats}</small>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="form-group">
                <label>{txt.url}</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={mediaType === 'video' ? txt.videoUrlPlaceholder : txt.urlPlaceholder}
                />
              </div>
            )}

            {/* Actions */}
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose} disabled={uploading}>
                {txt.cancel}
              </button>
              <button type="submit" className="save-btn" disabled={uploading}>
                {uploading ? (
                  <>
                    <span className="btn-spinner"></span>
                    {txt.saving}
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    {txt.save}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main Component
function GalleryManagementPage() {
  const { language } = useLanguage()
  const txt = TEXTS[language]
  const toast = useToast()
  
  const [loading, setLoading] = useState(true)
  const [gallery, setGallery] = useState([])
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/gallery')
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
      setGallery(data)
    } catch (err) {
      console.error('Failed to fetch gallery:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const handleTogglePublish = async (item) => {
    try {
      const itemId = item.id || item._id
      await api.put(`/gallery/${itemId}`, {
        isPublished: !item.isPublished
      })
      toast.success(txt.publishSuccess)
      fetchGallery()
    } catch (err) {
      toast.error(txt.error)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(txt.deleteConfirm)) return
    
    try {
      const itemId = item.id || item._id
      await api.delete(`/gallery/${itemId}`)
      toast.success(txt.deleteSuccess)
      fetchGallery()
    } catch (err) {
      toast.error(txt.error)
    }
  }

  const filteredGallery = gallery.filter(item => {
    if (filter === 'all') return true
    if (filter === 'photos') return item.type === 'image'
    if (filter === 'videos') return item.type === 'video'
    if (filter === 'published') return item.isPublished
    if (filter === 'unpublished') return !item.isPublished
    return true
  })

  return (
    <div className="gallery-management-page">
      {/* Header */}
      <div className="gallery-header">
        <div className="header-left">
          <div className="page-icon"><GalleryIcon /></div>
          <h1>{txt.pageTitle}</h1>
        </div>
        <button className="add-btn" onClick={() => setModalOpen(true)}>
          <PlusIcon /> {txt.addMedia}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {ALBUMS.map(album => (
          <button
            key={album.id}
            className={`tab ${filter === album.id ? 'active' : ''}`}
            onClick={() => setFilter(album.id)}
          >
            {album.label[language]}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : filteredGallery.length === 0 ? (
        <div className="empty-state">
          <GalleryIcon />
          <h3>{txt.emptyGallery}</h3>
          <p>{txt.emptyGalleryDesc}</p>
          <button className="add-btn" onClick={() => setModalOpen(true)}>
            <PlusIcon /> {txt.addMedia}
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredGallery.map((item, idx) => (
            <motion.div
              key={item.id || item._id}
              className={`gallery-item ${!item.isPublished ? 'unpublished' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="item-preview">
                {item.type === 'video' ? (
                  <div className="video-preview">
                    <VideoIcon />
                    <span>🎬</span>
                  </div>
                ) : (
                  <img src={getFullUrl(item.url)} alt={item.title} />
                )}
                <div className="item-overlay">
                  <button
                    className="overlay-btn"
                    onClick={() => handleTogglePublish(item)}
                    title={item.isPublished ? txt.unpublish : txt.publish}
                  >
                    {item.isPublished ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                  <button
                    className="overlay-btn delete"
                    onClick={() => handleDelete(item)}
                    title={txt.delete}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
              <div className="item-info">
                <span className="item-title">{item.title}</span>
                <span className="item-album">
                  {item.type === 'video' ? '🎬 Video' : '📷 Photo'}
                  {!item.isPublished && ' • 🔒'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Media Modal */}
      <AddMediaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchGallery}
        language={language}
      />
    </div>
  )
}

export default GalleryManagementPage
