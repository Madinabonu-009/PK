/**
 * Virtual List Component
 * Issue #22: Large Lists - Virtualization
 */

import { useState, useRef, useCallback, useEffect, memo } from 'react'

const VirtualList = memo(function VirtualList({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8
}) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)

  // Calculate visible range
  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  // Visible items
  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      item: items[i],
      style: {
        position: 'absolute',
        top: i * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight
      }
    })
  }

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop
    setScrollTop(newScrollTop)

    // Check if near end
    if (onEndReached) {
      const scrollHeight = e.target.scrollHeight
      const scrollPosition = newScrollTop + containerHeight
      if (scrollPosition / scrollHeight >= endReachedThreshold) {
        onEndReached()
      }
    }
  }, [containerHeight, onEndReached, endReachedThreshold])

  // Scroll to index
  const scrollToIndex = useCallback((index, align = 'start') => {
    if (!containerRef.current) return

    let targetTop
    switch (align) {
      case 'center':
        targetTop = index * itemHeight - containerHeight / 2 + itemHeight / 2
        break
      case 'end':
        targetTop = (index + 1) * itemHeight - containerHeight
        break
      default: // start
        targetTop = index * itemHeight
    }

    containerRef.current.scrollTop = Math.max(0, targetTop)
  }, [itemHeight, containerHeight])

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {visibleItems.map(({ index, item, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
})

// Hook for virtual list
export function useVirtualList(items, itemHeight, containerHeight, overscan = 3) {
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, i) => ({
    item,
    index: startIndex + i,
    style: {
      position: 'absolute',
      top: (startIndex + i) * itemHeight,
      height: itemHeight,
      left: 0,
      right: 0
    }
  }))

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    containerStyle: {
      height: containerHeight,
      overflow: 'auto',
      position: 'relative'
    },
    innerStyle: {
      height: totalHeight,
      position: 'relative'
    }
  }
}

export default VirtualList
