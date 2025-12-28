# Implementation Plan: Scroll Progress Line

## Overview

Play Kids loyihasi uchun professional Scroll Progress Line komponentini implement qilish. Mavjud `ScrollProgress.jsx` faylini yangilaymiz va yangi `ScrollProgressLine` komponentini qo'shamiz.

## Tasks

- [x] 1. Create useScrollProgress custom hook
  - Create new hook in `frontend/src/hooks/useScrollProgress.js`
  - Implement scroll position tracking with requestAnimationFrame
  - Calculate progress as scrollY / (documentHeight - viewportHeight)
  - Track isNearEnd (>90%), isComplete (>=99%), hasCompletedOnce states
  - Add throttling for performance
  - Implement cleanup on unmount
  - _Requirements: 2.1, 2.6, 5.1, 5.2, 5.5_

- [x] 1.1 Write property test for scroll progress accuracy
  - **Property 1: Scroll Progress Accuracy**
  - **Validates: Requirements 2.1**

- [x] 1.2 Write property test for state transitions
  - **Property 2: State Transitions**
  - **Validates: Requirements 3.1, 3.2**

- [x] 2. Create ScrollProgressLine component
  - Create `ScrollProgressLine` component in `frontend/src/components/animations/ScrollProgressLine.jsx`
  - Use useScrollProgress hook for state
  - Implement fixed positioning at top
  - Apply gradient (blue → green → yellow)
  - Use Framer Motion useSpring for smooth animation
  - Use CSS transform: scaleX for GPU acceleration
  - Memoize component with React.memo
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.2, 2.5, 7.1, 7.2, 7.3_

- [x] 2.1 Write property test for props customization
  - **Property 5: Props Customization**
  - **Validates: Requirements 7.4**

- [x] 3. Implement WOW effects
  - Add brightness increase when isNearEnd is true
  - Add glow effect when isComplete is true
  - Implement single pulse animation on first completion
  - Track hasCompletedOnce to prevent multiple pulses
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.1 Write property test for pulse idempotence
  - **Property 3: Pulse Idempotence**
  - **Validates: Requirements 3.4**

- [x] 4. Implement interactivity
  - Add hover effect (opacity increase)
  - Add click handler for smooth scroll to top
  - Set cursor: pointer
  - Use native smooth scroll behavior
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.1 Write property test for click navigation
  - **Property 4: Click Navigation**
  - **Validates: Requirements 4.2**

- [x] 5. Create CSS styles
  - Create `frontend/src/components/animations/ScrollProgressLine.css`
  - Define CSS custom properties for theming
  - Implement gradient background
  - Add glow and pulse animations
  - Add hover states
  - Implement prefers-reduced-motion support
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 6.1, 6.2_

- [x] 6. Add accessibility features
  - Add ARIA role="progressbar"
  - Add aria-valuenow, aria-valuemin, aria-valuemax
  - Add aria-label for screen readers
  - Ensure color contrast compliance
  - _Requirements: 6.3, 6.4, 6.5_

- [x] 7. Export and integrate
  - Add exports to `frontend/src/components/animations/index.js`
  - Update existing ScrollProgress.jsx to include new component
  - Add both named and default exports
  - _Requirements: 7.5_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for full test coverage
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Mavjud ScrollProgressBar komponentini saqlab qolamiz - yangi ScrollProgressLine qo'shamiz
