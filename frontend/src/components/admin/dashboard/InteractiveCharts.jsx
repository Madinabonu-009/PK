import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import './InteractiveCharts.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Chart color palette
const CHART_COLORS = {
  primary: 'rgba(99, 102, 241, 1)',
  primaryLight: 'rgba(99, 102, 241, 0.2)',
  success: 'rgba(34, 197, 94, 1)',
  successLight: 'rgba(34, 197, 94, 0.2)',
  warning: 'rgba(245, 158, 11, 1)',
  warningLight: 'rgba(245, 158, 11, 0.2)',
  danger: 'rgba(239, 68, 68, 1)',
  dangerLight: 'rgba(239, 68, 68, 0.2)',
  info: 'rgba(6, 182, 212, 1)',
  infoLight: 'rgba(6, 182, 212, 0.2)',
  purple: 'rgba(168, 85, 247, 1)',
  purpleLight: 'rgba(168, 85, 247, 0.2)',
  pink: 'rgba(236, 72, 153, 1)',
  pinkLight: 'rgba(236, 72, 153, 0.2)',
}

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.info,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
]

// Skeleton loader for charts
export function ChartSkeleton({ height = 300 }) {
  return (
    <div className="chart-skeleton" style={{ height }}>
      <div className="chart-skeleton-bars">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className="chart-skeleton-bar"
            style={{ 
              height: `${30 + Math.random() * 50}%`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Attendance Trend Line Chart
export function AttendanceLineChart({ 
  data, 
  loading = false, 
  onPointClick,
  height = 300,
  title = "Davomat tendensiyasi"
}) {
  const chartRef = useRef(null)

  if (loading) return <ChartSkeleton height={height} />

  const chartData = {
    labels: data?.labels || ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
    datasets: [
      {
        label: 'Kelganlar',
        data: data?.present || [85, 88, 82, 90, 87, 45, 0],
        borderColor: CHART_COLORS.success,
        backgroundColor: CHART_COLORS.successLight,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: CHART_COLORS.success,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Kelmaganlar',
        data: data?.absent || [15, 12, 18, 10, 13, 55, 100],
        borderColor: CHART_COLORS.danger,
        backgroundColor: CHART_COLORS.dangerLight,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: CHART_COLORS.danger,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, family: "'Inter', sans-serif" }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16, weight: '600', family: "'Inter', sans-serif" },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: (value) => `${value}%`,
          font: { size: 11 }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onPointClick) {
        const { datasetIndex, index } = elements[0]
        onPointClick({
          dataset: chartData.datasets[datasetIndex].label,
          label: chartData.labels[index],
          value: chartData.datasets[datasetIndex].data[index]
        })
      }
    }
  }

  return (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ height }}
    >
      <Line ref={chartRef} data={chartData} options={options} />
    </motion.div>
  )
}

// Payment Analytics Bar Chart
export function PaymentBarChart({ 
  data, 
  loading = false, 
  onBarClick,
  height = 300,
  title = "To'lov statistikasi"
}) {
  if (loading) return <ChartSkeleton height={height} />

  const chartData = {
    labels: data?.labels || ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn'],
    datasets: [
      {
        label: "To'langan",
        data: data?.paid || [45000000, 52000000, 48000000, 55000000, 51000000, 58000000],
        backgroundColor: CHART_COLORS.success,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Qarzdorlik',
        data: data?.debt || [5000000, 3000000, 7000000, 2000000, 4000000, 3000000],
        backgroundColor: CHART_COLORS.danger,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, family: "'Inter', sans-serif" }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16, weight: '600', family: "'Inter', sans-serif" },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y
            return `${context.dataset.label}: ${formatCurrency(value)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: (value) => formatCurrency(value, true),
          font: { size: 11 }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick) {
        const { datasetIndex, index } = elements[0]
        onBarClick({
          dataset: chartData.datasets[datasetIndex].label,
          label: chartData.labels[index],
          value: chartData.datasets[datasetIndex].data[index]
        })
      }
    }
  }

  return (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{ height }}
    >
      <Bar data={chartData} options={options} />
    </motion.div>
  )
}

// Enrollment Funnel Pie Chart
export function EnrollmentPieChart({ 
  data, 
  loading = false, 
  onSliceClick,
  height = 300,
  title = "Bolalar taqsimoti"
}) {
  if (loading) return <ChartSkeleton height={height} />

  const chartData = {
    labels: data?.labels || ['Kichik guruh', "O'rta guruh", 'Katta guruh', 'Tayyorlov'],
    datasets: [
      {
        data: data?.values || [25, 35, 28, 22],
        backgroundColor: PIE_COLORS,
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 10,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, family: "'Inter', sans-serif" },
          generateLabels: (chart) => {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              const total = data.datasets[0].data.reduce((a, b) => a + b, 0)
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i]
                const percentage = ((value / total) * 100).toFixed(1)
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: 0,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                }
              })
            }
            return []
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16, weight: '600', family: "'Inter', sans-serif" },
        padding: { bottom: 10 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} bola (${percentage}%)`
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onSliceClick) {
        const { index } = elements[0]
        onSliceClick({
          label: chartData.labels[index],
          value: chartData.datasets[0].data[index]
        })
      }
    }
  }

  return (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{ height }}
    >
      <Pie data={chartData} options={options} />
    </motion.div>
  )
}

