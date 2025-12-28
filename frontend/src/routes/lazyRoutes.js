/**
 * Lazy loaded route components
 * Improves initial load time by code splitting
 */

import { lazy } from 'react'

// Public Pages - Lazy loaded
export const HomePage = lazy(() => import('../pages/public/HomePage'))
export const AboutPage = lazy(() => import('../pages/public/AboutPage'))
export const DailyLifePage = lazy(() => import('../pages/public/DailyLifePage'))
export const MenuPage = lazy(() => import('../pages/public/MenuPage'))
export const TeachersPage = lazy(() => import('../pages/public/TeachersPage'))
export const EnrollmentPage = lazy(() => import('../pages/public/EnrollmentPage'))
export const GalleryPage = lazy(() => import('../pages/public/GalleryPage'))
export const ContactPage = lazy(() => import('../pages/public/ContactPage'))
export const BlogPage = lazy(() => import('../pages/public/BlogPage'))
export const BlogPostPage = lazy(() => import('../pages/public/BlogPostPage'))
export const CalendarPage = lazy(() => import('../pages/public/CalendarPage'))
export const JournalPage = lazy(() => import('../pages/public/JournalPage'))
export const FeedbackPage = lazy(() => import('../pages/public/FeedbackPage'))
export const ChildrenPublicPage = lazy(() => import('../pages/public/ChildrenPage'))
export const TodayStoryPage = lazy(() => import('../pages/public/TodayStoryPage'))
export const CurriculumPage = lazy(() => import('../pages/public/CurriculumPage'))
export const MyChildPage = lazy(() => import('../pages/public/MyChildPage'))
export const ParentAuthPage = lazy(() => import('../pages/public/ParentAuthPage'))
export const ParentProfilePage = lazy(() => import('../pages/public/ParentProfilePage'))
export const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'))

// Admin Pages - Lazy loaded
export const LoginPage = lazy(() => import('../pages/admin/LoginPage'))
export const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'))
export const ChildrenPage = lazy(() => import('../pages/admin/ChildrenPage'))
export const ChildProfilePage = lazy(() => import('../pages/admin/ChildProfilePage'))
export const GroupsPage = lazy(() => import('../pages/admin/GroupsPage'))
export const MenuManagementPage = lazy(() => import('../pages/admin/MenuManagementPage'))
export const EnrollmentsPage = lazy(() => import('../pages/admin/EnrollmentsPage'))
export const PaymentsPage = lazy(() => import('../pages/admin/PaymentsPage'))
export const FeedbackManagementPage = lazy(() => import('../pages/admin/FeedbackManagementPage'))
export const AttendancePage = lazy(() => import('../pages/admin/AttendancePage'))
export const DailyReportsPage = lazy(() => import('../pages/admin/DailyReportsPage'))
export const DebtsPage = lazy(() => import('../pages/admin/DebtsPage'))
export const ChatPage = lazy(() => import('../pages/admin/ChatPage'))

// Preload critical pages
export const preloadCriticalPages = () => {
  // Preload pages that users are likely to visit
  import('../pages/public/HomePage')
  import('../pages/public/AboutPage')
  import('../pages/public/EnrollmentPage')
}

// Preload admin pages after login
export const preloadAdminPages = () => {
  import('../pages/admin/DashboardPage')
  import('../pages/admin/ChildrenPage')
  import('../pages/admin/GroupsPage')
}
