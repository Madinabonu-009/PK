# Design Document: Professional Admin Panel

## Overview

Play Kids bog'cha boshqaruv tizimi uchun enterprise-grade admin panel. Bu panel zamonaviy React arxitekturasi, real-time WebSocket integratsiyasi, va professional UI/UX dizayn bilan quriladi. Panel modular tuzilishga ega bo'lib, har bir modul mustaqil ishlaydi va kengaytirilishi mumkin.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         App Shell                                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │ Sidebar  │ │ Header   │ │ Command  │ │ Notif    │ │ Theme    │  │   │
│  │  │ Nav      │ │ Bar      │ │ Palette  │ │ Center   │ │ Provider │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Feature Modules                               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │Dashboard│ │Children │ │Attendance│ │Finance  │ │Groups   │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │Menu     │ │Events   │ │Gallery  │ │Messages │ │Reports  │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  │  ┌─────────┐ ┌─────────┐                                            │   │
│  │  │Users    │ │Settings │                                            │   │
│  │  └─────────┘ └─────────┘                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Shared Services                               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │ API      │ │ WebSocket│ │ Cache    │ │ Storage  │ │ Analytics│  │   │
│  │  │ Client   │ │ Manager  │ │ Manager  │ │ Service  │ │ Service  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ REST API │ │ WebSocket│ │ Auth     │ │ File     │ │ Telegram │          │
│  │ Routes   │ │ Server   │ │ Service  │ │ Service  │ │ Bot      │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```


## Components and Interfaces

### 1. App Shell Components

#### AdminLayout
```jsx
// Main layout wrapper with sidebar, header, and content area
interface AdminLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}
```

#### ProSidebar
```jsx
// Collapsible sidebar with navigation, user info, and quick actions
interface SidebarProps {
  collapsed: boolean;
  activeRoute: string;
  user: User;
  notifications: number;
  onNavigate: (route: string) => void;
}

// Navigation items with icons, badges, and nested menus
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  badge?: number;
  children?: NavItem[];
  permission?: string;
}
```

#### CommandPalette
```jsx
// Global command palette (Ctrl+K)
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (command: Command) => void;
}

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'action' | 'search';
}
```

### 2. Dashboard Components

#### KPICard
```jsx
// Animated KPI card with trend indicator
interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  onClick?: () => void;
  loading?: boolean;
}
```

#### LiveActivityFeed
```jsx
// Real-time activity stream
interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  onActivityClick?: (activity: Activity) => void;
}

interface Activity {
  id: string;
  type: 'attendance' | 'payment' | 'enrollment' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user?: User;
  metadata?: Record<string, any>;
}
```

#### InteractiveChart
```jsx
// Chart component with drill-down capability
interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'area' | 'heatmap';
  data: ChartData;
  options?: ChartOptions;
  onDataPointClick?: (point: DataPoint) => void;
  loading?: boolean;
}
```

### 3. Data Grid Components

#### ProDataGrid
```jsx
// Advanced data grid with all features
interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  sorting?: SortConfig;
  filtering?: FilterConfig;
  grouping?: GroupConfig;
  selection?: SelectionConfig;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selected: T[]) => void;
  virtualScroll?: boolean;
  rowHeight?: number;
}

