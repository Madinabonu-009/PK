# Requirements Document

## Introduction

Play Kids admin panelida aniqlangan UI/dizayn muammolari va ob-havo widgetini haqiqiy API bilan ishlashini ta'minlash. Bu spec quyidagi muammolarni hal qiladi:
1. Ob-havo widgeti mock data ishlatmoqda - G'ijduvon uchun haqiqiy ob-havo ko'rsatilishi kerak
2. Settings sahifasida dizayn buzilgan - kartalar to'g'ri joylashmagan
3. Users sahifasida kartalar dizayni buzilgan
4. Chat sahifasida UI muammolari
5. Enrollments sahifasida jadval dizayni
6. Groups sahifasida modal dizayni

## Glossary

- **Platform**: Play Kids web platformasi
- **Admin_Panel**: Bog'cha ma'muriyati uchun boshqaruv tizimi
- **Weather_Widget**: Ob-havo ma'lumotlarini ko'rsatuvchi komponent
- **OpenWeatherMap_API**: Haqiqiy ob-havo ma'lumotlarini olish uchun API
- **G'ijduvon**: Buxoro viloyati, G'ijduvon tumani - ob-havo ko'rsatiladigan joy
- **UI_Layout**: Foydalanuvchi interfeysi joylashuvi

## Requirements

### Requirement 1: Haqiqiy Ob-havo Ma'lumotlari

**User Story:** As an admin, I want to see real weather data for G'ijduvon, so that I can plan outdoor activities for children.

#### Acceptance Criteria

1. WHEN the Weather_Widget loads THEN the Platform SHALL fetch real weather data from OpenWeatherMap_API for G'ijduvon coordinates (39.6722, 64.6853)
2. WHEN weather data is fetched THEN the Platform SHALL display current temperature, condition, humidity, and wind speed
3. WHEN the location is displayed THEN the Platform SHALL show "G'ijduvon" instead of "O'zbekiston"
4. WHEN API request fails THEN the Platform SHALL show cached data or fallback message
5. WHEN user clicks refresh THEN the Platform SHALL fetch fresh weather data from API

### Requirement 2: Settings Sahifasi Dizaynini Tuzatish

**User Story:** As an admin, I want the settings page to display correctly, so that I can easily navigate and configure settings.

#### Acceptance Criteria

1. WHEN settings page loads THEN the Platform SHALL display cards in proper grid layout without overlap
2. WHEN profile section is shown THEN the Platform SHALL display user info in organized card format
3. WHEN navigation tabs are clicked THEN the Platform SHALL switch content smoothly without layout shift

### Requirement 3: Users Sahifasi Dizaynini Tuzatish

**User Story:** As an admin, I want user cards to display properly, so that I can manage users effectively.

#### Acceptance Criteria

1. WHEN users page loads THEN the Platform SHALL display user cards in consistent grid layout
2. WHEN user card is shown THEN the Platform SHALL display all user info (name, role, contact) without text truncation issues
3. WHEN user tabs are clicked THEN the Platform SHALL filter users correctly with proper count badges

### Requirement 4: Chat Sahifasi Dizaynini Tuzatish

**User Story:** As an admin, I want the chat interface to work properly, so that I can communicate with parents.

#### Acceptance Criteria

1. WHEN chat page loads THEN the Platform SHALL display message list and chat area in proper two-column layout
2. WHEN messages are displayed THEN the Platform SHALL show sender info, timestamp, and message content clearly
3. WHEN quick reply buttons are clicked THEN the Platform SHALL insert reply text into input field

### Requirement 5: Enrollments Sahifasi Dizaynini Tuzatish

**User Story:** As an admin, I want enrollment table to display properly, so that I can review applications efficiently.

#### Acceptance Criteria

1. WHEN enrollments page loads THEN the Platform SHALL display table with proper column widths
2. WHEN status badges are shown THEN the Platform SHALL use consistent colors and sizing
3. WHEN action buttons are clicked THEN the Platform SHALL perform actions without UI glitches

### Requirement 6: Groups Modal Dizaynini Tuzatish

**User Story:** As an admin, I want group edit modal to display properly, so that I can edit group information easily.

#### Acceptance Criteria

1. WHEN group edit modal opens THEN the Platform SHALL display form fields in proper layout
2. WHEN modal is open THEN the Platform SHALL dim background and center modal properly
3. WHEN form is submitted THEN the Platform SHALL close modal and refresh group list

