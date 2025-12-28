# Requirements Document

## Introduction

"Play Kids" — 2-6 yoshli bolalar uchun zamonaviy bog'cha platformasi. Bu ko'p sahifali web platforma bo'lib, ota-onalar uchun public sahifalar va bog'cha ma'muriyati uchun admin panel o'z ichiga oladi. Platforma bog'cha faoliyatini to'liq raqamlashtirish, ota-onalarga maksimal ishonch berish va boshqaruvni yengillashtirish maqsadida yaratiladi.

Shior: "Farzandingiz baxtli bo'lsa — kelajak porloq bo'ladi"

## Glossary

- **Platform**: Play Kids web platformasi
- **Parent**: Ota-ona foydalanuvchi
- **Admin**: Bog'cha ma'muriyati foydalanuvchisi
- **Child**: Bog'chadagi bola
- **Group**: Bolalar guruhi (kichik, o'rta, katta)
- **Enrollment**: Bog'chaga ro'yxatdan o'tish arizasi
- **Weekly Menu**: Haftalik ovqatlanish menyusi
- **Dashboard**: Admin panel bosh sahifasi

## Requirements

### Requirement 1: Public Home Page

**User Story:** As a parent visiting the website, I want to see a professional home page that builds trust, so that I can consider enrolling my child.

#### Acceptance Criteria

1. WHEN a parent visits the home page THEN the Platform SHALL display a hero section with Play Kids branding and main CTA
2. WHEN a parent views the home page THEN the Platform SHALL display key benefits and problem-solution sections
3. WHEN a parent clicks navigation links THEN the Platform SHALL navigate to corresponding pages smoothly
4. WHEN a parent views the home page THEN the Platform SHALL display trust indicators (statistics, testimonials preview)

### Requirement 2: About Us Page

**User Story:** As a parent, I want to learn about Play Kids philosophy and values, so that I can understand their educational approach.

#### Acceptance Criteria

1. WHEN a parent visits the About page THEN the Platform SHALL display Play Kids mission and philosophy
2. WHEN a parent views the About page THEN the Platform SHALL display the educational approach and methodology
3. WHEN a parent views the About page THEN the Platform SHALL display core values with visual representations

### Requirement 3: Daily Life Page

**User Story:** As a parent, I want to see what a typical day looks like at the kindergarten, so that I can understand my child's daily routine.

#### Acceptance Criteria

1. WHEN a parent visits the Daily Life page THEN the Platform SHALL display a detailed daily schedule
2. WHEN a parent views the schedule THEN the Platform SHALL show activities for each time slot (learning, play, meals, rest)
3. WHEN a parent views the page THEN the Platform SHALL display educational activities and play descriptions

### Requirement 4: Weekly Menu Page

**User Story:** As a parent, I want to see the weekly meal menu, so that I know what my child will eat each day.

#### Acceptance Criteria

1. WHEN a parent visits the Weekly Menu page THEN the Platform SHALL display meals for each day (Monday-Sunday)
2. WHEN a parent views a day's menu THEN the Platform SHALL show breakfast, lunch, and snack details
3. WHEN a parent views the menu THEN the Platform SHALL display allergy information for each meal
4. WHEN admin updates the menu THEN the Platform SHALL reflect changes on the public page immediately

### Requirement 5: Teachers Page

**User Story:** As a parent, I want to see information about teachers, so that I can trust the people caring for my child.

#### Acceptance Criteria

1. WHEN a parent visits the Teachers page THEN the Platform SHALL display teacher profiles with photos
2. WHEN a parent views a teacher profile THEN the Platform SHALL show name, role, experience, and qualifications
3. WHEN a parent views the page THEN the Platform SHALL display the teacher's educational approach

### Requirement 6: Online Enrollment

**User Story:** As a parent, I want to enroll my child online, so that I can register without visiting in person.

#### Acceptance Criteria

1. WHEN a parent visits the Enrollment page THEN the Platform SHALL display an enrollment form
2. WHEN a parent fills the form THEN the Platform SHALL collect child name, birth date, parent contact, and additional notes
3. WHEN a parent submits the form THEN the Platform SHALL validate all required fields before submission
4. WHEN enrollment is submitted THEN the Platform SHALL send notification to admin and confirmation to parent
5. WHEN a parent checks status THEN the Platform SHALL display application status (pending/accepted/rejected)

### Requirement 7: Gallery Page

**User Story:** As a parent, I want to see photos of the kindergarten and activities, so that I can visualize the environment.

#### Acceptance Criteria

1. WHEN a parent visits the Gallery page THEN the Platform SHALL display categorized photo gallery
2. WHEN a parent clicks a photo THEN the Platform SHALL open it in a lightbox view
3. WHEN a parent filters by category THEN the Platform SHALL show only matching photos

### Requirement 8: Contact Page

**User Story:** As a parent, I want to contact the kindergarten easily, so that I can ask questions or schedule a visit.

#### Acceptance Criteria

1. WHEN a parent visits the Contact page THEN the Platform SHALL display contact form, phone, and messaging links
2. WHEN a parent submits the contact form THEN the Platform SHALL send message to admin via Telegram
3. WHEN a parent views the page THEN the Platform SHALL display location map and address

### Requirement 9: Admin Authentication

**User Story:** As an admin, I want to securely log in to the admin panel, so that only authorized users can access management features.

#### Acceptance Criteria

1. WHEN an admin visits the admin URL THEN the Platform SHALL display a login form
2. WHEN an admin enters valid credentials THEN the Platform SHALL grant access to the dashboard
3. WHEN an admin enters invalid credentials THEN the Platform SHALL display an error message
4. WHEN an admin session expires THEN the Platform SHALL redirect to login page

### Requirement 10: Admin Dashboard

**User Story:** As an admin, I want to see an overview of kindergarten statistics, so that I can monitor operations at a glance.

#### Acceptance Criteria

1. WHEN an admin views the dashboard THEN the Platform SHALL display total children count, pending enrollments, and group statistics
2. WHEN an admin views the dashboard THEN the Platform SHALL display recent enrollment applications
3. WHEN an admin views the dashboard THEN the Platform SHALL display quick action buttons for common tasks

### Requirement 11: Children Management

**User Story:** As an admin, I want to manage children records, so that I can track all enrolled children.

#### Acceptance Criteria

1. WHEN an admin views children list THEN the Platform SHALL display all children with search and filter options
2. WHEN an admin adds a child THEN the Platform SHALL create a new child record with required information
3. WHEN an admin edits a child THEN the Platform SHALL update the child's information
4. WHEN an admin deletes a child THEN the Platform SHALL remove the child record after confirmation

### Requirement 12: Groups Management

**User Story:** As an admin, I want to manage groups, so that I can organize children by age.

#### Acceptance Criteria

1. WHEN an admin views groups THEN the Platform SHALL display all groups with child counts
2. WHEN an admin creates a group THEN the Platform SHALL add a new group with name and age range
3. WHEN an admin assigns children THEN the Platform SHALL update group membership

### Requirement 13: Weekly Menu Management

**User Story:** As an admin, I want to manage the weekly menu, so that parents can see updated meal information.

#### Acceptance Criteria

1. WHEN an admin views menu management THEN the Platform SHALL display current week's menu
2. WHEN an admin edits a meal THEN the Platform SHALL update the menu item with new details
3. WHEN an admin saves changes THEN the Platform SHALL publish updates to the public menu page

### Requirement 14: Enrollment Applications Management

**User Story:** As an admin, I want to review and process enrollment applications, so that I can accept or reject new students.

#### Acceptance Criteria

1. WHEN an admin views applications THEN the Platform SHALL display all applications with status filters
2. WHEN an admin reviews an application THEN the Platform SHALL show full application details
3. WHEN an admin approves an application THEN the Platform SHALL update status and notify parent
4. WHEN an admin rejects an application THEN the Platform SHALL update status with reason and notify parent
