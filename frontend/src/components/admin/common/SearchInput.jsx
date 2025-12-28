import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './SearchInput.css'

// Simple fuzzy match function
function fuzzyMatch(text, query) {
  if (!query) return { match: true, score: 0, indices: [] }
  
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  // Exact match
  if (textLower.includes(queryLower)) {
    const index = textLower.indexOf(queryLower)
    return {
      match: true,
      score: 100,
      indices: Array.from({ length: queryLower.length }, (_, i) => index + i)
    }
  }
  
  // Fuzzy match
  let queryIndex = 0
  let score = 0
  const indices = []
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      indices.push(i)
      score += 10
      // Bonus for consecutive matches
      if (indices.length > 1 && indices[indices.length - 1] - indices[indices.length - 2] === 1) {
        score += 5
      }
      queryIndex++
    }
  }
  
  return {
    match: queryIndex === queryLower.length,
    score,
    indices
  }
}

// Highlight matched characters
function HighlightedText({ text, indices }) {
  if (!indices || indices.length === 0) {
    return <span>{text}</span>
  }

  const chars = text.split('')
  const indexSet = new Set(indices)

  return (
    <span>
      {chars.map((char, i) => (
        indexSet.has(i) ? (
          <mark key={i} className="search-highlight">{char}</mark>
        ) : (
          <span key={i}>{char}</span>
        )
      ))}
    </span>
  )
}

// Search Result Item
function SearchResultItem({ item, query, onClick, isSelected }) {
  const { match, indices } = fuzzyMatch(item.label || item.name || String(item), query)
  
  if (!match) return null

  return (
    <motion.div
      className={`search-result-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(item)}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: 'var(--hover-bg)' }}
    >
      {item.icon && <span className="search-result-icon">{item.icon}</span>}
      <div className="search-result-content">
        <span className="search-result-label">
          <HighlightedText text={item.label || item.name || String(item)} indices={indices} />
        </span>
        {item.description && (
          <span className="search-result-description">{item.description}</span>
        )}
      </div>
      {item.badge && (
        <span className="search-result-badge">{item.badge}</span>
      )}
    </motion.div>
  )
}

// Main SearchInput Component
function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Qidirish...",
  suggestions = [],
  onSuggestionSelect,
  loading = false,
  debounceMs = 300,
  showClear = true,
  autoFocus = false,
  size = 'medium', // small, medium, large
  variant = 'default', // default, filled, outlined
  icon = '🔍',
  shortcut,
  disabled = false,
  className = ''
}) {
  const [localValue, setLocalValue] = useState(value || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  // Sync with external value
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value)
    }
  }, [value])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter suggestions
  const filteredSuggestions = suggestions.filter(item => {
    const text = item.label || item.name || String(item)
    return fuzzyMatch(text, localValue).match
  }).sort((a, b) => {
    const textA = a.label || a.name || String(a)
    const textB = b.label || b.name || String(b)
    return fuzzyMatch(textB, localValue).score - fuzzyMatch(textA, localValue).score
  })

  // Handle input change
  const handleChange = useCallback((e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    setSelectedIndex(-1)
    setShowSuggestions(true)

    // Debounced onChange
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      onChange?.(newValue)
    }, debounceMs)
  }, [onChange, debounceMs])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch?.(localValue)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionSelect(filteredSuggestions[selectedIndex])
        } else {
          onSearch?.(localValue)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle suggestion select
  const handleSuggestionSelect = (item) => {
    const text = item.label || item.name || String(item)
    setLocalValue(text)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    onSuggestionSelect?.(item)
    onChange?.(text)
  }

  // Handle clear
  const handleClear = () => {
    setLocalValue('')
    setShowSuggestions(false)
    onChange?.('')
    inputRef.current?.focus()
  }

  // Focus input
  const focusInput = () => {
    inputRef.current?.focus()
  }

  return (
    <div 
      ref={containerRef}
      className={`search-input-container ${size} ${variant} ${className} ${disabled ? 'disabled' : ''}`}
    >
      <div className="search-input-wrapper">
        <span className="search-input-icon" onClick={focusInput}>
          {loading ? <span className="search-spinner" /> : icon}
        </span>
        
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
        />

        {showClear && localValue && (
          <button 
            className="search-clear-btn"
            onClick={handleClear}
            type="button"
          >
            ✕
          </button>
        )}

        {shortcut && !localValue && (
          <span className="search-shortcut">{shortcut}</span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            className="search-suggestions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {filteredSuggestions.slice(0, 10).map((item, index) => (
              <SearchResultItem
                key={item.id || index}
                item={item}
                query={localValue}
                onClick={handleSuggestionSelect}
                isSelected={index === selectedIndex}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Export fuzzy match for external use
export { fuzzyMatch, HighlightedText }
export default SearchInput