interface Column<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  editable?: boolean;
  onEdit?: (row: T, value: any) => void;
}
```

#### InlineEditor
```jsx
// Inline editing component with validation
interface InlineEditorProps {
  value: any;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  options?: SelectOption[];
  validation?: ValidationRule[];
  onSave: (value: any) => Promise<void>;
  onCancel: () => void;
}
```


### 4. Attendance Components

#### AttendanceGrid
```jsx
// Grid-based attendance taking
interface AttendanceGridProps {
  children: Child[];
  date: Date;
  attendance: AttendanceRecord[];
  onStatusChange: (childId: string, status: AttendanceStatus) => void;
  onBulkAction: (childIds: string[], status: AttendanceStatus) => void;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
```

#### AttendanceHeatmap
```jsx
// Heatmap visualization for attendance patterns
interface HeatmapProps {
  data: HeatmapData[];
  startDate: Date;
  endDate: Date;
  onCellClick?: (date: Date, value: number) => void;
}
```

#### QRScanner
```jsx
// QR code scanner for quick check-in
interface QRScannerProps {
  onScan: (childId: string) => void;
  onError: (error: Error) => void;
  active: boolean;
}
```

### 5. Financial Components

#### PaymentForm
```jsx
// Payment recording form
interface PaymentFormProps {
  child: Child;
  balance: number;
  onSubmit: (payment: PaymentData) => Promise<void>;
  paymentMethods: PaymentMethod[];
}

interface PaymentData {
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  reference?: string;
  notes?: string;
}
```

#### InvoiceGenerator
```jsx
// PDF invoice generation
interface InvoiceGeneratorProps {
  child: Child;
  items: InvoiceItem[];
  dueDate: Date;
  onGenerate: () => Promise<Blob>;
}
```

#### FinancialChart
```jsx
// Financial analytics charts
interface FinancialChartProps {
  type: 'revenue' | 'debt' | 'comparison';
  period: 'week' | 'month' | 'quarter' | 'year';
  data: FinancialData;
}
```

### 6. Calendar Components

#### EventCalendar
```jsx
// Interactive calendar with multiple views
interface CalendarProps {
  events: CalendarEvent[];
  view: 'month' | 'week' | 'day' | 'agenda';
  onViewChange: (view: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (start: Date, end: Date) => void;
  onEventDrop: (event: CalendarEvent, newStart: Date) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: 'holiday' | 'celebration' | 'meeting' | 'activity';
  recurring?: RecurringPattern;
  attendees?: string[];
  rsvp?: RSVPStatus[];
}
```

### 7. Media Components

#### MediaUploader
```jsx
// Bulk media upload with progress
interface MediaUploaderProps {
  accept: string[];
  maxSize: number;
  multiple: boolean;
  onUpload: (files: File[]) => Promise<UploadResult[]>;
  onProgress: (progress: UploadProgress) => void;
}
```

#### GalleryGrid
```jsx
// Masonry gallery with lightbox
interface GalleryGridProps {
  items: MediaItem[];
  layout: 'masonry' | 'grid' | 'list';
  onItemClick: (item: MediaItem) => void;
  onSelect: (items: MediaItem[]) => void;
  selectable: boolean;
}
```

### 8. Communication Components

#### MessageComposer
```jsx
// Rich text message composer
interface MessageComposerProps {
  recipients: Recipient[];
  templates: MessageTemplate[];
  onSend: (message: MessageData) => Promise<void>;
  onSchedule: (message: MessageData, date: Date) => Promise<void>;
}
```

#### ConversationList
```jsx
// Message conversation list
interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conversation: Conversation) => void;
  onSearch: (query: string) => void;
}
```


## Data Models

### Core Entities

```typescript
interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  groupId: string;
  photo?: string;
  qrCode: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  allergies: string[];
  medicalNotes?: string;
  documents: Document[];
  enrolledAt: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

interface Group {
  id: string;
  name: string;
  photo?: string;
  capacity: number;
  ageRange: { min: number; max: number };
  teachers: { id: string; role: 'primary' | 'secondary' }[];
  schedule: WeeklySchedule;
  currentCount: number;
}

interface AttendanceRecord {
  id: string;
  childId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  arrivalTime?: string;
  departureTime?: string;
  reason?: string;
  recordedBy: string;
  recordedAt: Date;
}

interface Payment {
  id: string;
  childId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'refunded';
  reference?: string;
  receiptUrl?: string;
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

interface Debt {
  id: string;
  childId: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paidAmount: number;
  remindersSent: number;
  lastReminderAt?: Date;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  category: 'holiday' | 'celebration' | 'meeting' | 'activity';
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    exceptions?: Date[];
  };
  attendees: string[];
  rsvp: { userId: string; status: 'yes' | 'no' | 'maybe' }[];
  attachments: string[];
  createdBy: string;
  createdAt: Date;
}

