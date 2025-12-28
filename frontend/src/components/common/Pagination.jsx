import { memo, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useLanguage } from '../../context/LanguageContext'
import './Pagination.css'

const TEXTS = {
  uz: {
    first: 'Birinchi',
    last: 'Oxirgi',
    prev: 'Oldingi',
    next: 'Keyingi',
    page: 'Sahifa',
    of: 'dan',
    showing: 'Ko\'rsatilmoqda',
    to: 'dan',
    total: 'jami',
    items: 'ta'
  },
  ru: {
    first: 'Первая',
    last: 'Последняя',
    prev: 'Назад',
    next: 'Вперед',
    page: 'Страница',
    of: 'из',
    showing: 'Показано',
    to: 'до',
    total: 'всего',
    items: 'шт'
  },
  en: {
    first: 'First',
    last: 'Last',
    prev: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    showing: 'Showing',
    to: 'to',
    total: 'total',
    items: 'items'
  }
}

const Pagination = memo(function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  showFirstLast = true,
  showInfo = false,
  maxVisiblePages = 5,
  size = 'medium',
  disabled = false
}) {
  const { language } = useLanguage()
  const txt = TEXTS[language] || TEXTS.uz

  const pageNumbers = useMemo(() => {
    const pages = []
    const half = Math.floor(maxVisiblePages / 2)
    
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }, [currentPage, totalPages, maxVisiblePages])

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
      onPageChange(page)
    }
  }, [currentPage, totalPages, onPageChange, disabled])

  const handleKeyDown = useCallback((e, page) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handlePageChange(page)
    }
  }, [handlePageChange])

  // Info text
  const infoText = useMemo(() => {
    if (!showInfo || !totalItems) return null
    const start = (currentPage - 1) * itemsPerPage + 1
    const end = Math.min(currentPage * itemsPerPage, totalItems)
    return `${txt.showing} ${start}-${end} ${txt.of} ${totalItems} ${txt.items}`
  }, [showInfo, totalItems, currentPage, itemsPerPage, txt])

  if (totalPages <= 1) return null

  return (
    <nav 
      className={`pagination pagination-${size} ${disabled ? 'pagination-disabled' : ''}`}
      role="navigation"
      aria-label="Pagination"
    >
      {showInfo && infoText && (
        <div className="pagination-info" aria-live="polite">
          {infoText}
        </div>
      )}

      <div className="pagination-controls">
        {showFirstLast && (
          <button 
            className="pagination-btn pagination-first"
            onClick={() => handlePageChange(1)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            disabled={currentPage === 1 || disabled}
            aria-label={txt.first}
            title={txt.first}
          >
            ««
          </button>
        )}
        
        <button 
          className="pagination-btn pagination-prev"
          onClick={() => handlePageChange(currentPage - 1)}
          onKeyDown={(e) => handleKeyDown(e, currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          aria-label={txt.prev}
          title={txt.prev}
        >
          ‹
        </button>

        <div className="pagination-pages" role="group" aria-label="Page numbers">
          {pageNumbers[0] > 1 && (
            <>
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(1)}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                disabled={disabled}
                aria-label={`${txt.page} 1`}
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="pagination-ellipsis" aria-hidden="true">...</span>
              )}
            </>
          )}

          {pageNumbers.map(page => (
            <button
              key={page}
              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
              onKeyDown={(e) => handleKeyDown(e, page)}
              disabled={disabled}
              aria-label={`${txt.page} ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="pagination-ellipsis" aria-hidden="true">...</span>
              )}
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(totalPages)}
                onKeyDown={(e) => handleKeyDown(e, totalPages)}
                disabled={disabled}
                aria-label={`${txt.page} ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button 
          className="pagination-btn pagination-next"
          onClick={() => handlePageChange(currentPage + 1)}
          onKeyDown={(e) => handleKeyDown(e, currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          aria-label={txt.next}
          title={txt.next}
        >
          ›
        </button>

        {showFirstLast && (
          <button 
            className="pagination-btn pagination-last"
            onClick={() => handlePageChange(totalPages)}
            onKeyDown={(e) => handleKeyDown(e, totalPages)}
            disabled={currentPage === totalPages || disabled}
            aria-label={txt.last}
            title={txt.last}
          >
            »»
          </button>
        )}
      </div>

      <div className="pagination-current" aria-live="polite">
        {txt.page} {currentPage} {txt.of} {totalPages}
      </div>
    </nav>
  )
})

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number,
  itemsPerPage: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  showFirstLast: PropTypes.bool,
  showInfo: PropTypes.bool,
  maxVisiblePages: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool
}

export default Pagination