// Revenue Doughnut Chart
export function RevenueDoughnutChart({ 
  data, 
  loading = false, 
  onSliceClick,
  height = 300,
  title = "Daromad taqsimoti",
  centerText
}) {
  if (loading) return <ChartSkeleton height={height} />

  const chartData = {
    labels: data?.labels || ["To'lov", 'Qo\'shimcha', 'Ovqat', 'Transport'],
    datasets: [
      {
        data: data?.values || [65, 15, 12, 8],
        backgroundColor: PIE_COLORS,
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 10,
        cutout: '65%',
      }
    ]
  }

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
      if (centerText) {
        const { ctx, width, height } = chart
        ctx.save()
        ctx.font = 'bold 24px Inter, sans-serif'
        ctx.fillStyle = '#1f2937'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(centerText.value || '', width / 2, height / 2 - 10)
        ctx.font = '12px Inter, sans-serif'
        ctx.fillStyle = '#6b7280'
        ctx.fillText(centerText.label || '', width / 2, height / 2 + 15)
        ctx.restore()
      }
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, family: "'Inter', sans-serif" }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16, weight: '600', family: "'Inter', sans-serif" },
        padding: { bottom: 10 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${percentage}%`
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onSliceClick) {
        const { index } = elements[0]
        onSliceClick({
          label: chartData.labels[index],
          value: chartData.datasets[0].data[index]
        })
      }
    }
  }

  return (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={{ height }}
    >
      <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
    </motion.div>
  )
}

// Helper function to format currency
function formatCurrency(value, short = false) {
  if (short) {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }
  return new Intl.NumberFormat('uz-UZ').format(value) + " so'm"
}

// Chart Card Wrapper
export function ChartCard({ 
  title, 
  subtitle, 
  children, 
  actions,
  className = ''
}) {
  return (
    <motion.div 
      className={`chart-card ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chart-card-header">
        <div className="chart-card-titles">
          <h3 className="chart-card-title">{title}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="chart-card-actions">{actions}</div>}
      </div>
      <div className="chart-card-body">
        {children}
      </div>
    </motion.div>
  )
}

// Period Selector
export function PeriodSelector({ value, onChange, options }) {
  const defaultOptions = [
    { value: 'week', label: 'Hafta' },
    { value: 'month', label: 'Oy' },
    { value: 'quarter', label: 'Chorak' },
    { value: 'year', label: 'Yil' }
  ]

  const periods = options || defaultOptions

  return (
    <div className="period-selector">
      {periods.map((period) => (
        <button
          key={period.value}
          className={`period-btn ${value === period.value ? 'active' : ''}`}
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

export default {
  AttendanceLineChart,
  PaymentBarChart,
  EnrollmentPieChart,
  RevenueDoughnutChart,
  ChartCard,
  PeriodSelector,
  ChartSkeleton
}
