/**
 * Admin Components Integration Tests
 * Tests for all admin panel components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Messages Components
import {
  MessageComposer,
  BroadcastMessaging,
  DeliveryTracker,
  ScheduledMessages,
  TelegramIntegration,
  MessageTemplates
} from '../../components/admin/messages'

// Reports Components
import {
  ReportBuilder,
  ScheduledReports
} from '../../components/admin/reports'

// Analytics Components
import {
  AnalyticsDashboard,
  CustomizableWidgets
} from '../../components/admin/analytics'

// Users Components
import {
  UserManagement,
  SessionManagement,
  TwoFactorAuth,
  PasswordPolicies,
  SuspiciousActivity
} from '../../components/admin/users'

// Search Components
import {
  GlobalSearch,
  AdvancedFilters
} from '../../components/admin/search'

// Test wrapper with router
const TestWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Messages Module', () => {
  describe('MessageComposer', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <MessageComposer />
        </TestWrapper>
      )
      expect(document.querySelector('.message-composer')).toBeTruthy()
    })
  })

  describe('BroadcastMessaging', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <BroadcastMessaging />
        </TestWrapper>
      )
      expect(document.querySelector('.broadcast-messaging')).toBeTruthy()
    })
  })

  describe('DeliveryTracker', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <DeliveryTracker messages={[]} />
        </TestWrapper>
      )
      expect(document.querySelector('.delivery-tracker')).toBeTruthy()
    })

    it('displays messages when provided', () => {
      const messages = [
        { id: 1, recipient: 'Test User', status: 'delivered', sentAt: new Date().toISOString() }
      ]
      render(
        <TestWrapper>
          <DeliveryTracker messages={messages} />
        </TestWrapper>
      )
      expect(screen.getByText('Test User')).toBeTruthy()
    })
  })

  describe('ScheduledMessages', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <ScheduledMessages scheduledMessages={[]} />
        </TestWrapper>
      )
      expect(document.querySelector('.scheduled-messages')).toBeTruthy()
    })
  })

  describe('TelegramIntegration', () => {
    it('renders disconnected state', () => {
      render(
        <TestWrapper>
          <TelegramIntegration connectionStatus="disconnected" />
        </TestWrapper>
      )
      expect(document.querySelector('.telegram-integration')).toBeTruthy()
      expect(screen.getByText(/Telegram ulanmagan/i)).toBeTruthy()
    })

    it('renders connected state with chats', () => {
      const chats = [
        { id: 1, name: 'Test Chat', username: 'testchat' }
      ]
      render(
        <TestWrapper>
          <TelegramIntegration 
            connectionStatus="connected" 
            chats={chats}
            botInfo={{ name: 'Test Bot', username: 'testbot' }}
          />
        </TestWrapper>
      )
      expect(screen.getByText('Test Chat')).toBeTruthy()
    })
  })

  describe('MessageTemplates', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <MessageTemplates templates={[]} />
        </TestWrapper>
      )
      expect(document.querySelector('.message-templates')).toBeTruthy()
    })

    it('displays templates when provided', () => {
      const templates = [
        { id: 1, title: 'Test Template', category: 'general', content: 'Test content' }
      ]
      render(
        <TestWrapper>
          <MessageTemplates templates={templates} />
        </TestWrapper>
      )
      expect(screen.getByText('Test Template')).toBeTruthy()
    })
  })
})


describe('Reports Module', () => {
  describe('ReportBuilder', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <ReportBuilder />
        </TestWrapper>
      )
      expect(document.querySelector('.report-builder')).toBeTruthy()
    })
  })

  describe('ScheduledReports', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <ScheduledReports scheduledReports={[]} reportHistory={[]} />
        </TestWrapper>
      )
      expect(document.querySelector('.scheduled-reports')).toBeTruthy()
    })

    it('displays scheduled reports when provided', () => {
      const reports = [
        { id: 1, name: 'Weekly Report', type: 'attendance', frequency: 'weekly', active: true }
      ]
      render(
        <TestWrapper>
          <ScheduledReports scheduledReports={reports} reportHistory={[]} />
        </TestWrapper>
      )
      expect(screen.getByText('Weekly Report')).toBeTruthy()
    })
  })
})

describe('Analytics Module', () => {
  describe('AnalyticsDashboard', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <AnalyticsDashboard />
        </TestWrapper>
      )
      expect(document.querySelector('.analytics-dashboard')).toBeTruthy()
    })

    it('displays KPIs when provided', () => {
      const kpis = [
        { title: 'Total Users', value: '100', icon: '👥', change: 5 }
      ]
      render(
        <TestWrapper>
          <AnalyticsDashboard kpis={kpis} />
        </TestWrapper>
      )
      expect(screen.getByText('Total Users')).toBeTruthy()
      expect(screen.getByText('100')).toBeTruthy()
    })
  })

  describe('CustomizableWidgets', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <CustomizableWidgets widgets={[]} />
        </TestWrapper>
      )
      expect(document.querySelector('.customizable-widgets')).toBeTruthy()
    })

    it('displays widgets when provided', () => {
      const widgets = [
        { id: '1', type: 'kpi', title: 'Test Widget', size: 'medium' }
      ]
      render(
        <TestWrapper>
          <CustomizableWidgets widgets={widgets} />
        </TestWrapper>
      )
      expect(screen.getByText('Test Widget')).toBeTruthy()
    })
  })
})

describe('Users Module', () => {
  describe('UserManagement', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <UserManagement />
        </TestWrapper>
      )
      expect(document.querySelector('.user-management')).toBeTruthy()
    })
  })

  describe('SessionManagement', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <SessionManagement sessions={[]} />
        </TestWrapper>
      )
      expect(document.querySelector('.session-management')).toBeTruthy()
    })

    it('displays sessions when provided', () => {
      const sessions = [
        { 
          id: '1', 
          deviceType: 'desktop', 
          browser: 'Chrome',
          ipAddress: '192.168.1.1',
          status: 'active',
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        }
      ]
      render(
        <TestWrapper>
          <SessionManagement sessions={sessions} currentSessionId="1" />
        </TestWrapper>
      )
      expect(screen.getByText('Chrome')).toBeTruthy()
    })
  })

  describe('TwoFactorAuth', () => {
    it('renders setup state when not enabled', () => {
      render(
        <TestWrapper>
          <TwoFactorAuth isEnabled={false} />
        </TestWrapper>
      )
      expect(document.querySelector('.two-factor-auth')).toBeTruthy()
      expect(screen.getByText(/Ikki bosqichli autentifikatsiya/i)).toBeTruthy()
    })

    it('renders enabled state', () => {
      render(
        <TestWrapper>
          <TwoFactorAuth isEnabled={true} method="totp" recoveryCodes={['code1', 'code2']} />
        </TestWrapper>
      )
      expect(screen.getByText(/yoqilgan/i)).toBeTruthy()
    })
  })

  describe('PasswordPolicies', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <PasswordPolicies />
        </TestWrapper>
      )
      expect(document.querySelector('.password-policies')).toBeTruthy()
    })
  })

  describe('SuspiciousActivity', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <SuspiciousActivity alerts={[]} />
        </TestWrapper>
      )
      expect(document.querySelector('.suspicious-activity')).toBeTruthy()
    })

    it('displays alerts when provided', () => {
      const alerts = [
        { 
          id: '1', 
          type: 'failed_login', 
          severity: 'high',
          message: 'Multiple failed login attempts',
          timestamp: new Date().toISOString()
        }
      ]
      render(
        <TestWrapper>
          <SuspiciousActivity alerts={alerts} />
        </TestWrapper>
      )
      expect(screen.getByText('Multiple failed login attempts')).toBeTruthy()
    })
  })
})

describe('Search Module', () => {
  describe('GlobalSearch', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <GlobalSearch />
        </TestWrapper>
      )
      expect(document.querySelector('.global-search')).toBeTruthy()
    })
  })

  describe('AdvancedFilters', () => {
    it('renders without crashing', () => {
      const fields = [
        { id: 'name', label: 'Name', type: 'text' },
        { id: 'age', label: 'Age', type: 'number' }
      ]
      render(
        <TestWrapper>
          <AdvancedFilters fields={fields} />
        </TestWrapper>
      )
      expect(document.querySelector('.advanced-filters')).toBeTruthy()
    })

    it('allows adding filter conditions', () => {
      const fields = [
        { id: 'name', label: 'Name', type: 'text' }
      ]
      render(
        <TestWrapper>
          <AdvancedFilters fields={fields} />
        </TestWrapper>
      )
      
      const addButton = screen.getByText(/Shart qo'shish/i)
      fireEvent.click(addButton)
      
      const conditions = document.querySelectorAll('.filter-condition')
      expect(conditions.length).toBe(2)
    })
  })
})
