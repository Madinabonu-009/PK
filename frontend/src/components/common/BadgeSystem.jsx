import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BadgeSystem.css';

// Badge turlari
const BADGES = {
  // Davomat badges
  attendance_week: {
    id: 'attendance_week',
    name: 'Hafta yulduzchasi',
    description: 'Bir hafta davomida har kuni keldi',
    icon: '⭐',
    color: '#f59e0b',
    requirement: 5
  },
  attendance_month: {
    id: 'attendance_month',
    name: 'Oy chempioni',
    description: 'Bir oy davomida 20+ kun keldi',
    icon: '🏆',
    color: '#eab308',
    requirement: 20
  },
  perfect_attendance: {
    id: 'perfect_attendance',
    name: 'Mukammal davomat',
    description: '100% davomat',
    icon: '👑',
    color: '#8b5cf6',
    requirement: 100
  },
  
  // Ovqatlanish badges
  good_eater: {
    id: 'good_eater',
    name: 'Yaxshi ovqatlanuvchi',
    description: 'Har doim ovqatni yaxshi yeydi',
    icon: '🍽️',
    color: '#22c55e',
    requirement: 10
  },
  
  // Mashg'ulot badges
  artist: {
    id: 'artist',
    name: 'Kichik rassom',
    description: 'Rasm mashg\'ulotlarida faol',
    icon: '🎨',
    color: '#ec4899',
    requirement: 5
  },
  singer: {
    id: 'singer',
    name: 'Kichik xonanda',
    description: 'Musiqa mashg\'ulotlarida faol',
    icon: '🎵',
    color: '#06b6d4',
    requirement: 5
  },
  athlete: {
    id: 'athlete',
    name: 'Sportchi',
    description: 'Sport mashg\'ulotlarida faol',
    icon: '⚽',
    color: '#10b981',
    requirement: 5
  },
  reader: {
    id: 'reader',
    name: 'Kitobxon',
    description: 'Kitob o\'qishni yaxshi ko\'radi',
    icon: '📚',
    color: '#6366f1',
    requirement: 5
  },
  
  // Xulq badges
  helper: {
    id: 'helper',
    name: 'Yordamchi',
    description: 'Do\'stlariga yordam beradi',
    icon: '🤝',
    color: '#f97316',
    requirement: 3
  },
  friendly: {
    id: 'friendly',
    name: 'Do\'stona',
    description: 'Hamma bilan yaxshi munosabatda',
    icon: '💖',
    color: '#ef4444',
    requirement: 5
  },
  
  // Maxsus badges
  birthday: {
    id: 'birthday',
    name: 'Tug\'ilgan kun',
    description: 'Tug\'ilgan kun muborak!',
    icon: '🎂',
    color: '#a855f7',
    requirement: 1
  },
  first_day: {
    id: 'first_day',
    name: 'Birinchi kun',
    description: 'Bog\'chaga birinchi kelgan kun',
    icon: '🌟',
    color: '#14b8a6',
    requirement: 1
  }
};

const BadgeSystem = ({ childId, earnedBadges = [], stats = {} }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Badge olganligini tekshirish
  const isBadgeEarned = (badgeId) => {
    return earnedBadges.includes(badgeId);
  };

  // Badge progress
  const getBadgeProgress = (badge) => {
    const statKey = badge.id.split('_')[0];
    const current = stats[statKey] || 0;
    return Math.min((current / badge.requirement) * 100, 100);
  };

  // Badge tanlash
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    if (isBadgeEarned(badge.id)) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  return (
    <div className="badge-system">
      <div className="badge-header">
        <h3>🏅 Yutuqlar</h3>
        <span className="badge-count">
          {earnedBadges.length} / {Object.keys(BADGES).length}
        </span>
      </div>

      <div className="badges-grid">
        {Object.values(BADGES).map((badge) => {
          const earned = isBadgeEarned(badge.id);
          const progress = getBadgeProgress(badge);
          
          return (
            <motion.div
              key={badge.id}
              className={`badge-item ${earned ? 'earned' : 'locked'}`}
              onClick={() => handleBadgeClick(badge)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ '--badge-color': badge.color }}
            >
              <div className="badge-icon-wrapper">
                <span className="badge-icon">{badge.icon}</span>
                {!earned && (
                  <div className="badge-progress">
                    <svg viewBox="0 0 36 36">
                      <path
                        className="progress-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="progress-fill"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                )}
                {earned && (
                  <motion.div 
                    className="badge-earned-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✓
                  </motion.div>
                )}
              </div>
              <span className="badge-name">{badge.name}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            className="badge-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              className="badge-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ '--badge-color': selectedBadge.color }}
            >
              <div className="badge-modal-icon">
                <span>{selectedBadge.icon}</span>
              </div>
              <h4>{selectedBadge.name}</h4>
              <p>{selectedBadge.description}</p>
              
              {isBadgeEarned(selectedBadge.id) ? (
                <div className="badge-earned-status">
                  <span>✅ Olingan!</span>
                </div>
              ) : (
                <div className="badge-progress-status">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getBadgeProgress(selectedBadge)}%` }}
                    />
                  </div>
                  <span>{Math.round(getBadgeProgress(selectedBadge))}%</span>
                </div>
              )}
              
              <button 
                className="badge-modal-close"
                onClick={() => setSelectedBadge(null)}
              >
                Yopish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="celebration-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.span
                key={i}
                className="confetti"
                initial={{ 
                  y: -20, 
                  x: Math.random() * window.innerWidth,
                  rotate: 0 
                }}
                animate={{ 
                  y: window.innerHeight + 20,
                  rotate: Math.random() * 720 - 360
                }}
                transition={{ 
                  duration: 2 + Math.random(),
                  ease: 'linear'
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  background: ['#f59e0b', '#22c55e', '#8b5cf6', '#ef4444', '#06b6d4'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeSystem;
