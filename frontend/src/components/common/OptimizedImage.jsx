/**
 * Optimized Image Component
 * Issues Fixed: #16, #23 - Lazy loading, WebP support
 */

import { useState, useRef, useEffect, memo } from 'react'
import './OptimizedImage.css'

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'blur', // 'blur', 'skeleton', 'none'
  loading = 'lazy',
  objectFit = 'cover',
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.png',
  sizes,
  srcSet,
  priority = false
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading !== 'lazy') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, loading])

  // Generate WebP srcSet if not provided
  const generateSrcSet = () => {
    if (srcSet) return srcSet
    if (!src) return undefined

    // Check if already WebP
    if (src.endsWith('.webp')) return undefined

    // Generate responsive sizes
    const widths = [320, 640, 768, 1024, 1280]
    const baseSrc = src.replace(/\.(jpg|jpeg|png|gif)$/i, '')
    
    return widths
      .map(w => `${baseSrc}-${w}w.webp ${w}w`)
      .join(', ')
  }

  const handleLoad = (e) => {
    setIsLoaded(true)
    onLoad?.(e)
  }

  const handleError = (e) => {
    setHasError(true)
    onError?.(e)
  }

  const containerStyle = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    aspectRatio: width && height ? `${width}/${height}` : undefined
  }

  const imgStyle = {
    objectFit,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease'
  }

  return (
    <div 
      ref={imgRef}
      className={`optimized-image ${className} ${isLoaded ? 'loaded' : ''}`}
      style={containerStyle}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder !== 'none' && (
        <div className={`optimized-image__placeholder optimized-image__placeholder--${placeholder}`}>
          {placeholder === 'skeleton' && (
            <div className="skeleton-shimmer" />
          )}
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <picture>
          {/* WebP source */}
          {!hasError && src && !src.endsWith('.webp') && (
            <source
              type="image/webp"
              srcSet={generateSrcSet()}
              sizes={sizes}
            />
          )}
          
          {/* Fallback image */}
          <img
            src={hasError ? fallbackSrc : src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            decoding="async"
            style={imgStyle}
            onLoad={handleLoad}
            onError={handleError}
            sizes={sizes}
            srcSet={!hasError ? srcSet : undefined}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <div className="optimized-image__error">
          <span>📷</span>
        </div>
      )}
    </div>
  )
})

export default OptimizedImage
