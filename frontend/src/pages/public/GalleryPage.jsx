import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { EmptyState, Skeleton } from '../../components/common'
import { GlassReveal, FloatingElement } from '../../components/animations/WowEffects'
import api from '../../services/api'
import './GalleryPage.css'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 
                 (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin)

// URL ni to'liq qilish
const getFullUrl = (url) => {
  if (!url) return ''
  // Agar to'liq URL bo'lsa, qaytarish
  if (url.startsWith('http')) return url
  // /images/ - frontend public papkasidan
  if (url.startsWith('/images/')) return url
  // /uploads/ - backend serverdan
  if (url.startsWith('/uploads/')) {
    return `${API_BASE}${url}`
  }
  // Boshqa holatlar
  return url.startsWith('/') ? `${API_BASE}${url}` : url
}

const TEXTS = {
  uz: {
    subtitle: "Bog'chamiz hayotidan suratlar - bolalarimizning quvonchi, mashg'ulotlari va bayramlarimiz",
    all: 'Barchasi',
    images: 'Rasmlar',
    videos: 'Videolar',
    daily: 'Kundalik',
    activities: "Mashg'ulotlar",
    events: 'Tadbirlar',
    general: 'Umumiy',
    noMedia: "Hozircha media yo'q",
    close: 'Yopish',
    loading: 'Yuklanmoqda...'
  },
  ru: {
    subtitle: 'Фотографии из жизни детского сада - радость наших детей, занятия и праздники',
    all: 'Все',
    images: 'Фото',
    videos: 'Видео',
    daily: 'Ежедневно',
    activities: 'Занятия',
    events: 'Мероприятия',
    general: 'Общее',
    noMedia: 'Пока нет медиа',
    close: 'Закрыть',
    loading: 'Загрузка...'
  },
  en: {
    subtitle: "Photos from kindergarten life - our children's joy, activities and celebrations",
    all: 'All',
    images: 'Photos',
    videos: 'Videos',
    daily: 'Daily',
    activities: 'Activities',
    events: 'Events',
    general: 'General',
    noMedia: 'No media yet',
    close: 'Close',
    loading: 'Loading...'
  }
}

// Lazy Image komponenti
const LazyGalleryImage = ({ src, alt, onClick }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className="lazy-image-wrapper">
      {!loaded && !error && (
        <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
      )}
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        onClick={onClick}
        style={{ opacity: loaded ? 1 : 0 }}
        className={loaded ? 'loaded' : ''}
      />
      {error && <div className="image-error">🖼️</div>}
    </div>
  )
}

