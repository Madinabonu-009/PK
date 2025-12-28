import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

export function useVirtualScroll({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5
}) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * itemHeight

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      style: {
        position: 'absolute',
        top: (visibleRange.startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0
      }
    }))
  }, [items, visibleRange, itemHeight])

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const scrollToIndex = useCallback((index, behavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * itemHeight,
        behavior
      })
    }
  }, [itemHeight])

  const scrollToTop = useCallback(() => scrollToIndex(0), [scrollToIndex])
  const scrollToBottom = useCallback(() => scrollToIndex(items.length - 1), [scrollToIndex, items.length])

  return {
    containerRef,
    containerProps: {
      ref: containerRef,
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }
    },
    innerProps: {
      style: {
        height: totalHeight,
        position: 'relative'
      }
    },
    visibleItems,
    totalHeight,
    scrollTop,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    visibleRange
  }
}

// Dynamic height virtual scroll
export function useDynamicVirtualScroll({
  items = [],
  estimatedItemHeight = 50,
  containerHeight = 400,
  overscan = 3
}) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [measuredHeights, setMeasuredHeights] = useState({})

  const getItemHeight = useCallback((index) => {
    return measuredHeights[index] || estimatedItemHeight
  }, [measuredHeights, estimatedItemHeight])

  const getItemOffset = useCallback((index) => {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i)
    }
    return offset
  }, [getItemHeight])

  const totalHeight = useMemo(() => {
    return items.reduce((sum, _, index) => sum + getItemHeight(index), 0)
  }, [items, getItemHeight])

  const visibleRange = useMemo(() => {
    let startIndex = 0
    let offset = 0
    
    while (offset < scrollTop && startIndex < items.length) {
      offset += getItemHeight(startIndex)
      startIndex++
    }
    startIndex = Math.max(0, startIndex - 1 - overscan)

    let endIndex = startIndex
    offset = getItemOffset(startIndex)
    
    while (offset < scrollTop + containerHeight && endIndex < items.length) {
      offset += getItemHeight(endIndex)
      endIndex++
    }
    endIndex = Math.min(items.length - 1, endIndex + overscan)

    return { startIndex, endIndex }
  }, [scrollTop, containerHeight, items.length, getItemHeight, getItemOffset, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, i) => {
      const index = visibleRange.startIndex + i
      return {
        item,
        index,
        style: {
          position: 'absolute',
          top: getItemOffset(index),
          left: 0,
          right: 0
        }
      }
    })
  }, [items, visibleRange, getItemOffset])

  const measureItem = useCallback((index, height) => {
    setMeasuredHeights(prev => {
      if (prev[index] === height) return prev
      return { ...prev, [index]: height }
    })
  }, [])

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return {
    containerRef,
    containerProps: {
      ref: containerRef,
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }
    },
    innerProps: {
      style: {
        height: totalHeight,
        position: 'relative'
      }
    },
    visibleItems,
    measureItem,
    totalHeight
  }
}

export default useVirtualScroll
