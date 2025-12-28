# Design Document: Play Kids Platform

## Overview

Play Kids platformasi - bu bolalar bog'chasi uchun to'liq raqamli yechim. Platforma ikki asosiy qismdan iborat:
1. **Public Website** - Ota-onalar uchun ma'lumot va xizmatlar
2. **Admin Panel** - Bog'cha ma'muriyati uchun boshqaruv tizimi

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Public Pages          │         Admin Panel                 │
│  ├── Home              │         ├── Login                   │
│  ├── About             │         ├── Dashboard               │
│  ├── Daily Life        │         ├── Children                │
│  ├── Weekly Menu       │         ├── Groups                  │
│  ├── Teachers          │         ├── Menu Management         │
│  ├── Enrollment        │         └── Enrollments             │
│  ├── Gallery           │                                     │
│  └── Contact           │                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)               │
├─────────────────────────────────────────────────────────────┤
│  API Routes:                                                 │
│  ├── /api/auth         - Authentication                      │
│  ├── /api/children     - Children CRUD                       │
│  ├── /api/groups       - Groups CRUD                         │
│  ├── /api/menu         - Weekly Menu CRUD                    │
│  ├── /api/enrollments  - Enrollment Applications             │
│  ├── /api/teachers     - Teachers Data                       │
│  └── /api/contact      - Contact Form + Telegram             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (JSON Files → PostgreSQL)        │
├─────────────────────────────────────────────────────────────┤
│  ├── users.json        - Admin users                         │
│  ├── children.json     - Children records                    │
│  ├── groups.json       - Groups data                         │
│  ├── menu.json         - Weekly menu                         │
│  ├── enrollments.json  - Enrollment applications             │
│  └── teachers.json     - Teachers data                       │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

```
src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Navigation.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   └── Loading.jsx
│   ├── public/
│   │   ├── Hero.jsx
│   │   ├── Benefits.jsx
│   │   ├── MenuTable.jsx
│   │   ├── TeacherCard.jsx
│   │   ├── EnrollmentForm.jsx
│   │   ├── GalleryGrid.jsx
│   │   └── ContactForm.jsx
│   └── admin/
│       ├── Sidebar.jsx
│       ├── StatsCard.jsx
│       ├── DataTable.jsx
│       ├── ChildForm.jsx
│       ├── GroupForm.jsx
│       └── MenuEditor.jsx
├── pages/
│   ├── public/
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── DailyLifePage.jsx
│   │   ├── MenuPage.jsx
│   │   ├── TeachersPage.jsx
│   │   ├── EnrollmentPage.jsx
│   │   ├── GalleryPage.jsx
│   │   └── ContactPage.jsx
│   └── admin/
│       ├── LoginPage.jsx
│       ├── DashboardPage.jsx
│       ├── ChildrenPage.jsx
│       ├── GroupsPage.jsx
│       ├── MenuManagementPage.jsx
│       └── EnrollmentsPage.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useFetch.js
│   └── useForm.js
├── context/
│   └── AuthContext.jsx
├── services/
│   └── api.js
└── utils/
    ├── validators.js
    └── formatters.js
```

### Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| POST | /api/auth/logout | Admin logout |
| GET | /api/auth/me | Get current user |
| GET | /api/children | List all children |
| POST | /api/children | Create child |
| PUT | /api/children/:id | Update child |
| DELETE | /api/children/:id | Delete child |
| GET | /api/groups | List all groups |
| POST | /api/groups | Create group |
| PUT | /api/groups/:id | Update group |
| GET | /api/menu | Get weekly menu |
| PUT | /api/menu | Update weekly menu |
| GET | /api/enrollments | List enrollments |
| POST | /api/enrollments | Submit enrollment |
| PUT | /api/enrollments/:id | Update status |
| GET | /api/teachers | List teachers |
| POST | /api/contact | Submit contact form |

## Data Models

### User (Admin)
```typescript
interface User {
  id: string;
  username: string;
  password: string; // hashed
  role: 'admin' | 'teacher';
  createdAt: Date;
}
```

### Child
```typescript
interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  groupId: string;
  parentName: string;
  parentPhone: string;
  allergies: string[];
  notes: string;
  enrolledAt: Date;
}
```

### Group
```typescript
interface Group {
  id: string;
  name: string;
  ageRange: string;
  capacity: number;
  teacherId: string;
}
```

### WeeklyMenu
```typescript
interface DayMenu {
  breakfast: { name: string; allergies: string[] };
  lunch: { name: string; allergies: string[] };
  snack: { name: string; allergies: string[] };
}

interface WeeklyMenu {
  monday: DayMenu;
  tuesday: DayMenu;
  wednesday: DayMenu;
  thursday: DayMenu;
  friday: DayMenu;
  saturday: DayMenu;
  sunday: DayMenu;
}
```

### Enrollment
```typescript
interface Enrollment {
  id: string;
  childName: string;
  birthDate: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  submittedAt: Date;
  processedAt?: Date;
}
```

### Teacher
```typescript
interface Teacher {
  id: string;
  name: string;
  role: string;
  experience: string;
  education: string;
  photo: string;
  bio: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Navigation Consistency
*For any* navigation link click, the Platform should navigate to the correct corresponding page without errors.
**Validates: Requirements 1.3**

### Property 2: Menu Data Completeness
*For any* weekly menu data, all 7 days must have breakfast, lunch, and snack entries with allergy information.
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 3: Menu Update Synchronization
*For any* menu update by admin, the public menu page should reflect the changes immediately after refresh.
**Validates: Requirements 4.4**

### Property 4: Teacher Profile Completeness
*For any* teacher in the database, the profile display must include name, role, experience, and photo.
**Validates: Requirements 5.1, 5.2**

### Property 5: Form Validation Completeness
*For any* enrollment form submission, all required fields (childName, birthDate, parentName, parentPhone) must be validated before submission.
**Validates: Requirements 6.3**

### Property 6: Enrollment Status Tracking
*For any* submitted enrollment, the status should be one of: pending, accepted, or rejected, and should be queryable by the parent.
**Validates: Requirements 6.5**

### Property 7: Gallery Filter Correctness
*For any* category filter applied, only photos matching that category should be displayed.
**Validates: Requirements 7.3**

### Property 8: Authentication Security
*For any* valid credentials, access should be granted; for any invalid credentials, access should be denied with error message.
**Validates: Requirements 9.2, 9.3**

### Property 9: Session Expiry Handling
*For any* expired session, the user should be redirected to login page when accessing protected routes.
**Validates: Requirements 9.4**

### Property 10: Children CRUD Operations
*For any* child record, create, read, update, and delete operations should maintain data integrity.
**Validates: Requirements 11.2, 11.3, 11.4**

### Property 11: Search and Filter Functionality
*For any* search query on children list, only matching records should be returned.
**Validates: Requirements 11.1**

### Property 12: Enrollment Workflow Integrity
*For any* enrollment approval or rejection, the status should update correctly and notification should be sent.
**Validates: Requirements 14.3, 14.4**

## Error Handling

### Frontend Errors
- Network errors: Display user-friendly message with retry option
- Validation errors: Show inline field-level error messages
- Authentication errors: Redirect to login with message
- 404 errors: Display custom not found page

### Backend Errors
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server-side error with logging

## Testing Strategy

### Unit Testing
- Component rendering tests
- Utility function tests
- Form validation tests
- API endpoint tests

### Property-Based Testing (fast-check)
- Menu data completeness property
- Form validation property
- Filter correctness property
- CRUD operation integrity property

### Integration Testing
- API endpoint integration
- Authentication flow
- Enrollment workflow
- Menu update synchronization