interface MenuItem {
  id: string;
  date: string;
  meals: {
    type: 'breakfast' | 'lunch' | 'snack';
    name: string;
    ingredients: string[];
    allergens: string[];
    nutritionalInfo: NutritionalInfo;
    cost: number;
  }[];
  published: boolean;
  publishedAt?: Date;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  albumId?: string;
  tags: string[];
  taggedChildren: string[];
  uploadedBy: string;
  uploadedAt: Date;
  views: number;
  downloads: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientIds: string[];
  content: string;
  attachments: string[];
  status: 'sent' | 'delivered' | 'read';
  scheduledFor?: Date;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  avatar?: string;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  preferences: UserPreferences;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

### API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface WebSocketMessage {
  type: 'update' | 'create' | 'delete' | 'notification';
  entity: string;
  data: any;
  timestamp: Date;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Dashboard Data Rendering
*For any* valid statistics data, the dashboard SHALL render all KPI cards with correct values, charts with accurate data points, and activity feed with proper formatting.
**Validates: Requirements 1.1, 1.3, 1.6**

### Property 2: Real-time Data Synchronization
*For any* WebSocket data change event, the UI state SHALL update to reflect the new data within the same render cycle.
**Validates: Requirements 1.2**

### Property 3: Alert Generation
*For any* data state containing issues (absent children, pending payments, new enrollments), the dashboard SHALL generate corresponding alerts with correct severity levels.
**Validates: Requirements 1.9**

### Property 4: Children List Operations
*For any* children data set and sort/filter/search criteria, the data grid SHALL return correctly ordered and filtered results with matching items highlighted.
**Validates: Requirements 2.1, 2.2**

### Property 5: Child Profile Completeness
*For any* child record, the profile view SHALL display all required fields including photo, documents, medical info, attendance history, and payment status.
**Validates: Requirements 2.3**

### Property 6: Form Validation
*For any* form input (valid or invalid), the validation system SHALL correctly identify errors and display appropriate messages without allowing invalid data submission.
**Validates: Requirements 2.4**

### Property 7: Bulk Action Consistency
*For any* selection of children and bulk action, the system SHALL apply the action to all selected items and update UI state accordingly.
**Validates: Requirements 2.5**

### Property 8: QR Code Round-Trip
*For any* child ID, generating a QR code and then scanning it SHALL return the original child ID.
**Validates: Requirements 2.10**

### Property 9: Attendance Statistics Calculation
*For any* attendance data set, the calculated statistics (present, absent, late percentages) SHALL be mathematically correct.
**Validates: Requirements 3.6**

### Property 10: Bulk Attendance Marking
*For any* group and attendance status, bulk marking SHALL update all children in the group to the specified status.
**Validates: Requirements 3.7**

### Property 11: Attendance Pattern Detection
*For any* attendance history with unusual patterns (3+ consecutive absences), the system SHALL generate appropriate alerts.
**Validates: Requirements 3.10**

### Property 12: Payment Balance Calculation
*For any* child with payments and debts, the calculated balance SHALL equal total fees minus total payments.
**Validates: Requirements 4.3, 4.7**

### Property 13: Invoice Generation
*For any* valid invoice data, the generated PDF SHALL contain all required fields (child info, items, totals, QR code) in correct format.
**Validates: Requirements 4.6**

### Property 14: Financial Report Accuracy
*For any* date range and financial data, the report calculations (totals, comparisons, trends) SHALL be mathematically correct.
**Validates: Requirements 4.8**

### Property 15: Group Capacity Enforcement
*For any* group at capacity, attempting to add another child SHALL be rejected with appropriate error message.
**Validates: Requirements 5.4**

### Property 16: Allergen Detection
*For any* menu with ingredients and children with allergies, the system SHALL correctly identify all allergen conflicts and affected children.
**Validates: Requirements 6.3, 6.4**

### Property 17: Nutritional Calculation
*For any* menu with meals, the calculated daily nutritional values SHALL be the sum of individual meal values.
**Validates: Requirements 6.5**

### Property 18: Recurring Event Generation
*For any* recurring event pattern, the generated event instances SHALL follow the specified pattern (daily, weekly, monthly) with correct dates.
**Validates: Requirements 7.2**

### Property 19: Image Optimization
*For any* uploaded image, the optimized version SHALL have reduced file size while maintaining acceptable quality (SSIM > 0.9).
**Validates: Requirements 8.2**

### Property 20: Message Delivery Tracking
*For any* sent message, the delivery status SHALL accurately reflect whether the message was delivered and read.
**Validates: Requirements 9.4**

### Property 21: Report Export Format
*For any* generated report, the exported file (PDF, Excel, CSV) SHALL be valid and contain all requested data.
**Validates: Requirements 10.3**

### Property 22: Permission Enforcement
*For any* user with specific role/permissions, access to protected resources SHALL be granted or denied according to permission rules.
**Validates: Requirements 11.2, 11.3**

### Property 23: Activity Logging
*For any* user action on the system, an activity log entry SHALL be created with correct user, action, entity, and timestamp.
**Validates: Requirements 11.4**

### Property 24: Internationalization Coverage
*For any* UI string and supported language, a translation SHALL exist and be displayed when that language is selected.
**Validates: Requirements 12.3, 12.4**

### Property 25: Backup Round-Trip
*For any* system backup, restoring from the backup SHALL result in data identical to the original state.
**Validates: Requirements 12.7**

### Property 26: Global Search Results
*For any* search query, the results SHALL include matching items from all searchable entities (children, parents, payments, events) with correct relevance ranking.
**Validates: Requirements 13.2**

### Property 27: Filter Persistence
*For any* saved filter configuration, loading it SHALL restore the exact same filter state.
**Validates: Requirements 13.7**

### Property 28: Offline Queue Sync
*For any* actions queued while offline, syncing when online SHALL apply all actions in correct order and update local state.
**Validates: Requirements 14.4**

### Property 29: Virtual Scroll Rendering
*For any* large data set with virtual scrolling, only visible items plus buffer SHALL be rendered in DOM.
**Validates: Requirements 15.2**

### Property 30: Cache Consistency
*For any* cached API response, subsequent requests for the same data SHALL return cached data until invalidation.
**Validates: Requirements 15.3**

### Property 31: Error Recovery
*For any* API error, the system SHALL display user-friendly message and provide retry option that correctly re-attempts the operation.
**Validates: Requirements 15.5, 15.6**


## Error Handling

### Frontend Error Handling Strategy

```typescript
// Centralized error handler
class ErrorHandler {
  static handle(error: Error, context?: string): void {
    // Log error
    logger.error(error, { context });
    
    // Show user-friendly message
    if (error instanceof NetworkError) {
      toast.error('Tarmoq xatosi. Qayta urinib ko\'ring.');
    } else if (error instanceof ValidationError) {
      toast.error(error.message);
    } else if (error instanceof AuthError) {
      // Redirect to login
      router.push('/admin/login');
    } else {
      toast.error('Kutilmagan xatolik yuz berdi.');
    }
  }
}

// API error interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Try token refresh
      const refreshed = await authService.refreshToken();
      if (refreshed) {
        return api.request(error.config);
      }
      // Redirect to login
      router.push('/admin/login');
    }
    throw error;
  }
);
```

### Backend Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: string[];
  stack?: string; // Only in development
}

