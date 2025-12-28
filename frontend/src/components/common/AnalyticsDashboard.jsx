import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './AnalyticsDashboard.css';

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
);

const AnalyticsDashboard = ({ childData, attendance = [], payments = [] }) => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [period, setPeriod] = useState('week');

  // Davomat statistikasi
  const getAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const total = attendance.length || 1;
    
    return {
      present,
      absent,
      percentage: Math.round((present / total) * 100)
    };
  };

  // Haftalik davomat grafigi
  const getWeeklyAttendanceData = () => {
    const days = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    const last7Days = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayAttendance = attendance.find(a => a.date === dateStr);
      last7Days.push(dayAttendance?.status === 'present' ? 1 : 0);
    }

    return {
      labels: days,
      datasets: [{
        label: 'Davomat',
        data: last7Days,
        backgroundColor: last7Days.map(v => v ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  };

  // Oylik davomat trend
  const getMonthlyTrendData = () => {
    const weeks = ['1-hafta', '2-hafta', '3-hafta', '4-hafta'];
    const data = [85, 90, 88, 95]; // Demo data

    return {
      labels: weeks,
      datasets: [{
        label: 'Davomat %',
        data: data,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      }]
    };
  };

  // To'lovlar statistikasi
  const getPaymentData = () => {
    const paid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
    const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
    const debt = payments.filter(p => p.status === 'debt').reduce((s, p) => s + (p.amount || 0), 0);

    return {
      labels: ['To\'langan', 'Kutilmoqda', 'Qarz'],
      datasets: [{
        data: [paid || 500000, pending || 100000, debt || 50000],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0,
      }]
    };
  };

  // Mashg'ulotlar statistikasi
  const getActivitiesData = () => {
    return {
      labels: ['Sport', 'Musiqa', 'Rasm', 'Ingliz tili', 'Matematika'],
      datasets: [{
        label: 'Faollik',
        data: [90, 75, 85, 70, 80],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderRadius: 8,
      }]
    };
  };

  const stats = getAttendanceStats();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="analytics-dashboard">
      {/* Stats Cards */}
      <div className="stats-cards">
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            ✅
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.present}</span>
            <span className="stat-label">Kelgan kunlar</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            ❌
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.absent}</span>
            <span className="stat-label">Kelmagan kunlar</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            📊
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.percentage}%</span>
            <span className="stat-label">Davomat foizi</span>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          📊 Davomat
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          💰 To'lovlar
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          🎨 Mashg'ulotlar
        </button>
      </div>

      {/* Charts */}
      <div className="charts-container">
        {activeTab === 'attendance' && (
          <div className="charts-grid">
            <motion.div 
              className="chart-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h4>📅 Haftalik davomat</h4>
              <div className="chart-wrapper">
                <Bar data={getWeeklyAttendanceData()} options={chartOptions} />
              </div>
            </motion.div>

            <motion.div 
              className="chart-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h4>📈 Oylik trend</h4>
              <div className="chart-wrapper">
                <Line data={getMonthlyTrendData()} options={chartOptions} />
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'payments' && (
          <motion.div 
            className="chart-card full-width"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h4>💰 To'lovlar holati</h4>
            <div className="chart-wrapper doughnut">
              <Doughnut data={getPaymentData()} options={doughnutOptions} />
            </div>
            <div className="payment-summary">
              <div className="summary-item">
                <span className="dot success" />
                <span>To'langan: 500,000 so'm</span>
              </div>
              <div className="summary-item">
                <span className="dot warning" />
                <span>Kutilmoqda: 100,000 so'm</span>
              </div>
              <div className="summary-item">
                <span className="dot danger" />
                <span>Qarz: 50,000 so'm</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activities' && (
          <motion.div 
            className="chart-card full-width"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h4>🎨 Mashg'ulotlar faolligi</h4>
            <div className="chart-wrapper">
              <Bar data={getActivitiesData()} options={chartOptions} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Weekly Summary */}
      <motion.div 
        className="weekly-summary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4>📋 Bu hafta xulosasi</h4>
        <div className="summary-content">
          <p>✅ <strong>{childData?.firstName || 'Bola'}</strong> bu hafta {stats.present} kun keldi</p>
          <p>📊 Davomat foizi: <strong>{stats.percentage}%</strong></p>
          <p>🎨 Eng faol mashg'ulot: <strong>Sport</strong></p>
          <p>😊 Umumiy kayfiyat: <strong>Yaxshi</strong></p>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
