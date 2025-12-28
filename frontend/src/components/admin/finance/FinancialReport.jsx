/**
 * FinancialReport - Moliyaviy hisobotlar
 * Task 15.2: Implement financial reports
 */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './FinancialReport.css'

// Hisobot turlari
const REPORT_TYPES = {
  monthly: { id: 'monthly', name: 'Oylik', icon: '📅' },
  quarterly: { id: 'quarterly', name: 'Choraklik', icon: '📊' },
  yearly: { id: 'yearly', name: 'Yillik', icon: '📈' },
  custom: { id: 'custom', name: 'Maxsus', icon: '⚙️' }
}

// Export formatlari
const EXPORT_FORMATS = [
  { id: 'excel', name: 'Excel', icon: '📊', ext: '.xlsx' },
  { id: 'pdf', name: 'PDF', icon: '📄', ext: '.pdf' },
  { id: 'csv', name: 'CSV', icon: '📋', ext: '.csv' }
]

// Pul formatini chiqarish
function formatCurrency(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm"
}

// Foizni hisoblash
function calculatePercentage(value, total) {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// O'sish foizini hisoblash
function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// Oy nomini olish
function getMonthName(monthIndex, language = 'uz') {
  const months = {
    uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  }
  return months[language]?.[monthIndex] || months.uz[monthIndex]
}

// Summary Card komponenti
function SummaryCard({ title, value, icon, trend, trendValue, color = 'primary' }) {
  return (
    <div className={`summary-card summary-card--${color}`}>
      <div className="summary-icon">{icon}</div>
      <div className="summary-content">
        <span className="summary-title">{title}</span>
        <span className="summary-value">{value}</span>
        {trend && (
          <span className={`summary-trend ${trend}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}%
          </span>
        )}
      </div>
    </div>
  )
}

// Revenue Chart komponenti (simplified)
function RevenueChart({ data, period }) {
  const maxValue = Math.max(...data.map(d => d.revenue), 1)
  
  return (
    <div className="revenue-chart">
      <div className="chart-header">
        <h4>📈 Daromad dinamikasi</h4>
      </div>
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="chart-bar-wrapper">
            <div className="chart-bar-container">
              <motion.div
                className="chart-bar revenue"
                initial={{ height: 0 }}
                animate={{ height: `${(item.revenue / maxValue) * 100}%` }}
                transition={{ delay: index * 0.05 }}
              />
              <motion.div
                className="chart-bar expenses"
                initial={{ height: 0 }}
                animate={{ height: `${(item.expenses / maxValue) * 100}%` }}
                transition={{ delay: index * 0.05 + 0.1 }}
              />
            </div>
            <span className="chart-label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span className="legend-item revenue">
          <span className="legend-dot"></span> Daromad
        </span>
        <span className="legend-item expenses">
          <span className="legend-dot"></span> Xarajat
        </span>
      </div>
    </div>
  )
}

// Payment Methods Chart
function PaymentMethodsChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0)
  
  return (
    <div className="payment-methods-chart">
      <h4>💳 To'lov usullari</h4>
      <div className="methods-list">
        {data.map((method, index) => (
          <div key={index} className="method-item">
            <div className="method-info">
              <span className="method-icon">{method.icon}</span>
              <span className="method-name">{method.name}</span>
            </div>
            <div className="method-bar-wrapper">
              <motion.div
                className="method-bar"
                initial={{ width: 0 }}
                animate={{ width: `${calculatePercentage(method.amount, total)}%` }}
                style={{ backgroundColor: method.color }}
              />
            </div>
            <div className="method-stats">
              <span className="method-amount">{formatCurrency(method.amount)}</span>
              <span className="method-percent">{calculatePercentage(method.amount, total)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Debt Analysis komponenti
function DebtAnalysis({ data }) {
  return (
    <div className="debt-analysis">
      <h4>📊 Qarz tahlili</h4>
      <div className="debt-stats">
        <div className="debt-stat">
          <span className="debt-label">Jami qarz</span>
          <span className="debt-value danger">{formatCurrency(data.totalDebt)}</span>
        </div>
        <div className="debt-stat">
          <span className="debt-label">Qarzdorlar</span>
          <span className="debt-value">{data.debtorCount} ta</span>
        </div>
        <div className="debt-stat">
          <span className="debt-label">O'rtacha qarz</span>
          <span className="debt-value">{formatCurrency(data.averageDebt)}</span>
        </div>
        <div className="debt-stat">
          <span className="debt-label">Yig'ilgan</span>
          <span className="debt-value success">{formatCurrency(data.collected)}</span>
        </div>
      </div>
      
      <div className="debt-breakdown">
        <h5>Kechikish bo'yicha</h5>
        <div className="breakdown-items">
          <div className="breakdown-item">
            <span className="breakdown-label">1-7 kun</span>
            <span className="breakdown-value">{formatCurrency(data.overdue7)}</span>
            <span className="breakdown-count">{data.overdue7Count} ta</span>
          </div>
          <div className="breakdown-item warning">
            <span className="breakdown-label">8-14 kun</span>
            <span className="breakdown-value">{formatCurrency(data.overdue14)}</span>
            <span className="breakdown-count">{data.overdue14Count} ta</span>
          </div>
          <div className="breakdown-item danger">
            <span className="breakdown-label">15+ kun</span>
            <span className="breakdown-value">{formatCurrency(data.overdue15plus)}</span>
            <span className="breakdown-count">{data.overdue15plusCount} ta</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Group Revenue Table
function GroupRevenueTable({ data }) {
  return (
    <div className="group-revenue-table">
      <h4>👥 Guruhlar bo'yicha</h4>
      <table>
        <thead>
          <tr>
            <th>Guruh</th>
            <th>Bolalar</th>
            <th>Kutilgan</th>
            <th>Yig'ilgan</th>
            <th>Qarz</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {data.map((group, index) => (
            <tr key={index}>
              <td className="group-name">{group.name}</td>
              <td>{group.childCount}</td>
              <td>{formatCurrency(group.expected)}</td>
              <td className="success">{formatCurrency(group.collected)}</td>
              <td className="danger">{formatCurrency(group.debt)}</td>
              <td>
                <div className="collection-rate">
                  <div 
                    className="rate-bar"
                    style={{ width: `${group.collectionRate}%` }}
                  />
                  <span>{group.collectionRate}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Jami</td>
            <td>{data.reduce((sum, g) => sum + g.childCount, 0)}</td>
            <td>{formatCurrency(data.reduce((sum, g) => sum + g.expected, 0))}</td>
            <td className="success">{formatCurrency(data.reduce((sum, g) => sum + g.collected, 0))}</td>
            <td className="danger">{formatCurrency(data.reduce((sum, g) => sum + g.debt, 0))}</td>
            <td>-</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// Trend Comparison
function TrendComparison({ current, previous, periodLabel }) {
  const items = [
    { label: 'Daromad', current: current.revenue, previous: previous.revenue, icon: '💰' },
    { label: 'Xarajat', current: current.expenses, previous: previous.expenses, icon: '💸' },
    { label: 'Foyda', current: current.profit, previous: previous.profit, icon: '📈' },
    { label: 'Yig\'ilgan', current: current.collected, previous: previous.collected, icon: '✅' }
  ]
  
  return (
    <div className="trend-comparison">
      <h4>📊 {periodLabel} taqqoslash</h4>
      <div className="comparison-grid">
        {items.map((item, index) => {
          const growth = calculateGrowth(item.current, item.previous)
          const isPositive = growth >= 0
          
          return (
            <div key={index} className="comparison-item">
              <div className="comparison-header">
                <span className="comparison-icon">{item.icon}</span>
                <span className="comparison-label">{item.label}</span>
              </div>
              <div className="comparison-values">
                <div className="value-row current">
                  <span className="value-label">Joriy</span>
                  <span className="value-amount">{formatCurrency(item.current)}</span>
                </div>
                <div className="value-row previous">
                  <span className="value-label">Oldingi</span>
                  <span className="value-amount">{formatCurrency(item.previous)}</span>
                </div>
              </div>
              <div className={`comparison-growth ${isPositive ? 'positive' : 'negative'}`}>
                <span className="growth-arrow">{isPositive ? '↑' : '↓'}</span>
                <span className="growth-value">{Math.abs(growth)}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Asosiy komponent
function FinancialReport({
  financialData = {},
  groups = [],
  onExport,
  language = 'uz'
}) {
  const [reportType, setReportType] = useState('monthly')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3))
  const [exporting, setExporting] = useState(false)
  
  // Hisobot ma'lumotlari
  const reportData = useMemo(() => {
    // Demo data - real app would fetch from API
    const currentPeriod = {
      revenue: financialData.revenue || 45000000,
      expenses: financialData.expenses || 12000000,
      profit: (financialData.revenue || 45000000) - (financialData.expenses || 12000000),
      collected: financialData.collected || 42000000,
      debt: financialData.debt || 3000000
    }
    
    const previousPeriod = {
      revenue: financialData.previousRevenue || 40000000,
      expenses: financialData.previousExpenses || 11000000,
      profit: (financialData.previousRevenue || 40000000) - (financialData.previousExpenses || 11000000),
      collected: financialData.previousCollected || 38000000
    }
    
    return { currentPeriod, previousPeriod }
  }, [financialData])
  
  // Chart data
  const chartData = useMemo(() => {
    // Generate chart data based on report type
    const months = []
    const count = reportType === 'yearly' ? 12 : reportType === 'quarterly' ? 3 : 1
    
    for (let i = 0; i < count; i++) {
      months.push({
        label: reportType === 'yearly' 
          ? getMonthName(i, language).substring(0, 3)
          : reportType === 'quarterly'
            ? getMonthName(selectedQuarter * 3 + i, language).substring(0, 3)
            : `Hafta ${i + 1}`,
        revenue: Math.floor(Math.random() * 5000000) + 3000000,
        expenses: Math.floor(Math.random() * 1500000) + 500000
      })
    }
    
    return months
  }, [reportType, selectedQuarter, language])
  
  // Payment methods data
  const paymentMethodsData = useMemo(() => [
    { name: 'Naqd', icon: '💵', amount: 18000000, color: '#22c55e' },
    { name: 'Plastik karta', icon: '💳', amount: 15000000, color: '#3b82f6' },
    { name: 'Bank o\'tkazmasi', icon: '🏦', amount: 8000000, color: '#8b5cf6' },
    { name: 'Click/Payme', icon: '📱', amount: 4000000, color: '#f59e0b' }
  ], [])
  
  // Debt analysis data
  const debtData = useMemo(() => ({
    totalDebt: 3000000,
    debtorCount: 12,
    averageDebt: 250000,
    collected: 42000000,
    overdue7: 1200000,
    overdue7Count: 5,
    overdue14: 1000000,
    overdue14Count: 4,
    overdue15plus: 800000,
    overdue15plusCount: 3
  }), [])
  
  // Group revenue data
  const groupRevenueData = useMemo(() => 
    groups.length > 0 ? groups.map(g => ({
      name: g.name,
      childCount: g.childCount || Math.floor(Math.random() * 15) + 10,
      expected: Math.floor(Math.random() * 10000000) + 5000000,
      collected: Math.floor(Math.random() * 9000000) + 4000000,
      debt: Math.floor(Math.random() * 1000000),
      collectionRate: Math.floor(Math.random() * 20) + 80
    })) : [
      { name: 'Kichik guruh', childCount: 15, expected: 7500000, collected: 7000000, debt: 500000, collectionRate: 93 },
      { name: "O'rta guruh", childCount: 18, expected: 9000000, collected: 8200000, debt: 800000, collectionRate: 91 },
      { name: 'Katta guruh', childCount: 20, expected: 10000000, collected: 9500000, debt: 500000, collectionRate: 95 },
      { name: 'Tayyorlov', childCount: 22, expected: 11000000, collected: 10300000, debt: 700000, collectionRate: 94 }
    ]
  , [groups])
  
  // Export handler
  const handleExport = async (format) => {
    setExporting(true)
    try {
      await onExport?.({
        format,
        reportType,
        year: selectedYear,
        month: selectedMonth,
        quarter: selectedQuarter,
        data: {
          ...reportData,
          chartData,
          paymentMethodsData,
          debtData,
          groupRevenueData
        }
      })
    } finally {
      setExporting(false)
    }
  }
  
  // Period label
  const periodLabel = useMemo(() => {
    if (reportType === 'monthly') {
      return `${getMonthName(selectedMonth, language)} ${selectedYear}`
    } else if (reportType === 'quarterly') {
      return `${selectedQuarter + 1}-chorak ${selectedYear}`
    } else if (reportType === 'yearly') {
      return `${selectedYear} yil`
    }
    return ''
  }, [reportType, selectedYear, selectedMonth, selectedQuarter, language])
  
  return (
    <div className="financial-report">
      {/* Header */}
      <div className="report-header">
        <div className="header-title">
          <h2>📊 Moliyaviy Hisobot</h2>
          <p>{periodLabel}</p>
        </div>
        
        <div className="header-actions">
          {EXPORT_FORMATS.map(format => (
            <button
              key={format.id}
              className="export-btn"
              onClick={() => handleExport(format.id)}
              disabled={exporting}
            >
              {format.icon} {format.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Controls */}
      <div className="report-controls">
        <div className="report-type-selector">
          {Object.values(REPORT_TYPES).map(type => (
            <button
              key={type.id}
              className={`type-btn ${reportType === type.id ? 'active' : ''}`}
              onClick={() => setReportType(type.id)}
            >
              {type.icon} {type.name}
            </button>
          ))}
        </div>
        
        <div className="period-selector">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          {reportType === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{getMonthName(i, language)}</option>
              ))}
            </select>
          )}
          
          {reportType === 'quarterly' && (
            <select
              value={selectedQuarter}
              onChange={e => setSelectedQuarter(parseInt(e.target.value))}
            >
              <option value={0}>1-chorak</option>
              <option value={1}>2-chorak</option>
              <option value={2}>3-chorak</option>
              <option value={3}>4-chorak</option>
            </select>
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <SummaryCard
          title="Jami daromad"
          value={formatCurrency(reportData.currentPeriod.revenue)}
          icon="💰"
          trend={reportData.currentPeriod.revenue >= reportData.previousPeriod.revenue ? 'up' : 'down'}
          trendValue={Math.abs(calculateGrowth(reportData.currentPeriod.revenue, reportData.previousPeriod.revenue))}
          color="success"
        />
        <SummaryCard
          title="Xarajatlar"
          value={formatCurrency(reportData.currentPeriod.expenses)}
          icon="💸"
          trend={reportData.currentPeriod.expenses <= reportData.previousPeriod.expenses ? 'up' : 'down'}
          trendValue={Math.abs(calculateGrowth(reportData.currentPeriod.expenses, reportData.previousPeriod.expenses))}
          color="warning"
        />
        <SummaryCard
          title="Sof foyda"
          value={formatCurrency(reportData.currentPeriod.profit)}
          icon="📈"
          trend={reportData.currentPeriod.profit >= reportData.previousPeriod.profit ? 'up' : 'down'}
          trendValue={Math.abs(calculateGrowth(reportData.currentPeriod.profit, reportData.previousPeriod.profit))}
          color="primary"
        />
        <SummaryCard
          title="Qarz"
          value={formatCurrency(reportData.currentPeriod.debt)}
          icon="⚠️"
          color="danger"
        />
      </div>
      
      {/* Charts Row */}
      <div className="charts-row">
        <RevenueChart data={chartData} period={reportType} />
        <PaymentMethodsChart data={paymentMethodsData} />
      </div>
      
      {/* Analysis Row */}
      <div className="analysis-row">
        <DebtAnalysis data={debtData} />
        <TrendComparison
          current={reportData.currentPeriod}
          previous={reportData.previousPeriod}
          periodLabel="Oldingi davr bilan"
        />
      </div>
      
      {/* Group Revenue Table */}
      <GroupRevenueTable data={groupRevenueData} />
    </div>
  )
}

export default FinancialReport
export { 
  REPORT_TYPES, 
  EXPORT_FORMATS, 
  formatCurrency, 
  calculatePercentage, 
  calculateGrowth,
  getMonthName 
}