const GalleryPage = () => {
  const { t, language } = useLanguage()
  const txt = TEXTS[language]
  
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      const response = await api.get('/gallery')
      // API returns { data: [...], pagination: {...} }
      const data = response.data?.data || response.data?.items || 
                   (Array.isArray(response.data) ? response.data : [])
      setItems(data)
    } catch (error) {
      // Fallback to demo data
      setItems([
        { id: 1, type: 'image', url: '/images/gallery-1.jpg', title: "Ijodiy mashg'ulot", album: 'activities' },
        { id: 2, type: 'image', url: '/images/gallery-2.jpg', title: "O'quv xonasi", album: 'daily' },
        { id: 3, type: 'image', url: '/images/gallery-3.jpg', title: "Sport mashg'uloti", album: 'activities' },
        { id: 4, type: 'image', url: '/images/gallery-4.jpg', title: 'Bayram tadbiri', album: 'events' },
        { id: 5, type: 'image', url: '/images/gallery-5.jpg', title: 'Oshxona', album: 'daily' },
        { id: 6, type: 'image', url: '/images/gallery-6.jpg', title: "O'yin maydoni", album: 'general' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    // Ensure items is always an array
    const safeItems = Array.isArray(items) ? items : []
    if (filter === 'all') return safeItems
    if (filter === 'image' || filter === 'video') {
      return safeItems.filter(i => i.type === filter)
    }
    return safeItems.filter(i => i.album === filter)
  }, [items, filter])

  const albums = ['all', 'image', 'video', 'daily', 'activities', 'events', 'general']

  // Gallery skeleton
  const GallerySkeleton = () => (
    <div className="gallery-grid">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="gallery-item skeleton-item">
          <Skeleton variant="rectangular" width="100%" height={200} animation="wave" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <div className="container">
          <GlassReveal>
            <FloatingElement amplitude={5} duration={4}>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {t('galleryTitle')}
              </motion.h1>
            </FloatingElement>
          </GlassReveal>
          <GlassReveal delay={0.2}>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {txt.subtitle}
            </motion.p>
          </GlassReveal>
        </div>
      </section>

      <section className="gallery-content">
        <div className="container">
          {/* Filters */}
          <motion.div className="gallery-filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {albums.map(album => (
              <button
                key={album}
                className={`filter-btn ${filter === album ? 'active' : ''}`}
                onClick={() => setFilter(album)}
                aria-label={txt[album] || album}
              >
                {album === 'all' && '📷 '}
                {album === 'image' && '🖼️ '}
                {album === 'video' && '🎬 '}
                {txt[album] || album}
              </button>
            ))}
          </motion.div>

          {/* Gallery Grid */}
          {loading ? (
            <GallerySkeleton />
          ) : filteredItems.length === 0 ? (
            <EmptyState variant="gallery" />
          ) : (
            <motion.div className="gallery-grid" layout>
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="gallery-item"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelectedItem(item)}
                    role="button"
                    tabIndex={0}
                    aria-label={item.title}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(item)}
                  >
                    {item.type === 'image' ? (
                      <LazyGalleryImage 
                        src={getFullUrl(item.url)} 
                        alt={item.title}
                        onClick={() => setSelectedItem(item)}
                      />
                    ) : item.url.includes('youtube') || item.url.includes('youtu.be') ? (
                      <div className="video-thumb">
                        <img src={item.thumbnail || `https://img.youtube.com/vi/${item.url.split('/').pop()}/maxresdefault.jpg`} alt={item.title} />
                        <div className="play-icon" aria-hidden="true">▶</div>
                      </div>
                    ) : item.url.includes('drive.google.com') ? (
                      <div className="video-thumb">
                        <img src={item.thumbnail || '/images/video-placeholder.jpg'} alt={item.title} />
                        <div className="play-icon" aria-hidden="true">▶</div>
                      </div>
                    ) : (
                      <div className="video-thumb">
                        {item.url.startsWith('http') ? (
                          <video src={item.url} muted preload="metadata" />
                        ) : (
                          <video src={getFullUrl(item.url)} muted preload="metadata" />
                        )}
                        <div className="play-icon" aria-hidden="true">▶</div>
                      </div>
                    )}
                    <div className="item-overlay">
                      <span className="item-title">{item.title}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="lightbox-close" 
                onClick={() => setSelectedItem(null)}
                aria-label={txt.close}
              >
                ×
              </button>
              {selectedItem.type === 'image' ? (
                <img src={getFullUrl(selectedItem.url)} alt={selectedItem.title} />
              ) : selectedItem.url.includes('youtube') || selectedItem.url.includes('youtu.be') ? (
                <iframe 
                  src={selectedItem.url.includes('embed') ? selectedItem.url : `https://www.youtube.com/embed/${selectedItem.url.split('/').pop().split('?')[0].replace('watch?v=', '')}`} 
                  width="100%" 
                  height="500" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  title={selectedItem.title}
                />
              ) : selectedItem.url.includes('drive.google.com') ? (
                <iframe 
                  src={selectedItem.url.replace('/view', '/preview').replace('?usp=sharing', '')} 
                  width="100%" 
                  height="500" 
                  frameBorder="0" 
                  allow="autoplay" 
                  allowFullScreen
                  title={selectedItem.title}
                />
              ) : (
                <video 
                  src={selectedItem.url.startsWith('http') ? selectedItem.url : getFullUrl(selectedItem.url)} 
                  controls 
                  autoPlay 
                />
              )}
              {selectedItem.title && <p className="lightbox-caption">{selectedItem.title}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryPage