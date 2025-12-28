/**
 * Tests for Loading components
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  LoadingSpinner,
  LoadingOverlay,
  Skeleton,
  InlineLoading,
  ProgressBar
} from '../Loading'

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('should render with default props', () => {
      const { container } = render(<LoadingSpinner />)
      expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
    })

    it('should apply size class', () => {
      const { container } = render(<LoadingSpinner size="large" />)
      expect(container.querySelector('.loading-spinner-large')).toBeInTheDocument()
    })

    it('should apply color class', () => {
      const { container } = render(<LoadingSpinner color="secondary" />)
      expect(container.querySelector('.loading-spinner-secondary')).toBeInTheDocument()
    })
  })

  describe('LoadingOverlay', () => {
    it('should render with message', () => {
      render(<LoadingOverlay message="Loading data..." />)
      expect(screen.getByText('Loading data...')).toBeInTheDocument()
    })

    it('should render without message', () => {
      const { container } = render(<LoadingOverlay />)
      expect(container.querySelector('.loading-overlay')).toBeInTheDocument()
    })
  })

  describe('Skeleton', () => {
    it('should render single skeleton', () => {
      const { container } = render(<Skeleton />)
      expect(container.querySelectorAll('.skeleton')).toHaveLength(1)
    })

    it('should render multiple skeletons', () => {
      const { container } = render(<Skeleton count={3} />)
      expect(container.querySelectorAll('.skeleton')).toHaveLength(3)
    })

    it('should apply custom styles', () => {
      const { container } = render(
        <Skeleton width="200px" height="50px" borderRadius="8px" />
      )
      const skeleton = container.querySelector('.skeleton')
      expect(skeleton).toHaveStyle({
        width: '200px',
        height: '50px',
        borderRadius: '8px'
      })
    })
  })

  describe('InlineLoading', () => {
    it('should render with default text', () => {
      render(<InlineLoading />)
      expect(screen.getByText('Yuklanmoqda')).toBeInTheDocument()
    })

    it('should render with custom text', () => {
      render(<InlineLoading text="Processing..." />)
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
  })

  describe('ProgressBar', () => {
    it('should render with progress value', () => {
      render(<ProgressBar progress={50} />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should hide label when showLabel is false', () => {
      render(<ProgressBar progress={50} showLabel={false} />)
      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })

    it('should clamp progress between 0 and 100', () => {
      const { container, rerender } = render(<ProgressBar progress={150} />)
      let fill = container.querySelector('.progress-bar-fill')
      expect(fill).toHaveStyle({ width: '100%' })

      rerender(<ProgressBar progress={-50} />)
      fill = container.querySelector('.progress-bar-fill')
      expect(fill).toHaveStyle({ width: '0%' })
    })
  })
})
