/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcuts for admin panel
 */

import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// Default shortcuts configuration
const DEFAULT_SHORTCUTS = {
  // Navigation
  'ctrl+shift+d': { action: 'navigate', path: '/admin/dashboard', description: 'Go to Dashboard' },
  'ctrl+shift+c': { action: 'navigate', path: '/admin/children', description: 'Go to Children' },
  'ctrl+shift+g': { action: 'navigate', path: '/admin/groups', description: 'Go to Groups' },
  'ctrl+shift+a': { action: 'navigate', path: '/admin/attendance', description: 'Go to Attendance' },
  'ctrl+shift+p': { action: 'navigate', path: '/admin/payments', description: 'Go to Payments' },
  'ctrl+shift+e': { action: 'navigate', path: '/admin/enrollments', description: 'Go to Enrollments' },
  'ctrl+shift+m': { action: 'navigate', path: '/admin/chat', description: 'Go to Messages' },
  'ctrl+shift+s': { action: 'navigate', path: '/admin/settings', description: 'Go to Settings' },
  
  // Actions
  'ctrl+k': { action: 'command-palette', description: 'Open Command Palette' },
  'ctrl+b': { action: 'toggle-sidebar', description: 'Toggle Sidebar' },
  'ctrl+n': { action: 'new-item', description: 'Create New Item' },
  'ctrl+/': { action: 'show-shortcuts', description: 'Show Shortcuts' },
  'escape': { action: 'close-modal', description: 'Close Modal/Dialog' },
  
  // Search
  'ctrl+f': { action: 'focus-search', description: 'Focus Search' },
}

// Parse shortcut string to key combination
const parseShortcut = (shortcut) => {
  const parts = shortcut.toLowerCase().split('+')
  return {
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    key: parts.filter(p => !['ctrl', 'control', 'shift', 'alt', 'meta', 'cmd'].includes(p))[0]
  }
}

// Check if event matches shortcut
const matchesShortcut = (event, shortcut) => {
  const parsed = parseShortcut(shortcut)
  
  const ctrlMatch = parsed.ctrl ? (event.ctrlKey || event.metaKey) : (!event.ctrlKey && !event.metaKey)
  const shiftMatch = parsed.shift ? event.shiftKey : !event.shiftKey
  const altMatch = parsed.alt ? event.altKey : !event.altKey
  const keyMatch = event.key.toLowerCase() === parsed.key
  
  return ctrlMatch && shiftMatch && altMatch && keyMatch
}

/**
 * Hook for handling keyboard shortcuts
 * @param {Object} customShortcuts - Custom shortcuts to add/override
 * @param {Object} handlers - Action handlers
 */
export function useKeyboardShortcuts(customShortcuts = {}, handlers = {}) {
  const navigate = useNavigate()
  const handlersRef = useRef(handlers)
  
  // Update handlers ref
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])
  
  // Merge shortcuts
  const shortcuts = { ...DEFAULT_SHORTCUTS, ...customShortcuts }
  
  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.isContentEditable
    
    // Allow some shortcuts even in inputs
    const allowInInput = ['escape', 'ctrl+k']
    
    for (const [shortcut, config] of Object.entries(shortcuts)) {
      if (matchesShortcut(event, shortcut)) {
        // Check if we should skip this shortcut in inputs
        if (isInput && !allowInInput.includes(shortcut)) {
          continue
        }
        
        event.preventDefault()
        
        // Handle action
        switch (config.action) {
          case 'navigate':
            navigate(config.path)
            break
          case 'command-palette':
            handlersRef.current.onCommandPalette?.()
            break
          case 'toggle-sidebar':
            handlersRef.current.onToggleSidebar?.()
            break
          case 'new-item':
            handlersRef.current.onNewItem?.()
            break
          case 'show-shortcuts':
            handlersRef.current.onShowShortcuts?.()
            break
          case 'close-modal':
            handlersRef.current.onCloseModal?.()
            break
          case 'focus-search':
            handlersRef.current.onFocusSearch?.()
            break
          default:
            // Custom action handler
            handlersRef.current[config.action]?.()
        }
        
        break
      }
    }
  }, [shortcuts, navigate])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  
  return {
    shortcuts,
    getShortcutsList: () => Object.entries(shortcuts).map(([key, config]) => ({
      shortcut: key,
      ...config
    }))
  }
}

/**
 * Hook for registering a single shortcut
 */
export function useShortcut(shortcut, callback, deps = []) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (matchesShortcut(event, shortcut)) {
        // Don't trigger in inputs unless it's escape
        const target = event.target
        const isInput = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.isContentEditable
        
        if (isInput && shortcut !== 'escape') {
          return
        }
        
        event.preventDefault()
        callback()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcut, callback, ...deps])
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  return shortcut
    .split('+')
    .map(part => {
      switch (part.toLowerCase()) {
        case 'ctrl':
        case 'control':
          return isMac ? '⌘' : 'Ctrl'
        case 'shift':
          return isMac ? '⇧' : 'Shift'
        case 'alt':
          return isMac ? '⌥' : 'Alt'
        case 'meta':
        case 'cmd':
          return isMac ? '⌘' : 'Win'
        case 'escape':
          return 'Esc'
        case 'enter':
          return '↵'
        case 'arrowup':
          return '↑'
        case 'arrowdown':
          return '↓'
        case 'arrowleft':
          return '←'
        case 'arrowright':
          return '→'
        default:
          return part.toUpperCase()
      }
    })
    .join(isMac ? '' : '+')
}

export default useKeyboardShortcuts
