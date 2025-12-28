# Requirements Document

## Introduction

Bu hujjat deploy qilingan loyihadagi muammolarni tuzatish uchun talablarni belgilaydi. Asosiy muammolar: fikr qoldirish funksiyasi ishlamayapti, galereyadagi ba'zi media fayllar ochilmayapti, kutubxonadagi YouTube videolari ishlamayapti, va mobil ko'rinishda ba'zi sahifalar topilmayapti.

## Glossary

- **Feedback_System**: Foydalanuvchilar fikr qoldiradigan tizim
- **Gallery_System**: Rasm va videolarni ko'rsatadigan galereya komponenti
- **Library_System**: YouTube videolarini ko'rsatadigan kutubxona komponenti
- **API_Service**: Backend bilan aloqa qiluvchi frontend servisi
- **Mobile_Navigation**: Mobil qurilmalarda navigatsiya tizimi

## Requirements

### Requirement 1: Feedback API URL Configuration

**User Story:** As a user, I want to submit feedback on the deployed site, so that I can share my experience with the kindergarten.

#### Acceptance Criteria

1. WHEN the application is deployed, THE Feedback_System SHALL use environment-based API URLs instead of hardcoded localhost URLs
2. WHEN a user submits feedback, THE Feedback_System SHALL send the request to the correct production API endpoint
3. WHEN fetching existing feedbacks, THE Feedback_System SHALL retrieve data from the production API
4. IF the API request fails, THEN THE Feedback_System SHALL display a user-friendly error message

### Requirement 2: Gallery Media URL Resolution

**User Story:** As a user, I want to view all gallery images and videos, so that I can see the kindergarten activities.

#### Acceptance Criteria

1. WHEN displaying gallery items, THE Gallery_System SHALL correctly resolve media URLs for both local and remote files
2. WHEN a media file is stored on the backend server, THE Gallery_System SHALL prepend the correct API base URL
3. WHEN a video is from YouTube or Google Drive, THE Gallery_System SHALL use the appropriate embed format
4. IF a media file fails to load, THEN THE Gallery_System SHALL display a placeholder and not break the page

### Requirement 3: Library YouTube Video Embedding

**User Story:** As a user, I want to watch educational videos in the library section, so that children can learn through stories.

#### Acceptance Criteria

1. WHEN displaying YouTube videos, THE Library_System SHALL use the correct embed URL format
2. WHEN a user clicks on a video, THE Library_System SHALL open the video player with autoplay enabled
3. WHEN the video player is opened, THE Library_System SHALL allow fullscreen mode
4. IF a YouTube video is unavailable, THEN THE Library_System SHALL display an appropriate message

### Requirement 4: Mobile Navigation Routing

**User Story:** As a mobile user, I want to navigate to all pages without errors, so that I can access all features on my phone.

#### Acceptance Criteria

1. WHEN navigating on mobile devices, THE Mobile_Navigation SHALL correctly route to all defined pages
2. WHEN a route is accessed directly via URL, THE Mobile_Navigation SHALL render the correct page component
3. WHEN using the mobile bottom navigation, THE Mobile_Navigation SHALL navigate to the correct routes
4. IF a route is not found, THEN THE Mobile_Navigation SHALL display the 404 page with navigation options

### Requirement 5: API Service Configuration

**User Story:** As a developer, I want the API service to use correct URLs in all environments, so that the application works in both development and production.

#### Acceptance Criteria

1. THE API_Service SHALL read the base URL from environment variables
2. WHEN VITE_API_URL is set, THE API_Service SHALL use it as the base URL
3. WHEN VITE_API_URL is not set, THE API_Service SHALL fall back to a relative path '/api'
4. WHEN making requests to the backend, THE API_Service SHALL include proper CORS headers
