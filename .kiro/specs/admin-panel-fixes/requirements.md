# Requirements Document

## Introduction

Play Kids bog'cha boshqaruv tizimining admin panelidagi ishlamayotgan yoki xato berayotgan funksiyalarni tuzatish. Bu spec mavjud kodlarni to'g'rilash va mustahkamlashga qaratilgan bo'lib, yangi funksiyalar qo'shilmaydi.

## Glossary

- **Platform**: Play Kids web platformasi
- **Admin Panel**: Bog'cha ma'muriyati uchun boshqaruv tizimi
- **CRUD**: Create, Read, Update, Delete operatsiyalari
- **Enrollment**: Bog'chaga ro'yxatdan o'tish arizasi
- **JWT**: JSON Web Token - autentifikatsiya uchun
- **UI State**: Frontend holatini boshqarish

## Requirements

### Requirement 1: CRUD Operatsiyalarini Tuzatish

**User Story:** As an admin, I want CRUD operations to work correctly, so that I can manage children, groups, and other data reliably.

#### Acceptance Criteria

1. WHEN an admin updates a child record THEN the Platform SHALL save changes to database and update UI immediately
2. WHEN an admin deletes a record THEN the Platform SHALL remove it from database and refresh the UI list
3. WHEN an admin submits a form THEN the Platform SHALL validate data and save to database with proper error handling
4. WHEN a database operation fails THEN the Platform SHALL display a clear error message to the user

### Requirement 2: Enrollment Qabul Qilish Jarayonini Tuzatish

**User Story:** As an admin, I want to approve enrollments and have children automatically added, so that the enrollment workflow is seamless.

#### Acceptance Criteria

1. WHEN an admin approves an enrollment THEN the Platform SHALL change status to "accepted" and save to database
2. WHEN an enrollment is approved THEN the Platform SHALL create a new child record automatically
3. WHEN an enrollment is rejected THEN the Platform SHALL require a rejection reason and update status
4. WHEN enrollment status changes THEN the Platform SHALL refresh the enrollments list in UI
5. WHEN an enrollment is processed THEN the Platform SHALL send notification via Telegram

### Requirement 3: Authentication va Session Boshqaruvini Tuzatish

**User Story:** As an admin, I want authentication to work reliably, so that I can access the admin panel without unexpected logouts.

#### Acceptance Criteria

1. WHEN a valid token exists THEN the Platform SHALL allow access to protected routes
2. WHEN a token expires THEN the Platform SHALL redirect to login with appropriate message
3. WHEN page is refreshed THEN the Platform SHALL maintain authentication state if token is valid
4. WHEN API returns 401 THEN the Platform SHALL clear token and redirect to login

### Requirement 4: UI Loading va Error State Qo'shish

**User Story:** As an admin, I want clear feedback during operations, so that I understand what is happening.

#### Acceptance Criteria

1. WHEN an API request is in progress THEN the Platform SHALL show loading indicator
2. WHEN an API request fails THEN the Platform SHALL display error message with retry option
3. WHEN a form is submitting THEN the Platform SHALL disable submit button to prevent double submission
4. WHEN an operation succeeds THEN the Platform SHALL show success feedback

### Requirement 5: Backend API Validatsiya va Error Handling

**User Story:** As a developer, I want consistent API responses, so that frontend can handle all cases properly.

#### Acceptance Criteria

1. WHEN API receives invalid data THEN the Platform SHALL return 400 status with validation errors
2. WHEN API operation succeeds THEN the Platform SHALL return consistent response format
3. WHEN database operation fails THEN the Platform SHALL return 500 status with error message
4. WHEN resource not found THEN the Platform SHALL return 404 status with clear message

