import { useEffect, useCallback, useRef, memo } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import './Modal.css'

const Modal = memo(function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  initialFocus = true,
  returnFocus = true,
  ariaLabel,
  ariaDescribedBy
}) {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)

  // Escape tugmasi
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose()
    }
  }, [onClose, closeOnEscape])

  // Focus trap - Tab navigatsiya
  const handleTabKey = useCallback((e) => {
    if (e.key !== 'Tab') return

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Oldingi fokusni saqlash
      previousActiveElement.current = document.activeElement

      // Event listenerlar
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTabKey)
      document.body.style.overflow = 'hidden'

      // Boshlang'ich fokus
      if (initialFocus) {
        setTimeout(() => {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusableElements && focusableElements.length > 0) {
            focusableElements[0].focus()
          }
        }, 50)
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTabKey)
      document.body.style.overflow = 'unset'

      // Fokusni qaytarish
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, handleEscape, handleTabKey, initialFocus, returnFocus])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  const modalContent = (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div 
        ref={modalRef}
        className={`modal modal-${size}`} 
        role="dialog" 
        aria-modal="true"
        aria-label={ariaLabel || title}
        aria-describedby={ariaDescribedBy}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title" id="modal-title">{title}</h2>}
            {showCloseButton && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Yopish"
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
        )}
        <div className="modal-content" id="modal-content">
          {children}
        </div>
      </div>
    </div>
  )

  // Portal orqali render qilish
  return createPortal(modalContent, document.body)
})

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'fullscreen']),
  showCloseButton: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  initialFocus: PropTypes.bool,
  returnFocus: PropTypes.bool,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string
}

export default Modal
