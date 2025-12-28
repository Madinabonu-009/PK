import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './AnalyticsDashboard.css'

// Date Range Presets
const DATE_PRESETS = {
  '7d': { label: 'Oxirgi 7 kun', days: 7 },
  '30d': { label: 'Oxirgi 30 kun', days: 30 },
  '90d': { label: 'Oxirgi 90 kun', days: 90 },
  '1y': { label: 'Oxirgi 1 yil', days: 365 },
  'custom': { label: 'Maxsus', days: 0 }
}

// Chart Colors
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// KPI Card
function KPICard({ title, value, change, changeType, icon, onClick }) {
  const isPositive = changeType === 'positive' || change > 0
  
  return (
    <motion.div
      className="kpi-card"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <span className="kpi-title">{title}</span>
        <span className="kpi-value">{value}</span>
        {change !== undefined && (
          <span className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}

// Trend Chart
function TrendChart({ data, dataKey, title, color = '#3b82f6' }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
          <YAxis stroke="var(--text-secondary)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Comparison Chart
function ComparisonChart({ data, title }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
          <YAxis stroke="var(--text-secondary)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey="current" name="Joriy davr" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="previous" name="Oldingi davr" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Distribution Chart
function DistributionChart({ data, title }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Anomaly Alert
function AnomalyAlert({ anomaly, onDismiss }) {
  const severityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6'
  }

  return (
    <motion.div
      className="anomaly-alert"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ borderLeftColor: severityColors[anomaly.severity] }}
    >
      <div className="anomaly-icon">
        {anomaly.severity === 'high' ? '🚨' : anomaly.severity === 'medium' ? '⚠️' : 'ℹ️'}
      </div>
      <div className="anomaly-content">
        <span className="anomaly-title">{anomaly.title}</span>
        <span className="anomaly-description">{anomaly.description}</span>
      </div>
      <button className="dismiss-btn" onClick={() => onDismiss?.(anomaly.id)}>✕</button>
    </motion.div>
  )
}


// Main Analytics Dashboard Component
function AnalyticsDashboard({
  kpis = [],
  trendData = [],
  comparisonData = [],
  distributionData = [],
  anomalies = [],
  onDateRangeChange,
  onDrillDown,
  onDismissAnomaly
}) {
  const [dateRange, setDateRange] = useState('30d')
  const [customRange, setCustomRange] = useState({ start: '', end: '' })

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    if (range !== 'custom') {
      onDateRangeChange?.(range)
    }
  }

  const handleCustomRangeApply = () => {
    if (customRange.start && customRange.end) {
      onDateRangeChange?.({ type: 'custom', ...customRange })
    }
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h2>📊 Analitika</h2>
          <p>Ma'lumotlar tahlili va trendlar</p>
        </div>

        <div className="date-range-selector">
          {Object.entries(DATE_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`range-btn ${dateRange === key ? 'active' : ''}`}
              onClick={() => handleDateRangeChange(key)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      {dateRange === 'custom' && (
        <div className="custom-range">
          <input
            type="date"
            value={customRange.start}
            onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <span>dan</span>
          <input
            type="date"
            value={customRange.end}
            onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
          />
          <span>gacha</span>
          <button className="apply-btn" onClick={handleCustomRangeApply}>
            Qo'llash
          </button>
        </div>
      )}

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="anomalies-section">
          <h3>🔔 Anomaliyalar</h3>
          <div className="anomalies-list">
            {anomalies.map(anomaly => (
              <AnomalyAlert
                key={anomaly.id}
                anomaly={anomaly}
                onDismiss={onDismissAnomaly}
              />
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="kpis-grid">
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            {...kpi}
            onClick={() => onDrillDown?.(kpi.type)}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {trendData.length > 0 && (
          <TrendChart
            data={trendData}
            dataKey="value"
            title="📈 Trend tahlili"
            color="#3b82f6"
          />
        )}

        {comparisonData.length > 0 && (
          <ComparisonChart
            data={comparisonData}
            title="📊 Davr taqqoslash"
          />
        )}

        {distributionData.length > 0 && (
          <DistributionChart
            data={distributionData}
            title="🥧 Taqsimot"
          />
        )}
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h3>💡 Tushunchalar</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-icon">📈</span>
            <div className="insight-content">
              <span className="insight-title">O'sish tendensiyasi</span>
              <span className="insight-text">
                Oxirgi 30 kunda davomat 5% ga oshdi
              </span>
            </div>
          </div>
          <div className="insight-card">
            <span className="insight-icon">💰</span>
            <div className="insight-content">
              <span className="insight-title">To'lov samaradorligi</span>
              <span className="insight-text">
                O'z vaqtida to'lovlar 92% ni tashkil etadi
              </span>
            </div>
          </div>
          <div className="insight-card">
            <span className="insight-icon">👶</span>
            <div className="insight-content">
              <span className="insight-title">Guruh to'liqligi</span>
              <span className="insight-text">
                O'rtacha guruh to'liqligi 85%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
export {
  KPICard,
  TrendChart,
  ComparisonChart,
  DistributionChart,
  AnomalyAlert,
  DATE_PRESETS,
  CHART_COLORS
}
