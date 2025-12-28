import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import './GlobalSearch.css'

const ENTITY_TYPES = {
  child: { icon: '👶', label: 'Bolalar', color: '#3b82f6' },
  parent: { icon: '👨‍👩‍👧', label: 'Ota-onalar', color: '#8b5cf6' },
  payment: { icon: '💳', label: "To'lovlar", color: '#22c55e' },
  event: { icon: '📅', label: 'Tadbirlar', color: '#f59e0b' },
  message: { icon: '💬', label: 'Xabarlar', color: '#06b6d4' },
  group: { icon: '👥', label: 'Guruhlar', color: '#ec4899' }
}

// Simple fuzzy search implementation
const fuzzyMatch = (text, query) => {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  let queryIndex = 0
  let score = 0
  let lastMatchIndex = -1
  const matches = []

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      matches.push(i)
      score += lastMatchIndex === i - 1 ? 2 : 1 // Consecutive matches score higher
      lastMatchIndex = i
      queryIndex++
    }
  }

  return queryIndex === queryLower.length ? { score, matches } : null
}

export default function GlobalSearch({ 
  isOpen, 
  onClose, 
  onSelect,
  searchFn,
  recentSearches = [],
  onSaveRecent
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const searchResults = await searchFn(searchQuery, activeFilter)
      
      // Sort by relevance score
      const scoredResults = searchResults.map(result => {
        const match = fuzzyMatch(result.title, searchQuery)
        return { ...result, score: match?.score || 0, matches: match?.matches || [] }
      }).sort((a, b) => b.score - a.score)

      setResults(scoredResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [searchFn, activeFilter])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 200)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, performSearch])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [results, selectedIndex, onClose])

  const handleSelect = (result) => {
    onSaveRecent?.(query)
    onSelect?.(result)
    onClose()
  }

  const highlightMatches = (text, matches) => {
    if (!matches || matches.length === 0) return text
    
    const parts = []
    let lastIndex = 0
    
    matches.forEach(matchIndex => {
      if (matchIndex > lastIndex) {
        parts.push(text.slice(lastIndex, matchIndex))
      }
      parts.push(<mark key={matchIndex}>{text[matchIndex]}</mark>)
      lastIndex = matchIndex + 1
    })
    
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }
    
    return parts
  }

  const groupedResults = useMemo(() => {
    const groups = {}
    results.forEach(result => {
      const type = result.type || 'other'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(result)
    })
    return groups
  }, [results])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="global-search"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onKeyDown={handleKeyDown}
      >
        <div className="global-search__backdrop" onClick={onClose} />
        
        <motion.div
          className="global-search__container"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <div className="global-search__input-wrapper">
            <span className="global-search__icon">🔍</span>
            <input
              ref={inputRef}
              type="text"
              className="global-search__input"
              placeholder="Qidirish..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="global-search__shortcut">ESC</span>
          </div>

          <div className="global-search__filters">
            <button
              className={`global-search__filter ${!activeFilter ? 'global-search__filter--active' : ''}`}
              onClick={() => setActiveFilter(null)}
            >
              Hammasi
            </button>
            {Object.entries(ENTITY_TYPES).map(([key, { icon, label }]) => (
              <button
                key={key}
                className={`global-search__filter ${activeFilter === key ? 'global-search__filter--active' : ''}`}
                onClick={() => setActiveFilter(key)}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <div className="global-search__results">
            {loading ? (
              <div className="global-search__loading">
                <div className="global-search__spinner" />
                <p>Qidirilmoqda...</p>
              </div>
            ) : query && results.length === 0 ? (
              <div className="global-search__empty">
                <div className="global-search__empty-icon">🔍</div>
                <p className="global-search__empty-text">Natija topilmadi</p>
                <p className="global-search__empty-hint">Boshqa so'z bilan qidirib ko'ring</p>
              </div>
            ) : !query && recentSearches.length > 0 ? (
              <div className="global-search__recent">
                <h4 className="global-search__recent-title">So'nggi qidiruvlar</h4>
                <div className="global-search__recent-list">
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      className="global-search__recent-item"
                      onClick={() => setQuery(search)}
                    >
                      🕐 {search}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              Object.entries(groupedResults).map(([type, items]) => {
                const config = ENTITY_TYPES[type] || { icon: '📄', label: type, color: '#6b7280' }
                return (
                  <div key={type} className="global-search__section">
                    <h4 className="global-search__section-title">{config.label}</h4>
                    {items.map((result, index) => {
                      const globalIndex = results.indexOf(result)
                      return (
                        <div
                          key={result.id}
                          className={`global-search__result ${globalIndex === selectedIndex ? 'global-search__result--selected' : ''}`}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                        >
                          <div 
                            className="global-search__result-icon"
                            style={{ background: `${config.color}20` }}
                          >
                            {result.avatar ? (
                              <img src={result.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                            ) : (
                              config.icon
                            )}
                          </div>
                          <div className="global-search__result-content">
                            <div className="global-search__result-title">
                              {highlightMatches(result.title, result.matches)}
                            </div>
                            <div className="global-search__result-meta">
                              {result.subtitle && <span>{result.subtitle}</span>}
                            </div>
                          </div>
                          <span 
                            className="global-search__result-type"
                            style={{ background: `${config.color}20`, color: config.color }}
                          >
                            {config.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>

          <div className="global-search__footer">
            <div className="global-search__footer-shortcuts">
              <span className="global-search__footer-shortcut">
                <kbd>↑</kbd><kbd>↓</kbd> navigatsiya
              </span>
              <span className="global-search__footer-shortcut">
                <kbd>Enter</kbd> tanlash
              </span>
              <span className="global-search__footer-shortcut">
                <kbd>Esc</kbd> yopish
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

GlobalSearch.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
  searchFn: PropTypes.func.isRequired,
  recentSearches: PropTypes.arrayOf(PropTypes.string),
  onSaveRecent: PropTypes.func
}
