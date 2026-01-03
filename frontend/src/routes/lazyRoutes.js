/**
 * Lazy loaded route components
 * Improves initial load time by code splitting
 */

import { lazy } from 'react'

// Public Pages - Lazy loaded
export const HomePage = lazy(() => import('../pages/public/HomePage'))
export const AboutPage = lazy(() => import('../pages/public/AboutPage'))
export const MenuPage = lazy(() => import('../pages/public/MenuPage'))
export const TeachersPage = lazy(() => import('../pages/public/TeachersPage'))
export const EnrollmentPage = lazy(() => import('../pages/public/EnrollmentPage'))
export const GalleryPage = lazy(() => import('../pages/public/GalleryPage'))
export const ContactPage = lazy(() => import('../pages/public/ContactPage'))
export const FeedbackPage = lazy(() => import('../pages/public/FeedbackPage'))
export const CurriculumPage = lazy(() => import('../pages/public/CurriculumPage'))
export const GamesPage = lazy(() => import('../pages/public/GamesPage'))
export const LibraryPage = lazy(() => import('../pages/public/LibraryPage'))
export const OurChildrenPage = lazy(() => import('../pages/public/OurChildrenPage'))
export const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'))

// Admin Pages - Lazy loaded
export const LoginPage = lazy(() => import('../pages/admin/LoginPage'))
export const DashboardPage = lazy(() => import('../pages/admin/ProDashboard'))
export const ChildrenPage = lazy(() => import('../pages/admin/ChildrenPage'))
export const ChildProfilePage = lazy(() => import('../pages/admin/ChildProfilePage'))
export const GroupsPage = lazy(() => import('../pages/admin/GroupsPage'))
export const GroupDetailPage = lazy(() => import('../pages/admin/GroupDetailPage'))
export const MenuManagementPage = lazy(() => import('../pages/admin/MenuManagementPage'))
export const EnrollmentsPage = lazy(() => import('../pages/admin/EnrollmentsPage'))
export const PaymentsPage = lazy(() => import('../pages/admin/PaymentsPage'))
export const FeedbackManagementPage = lazy(() => import('../pages/admin/FeedbackManagementPage'))
export const AttendancePage = lazy(() => import('../pages/admin/AttendancePage'))
export const DailyReportsPage = lazy(() => import('../pages/admin/DailyReportsPage'))
export const DebtsPage = lazy(() => import('../pages/admin/DebtsPage'))
export const ChatPage = lazy(() => import('../pages/admin/ChatPage'))
export const GalleryManagementPage = lazy(() => import('../pages/admin/GalleryManagementPage'))
export const ProgressPage = lazy(() => import('../pages/admin/ProgressPage'))
export const TeacherDashboard = lazy(() => import('../pages/admin/TeacherDashboard'))
export const TelegramPage = lazy(() => import('../pages/admin/TelegramPage'))
export const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'))
export const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'))
export const UsersPage = lazy(() => import('../pages/admin/UsersPage'))
export const TeachersManagementPage = lazy(() => import('../pages/admin/TeachersManagementPage'))
export const LibraryManagementPage = lazy(() => import('../pages/admin/LibraryManagementPage'))

// Preload critical pages
export const preloadCriticalPages = () => {
  import('../pages/public/HomePage')
  import('../pages/public/AboutPage')
  import('../pages/public/EnrollmentPage')
}

// Preload admin pages after login
export const preloadAdminPages = () => {
  import('../pages/admin/ProDashboard')
  import('../pages/admin/ChildrenPage')
  import('../pages/admin/GroupsPage')
}
