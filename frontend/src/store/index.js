/**
 * Store Index
 * Issue #15: Centralized state management exports
 */

export {
  useUserStore,
  useUIStore,
  useNotificationStore,
  useLoadingStore,
  useIsAuthenticated,
  useCurrentUser,
  useUnreadCount
} from './useAppStore'

// Admin Panel Stores
export {
  useAdminDashboardStore,
  useAdminPreferencesStore,
  useAdminCacheStore,
  useDashboardStats,
  useDashboardAlerts,
  useDashboardActivities,
  useAdminPreferences,
  useSidebarCollapsed,
  useRecentItems,
  useFavorites
} from './useAdminStore'
