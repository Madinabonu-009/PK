# Requirements Document

## Introduction

Bu loyiha Play Kids bog'cha platformasining admin paneli va public sahifalarini professional darajada yaxshilash, barcha demo funksiyalarni real ishlaydigan qilish, va hardcode ranglar/matnlarni olib tashlashga qaratilgan. Loyiha uch asosiy yo'nalishda ishlaydi: dizayn yaxshilash, funksionallikni real qilish, va konfiguratsiya tizimini yaratish.

## Glossary

- **Admin_Panel**: Bog'cha boshqaruvi uchun administrator interfeysi
- **Public_Pages**: Ota-onalar va mehmonlar uchun ochiq sahifalar
- **Theme_System**: Rang va stil o'zgaruvchilarini boshqaruvchi tizim
- **i18n_System**: Ko'p tilli qo'llab-quvvatlash tizimi (internationalization)
- **Config_System**: Sayt sozlamalarini markazlashtirilgan boshqarish tizimi
- **Design_Tokens**: CSS o'zgaruvchilari orqali boshqariladigan dizayn qiymatlari
- **Demo_Function**: Hozirda ishlamaydigan yoki mock ma'lumotlar bilan ishlaydigan funksiya
- **Real_Function**: Backend API bilan to'liq integratsiyalangan ishlaydigan funksiya

## Requirements

### Requirement 1: Login sahifasi dizaynini professional darajada yaxshilash

**User Story:** As an administrator, I want a professional and visually appealing login page, so that I have a positive first impression of the admin panel.

#### Acceptance Criteria

1. WHEN the login page loads, THE Login_Page SHALL display a modern, professional design with smooth animations
2. WHEN the user interacts with form fields, THE Login_Page SHALL provide visual feedback through focus states and micro-interactions
3. THE Login_Page SHALL use only CSS variables from the Theme_System for all colors and styling
4. WHEN the theme changes, THE Login_Page SHALL adapt its appearance accordingly without hardcoded colors
5. THE Login_Page SHALL display the kindergarten branding from Config_System instead of hardcoded text

### Requirement 2: Admin Panel dizaynini professional darajada yaxshilash

**User Story:** As an administrator, I want a modern and intuitive admin panel design, so that I can efficiently manage the kindergarten operations.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use consistent Design_Tokens across all pages for colors, spacing, and typography
2. WHEN navigating between admin pages, THE Admin_Panel SHALL provide smooth page transitions
3. THE Admin_Panel SHALL display responsive layouts that work on desktop, tablet, and mobile devices
4. WHEN hovering or clicking on interactive elements, THE Admin_Panel SHALL provide appropriate visual feedback
5. THE Admin_Panel SHALL use the i18n_System for all text content instead of hardcoded strings
6. WHEN data is loading, THE Admin_Panel SHALL display skeleton loaders instead of blank screens

### Requirement 3: Public sahifalar dizaynini professional darajada yaxshilash

**User Story:** As a parent visiting the website, I want an attractive and informative public website, so that I can learn about the kindergarten and enroll my child.

#### Acceptance Criteria

1. THE Public_Pages SHALL use consistent Design_Tokens for visual harmony across all pages
2. WHEN scrolling, THE Public_Pages SHALL display smooth scroll animations and reveal effects
3. THE Public_Pages SHALL be fully responsive and mobile-friendly
4. THE Public_Pages SHALL use the i18n_System for all text content in Uzbek, Russian, and English
5. WHEN the theme changes, THE Public_Pages SHALL adapt colors and styling from Theme_System
6. THE Public_Pages SHALL load images lazily for better performance

### Requirement 4: Hardcode ranglar va matnlarni olib tashlash

**User Story:** As a developer, I want all colors and texts to be configurable, so that the application is maintainable and customizable.

#### Acceptance Criteria

