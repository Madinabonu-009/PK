// 🖼️ 9. Gallery = Masonry + Zoom Magic
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import './GalleryModal.css'

const GalleryModal = ({ images, initialIndex = 0, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="gallery-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="gallery-modal-backdrop"
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(20px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
          />
          
          <motion.div
            className="gallery-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="gallery-modal-close" onClick={onClose}>✕</button>
            
            <button className="gallery-modal-nav prev" onClick={handlePrev}>❮</button>
            
            <motion.img
              key={currentIndex}
              src={images[currentIndex]?.src || images[currentIndex]}
              alt={images[currentIndex]?.alt || `Image ${currentIndex + 1}`}
              className="gallery-modal-image"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) handlePrev()
                if (info.offset.x < -100) handleNext()
              }}
            />
            
            <button className="gallery-modal-nav next" onClick={handleNext}>❯</button>
            
            <div className="gallery-modal-counter">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GalleryModal
