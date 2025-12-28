/**
 * Font Loader Utility
 * Issue #25: Font preloading for better performance
 */

// Font configurations
const FONTS = [
  {
    family: 'Inter',
    weights: [400, 500, 600, 700],
    display: 'swap'
  },
  {
    family: 'Nunito',
    weights: [400, 600, 700, 800],
    display: 'swap'
  }
]

// Preload critical fonts
export function preloadFonts() {
  if (typeof document === 'undefined') return

  const head = document.head
  
  // Google Fonts preconnect
  const preconnectGoogle = document.createElement('link')
  preconnectGoogle.rel = 'preconnect'
  preconnectGoogle.href = 'https://fonts.googleapis.com'
  head.appendChild(preconnectGoogle)

  const preconnectGstatic = document.createElement('link')
  preconnectGstatic.rel = 'preconnect'
  preconnectGstatic.href = 'https://fonts.gstatic.com'
  preconnectGstatic.crossOrigin = 'anonymous'
  head.appendChild(preconnectGstatic)

  // Preload font files
  FONTS.forEach(font => {
    const weights = font.weights.join(';')
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = `https://fonts.googleapis.com/css2?family=${font.family}:wght@${weights}&display=${font.display}`
    head.appendChild(link)
  })
}

// Load fonts asynchronously
export function loadFontsAsync() {
  if (typeof document === 'undefined') return Promise.resolve()

  return new Promise((resolve) => {
    const fontPromises = FONTS.map(font => {
      const weights = font.weights.join(';')
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${font.family}:wght@${weights}&display=${font.display}`
      
      return new Promise((res) => {
        link.onload = res
        link.onerror = res // Don't block on error
        document.head.appendChild(link)
      })
    })

    Promise.all(fontPromises).then(resolve)
  })
}

// Check if fonts are loaded
export function areFontsLoaded() {
  if (typeof document === 'undefined') return true
  return document.fonts?.status === 'loaded'
}

// Wait for fonts to be ready
export function waitForFonts() {
  if (typeof document === 'undefined') return Promise.resolve()
  return document.fonts?.ready || Promise.resolve()
}

export default {
  preloadFonts,
  loadFontsAsync,
  areFontsLoaded,
  waitForFonts
}
