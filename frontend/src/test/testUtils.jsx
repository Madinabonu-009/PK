/**
 * Test Utilities
 * Issue #19: Testing infrastructure
 */

import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from '../context/LanguageContext'
import { ThemeProvider } from '../context/ThemeContext'
import { GamificationProvider } from '../context/GamificationContext'

// All providers wrapper
function AllProviders({ children }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <GamificationProvider>
            {children}
          </GamificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

// Custom render with providers
export function renderWithProviders(ui, options = {}) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Mock data generators
export const mockChild = (overrides = {}) => ({
  _id: `child_${Date.now()}`,
  firstName: 'Test',
  lastName: 'Child',
  birthDate: '2020-01-15',
  groupId: 'group_1',
  parentName: 'Test Parent',
  parentPhone: '+998901234567',
  parentEmail: 'parent@test.com',
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides
})

export const mockUser = (overrides = {}) => ({
  _id: `user_${Date.now()}`,
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin',
  createdAt: new Date().toISOString(),
  ...overrides
})

export const mockGroup = (overrides = {}) => ({
  _id: `group_${Date.now()}`,
  name: 'Test Group',
  ageRange: '3-4',
  teacherId: 'teacher_1',
  capacity: 20,
  isActive: true,
  ...overrides
})

export const mockGameProgress = (overrides = {}) => ({
  _id: `progress_${Date.now()}`,
  childId: 'child_1',
  gameType: 'memory',
  score: 80,
  maxScore: 100,
  timeSpent: 120,
  playedAt: new Date().toISOString(),
  ...overrides
})

// Wait utilities
export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const waitForElement = async (getElement, timeout = 5000) => {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    try {
      const element = getElement()
      if (element) return element
    } catch (e) {
      // Element not found yet
    }
    await waitFor(50)
  }
  throw new Error('Element not found within timeout')
}

// Mock API responses
export const mockApiResponse = (data, delay = 100) => {
  return new Promise(resolve => {
    setTimeout(() => resolve({ data }), delay)
  })
}

export const mockApiError = (message, status = 500, delay = 100) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject({ 
      response: { 
        status, 
        data: { error: message } 
      } 
    }), delay)
  })
}

// Re-export testing library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
