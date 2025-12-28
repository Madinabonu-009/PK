/**
 * Styles Index
 * Issue #24: Centralized CSS imports
 */

// Base styles
import './accessibility.css'
import './animations.css'
import './responsive.css'

// Export for dynamic imports if needed
export const loadStyles = async () => {
  await Promise.all([
    import('./accessibility.css'),
    import('./animations.css'),
    import('./responsive.css')
  ])
}
