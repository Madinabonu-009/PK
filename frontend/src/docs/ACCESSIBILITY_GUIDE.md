# Accessibility (A11y) Guide

Play Kids tizimi WCAG 2.1 Level AA standartlariga muvofiq yaratilgan.

## Quick Start

```jsx
import { useAriaLabel, useFocusTrap, useAnnouncer } from '../hooks/useAccessibility'
import '../styles/accessibility.css'

function MyComponent() {
  const { 'aria-labelledby': labelId, label } = useAriaLabel('User Name')
  const announce = useAnnouncer()
  
  const handleSubmit = () => {
    // Success announcement
    announce('Form muvaffaqiyatli yuborildi!', 'polite')
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <label id={labelId}>{label}</label>
      <input aria-labelledby={labelId} />
    </form>
  )
}
```

## M12: ARIA Labels

### Automatic ARIA IDs
```jsx
import { useAriaLabel } from '../hooks/useAccessibility'

const { labelId, label, 'aria-labelledby': labelledBy } = useAriaLabel(
  'Search',
  results.length ? `${results.length} natija topildi` : ''
)
```

### Manual Labels
```jsx
<button aria-label="Yopish">
  <XIcon />
</button>

<input 
  aria-label="Telefon raqam"
  type="tel"
  placeholder="+998 XX XXX XX XX"
/>
```

## M13: Keyboard Navigation

### Arrow Keys
```jsx
import { useKeyboardNavigation } from '../hooks/useAccessibility'

function Dropdown({ items }) {
  const { currentIndex, handleKeyDown, getItemProps } = useKeyboardNavigation(items, {
    onSelect: (item) => console.log('Selected:', item),
    orientation: 'vertical',
    loop: true
  })
  
  return (
    <div role="listbox" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <div key={item.id} {...getItemProps(index)}>
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

### Tab Navigation
```jsx
// Roving tabindex for custom components
import { RovingTabIndex } from '../utils/accessibility'

const tabs = document.querySelectorAll('[role="tab"]')
const rovingTabIndex = new RovingTabIndex(container, Array.from(tabs))

// Arrow keys automatically handled
```

## M14: Screen Reader Support

### Announcements
```jsx
import { useAnnouncer } from '../hooks/useAccessibility'

const announce = useAnnouncer()

// Polite announcement (non-urgent)
announce('Ma\'lumot saqlandi', 'polite')

// Assertive announcement (urgent)
announce('Xatolik yuz berdi!', 'assertive')
```

### Live Regions
```jsx
import { useAriaLive } from '../hooks/useAccessibility'

const { announce, liveRegionProps, message } = useAriaLive(true)

announce('Yuklanmoqda...')

<div {...liveRegionProps}>{message}</div>
```

### Hidden Content
```jsx
// Screen reader only
<span className="sr-only">Loading...</span>

// Hidden from all
<div aria-hidden="true">Decorative content</div>
```

## M15: Focus Management

### Focus Trap (Modal)
```jsx
import { useFocusTrap, useFocusReturn } from '../hooks/useAccessibility'

function Modal({ isOpen }) {
  const modalRef = useFocusTrap(isOpen)
  const { saveFocus, restoreFocus } = useFocusReturn()
  
  useEffect(() => {
    if (isOpen) {
      saveFocus()
    } else {
      restoreFocus()
    }
  }, [isOpen])
  
  return <div ref={modalRef}>{/* Modal content */}</div>
}
```

### Focus Visible
```css
/* CSS automatically applied */
button:focus-visible {
  outline: 3px solid #fbbf24;
  outline-offset: 2px;
}
```

## M16: Color Contrast

### Check Contrast Ratio
```js
import { validateContrast } from '../utils/accessibility'