1. THE Theme_System SHALL define all colors as CSS custom properties in index.css
2. WHEN a component uses a color, THE Component SHALL reference CSS variables instead of hardcoded hex/rgb values
3. THE i18n_System SHALL contain all user-facing text strings for all supported languages
4. WHEN a component displays text, THE Component SHALL retrieve it from i18n_System
5. THE Config_System SHALL store all configurable values like contact info, statistics, and branding
6. WHEN configuration values are needed, THE Component SHALL retrieve them from Config_System

### Requirement 5: Demo funksiyalarni real ishlaydigan qilish - Telegram integratsiyasi

**User Story:** As an administrator, I want the Telegram messaging feature to actually send messages, so that I can communicate with parents effectively.

#### Acceptance Criteria

1. WHEN the admin clicks "Send Menu", THE Telegram_Service SHALL send the actual daily menu to the Telegram channel
2. WHEN the admin clicks "Send Attendance", THE Telegram_Service SHALL send the real attendance report
3. WHEN the admin sends a custom message, THE Telegram_Service SHALL deliver it to the configured Telegram channel
4. IF the Telegram bot is not configured, THEN THE Telegram_Page SHALL display a clear setup guide
5. WHEN a message is sent successfully, THE Telegram_Page SHALL display a success notification with details

### Requirement 6: Demo funksiyalarni real ishlaydigan qilish - Analytics

**User Story:** As an administrator, I want real analytics and statistics, so that I can make data-driven decisions about the kindergarten.

#### Acceptance Criteria

1. WHEN the analytics page loads, THE Analytics_Page SHALL display real data from the database
2. THE Analytics_Page SHALL show accurate attendance statistics calculated from actual records
3. THE Analytics_Page SHALL display real payment and debt statistics
4. THE Analytics_Page SHALL show enrollment trends based on actual enrollment data
5. WHEN date filters are applied, THE Analytics_Page SHALL recalculate statistics for the selected period

### Requirement 7: Demo funksiyalarni real ishlaydigan qilish - Dashboard

**User Story:** As an administrator, I want the dashboard to show real-time accurate data, so that I can monitor the kindergarten status at a glance.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE Dashboard_Page SHALL fetch and display real statistics from the backend
2. THE Dashboard_Page SHALL show accurate count of children, attendance, and pending enrollments
3. THE Dashboard_Page SHALL display real alerts for children with attendance issues or debts
4. WHEN data changes in the system, THE Dashboard_Page SHALL reflect updates when refreshed
5. THE Dashboard_Page SHALL calculate and display accurate attendance percentages

### Requirement 8: Demo funksiyalarni real ishlaydigan qilish - Reports

**User Story:** As an administrator, I want to generate real reports, so that I can track and document kindergarten activities.

#### Acceptance Criteria

1. WHEN generating a daily report, THE Reports_System SHALL compile actual attendance and activity data
2. THE Reports_System SHALL allow exporting reports in PDF or Excel format
3. WHEN viewing historical reports, THE Reports_System SHALL retrieve actual saved report data
4. THE Reports_System SHALL calculate accurate financial summaries from payment records

### Requirement 9: Barcha sahifalarda theme qo'llab-quvvatlash

**User Story:** As a user, I want to switch between light, dark, and colorful themes, so that I can use the application comfortably in any environment.

#### Acceptance Criteria

1. WHEN the user selects a theme, THE Theme_System SHALL apply the selected theme across all pages
2. THE Theme_System SHALL persist the selected theme in local storage
3. WHEN the application loads, THE Theme_System SHALL restore the previously selected theme
4. THE Theme_System SHALL support light, dark, and colorful theme variants
5. WHEN theme changes, THE Application SHALL smoothly transition colors without page reload

### Requirement 10: Performance va UX yaxshilash

**User Story:** As a user, I want the application to be fast and responsive, so that I can complete tasks efficiently.

#### Acceptance Criteria

1. WHEN pages load, THE Application SHALL display content within 2 seconds on average connections
2. THE Application SHALL use lazy loading for images and heavy components
3. WHEN forms are submitted, THE Application SHALL provide immediate feedback
4. THE Application SHALL cache API responses where appropriate to reduce loading times
5. WHEN errors occur, THE Application SHALL display user-friendly error messages with recovery options
