import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header, Footer, ErrorBoundary, MobileBottomNav, PageLoader, OfflineIndicator, ToastProvider } from './components/common'
import { ProtectedRoute, AdminLayout as ProAdminLayout } from './components/admin'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { GamificationProvider } from './context/GamificationContext'
import { NotificationProvider, PageTransition, ThemeTransition, BackToTop, ScrollProgressLine } from './components/animations'
import ChatButton from './components/common/ChatButton'
import InstallPrompt from './components/pwa/InstallPrompt'

// Public pages
const HomePage = lazy(() => import('./pages/public/HomePage'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const DailyLifePage = lazy(() => import('./pages/public/DailyLifePage'))
const MenuPage = lazy(() => import('./pages/public/MenuPage'))
const StaffPage = lazy(() => import('./pages/public/TeachersPage'))
const EnrollmentPage = lazy(() => import('./pages/public/EnrollmentPage'))
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'))
const ContactPage = lazy(() => import('./pages/public/ContactPage'))
const FeedbackPage = lazy(() => import('./pages/public/FeedbackPage'))
const CurriculumPage = lazy(() => import('./pages/public/CurriculumPage'))
const GamesPage = lazy(() => import('./pages/public/GamesPage'))
const LibraryPage = lazy(() => import('./pages/public/LibraryPage'))
const OurChildrenPage = lazy(() => import('./pages/public/OurChildrenPage'))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'))

// Admin pages
const LoginPage = lazy(() => import('./pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('./pages/admin/ProDashboard'))
const ChildrenPage = lazy(() => import('./pages/admin/ChildrenPage'))
const ChildProfilePage = lazy(() => import('./pages/admin/ChildProfilePage'))
const GroupsPage = lazy(() => import('./pages/admin/GroupsPage'))
const GroupDetailPage = lazy(() => import('./pages/admin/GroupDetailPage'))
const MenuManagementPage = lazy(() => import('./pages/admin/MenuManagementPage'))
const EnrollmentsPage = lazy(() => import('./pages/admin/EnrollmentsPage'))
const PaymentsPage = lazy(() => import('./pages/admin/PaymentsPage'))
const FeedbackManagementPage = lazy(() => import('./pages/admin/FeedbackManagementPage'))
const AttendancePage = lazy(() => import('./pages/admin/AttendancePage'))
const DailyReportsPage = lazy(() => import('./pages/admin/DailyReportsPage'))
const DebtsPage = lazy(() => import('./pages/admin/DebtsPage'))
const ChatPage = lazy(() => import('./pages/admin/ChatPage'))
const GalleryManagementPage = lazy(() => import('./pages/admin/GalleryManagementPage'))
const ProgressPage = lazy(() => import('./pages/admin/ProgressPage'))
const StoriesManagementPage = lazy(() => import('./pages/admin/StoriesManagementPage'))
const StaffDashboard = lazy(() => import('./pages/admin/TeacherDashboard'))
const TelegramPage = lazy(() => import('./pages/admin/TelegramPage'))
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'))
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'))
const UsersPage = lazy(() => import('./pages/admin/UsersPage'))

function ChatButtonWrapper() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) return null
  return <ChatButton />
}

function PublicLayout({ children }) {
  return (
    <ErrorBoundary>
      <ScrollProgressLine />
      <Header />
      <main className="main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </ErrorBoundary>
  )
}

function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <ProAdminLayout>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </ProAdminLayout>
    </ProtectedRoute>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/daily-life" element={<PublicLayout><DailyLifePage /></PublicLayout>} />
        <Route path="/menu" element={<PublicLayout><MenuPage /></PublicLayout>} />
        <Route path="/staff" element={<PublicLayout><StaffPage /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
        <Route path="/our-children" element={<PublicLayout><OurChildrenPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/enrollment" element={<PublicLayout><EnrollmentPage /></PublicLayout>} />
        <Route path="/feedback" element={<PublicLayout><FeedbackPage /></PublicLayout>} />
        <Route path="/curriculum" element={<PublicLayout><CurriculumPage /></PublicLayout>} />
        <Route path="/games" element={<PublicLayout><GamesPage /></PublicLayout>} />
        <Route path="/library" element={<PublicLayout><LibraryPage /></PublicLayout>} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminLayout><DashboardPage /></AdminLayout>} />
        <Route path="/admin/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/admin/dashboard" element={<AdminLayout><DashboardPage /></AdminLayout>} />
        <Route path="/admin/children" element={<AdminLayout><ChildrenPage /></AdminLayout>} />
        <Route path="/admin/children/:id" element={<AdminLayout><ChildProfilePage /></AdminLayout>} />
        <Route path="/admin/groups" element={<AdminLayout><GroupsPage /></AdminLayout>} />
        <Route path="/admin/groups/:id" element={<AdminLayout><GroupDetailPage /></AdminLayout>} />
        <Route path="/admin/menu" element={<AdminLayout><MenuManagementPage /></AdminLayout>} />
        <Route path="/admin/enrollments" element={<AdminLayout><EnrollmentsPage /></AdminLayout>} />
        <Route path="/admin/payments" element={<AdminLayout><PaymentsPage /></AdminLayout>} />
        <Route path="/admin/feedback" element={<AdminLayout><FeedbackManagementPage /></AdminLayout>} />
        <Route path="/admin/attendance" element={<AdminLayout><AttendancePage /></AdminLayout>} />
        <Route path="/admin/daily-reports" element={<AdminLayout><DailyReportsPage /></AdminLayout>} />
        <Route path="/admin/debts" element={<AdminLayout><DebtsPage /></AdminLayout>} />
        <Route path="/admin/chat" element={<AdminLayout><ChatPage /></AdminLayout>} />
        <Route path="/admin/gallery" element={<AdminLayout><GalleryManagementPage /></AdminLayout>} />
        <Route path="/admin/progress" element={<AdminLayout><ProgressPage /></AdminLayout>} />
        <Route path="/admin/stories" element={<AdminLayout><StoriesManagementPage /></AdminLayout>} />
        <Route path="/admin/staff" element={<AdminLayout><StaffDashboard /></AdminLayout>} />
        <Route path="/admin/telegram" element={<AdminLayout><TelegramPage /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />
        <Route path="/admin/analytics" element={<AdminLayout><AnalyticsPage /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><UsersPage /></AdminLayout>} />
        
        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <GamificationProvider>
            <NotificationProvider>
              <ToastProvider>
                <ErrorBoundary fallback={({ error, reset }) => (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif'
                  }}>
                    <h1 style={{ color: '#ef4444', marginBottom: '16px' }}>Xatolik yuz berdi</h1>
                    <p style={{ color: '#666', marginBottom: '24px' }}>Sahifani qayta yuklang yoki bosh sahifaga qayting</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => window.location.reload()} 
                        style={{ 
                          padding: '12px 24px', 
                          background: '#667eea', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Qayta yuklash
                      </button>
                      <button 
                        onClick={() => window.location.href = '/'} 
                        style={{ 
                          padding: '12px 24px', 
                          background: '#e5e7eb', 
                          color: '#333', 
                          border: 'none', 
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Bosh sahifa
                      </button>
                    </div>
                  </div>
                )}>
                  <Suspense fallback={<PageLoader />}>
                    <div className="app">
                      <OfflineIndicator />
                      <ThemeTransition />
                      <AnimatedRoutes />
                      <MobileBottomNav />
                      <ChatButtonWrapper />
                      <BackToTop showAfter={400} />
                      <InstallPrompt />
                    </div>
                  </Suspense>
                </ErrorBoundary>
              </ToastProvider>
            </NotificationProvider>
          </GamificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
