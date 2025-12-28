# Design Document: Admin Panel Fixes

## Overview

Bu dizayn hujjati Play Kids admin panelida aniqlangan muammolarni tuzatish uchun mo'ljallangan. Asosiy muammolar:
1. CRUD operatsiyalari to'g'ri ishlamaydi
2. Enrollment qabul qilish jarayoni buzilgan
3. Authentication va session boshqaruvi muammolari
4. UI loading/error state yo'qligi
5. Backend API validation va error handling

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Tuzatilishi kerak:                                          │
│  ├── AuthContext - token refresh, session persistence        │
│  ├── api.js - error handling, response interceptors          │
│  ├── ChildrenPage - CRUD operations, UI state                │
│  ├── EnrollmentsPage - approve/reject workflow               │
│  └── All admin pages - loading/error states                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)               │
├─────────────────────────────────────────────────────────────┤
│  Tuzatilishi kerak:                                          │
│  ├── /api/children - PUT/DELETE operations                   │
│  ├── /api/enrollments - approve workflow, child creation     │
│  ├── /api/auth - token validation, refresh                   │
│  └── All routes - validation, error handling                 │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Aniqlangan Muammolar va Yechimlar

#### 1. CRUD Muammolari

**Muammo:** PUT/PATCH so'rovlari ishlamaydi, UI yangilanmaydi

**Sabab:**
- Frontend `id` ishlatadi, lekin MongoDB `_id` qaytaradi
- `fetchData()` o'chirishdan keyin chaqirilmaydi
- Form submit qilganda `selectedChild.id` undefined bo'lishi mumkin

**Yechim:**
```javascript
// Frontend - ID ni to'g'ri olish
const childId = selectedChild.id || selectedChild._id

// Backend - response da id qaytarish
res.json({ ...child, id: child._id || child.id })
```

#### 2. Enrollment Qabul Qilish Muammolari

**Muammo:** Status o'zgarmaydi, bola avtomatik qo'shilmaydi

**Sabab:**
- Frontend `enrollment.id` ishlatadi, backend `_id` kutadi
- Child yaratish logikasi to'liq emas
- Status "approved" va "accepted" farqi

**Yechim:**
```javascript
// Frontend - to'g'ri ID ishlatish
const enrollmentId = selectedEnrollment.id || selectedEnrollment._id

// Backend - status normalizatsiya
const finalStatus = (status === 'approved' || status === 'accepted') ? 'accepted' : status
```

#### 3. Auth Muammolari

**Muammo:** Token bor lekin 401/403, refresh qilganda logout

**Sabab:**
- Token localStorage da saqlanadi, lekin checkAuth() xato bersa o'chiriladi
- API interceptor 401 da darhol login ga redirect qiladi

**Yechim:**
```javascript
// AuthContext - token refresh qo'shish
const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken')
  if (!refresh) return false
  try {
    const response = await api.post('/auth/refresh', { refreshToken: refresh })
    localStorage.setItem('token', response.data.token)
    return true
  } catch {
    return false
  }
}
```

#### 4. UI State Muammolari

**Muammo:** Loading/error state yo'q

**Yechim:**
- Har bir sahifada `loading`, `error`, `submitting` state qo'shish
- Button disable qilish submitting paytida
- Error message ko'rsatish

## Data Models

### API Response Format (Standart)

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}
```

### ID Handling

```typescript
// Frontend da ID olish
const getId = (item: any): string => {
  return item.id || item._id || '';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: CRUD Update Consistency
*For any* child record update, the database should reflect the new values after a successful PUT request.
**Validates: Requirements 1.1**

### Property 2: CRUD Delete Consistency
*For any* child record deletion, the record should no longer exist in the database after a successful DELETE request.
**Validates: Requirements 1.2**

### Property 3: Form Validation
*For any* form submission with invalid data, the API should return 400 status with validation errors.
**Validates: Requirements 1.3, 5.1**

### Property 4: Enrollment Approval Status
*For any* enrollment approval, the status should change to "accepted" in the database.
**Validates: Requirements 2.1**

### Property 5: Enrollment to Child Conversion
*For any* approved enrollment, a corresponding child record should be created in the database.
**Validates: Requirements 2.2**

### Property 6: Enrollment Rejection Requires Reason
*For any* enrollment rejection without a reason, the API should return 400 status.
**Validates: Requirements 2.3**

### Property 7: Valid Token Access
*For any* request with a valid JWT token, the API should grant access to protected routes.
**Validates: Requirements 3.1**

### Property 8: Expired Token Rejection
*For any* request with an expired JWT token, the API should return 401 status.
**Validates: Requirements 3.2**

### Property 9: API Response Format
*For any* successful API operation, the response should follow the standard format with success flag.
**Validates: Requirements 5.2**

### Property 10: Not Found Response
*For any* request for a non-existent resource, the API should return 404 status.
**Validates: Requirements 5.4**

## Error Handling

### Frontend Error Handling

```javascript
// Centralized error handler
const handleApiError = (error, setError) => {
  if (error.response) {
    const message = error.response.data?.error || 
                   error.response.data?.message || 
                   'Xatolik yuz berdi'
    setError(message)
  } else if (error.request) {
    setError('Server bilan bog\'lanib bo\'lmadi')
  } else {
    setError('Kutilmagan xatolik')
  }
}
```

### Backend Error Handling

```javascript
// Consistent error response
const sendError = (res, status, message, details = null) => {
  const response = { success: false, error: message }
  if (details) response.details = details
  return res.status(status).json(response)
}
```

## Testing Strategy

### Unit Testing
- API endpoint tests with Jest
- Component rendering tests
- Validation function tests

### Property-Based Testing (fast-check)
- CRUD operation consistency
- Enrollment workflow integrity
- Authentication token handling
- API response format consistency

### Integration Testing
- Full enrollment approval workflow
- Authentication flow
- CRUD operations end-to-end

