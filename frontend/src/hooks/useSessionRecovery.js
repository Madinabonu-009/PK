import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'play_kids_session_state'
const AUTOSAVE_INTERVAL = 30000 // 30 seconds

export function useSessionRecovery(key, initialState = null) {
  const [state, setState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`${STORAGE_KEY}_${key}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.data
      }
    } catch (error) {
      console.error('Failed to restore session state:', error)
    }
    return initialState
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const saveTimeoutRef = useRef(null)

  // Save state to sessionStorage
  const saveState = useCallback((data) => {
    try {
      sessionStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save session state:', error)
    }
  }, [key])

  // Update state with auto-save
  const updateState = useCallback((updater) => {
    setState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater
      setHasUnsavedChanges(true)
      
      // Debounced auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveState(newState)
      }, 1000)
      
      return newState
    })
  }, [saveState])

  // Clear saved state
  const clearState = useCallback(() => {
    sessionStorage.removeItem(`${STORAGE_KEY}_${key}`)
    setState(initialState)
    setHasUnsavedChanges(false)
  }, [key, initialState])

  // Force save
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveState(state)
  }, [state, saveState])

  // Periodic auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        saveState(state)
      }
    }, AUTOSAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [state, hasUnsavedChanges, saveState])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        saveState(state)
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state, hasUnsavedChanges, saveState])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    state,
    setState: updateState,
    hasUnsavedChanges,
    lastSaved,
    clearState,
    forceSave
  }
}

// Form-specific session recovery
export function useFormRecovery(formId, initialValues = {}) {
  const { state, setState, hasUnsavedChanges, clearState, forceSave } = useSessionRecovery(
    `form_${formId}`,
    initialValues
  )

  const setFieldValue = useCallback((field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value
    }))
  }, [setState])

  const setFieldValues = useCallback((values) => {
    setState(prev => ({
      ...prev,
      ...values
    }))
  }, [setState])

  const resetForm = useCallback(() => {
    clearState()
  }, [clearState])

  return {
    values: state || initialValues,
    setFieldValue,
    setFieldValues,
    hasUnsavedChanges,
    resetForm,
    saveForm: forceSave
  }
}

// Check for recoverable sessions
export function getRecoverableSessions() {
  const sessions = []
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key?.startsWith(STORAGE_KEY)) {
      try {
        const data = JSON.parse(sessionStorage.getItem(key))
        sessions.push({
          key: key.replace(`${STORAGE_KEY}_`, ''),
          timestamp: data.timestamp,
          data: data.data
        })
      } catch (error) {
        // Skip invalid entries
      }
    }
  }
  
  return sessions.sort((a, b) => b.timestamp - a.timestamp)
}

// Clear all recoverable sessions
export function clearAllSessions() {
  const keysToRemove = []
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key?.startsWith(STORAGE_KEY)) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => sessionStorage.removeItem(key))
}

export default useSessionRecovery
