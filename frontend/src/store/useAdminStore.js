/**
 * Admin Panel Store using Zustand
 * Professional admin panel state management
 */

import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

// Admin Dashboard Store
export const useAdminDashboardStore = create(
  devtools(
    (set, get) => ({
      // Dashboard stats
      stats: {
        totalChildren: 0,
        presentToday: 0,
        absentToday: 0,
        pendingEnrollments: 0,
        totalDebt: 0,
        debtorCount: 0,
        totalGroups: 0,
        totalTeachers: 0
      },
      
      // Alerts
      alerts: [],
      
      // Recent activities
      activities: [],
      
      // Loading states
      isLoading: false,
      lastUpdated: null,
      
      // Actions
      setStats: (stats) => set({ stats, lastUpdated: new Date() }),
      
      updateStat: (key, value) => set((state) => ({
        stats: { ...state.stats, [key]: value }
      })),
      
      setAlerts: (alerts) => set({ alerts }),
      
      addAlert: (alert) => set((state) => ({
        alerts: [{ id: Date.now(), ...alert }, ...state.alerts].slice(0, 20)
      })),
      
      dismissAlert: (id) => set((state) => ({
        alerts: state.alerts.filter(a => a.id !== id)
      })),
      
      setActivities: (activities) => set({ activities }),
      
      addActivity: (activity) => set((state) => ({
        activities: [
          { id: Date.now(), timestamp: new Date(), ...activity },
          ...state.activities
        ].slice(0, 50)
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      reset: () => set({
        stats: {
          totalChildren: 0,
          presentToday: 0,
          absentToday: 0,
          pendingEnrollments: 0,
          totalDebt: 0,
          debtorCount: 0,
          totalGroups: 0,
          totalTeachers: 0
        },
        alerts: [],
        activities: [],
        isLoading: false,
        lastUpdated: null
      })
    }),
    { name: 'AdminDashboardStore' }
  )
)

// Admin Preferences Store (persisted)
export const useAdminPreferencesStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Sidebar
        sidebarCollapsed: false,
        sidebarPinned: true,
        
        // View preferences
        defaultView: 'grid', // 'grid' | 'list' | 'table'
        itemsPerPage: 10,
        
        // Dashboard widgets
        dashboardWidgets: [
          { id: 'kpi-children', enabled: true, order: 0 },
          { id: 'kpi-attendance', enabled: true, order: 1 },
          { id: 'kpi-payments', enabled: true, order: 2 },
          { id: 'kpi-enrollments', enabled: true, order: 3 },
          { id: 'chart-attendance', enabled: true, order: 4 },
          { id: 'chart-revenue', enabled: true, order: 5 },
          { id: 'activity-feed', enabled: true, order: 6 },
          { id: 'alerts', enabled: true, order: 7 }
        ],
        
        // Notification preferences
        notificationSound: true,
        desktopNotifications: true,
        emailNotifications: true,
        
        // Recent items
        recentItems: [],
        favorites: [],
        
        // Saved filters
        savedFilters: {},
        
        // Actions
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        
        setDefaultView: (view) => set({ defaultView: view }),
        setItemsPerPage: (count) => set({ itemsPerPage: count }),
        
        updateWidget: (id, updates) => set((state) => ({
          dashboardWidgets: state.dashboardWidgets.map(w =>
            w.id === id ? { ...w, ...updates } : w
          )
        })),
        
        reorderWidgets: (widgets) => set({ dashboardWidgets: widgets }),
        
        setNotificationSound: (enabled) => set({ notificationSound: enabled }),
        setDesktopNotifications: (enabled) => set({ desktopNotifications: enabled }),
        setEmailNotifications: (enabled) => set({ emailNotifications: enabled }),
        
        addRecentItem: (item) => set((state) => ({
          recentItems: [
            { ...item, visitedAt: new Date() },
            ...state.recentItems.filter(i => i.id !== item.id)
          ].slice(0, 10)
        })),
        
        toggleFavorite: (item) => set((state) => {
          const exists = state.favorites.find(f => f.id === item.id)
          return {
            favorites: exists
              ? state.favorites.filter(f => f.id !== item.id)
              : [...state.favorites, item]
          }
        }),
        
        saveFilter: (key, filter) => set((state) => ({
          savedFilters: { ...state.savedFilters, [key]: filter }
        })),
        
        deleteFilter: (key) => set((state) => {
          const { [key]: _, ...rest } = state.savedFilters
          return { savedFilters: rest }
        }),
        
        resetPreferences: () => set({
          sidebarCollapsed: false,
          sidebarPinned: true,
          defaultView: 'grid',
          itemsPerPage: 10,
          notificationSound: true,
          desktopNotifications: true,
          emailNotifications: true
        })
      }),
      {
        name: 'admin-preferences',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          sidebarPinned: state.sidebarPinned,
          defaultView: state.defaultView,
          itemsPerPage: state.itemsPerPage,
          dashboardWidgets: state.dashboardWidgets,
          notificationSound: state.notificationSound,
          desktopNotifications: state.desktopNotifications,
          emailNotifications: state.emailNotifications,
          recentItems: state.recentItems,
          favorites: state.favorites,
          savedFilters: state.savedFilters
        })
      }
    ),
    { name: 'AdminPreferencesStore' }
  )
)

// Admin Data Cache Store
export const useAdminCacheStore = create(
  devtools(
    (set, get) => ({
      // Cached data
      children: { data: [], lastFetched: null },
      groups: { data: [], lastFetched: null },
      teachers: { data: [], lastFetched: null },
      enrollments: { data: [], lastFetched: null },
      
      // Cache duration (5 minutes)
      cacheDuration: 5 * 60 * 1000,
      
      // Actions
      setCache: (key, data) => set((state) => ({
        [key]: { data, lastFetched: Date.now() }
      })),
      
      getCache: (key) => {
        const cache = get()[key]
        if (!cache || !cache.lastFetched) return null
        
        const isExpired = Date.now() - cache.lastFetched > get().cacheDuration
        return isExpired ? null : cache.data
      },
      
      invalidateCache: (key) => set((state) => ({
        [key]: { data: [], lastFetched: null }
      })),
      
      invalidateAll: () => set({
        children: { data: [], lastFetched: null },
        groups: { data: [], lastFetched: null },
        teachers: { data: [], lastFetched: null },
        enrollments: { data: [], lastFetched: null }
      })
    }),
    { name: 'AdminCacheStore' }
  )
)

// Selector hooks
export const useDashboardStats = () => useAdminDashboardStore((state) => state.stats)
export const useDashboardAlerts = () => useAdminDashboardStore((state) => state.alerts)
export const useDashboardActivities = () => useAdminDashboardStore((state) => state.activities)
export const useAdminPreferences = () => useAdminPreferencesStore((state) => state)
export const useSidebarCollapsed = () => useAdminPreferencesStore((state) => state.sidebarCollapsed)
export const useRecentItems = () => useAdminPreferencesStore((state) => state.recentItems)
export const useFavorites = () => useAdminPreferencesStore((state) => state.favorites)
