import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './DailyChallenge.css'

const translations = {
  uz: {
    title: "Kunlik Vazifa",
    subtitle: "Har kuni yangi topshiriq!",
    complete: "Bajarildi!",
    reward: "Mukofot",
    timeLeft: "Qolgan vaqt",
    hours: "soat",
    newChallenge: "Yangi vazifa",
    streak: "Ketma-ket kunlar",
    tasks: {
      playGames: "3 ta o'yin o'yna",
      readStory: "1 ta ertak o'qi",
      learnLetters: "5 ta harf o'rgan",
      solvemath: "10 ta misol yech",
      createStory: "1 ta ertak yarat",
      colorPicture: "2 ta rasm bo'ya"
    }
  },
  ru: {
    title: "Ежедневное задание",
    subtitle: "Каждый день новое задание!",
    complete: "Выполнено!",
    reward: "Награда",
    timeLeft: "Осталось",
    hours: "часов",
    newChallenge: "Новое задание",
    streak: "Дней подряд",
    tasks: {
      playGames: "Сыграй 3 игры",
      readStory: "Прочитай 1 сказку",
      learnLetters: "Выучи 5 букв",
      solvemath: "Реши 10 примеров",
      createStory: "Создай 1 сказку",
      colorPicture: "Раскрась 2 картинки"
    }
  },
  en: {
    title: "Daily Challenge",
    subtitle: "New challenge every day!",
    complete: "Complete!",
    reward: "Reward",
    timeLeft: "Time left",
    hours: "hours",
    newChallenge: "New challenge",
    streak: "Day streak",
    tasks: {
      playGames: "Play 3 games",
      readStory: "Read 1 story",
      learnLetters: "Learn 5 letters",
      solvemath: "Solve 10 problems",
      createStory: "Create 1 story",
      colorPicture: "Color 2 pictures"
    }
  }
}

const CHALLENGES = [
  { id: 'playGames', icon: '🎮', target: 3, xp: 100, type: 'games' },
  { id: 'readStory', icon: '📚', target: 1, xp: 75, type: 'stories' },
  { id: 'learnLetters', icon: '🔤', target: 5, xp: 80, type: 'letters' },
  { id: 'solvemath', icon: '🧮', target: 10, xp: 120, type: 'math' },
  { id: 'createStory', icon: '✨', target: 1, xp: 150, type: 'create' },
  { id: 'colorPicture', icon: '🎨', target: 2, xp: 60, type: 'coloring' }
]

export default function DailyChallenge({ compact = false }) {
  const { language } = useLanguage()
  const { addXP, awardBadge, streak } = useGamification()
  const t = translations[language] || translations.uz

  const [challenge, setChallenge] = useState(null)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [showReward, setShowReward] = useState(false)

  // Kunlik vazifani olish
  useEffect(() => {
    const today = new Date().toDateString()
    const saved = localStorage.getItem('daily_challenge')
    
    if (saved) {
      const data = JSON.parse(saved)
      if (data.date === today) {
        setChallenge(CHALLENGES.find(c => c.id === data.challengeId))
        setProgress(data.progress || 0)
        setCompleted(data.completed || false)
      } else {
        // Yangi kun - yangi vazifa
        generateNewChallenge(today)
      }
    } else {
      generateNewChallenge(today)
    }
  }, [])

  // Vaqtni hisoblash
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight - now
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}:${mins.toString().padStart(2, '0')}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const generateNewChallenge = (date) => {
    const dayIndex = new Date(date).getDay()
    const newChallenge = CHALLENGES[dayIndex % CHALLENGES.length]
    setChallenge(newChallenge)
    setProgress(0)
    setCompleted(false)
    saveProgress(newChallenge.id, 0, false, date)
  }

  const saveProgress = (challengeId, prog, comp, date = new Date().toDateString()) => {
    localStorage.setItem('daily_challenge', JSON.stringify({
      date,
      challengeId,
      progress: prog,
      completed: comp
    }))
  }

  const updateProgress = (amount = 1) => {
    if (completed || !challenge) return
    
    const newProgress = Math.min(progress + amount, challenge.target)
    setProgress(newProgress)
    
    if (newProgress >= challenge.target) {
      setCompleted(true)
      setShowReward(true)
      addXP(challenge.xp, 'Daily challenge completed')
      if (streak >= 7) {
        awardBadge('daily_champion')
      }
      setTimeout(() => setShowReward(false), 3000)
    }
    
    saveProgress(challenge.id, newProgress, newProgress >= challenge.target)
  }

  // Global event listener for progress updates
  useEffect(() => {
    const handleProgress = (e) => {
      if (challenge && e.detail.type === challenge.type) {
        updateProgress(e.detail.amount || 1)
      }
    }
    window.addEventListener('dailyChallengeProgress', handleProgress)
    return () => window.removeEventListener('dailyChallengeProgress', handleProgress)
  }, [challenge, progress, completed])

  if (!challenge) return null

  if (compact) {
    return (
      <motion.div 
        className="daily-challenge-compact gradient-border"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="challenge-icon-small heartbeat">{challenge.icon}</div>
        <div className="challenge-progress-mini holographic">
          <div 
            className="progress-fill-mini" 
            style={{ width: `${(progress / challenge.target) * 100}%` }}
          />
        </div>
        <span className="challenge-count">{progress}/{challenge.target}</span>
        {completed && <span className="check-mark wow-jello">✅</span>}
      </motion.div>
    )
  }

  return (
    <motion.div 
      className={`daily-challenge ${completed ? 'completed' : ''} parallax-tilt`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="challenge-header">
        <div className="challenge-title-section">
          <h3 className="rainbow-text">{t.title}</h3>
          <p>{t.subtitle}</p>
        </div>
        <div className="challenge-timer neon-glow">
          <span className="timer-icon heartbeat">⏰</span>
          <span>{timeLeft}</span>
        </div>
      </div>

      <div className="challenge-content">
        <motion.div 
          className="challenge-icon-large morph-blob"
          animate={{ 
            scale: completed ? [1, 1.2, 1] : 1,
            rotate: completed ? [0, 10, -10, 0] : 0
          }}
        >
          {challenge.icon}
        </motion.div>

        <div className="challenge-info">
          <h4>{t.tasks[challenge.id]}</h4>
          <div className="challenge-progress-bar holographic">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(progress / challenge.target) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            <span className="progress-text">{progress} / {challenge.target}</span>
          </div>
        </div>

        <div className="challenge-reward liquid-btn">
          <span className="reward-label">{t.reward}</span>
          <span className="reward-xp neon-glow">+{challenge.xp} XP</span>
        </div>
      </div>

      {completed && (
        <motion.div 
          className="completed-badge wow-elastic"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          ✅ {t.complete}
        </motion.div>
      )}

      <div className="streak-display">
        <span className="streak-fire heartbeat">🔥</span>
        <span>{streak} {t.streak}</span>
      </div>

      {/* Reward Animation */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            className="reward-popup"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="reward-content">
              <span className="reward-emoji">🎉</span>
              <h3>{t.complete}</h3>
              <p>+{challenge.xp} XP</p>
              <div className="confetti">
                {[...Array(20)].map((_, i) => (
                  <span 
                    key={i} 
                    className="confetti-piece"
                    style={{
                      '--x': `${Math.random() * 100}%`,
                      '--delay': `${Math.random() * 0.5}s`,
                      '--color': ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'][i % 4]
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Helper function to trigger progress from other components
export const triggerDailyProgress = (type, amount = 1) => {
  window.dispatchEvent(new CustomEvent('dailyChallengeProgress', {
    detail: { type, amount }
  }))
}
