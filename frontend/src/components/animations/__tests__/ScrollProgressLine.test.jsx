/**
 * Tests for ScrollProgressLine component
 * 
 * Feature: scroll-progress-line
 * Rainbow theme progress bar tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScrollProgressLine } from '../ScrollProgressLine'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, initial, animate, transition, ...props }) => (
      <div className={className} style={style} {...props}>{children}</div>
    )
  },
  useSpring: vi.fn((value) => value),
  useTransform: vi.fn((spring, input, output) => 0.5)
}))

describe('ScrollProgressLine', () => {
  let scrollY = 0
  let documentHeight = 2000
  let viewportHeight = 800

  beforeEach(() => {
    vi.clearAllMocks()
    scrollY = 0
    
    // Mock window properties
    Object.defineProperty(window, 'scrollY', {
      get: () => scrollY,
      configurable: true
    })
    
    Object.defineProperty(window, 'innerHeight', {
      get: () => viewportHeight,
      configurable: true
    })
    
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      get: () => documentHeight,
      configurable: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ScrollProgressLine />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
    })

    it('should have correct ARIA attributes', () => {
      render(<ScrollProgressLine />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
      expect(progressBar).toHaveAttribute('aria-label')
    })

    it('should apply custom className', () => {
      render(<ScrollProgressLine className="custom-class" />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('rainbow-progress')
      expect(progressBar).toHaveClass('custom-class')
    })

    it('should render track element', () => {
      const { container } = render(<ScrollProgressLine />)
      
      const track = container.querySelector('.rainbow-progress__track')
      expect(track).toBeInTheDocument()
    })

    it('should render bar element', () => {
      const { container } = render(<ScrollProgressLine />)
      
      const bar = container.querySelector('.rainbow-progress__bar')
      expect(bar).toBeInTheDocument()
    })

    it('should render glow element', () => {
      const { container } = render(<ScrollProgressLine />)
      
      const glow = container.querySelector('.rainbow-progress__glow')
      expect(glow).toBeInTheDocument()
    })
  })

  describe('Props Customization', () => {
    it('should apply custom height (clamped to 3-4px)', () => {
      const { container } = render(<ScrollProgressLine height={4} />)
      
      const progressBar = container.querySelector('.rainbow-progress')
      expect(progressBar.style.getPropertyValue('--rp-height')).toBe('4px')
    })

    it('should apply default height of 3px', () => {
      const { container } = render(<ScrollProgressLine />)
      
      const progressBar = container.querySelector('.rainbow-progress')
      expect(progressBar.style.getPropertyValue('--rp-height')).toBe('3px')
    })

    it('should clamp height to minimum 3px', () => {
      const { container } = render(<ScrollProgressLine height={1} />)
      
      const progressBar = container.querySelector('.rainbow-progress')
      expect(progressBar.style.getPropertyValue('--rp-height')).toBe('3px')
    })

    it('should clamp height to maximum 4px', () => {
      const { container } = render(<ScrollProgressLine height={10} />)
      
      const progressBar = container.querySelector('.rainbow-progress')
      expect(progressBar.style.getPropertyValue('--rp-height')).toBe('4px')
    })
  })

  describe('Click Navigation', () => {
    it('should scroll to top on click when enableClick is true', () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      
      render(<ScrollProgressLine enableClick={true} />)
      
      const progressBar = screen.getByRole('progressbar')
      fireEvent.click(progressBar)
      
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      })
      
      scrollToSpy.mockRestore()
    })

    it('should not scroll to top when enableClick is false', () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      
      render(<ScrollProgressLine enableClick={false} />)
      
      const progressBar = screen.getByRole('progressbar')
      fireEvent.click(progressBar)
      
      expect(scrollToSpy).not.toHaveBeenCalled()
      
      scrollToSpy.mockRestore()
    })
  })

  describe('Complete State', () => {
    it('should apply complete class when progress is 100%', async () => {
      // Simulate scroll to bottom
      scrollY = documentHeight - viewportHeight
      
      const { container } = render(<ScrollProgressLine />)
      
      // Trigger scroll event
      fireEvent.scroll(window)
      
      // Wait for RAF
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const progressBar = container.querySelector('.rainbow-progress')
      expect(progressBar).toHaveClass('rainbow-progress--complete')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label in Uzbek', () => {
      render(<ScrollProgressLine />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar.getAttribute('aria-label')).toContain("o'qildi")
    })

    it('should update aria-valuenow based on scroll progress', () => {
      render(<ScrollProgressLine />)
      
      const progressBar = screen.getByRole('progressbar')
      const value = parseInt(progressBar.getAttribute('aria-valuenow'))
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(100)
    })
  })
})
