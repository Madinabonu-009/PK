import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { filterPhotosByCategory } from '../../utils/galleryFilter'
import { GalleryModal, TiltCard } from '../animations'
import './GalleryGrid.css'

const GalleryGrid = ({ photos, categories }) => {
  const { t, language } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const texts = {
    uz: { noPhotos: 'Bu kategoriyada rasmlar topilmadi' },
    ru: { noPhotos: 'В этой категории фотографий не найдено' },
    en: { noPhotos: 'No photos found in this category' }
  }
  const txt = texts[language]

  const filteredPhotos = filterPhotosByCategory(photos, selectedCategory)

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = 'unset'
  }

  return (
    <div className="gallery-grid-container">
      {/* Category Filter */}
      <div className="gallery-filters">
        <button
          className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          {t('all')}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Photo Grid with Stagger Animation */}
      <div className="gallery-grid">
        {filteredPhotos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <TiltCard intensity={8}>
              <div
                className="gallery-item"
                onClick={() => openLightbox(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
              >
                <img 
                  src={photo.src} 
                  alt={photo.alt} 
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/images/gallery-1.jpg'
                  }}
                />
                <div className="gallery-item-overlay">
                  <span className="gallery-item-title">{photo.title}</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="gallery-empty">
          <p>{txt.noPhotos}</p>
        </div>
      )}

      {/* Gallery Modal with Zoom Magic */}
      <GalleryModal
        images={filteredPhotos.map(p => ({ src: p.src, alt: p.alt }))}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
      />
    </div>
  )
}

export default GalleryGrid
