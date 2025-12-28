# Play Kids Admin Panel - Developer Guide

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS + CSS Modules
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Real-time**: WebSocket
- **Charts**: Recharts
- **Icons**: Lucide React

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── admin/
│   │       ├── analytics/      # Analytics components
│   │       ├── attendance/     # Attendance module
│   │       ├── calendar/       # Events & calendar
│   │       ├── children/       # Children management
│   │       ├── common/         # Shared components
│   │       ├── dashboard/      # Dashboard widgets
│   │       ├── finance/        # Financial module
│   │       ├── gallery/        # Media management
│   │       ├── groups/         # Group management
│   │       ├── layout/         # Layout components
│   │       ├── menu/           # Menu & nutrition
│   │       ├── messages/       # Communication
│   │       ├── mobile/         # Mobile components
│   │       ├── reports/        # Report generation
│   │       ├── search/         # Search & filters
│   │       ├── settings/       # System settings
│   │       └── users/          # User management
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   ├── stores/                 # Zustand stores
│   ├── utils/                  # Utility functions
│   ├── test/                   # Test files
│   └── docs/                   # Documentation
```

## Component Guidelines

### Creating New Components

```jsx
// ComponentName.jsx
import React, { useState, useEffect } from 'react';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2, onAction }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Side effects
  }, []);

  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

### CSS Module Pattern

```css
/* ComponentName.css */
.component-name {
  /* Base styles */
}

.component-name__header {
  /* BEM naming */
}

.component-name--variant {
  /* Modifier */
}

/* Dark mode support */
.dark .component-name {
  /* Dark theme overrides */
}
```

### Export Pattern

```javascript
// index.js
export { default as ComponentA } from './ComponentA';
export { default as ComponentB } from './ComponentB';
```

## State Management

### Zustand Store Example

```javascript
import { create } from 'zustand';

const useAdminStore = create((set, get) => ({
  // State
  data: [],
  loading: false,
  
  // Actions
  setData: (data) => set({ data }),
  fetchData: async () => {
    set({ loading: true });
    const response = await api.getData();
    set({ data: response, loading: false });
  },
}));
```

## API Integration

### React Query Pattern

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';

// Query
const { data, isLoading } = useQuery({
  queryKey: ['children'],
  queryFn: () => api.getChildren(),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data) => api.createChild(data),
  onSuccess: () => queryClient.invalidateQueries(['children']),
});
```

## WebSocket Integration

```javascript
import { useWebSocket } from '../contexts/WebSocketContext';

const Component = () => {
  const { subscribe, send } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('event-type', (data) => {
      // Handle real-time update
    });
    return unsubscribe;
  }, []);
};
```

## Testing

### Component Test Example

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const onAction = vi.fn();
    render(<ComponentName onAction={onAction} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

## Accessibility

- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation
- Maintain color contrast ratios
- Test with screen readers

```jsx
<button
  aria-label="Close modal"
  onClick={onClose}
  onKeyDown={(e) => e.key === 'Enter' && onClose()}
>
  <X />
</button>
```

## Security

- Sanitize user inputs
- Use `security.js` utilities for XSS prevention
- Validate data on both client and server
- Never store sensitive data in localStorage

```javascript
import { sanitizeInput, validateInput } from '../utils/security';

const safeValue = sanitizeInput(userInput);
const isValid = validateInput(value, 'email');
```

## Performance

- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load routes and heavy components
- Optimize images before upload

## Environment Variables

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_TELEGRAM_BOT_TOKEN=your_token
```

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm run test

# Lint
npm run lint
```

## Deployment

See `DEPLOYMENT_CONFIG.md` for production deployment instructions.
