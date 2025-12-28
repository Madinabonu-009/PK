// Core Admin Components
export { default as ProtectedRoute } from './ProtectedRoute'
export { default as SmartAssistant } from './SmartAssistant'
export { default as AdminLayout, useAdminLayout } from './AdminLayout'
export { default as ProSidebar } from './ProSidebar'
export { default as AdminHeader } from './AdminHeader'
export { default as CommandPalette } from './CommandPalette'

// Dashboard
export { default as KPICard, KPICardSkeleton, AnimatedCounter, TrendIndicator } from './dashboard/KPICard'
export { default as InteractiveCharts, ChartCard, PeriodSelector, ChartSkeleton, AttendanceLineChart, PaymentBarChart, EnrollmentPieChart, RevenueDoughnutChart } from './dashboard/InteractiveCharts'
export { default as LiveActivityFeed } from './dashboard/LiveActivityFeed'
export { default as AlertList } from './dashboard/AlertCard'
export { default as WeatherWidget } from './dashboard/WeatherWidget'

// Common
export { default as ProDataGrid } from './common/ProDataGrid'
export { default as SearchInput } from './common/SearchInput'
export { default as ConnectionStatus } from './common/ConnectionStatus'
export { default as Breadcrumb } from './common/Breadcrumb'

// Children
export { default as ChildCard } from './children/ChildCard'
export { default as QRCodeGenerator } from './children/QRCodeGenerator'
export { default as ActivityTimeline } from './children/ActivityTimeline'
export { default as PhotoUpload } from './children/PhotoUpload'

// Attendance
export { default as AttendanceGrid } from './attendance/AttendanceGrid'
export { default as QRScanner } from './attendance/QRScanner'
export { default as AttendanceHeatmap } from './attendance/AttendanceHeatmap'

// Finance
export { default as PaymentForm } from './finance/PaymentForm'
export { default as PaymentHistory } from './finance/PaymentHistory'
export { default as FinancialDashboard } from './finance/FinancialDashboard'
export { default as InvoiceGenerator } from './finance/InvoiceGenerator'

// Groups
export { default as GroupCard } from './groups/GroupCard'
export { default as GroupForm } from './groups/GroupForm'
export { default as GroupDetail } from './groups/GroupDetail'
export { default as GroupReports } from './groups/GroupReports'

// Calendar
export { default as EventCalendar } from './calendar/EventCalendar'
export { default as EventForm } from './calendar/EventForm'
export { default as RSVPTracker } from './calendar/RSVPTracker'
export { default as CalendarExport } from './calendar/CalendarExport'

// Menu
export { default as MenuCalendar } from './menu/MenuCalendar'
export { default as RecipeDatabase } from './menu/RecipeDatabase'
export { default as AllergenChecker } from './menu/AllergenChecker'
export { default as NutritionalCalculator } from './menu/NutritionalCalculator'
export { default as MealTemplates } from './menu/MealTemplates'
export { default as CostTracker } from './menu/CostTracker'
export { default as ShoppingListGenerator } from './menu/ShoppingListGenerator'
export { default as MenuPublisher } from './menu/MenuPublisher'

// Gallery
export { default as MediaGallery } from './gallery/MediaGallery'

// Messages
export { default as MessageComposer } from './messages/MessageComposer'
export { default as BroadcastMessaging } from './messages/BroadcastMessaging'
export { default as DeliveryTracker } from './messages/DeliveryTracker'
export { default as ScheduledMessages } from './messages/ScheduledMessages'
export { default as TelegramIntegration } from './messages/TelegramIntegration'
export { default as MessageTemplates } from './messages/MessageTemplates'

// Reports
export { default as ReportBuilder } from './reports/ReportBuilder'
export { default as ScheduledReports } from './reports/ScheduledReports'

// Users
export { default as UserManagement } from './users/UserManagement'
export { default as SessionManagement } from './users/SessionManagement'
export { default as TwoFactorAuth } from './users/TwoFactorAuth'
export { default as PasswordPolicies } from './users/PasswordPolicies'
export { default as SuspiciousActivity } from './users/SuspiciousActivity'

// Settings
export { default as SettingsPage } from './settings/SettingsPage'

// Mobile
export { BottomTabBar, PullToRefresh, SwipeActions, MobileHeader, FloatingActionButton } from './mobile/MobileNav'

// Search
export { default as GlobalSearch } from './search/GlobalSearch'
export { default as AdvancedFilters } from './search/AdvancedFilters'

// Analytics
export { default as AnalyticsDashboard } from './analytics/AnalyticsDashboard'
export { default as CustomizableWidgets } from './analytics/CustomizableWidgets'
export { default as DataExportAPI } from './analytics/DataExportAPI'