// Error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};
```

## Testing Strategy

### Unit Testing
- Component rendering tests with React Testing Library
- Hook tests with @testing-library/react-hooks
- Utility function tests with Jest
- API service tests with mocked axios

### Property-Based Testing (fast-check)
- Data transformation properties
- Calculation accuracy properties
- Round-trip properties (QR code, backup/restore, filter save/load)
- Invariant properties (balance calculations, statistics)

### Integration Testing
- Full user flows (enrollment, payment, attendance)
- WebSocket integration
- File upload/download
- Report generation

### E2E Testing (Playwright)
- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
  ],
};

// Property test configuration
const fcConfig = {
  numRuns: 100,
  verbose: true,
};
```

## Performance Optimizations

### Frontend Optimizations
1. **Code Splitting**: Lazy load feature modules
2. **Virtual Scrolling**: For large data sets (>100 items)
3. **Memoization**: useMemo/useCallback for expensive computations
4. **Image Optimization**: WebP format, lazy loading, srcset
5. **Caching**: React Query for API response caching
6. **Debouncing**: Search inputs, resize handlers

### Backend Optimizations
1. **Database Indexing**: On frequently queried fields
2. **Query Optimization**: Pagination, field selection
3. **Response Compression**: gzip/brotli
4. **Caching**: Redis for session and frequently accessed data
5. **Connection Pooling**: For database connections

## Security Considerations

1. **Authentication**: JWT with refresh tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Server-side validation for all inputs
4. **XSS Prevention**: Content Security Policy, sanitization
5. **CSRF Protection**: Token-based CSRF protection
6. **Rate Limiting**: Per-user and per-IP rate limits
7. **Audit Logging**: All sensitive operations logged
8. **Data Encryption**: Sensitive data encrypted at rest
