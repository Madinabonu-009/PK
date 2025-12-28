import { useState } from 'react';
import { motion } from 'framer-motion';
import './ChildSmartCard.css';

const ChildSmartCard = ({ child, attendance, dailyReport, payments }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Kayfiyat emoji
  const moodEmojis = {
    excellent: '😄',
    good: '😊',
    normal: '😐',
    tired: '😴',
    sad: '😢'
  };

  // Ovqatlanish holati
  const mealStatus = {
    full: { emoji: '🍽️', color: '#22c55e', label: 'Yaxshi ovqatlandi' },
    partial: { emoji: '🥄', color: '#f59e0b', label: 'Qisman ovqatlandi' },
    none: { emoji: '❌', color: '#ef4444', label: 'Ovqatlanmadi' }
  };

  // Davomat holati
  const getAttendanceStatus = () => {
    if (!attendance) return { status: 'unknown', color: '#6b7280' };
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.find(a => a.date === today);
    if (!todayAttendance) return { status: 'unknown', color: '#6b7280' };
    return todayAttendance.status === 'present' 
      ? { status: 'present', color: '#22c55e', label: 'Bog\'chada' }
      : { status: 'absent', color: '#ef4444', label: 'Kelmagan' };
  };

  // Progress hisoblash
  const calculateProgress = () => {
    if (!attendance || attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  };

  // Yosh hisoblash
  const calculateAge = () => {
    if (!child?.birthDate) return '?';
    const birth = new Date(child.birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (months < 0) return `${years - 1} yosh`;
    return `${years} yosh ${months} oy`;
  };

  const attendanceStatus = getAttendanceStatus();
  const progress = calculateProgress();

  return (
    <div className="smart-card-container">
      <motion.div 
        className={`smart-card ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Front Side */}
        <div className="smart-card-front">
          {/* Header */}
          <div className="smart-card-header">
            <div className="child-avatar">
              {child?.photo ? (
                <img src={child.photo} alt={child.firstName} loading="lazy" />
              ) : (
                <div className="avatar-placeholder">
                  {child?.firstName?.[0]}{child?.lastName?.[0]}
                </div>
              )}
              <span 
                className="status-dot"
                style={{ backgroundColor: attendanceStatus.color }}
              />
            </div>
            <div className="child-info">
              <h3>{child?.firstName} {child?.lastName}</h3>
              <p className="child-group">👥 {child?.groupName || 'Guruh belgilanmagan'}</p>
              <p className="child-age">🎂 {calculateAge()}</p>
            </div>
          </div>

          {/* Today Status */}
          <div className="today-status">
            <h4>📅 Bugungi holat</h4>
            <div className="status-grid">
              {/* Davomat */}
              <div className="status-item">
                <span className="status-icon" style={{ color: attendanceStatus.color }}>
                  {attendanceStatus.status === 'present' ? '✅' : '❌'}
                </span>
                <span className="status-label">{attendanceStatus.label || 'Noma\'lum'}</span>
              </div>

              {/* Kayfiyat */}
              <div className="status-item">
                <span className="status-icon">
                  {moodEmojis[dailyReport?.mood] || '😊'}
                </span>
                <span className="status-label">Kayfiyat</span>
              </div>

              {/* Ovqatlanish */}
              <div className="status-item">
                <span className="status-icon">
                  {mealStatus[dailyReport?.meals]?.emoji || '🍽️'}
                </span>
                <span className="status-label">Ovqat</span>
              </div>

              {/* Uyqu */}
              <div className="status-item">
                <span className="status-icon">
                  {dailyReport?.sleep === 'good' ? '😴' : '👀'}
                </span>
                <span className="status-label">Uyqu</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-header">
              <span>📊 Davomat</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Flip hint */}
          <p className="flip-hint">🔄 Batafsil ko'rish uchun bosing</p>
        </div>

        {/* Back Side */}
        <div className="smart-card-back">
          <h4>📋 Batafsil ma'lumot</h4>
          
          {/* Daily Report */}
          {dailyReport && (
            <div className="detail-section">
              <h5>🗓️ Kunlik hisobot</h5>
              {dailyReport.activities && (
                <p>🎨 Mashg'ulotlar: {dailyReport.activities}</p>
              )}
              {dailyReport.notes && (
                <p>📝 Izoh: {dailyReport.notes}</p>
              )}
            </div>
          )}

          {/* Payments */}
          <div className="detail-section">
            <h5>💰 To'lovlar</h5>
            {payments?.debt > 0 ? (
              <p className="debt-warning">⚠️ Qarz: {payments.debt.toLocaleString()} so'm</p>
            ) : (
              <p className="no-debt">✅ Qarz yo'q</p>
            )}
          </div>

          {/* Contact */}
          <div className="detail-section">
            <h5>📞 Aloqa</h5>
            <p>👨‍👩‍👧 {child?.parentName || 'Ota-ona'}</p>
            <p>📱 {child?.parentPhone || 'Telefon yo\'q'}</p>
          </div>

          <p className="flip-hint">🔄 Orqaga qaytish</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChildSmartCard;
