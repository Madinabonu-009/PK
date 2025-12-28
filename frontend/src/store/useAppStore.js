/**
 * Global App Store using Zustand
 * Issue #15: Global state management
 */

import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { STORAGE_KEYS } from '../constants'

// User Store
export const useUserStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        clearUser: () => set({ user: null, isAuthenticated: false }),
        
        updateUser: (updates) => set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),
        
        setLoading: (isLoading) => set({ isLoading })
      }),
      {
        name: STORAGE_KEYS.USER,
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
      }
    ),
    { name: 'UserStore' }
  )
)

// UI Store
export const useUIStore = create(
  devtools(
    (set) => ({
      isSidebarOpen: true,
      isMobileMenuOpen: false,
      activeModal: null,
      modalData: null,
      
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      
      openModal: (modalId, data = null) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null })
    }),
    { name: 'UIStore' }
  )
)

// Notification Store
export const useNotificationStore = create(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => set((state) => ({
        notifications: [
          { id: Date.now(), createdAt: new Date(), read: false, ...notification },
          ...state.notifications
        ].slice(0, 50), // Keep max 50
        unreadCount: state.unreadCount + 1
      })),
      
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      })),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      })),
      
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: state.notifications.find(n => n.id === id && !n.read) 
          ? state.unreadCount - 1 
          : state.unreadCount
      }))
    }),
    { name: 'NotificationStore' }
  )
)

// Loading Store (for global loading states)
export const useLoadingStore = create(
  devtools(
    (set, get) => ({
      loadingStates: {},
      
      setLoading: (key, isLoading) => set((state) => ({
        loadingStates: { ...state.loadingStates, [key]: isLoading }
      })),
      
      isLoading: (key) => get().loadingStates[key] || false,
      
      isAnyLoading: () => Object.values(get().loadingStates).some(Boolean),
      
      clearLoading: () => set({ loadingStates: {} })
    }),
    { name: 'LoadingStore' }
  )
)

// Combined selector hooks
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated)
export const useCurrentUser = () => useUserStore((state) => state.user)
export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount)
