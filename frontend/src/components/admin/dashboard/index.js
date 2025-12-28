// Dashboard Components Export

// KPI Card
export { default as KPICard, KPICardSkeleton, AnimatedCounter, TrendIndicator } from './KPICard'

// Interactive Charts - import as object and re-export
import InteractiveChartsModule from './InteractiveCharts'
export const {
  AttendanceLineChart,
  PaymentBarChart,
  EnrollmentPieChart,
  RevenueDoughnutChart,
  ChartCard,
  PeriodSelector,
  ChartSkeleton
} = InteractiveChartsModule
export { default as InteractiveCharts } from './InteractiveCharts'

// Live Activity Feed
export { default as LiveActivityFeed, ActivityItem, ActivityFilterTabs, ACTIVITY_TYPES } from './LiveActivityFeed'

// Alert System
export { default as AlertList, AlertCard, AlertSummary, SEVERITY_CONFIG, ALERT_TYPES } from './AlertCard'

// Weather Widget
export { default as WeatherWidget, MiniWeather, WeatherWidgetSkeleton, WEATHER_CONDITIONS } from './WeatherWidget'
