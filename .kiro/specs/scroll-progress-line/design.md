# Design Document: Scroll Progress Line

## Overview

Play Kids loyihasi uchun professional Scroll Progress Line komponenti. Bu komponent sahifa scroll holatini vizual ko'rsatadi - yumshoq gradient chiziq, WOW effektlar va interaktivlik bilan.

Mavjud `ScrollProgress.jsx` komponentini yangilaymiz - yangi talablarga mos ravishda qayta yozamiz.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ScrollProgressLine                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Background Track (opacity: 0.1)                     │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │  Progress Bar (gradient, scaleX transform)    │   │    │
│  │  │  ┌────────────────────────────────────────┐  │   │    │
│  │  │  │  Glow Effect (conditional, 100%)       │  │   │    │
│  │  │  └────────────────────────────────────────┘  │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### ScrollProgressLine Component

```jsx
interface ScrollProgressLineProps {
  height?: number;           // Default: 4
  showGlow?: boolean;        // Default: true
  enableClick?: boolean;     // Default: true
  className?: string;        // Custom class
}
```

### useScrollProgress Hook

```jsx
interface ScrollProgressState {
  progress: number;          // 0-1
  isNearEnd: boolean;        // progress > 0.9
  isComplete: boolean;       // progress >= 0.99
  hasCompletedOnce: boolean; // For pulse animation
}
```

## Data Models

### CSS Custom Properties

```css
:root {
  --scroll-progress-height: 4px;
  --scroll-progress-gradient: linear-gradient(90deg, #4facfe, #00f2fe, #43e97b, #f9d423);
  --scroll-progress-bg: rgba(0, 0, 0, 0.1);
  --scroll-progress-glow: 0 0 10px rgba(67, 233, 123, 0.5);
  --scroll-progress-z-index: 9999;
}
```

### Animation States

```
State Machine:
┌─────────┐    scroll    ┌──────────┐    >90%    ┌──────────┐
│  Idle   │ ──────────▶  │ Scrolling │ ────────▶ │ Near End │
└─────────┘              └──────────┘            └──────────┘
                                                       │
                                                      100%
                                                       ▼
                                                ┌──────────┐
                                                │ Complete │
                                                │ (pulse)  │
                                                └──────────┘
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Scroll Progress Accuracy

*For any* scroll position within the document, the progress value SHALL equal `scrollY / (documentHeight - viewportHeight)`, clamped between 0 and 1.

**Validates: Requirements 2.1**

### Property 2: State Transitions

*For any* progress value:
- When progress > 0.9, isNearEnd SHALL be true
- When progress >= 0.99, isComplete SHALL be true
- When progress < 0.9, isNearEnd SHALL be false
- When progress < 0.99, isComplete SHALL be false

**Validates: Requirements 3.1, 3.2**

### Property 3: Pulse Idempotence

*For any* sequence of scroll events that reach 100% multiple times, the pulse animation SHALL only trigger once until the user scrolls away and returns to 100%.

**Validates: Requirements 3.4**

### Property 4: Click Navigation

*For any* click event on the Scroll_Progress_Line, the window SHALL scroll to position 0 with smooth behavior.

**Validates: Requirements 4.2**

### Property 5: Props Customization

*For any* valid combination of props (height, showGlow, enableClick), the component SHALL render with those exact values applied.

**Validates: Requirements 7.4**

## Error Handling

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| Document height = viewport height | Return progress = 0, disable scroll tracking |
| Invalid height prop | Clamp to 3-4px range |
| SSR environment | Return null, no scroll tracking |
| Scroll event errors | Graceful degradation, log error |

## Testing Strategy

### Unit Tests
- Component renders correctly with default props
- Component renders with custom props
- ARIA attributes are present
- CSS classes are applied correctly
- Click handler triggers scroll to top

### Property-Based Tests
- **Property 1**: Generate random scroll positions, verify progress calculation
- **Property 2**: Generate random progress values, verify state transitions
- **Property 3**: Simulate multiple 100% reaches, verify single pulse
- **Property 4**: Simulate clicks, verify scrollTo called correctly
- **Property 5**: Generate random prop combinations, verify rendering

### Testing Framework
- Vitest for unit and property tests
- fast-check for property-based testing
- @testing-library/react for component testing
- Minimum 100 iterations per property test

### Test Annotations
Each property test will be tagged with:
```
// Feature: scroll-progress-line, Property N: [property description]
// Validates: Requirements X.Y
```
