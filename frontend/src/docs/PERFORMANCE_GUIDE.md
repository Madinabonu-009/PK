# Performance Optimization Guide

## React.memo Usage (M7)

### When to use React.memo?

**✅ USE React.memo when:**
- Component re-renders frequently with same props
- Component is expensive to render (heavy calculations, large lists)
- Parent re-renders but child props rarely change
- Pure functional component without side effects

**❌ DON'T use React.memo when:**
- Component already renders fast
- Props change frequently
- Component is small and simple
- Using memo adds unnecessary complexity

### Examples

#### Basic Usage
```jsx
import { memo } from 'react'

const ExpensiveComponent = memo(function ExpensiveComponent({ data, onAction }) {
  // Heavy rendering logic
  return <div>{/* ... */}</div>
})

export default ExpensiveComponent
```

#### With Custom Comparison
```jsx
const UserCard = memo(
  function UserCard({ user }) {
    return <div>{user.name}</div>
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.user.id === nextProps.user.id
  }
)
```

#### With useCallback
```jsx
const ParentComponent = () => {
  const [count, setCount] = useState(0)
  
  // ❌ Bad: New function on every render
  const handleClick = () => console.log('clicked')
  
  // ✅ Good: Memoized callback
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])
  
  return <MemoizedChild onClick={handleClick} />
}
```

## useMemo Usage (M6)

### Filtering & Sorting

```jsx
import { useMemo } from 'react'
import { useMemoizedFilter, useMemoizedSort, useMemoizedSearch } from '../hooks/usePerformance'

function DataList({ data, filter, sortKey, sortOrder, searchTerm }) {
  // ✅ Memoized filtering
  const filtered = useMemoizedFilter(data, (item) => {
    if (!filter) return true
    return item.status === filter
  })
  
  // ✅ Memoized sorting
  const sorted = useMemoizedSort(filtered, sortKey, sortOrder)
  
  // ✅ Memoized search
  const searched = useMemoizedSearch(sorted, searchTerm, ['name', 'email'])
  
  return (
    <div>
      {searched.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
```

## Debounce Usage (M11)

### Search Input
```jsx
import { useState } from 'react'
import { useDebounce } from '../hooks/usePerformance'

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  
  useEffect(() => {
    if (debouncedSearch) {
      // API call only after user stops typing
      api.get(`/search?q=${debouncedSearch}`)
    }
  }, [debouncedSearch])
  
  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

## Lazy Loading Images (M8)

```jsx
import LazyImage from '../components/common/LazyImage'

function Gallery({ images }) {
  return (
    <div className="gallery">
      {images.map(img => (
        <LazyImage 
          key={img.id}
          src={img.url}
          alt={img.title}
          placeholder={<Skeleton />}
        />
      ))}
    </div>
  )
}
```

## Code Splitting (M9)

### Route-based splitting
```jsx
import { lazyLoad } from '../utils/lazyLoader'

// ✅ Lazy load heavy routes
const AdminDashboard = lazyLoad(() => import('./pages/admin/Dashboard'))
const ReportsPage = lazyLoad(() => import('./pages/admin/ReportsPage'))

// Routes
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/reports" element={<ReportsPage />} />
```

### Component-based splitting
```jsx
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./components/HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  )
}
```

## API Response Caching (M10)

Already implemented in `src/services/api.js`:
- GET requests automatically cached for 5 minutes
- Cache cleared on mutations (POST, PUT, DELETE)
- Use `skipCache: true` to bypass cache

```jsx
// ✅ Cached by default
api.get('/children')

// ❌ Skip cache for real-time data
api.get('/notifications', { skipCache: true })
```

## Virtual Scrolling

For large lists (1000+ items):

```jsx
import VirtualList from '../components/common/VirtualList'

function LargeDataList({ items }) {
  return (
    <VirtualList
      items={items}
      itemHeight={80}
      renderItem={(item) => <ItemCard item={item} />}
    />
  )
}
```

## Performance Checklist

### Component Level
- [ ] Heavy components wrapped with `React.memo`
- [ ] Event handlers memoized with `useCallback`
- [ ] Expensive calculations memoized with `useMemo`
- [ ] List keys are stable and unique
- [ ] Avoid inline functions in JSX
- [ ] Avoid creating objects/arrays in render

### Data Level
- [ ] Search inputs debounced
- [ ] API responses cached
- [ ] Large lists virtualized
- [ ] Images lazy loaded
- [ ] Data fetching optimized (no waterfalls)

### Bundle Level
- [ ] Routes code-split
- [ ] Heavy components lazy loaded
- [ ] Third-party libraries tree-shaken
- [ ] Unused code removed
- [ ] Bundle size monitored

### Runtime Level
- [ ] No unnecessary re-renders
- [ ] Smooth animations (60fps)
- [ ] Fast interaction response (<100ms)
- [ ] Web Vitals in good range

## Tools

### Development
```bash
# Analyze bundle size
npm run build -- --stats
npx webpack-bundle-analyzer dist/stats.json

# Profile components
# Use React DevTools Profiler tab
```

### Production Monitoring
```javascript
// Track performance metrics
import { trackPageLoad, trackWebVitals } from '../utils/performance'

trackPageLoad()
trackWebVitals()
```

## Best Practices

1. **Measure First**: Profile before optimizing
2. **Optimize Hot Paths**: Focus on frequently rendered components
3. **Lazy Load**: Split code at route boundaries
4. **Cache Smart**: Cache API responses and computed values
5. **Virtualize Large Lists**: Use virtual scrolling for 100+ items
6. **Debounce Inputs**: Wait for user to finish typing
7. **Monitor Metrics**: Track Core Web Vitals

## Performance Budget

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- Time to First Byte (TTFB): < 600ms

## Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
