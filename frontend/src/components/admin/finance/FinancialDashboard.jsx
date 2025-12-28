import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import './FinancialDashboard.css'

export default function FinancialDashboard({ 
  revenue = [],
  expenses = [],
  debts = [],
  period = 'month'
}) {
  const stats = useMemo(() => {
    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalDebts = debts.reduce((sum, d) => sum + d.remaining, 0)
    const profit = totalRevenue - totalExpenses
    const collectionRate = totalRevenue > 0 
      ? ((totalRevenue - totalDebts) / totalRevenue * 100).toFixed(1)
      : 0

    return { totalRevenue, totalExpenses, totalDebts, profit, collectionRate }
  }, [revenue, expenses, debts])

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M'
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K'
    }
    return amount.toString()
  }

  const revenueChartData = useMemo(() => ({
    labels: revenue.map(r => r.label),
    datasets: [{
      label: 'Daromad',
      data: revenue.map(r => r.amount),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4
    }, {
      label: 'Xarajat',
      data: expenses.map(e => e.amount),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }), [revenue, expenses])

  const debtChartData = useMemo(() => {
    const byStatus = debts.reduce((acc, d) => {
      const status = d.daysOverdue > 30 ? 'critical' : d.daysOverdue > 7 ? 'warning' : 'normal'
      acc[status] = (acc[status] || 0) + d.remaining
      return acc
    }, {})

    return {
      labels: ['Normal', 'Ogohlantirish', 'Kritik'],
      datasets: [{
        data: [byStatus.normal || 0, byStatus.warning || 0, byStatus.critical || 0],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    }
  }, [debts])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 16
        }
      }
    },
    cutout: '70%'
  }

  return (
    <div className="financial-dashboard">
      <div className="financial-dashboard__stats">
        <motion.div 
          className="financial-stat"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <div className="financial-stat__header">
            <div className="financial-stat__icon financial-stat__icon--revenue">💰</div>
            <span className="financial-stat__trend financial-stat__trend--up">↑ 12%</span>
          </div>
          <div className="financial-stat__value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="financial-stat__label">Jami daromad</div>
        </motion.div>

        <motion.div 
          className="financial-stat"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="financial-stat__header">
            <div className="financial-stat__icon financial-stat__icon--expense">📉</div>
            <span className="financial-stat__trend financial-stat__trend--down">↓ 5%</span>
          </div>
          <div className="financial-stat__value">{formatCurrency(stats.totalExpenses)}</div>
          <div className="financial-stat__label">Jami xarajat</div>
        </motion.div>

        <motion.div 
          className="financial-stat"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="financial-stat__header">
            <div className="financial-stat__icon financial-stat__icon--debt">⚠️</div>
          </div>
          <div className="financial-stat__value">{formatCurrency(stats.totalDebts)}</div>
          <div className="financial-stat__label">Qarzdorlik</div>
        </motion.div>

        <motion.div 
          className="financial-stat"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="financial-stat__header">
            <div className="financial-stat__icon financial-stat__icon--profit">📊</div>
            <span className="financial-stat__trend financial-stat__trend--up">{stats.collectionRate}%</span>
          </div>
          <div className="financial-stat__value">{formatCurrency(stats.profit)}</div>
          <div className="financial-stat__label">Sof foyda</div>
        </motion.div>
      </div>

      <div className="financial-dashboard__charts">
        <div className="financial-chart">
          <div className="financial-chart__header">
            <h3 className="financial-chart__title">Daromad va xarajatlar</h3>
            <div className="financial-chart__period">
              <button className={`financial-chart__period-btn ${period === 'week' ? 'financial-chart__period-btn--active' : ''}`}>
                Hafta
              </button>
              <button className={`financial-chart__period-btn ${period === 'month' ? 'financial-chart__period-btn--active' : ''}`}>
                Oy
              </button>
              <button className={`financial-chart__period-btn ${period === 'year' ? 'financial-chart__period-btn--active' : ''}`}>
                Yil
              </button>
            </div>
          </div>
          <div className="financial-chart__canvas">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        <div className="financial-chart">
          <div className="financial-chart__header">
            <h3 className="financial-chart__title">Qarzdorlik holati</h3>
          </div>
          <div className="financial-chart__canvas">
            <Doughnut data={debtChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="financial-dashboard__debtors">
        <div className="financial-dashboard__debtors-header">
          <h3 className="financial-dashboard__debtors-title">Qarzdorlar ro'yxati</h3>
          <span className="financial-dashboard__debtors-count">{debts.length} ta</span>
        </div>
        <div className="financial-dashboard__debtors-list">
          {debts.slice(0, 10).map((debt, index) => (
            <motion.div
              key={debt.id}
              className="debtor-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <img 
                src={debt.photo || '/default-avatar.png'} 
                alt={debt.childName}
                className="debtor-item__avatar"
              />
              <div className="debtor-item__info">
                <div className="debtor-item__name">{debt.childName}</div>
                <div className={`debtor-item__days ${
                  debt.daysOverdue > 30 ? 'debtor-item__days--critical' :
                  debt.daysOverdue > 7 ? 'debtor-item__days--warning' : ''
                }`}>
                  {debt.daysOverdue > 0 ? `${debt.daysOverdue} kun kechikkan` : 'Muddati tugamagan'}
                </div>
              </div>
              <div className="debtor-item__amount">
                {new Intl.NumberFormat('uz-UZ').format(debt.remaining)} so'm
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

FinancialDashboard.propTypes = {
  revenue: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired
  })),
  expenses: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired
  })),
  debts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    childName: PropTypes.string.isRequired,
    remaining: PropTypes.number.isRequired,
    daysOverdue: PropTypes.number,
    photo: PropTypes.string
  })),
  period: PropTypes.oneOf(['week', 'month', 'year'])
}