const result = validateContrast('#4f46e5', '#ffffff', 'AA', 'normal')
// { ratio: '8.59', passes: true, level: 'AA', threshold: 4.5 }
```

### Safe Colors
```css
/* Pre-defined safe palette */
.colorblind-safe {
  --success: #0072B2;
  --warning: #F0E442;
  --error: #D55E00;
  --info: #56B4E9;
}
```

### WCAG Requirements
- **Normal text**: 4.5:1 (AA), 7:1 (AAA)
- **Large text** (18pt+): 3:1 (AA), 4.5:1 (AAA)
- **UI components**: 3:1

## M17: Alt Text for Images

```jsx
// Informative images
<img src="teacher.jpg" alt="Nilufar Saidova - Tarbiyachi" />

// Decorative images
<img src="pattern.png" alt="" />

// Complex images
<img 
  src="chart.png" 
  alt="2024-yil bolalar soni grafigi"
  aria-describedby="chart-desc"
/>
<div id="chart-desc">
  Grafikda 2024-yilda 150 nafar bola qayd etilganligi ko'rsatilgan...
</div>

// Lazy loaded images
<LazyImage 
  src="photo.jpg"
  alt="Bolalar bog'chasi binosi"
  loading="lazy"
/>
```

## M18: Form Labels

```jsx
import { getFormFieldProps } from '../utils/accessibility'

function FormField({ id, label, error, required, description }) {
  const props = getFormFieldProps(id, label, error, required, description)
  
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label {...props.label}>{label}</label>
      {description && <div {...props.description}>{description}</div>}
      <input {...props.input} />
      {error && <div {...props.error}>{error}</div>}
    </div>
  )
}
```

### Accessible Forms
```jsx
<form aria-labelledby="form-title">
  <h2 id="form-title">Ro'yxatdan o'tish</h2>
  
  <label htmlFor="name">Ism *</label>
  <input 
    id="name"
    type="text"
    required
    aria-required="true"
    aria-invalid={!!errors.name}
    aria-describedby={errors.name ? "name-error" : undefined}
  />
  {errors.name && (
    <div id="name-error" role="alert" className="error-message">
      {errors.name}
    </div>
  )}
</form>
```

## M19: Error Announcements

```jsx
import { useAnnouncer } from '../hooks/useAccessibility'

const announce = useAnnouncer()

const handleSubmit = async () => {
  try {
    await api.post('/users', data)
    announce('Foydalanuvchi muvaffaqiyatli qo\'shildi', 'polite')
  } catch (error) {
    announce('Xatolik: ' + error.message, 'assertive')
  }
}

// Error display
{error && (
  <div role="alert" aria-live="assertive" className="error-message">
    {error}
  </div>
)}
```

## Skip Links

```jsx
import { useSkipLink } from '../hooks/useAccessibility'

function App() {
  useSkipLink() // Automatically adds skip link
  
  return (
    <>
      <header>...</header>
      <main id="main-content">...</main>
    </>
  )
}
```

## Reduced Motion

```jsx
import { useReducedMotion } from '../hooks/useAccessibility'

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      Content
    </motion.div>
  )
}
```

## Testing Checklist

### Keyboard
- [ ] All interactive elements focusable with Tab
- [ ] Focus order logical
- [ ] No keyboard traps
- [ ] Custom components navigable with arrows
- [ ] Enter/Space triggers actions

### Screen Reader
- [ ] All images have alt text
- [ ] Form fields have labels
- [ ] Errors announced
- [ ] Dynamic content announced
- [ ] Headings hierarchical (h1 → h2 → h3)

### Visual
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] Text resizable to 200%
- [ ] Touch targets ≥ 44x44px
- [ ] No information by color alone

### Motion
- [ ] Animations respect prefers-reduced-motion
- [ ] No auto-playing videos
- [ ] Parallax can be disabled

## Tools

### Browser Extensions
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Screen Readers
- NVDA (Windows) - Free
- JAWS (Windows) - Commercial
- VoiceOver (Mac/iOS) - Built-in
- TalkBack (Android) - Built-in

### Testing
```bash
# Lighthouse CI
npm run lighthouse

# axe-core tests
npm run test:a11y
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project](https://www.a11yproject.com/)
