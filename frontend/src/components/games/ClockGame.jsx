import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './ClockGame.css'

const translations = {
  uz: {
    title: "Soatni o'rgan",
    subtitle: "Vaqtni aniqlashni o'rgan!",
    back: "Orqaga",
    learn: "O'rganish",
    quiz: "Viktorina",
    daily: "Kundalik",
    whatTime: "Soat nechchi?",
    setTime: "Soatni qo'y:",
    correct: "To'g'ri! 🎉",
    wrong: "Noto'g'ri 😢",
    score: "Ball",
    next: "Keyingi",
    check: "Tekshirish",
    tryAgain: "Qayta o'ynash",
    completed: "Barakalla! 🏆",
    hour: "soat",
    minute: "daqiqa",
    oclock: "aniq",
    half: "yarim",
    quarter: "chorak",
    easy: "Oson",
    medium: "O'rta",
    hard: "Qiyin",
    selectDifficulty: "Qiyinlik darajasini tanlang",
    morning: "Ertalab",
    afternoon: "Kunduzi",
    evening: "Kechqurun",
    night: "Tunda",
    breakfast: "Nonushta",
    lunch: "Tushlik",
    dinner: "Kechki ovqat",
    sleep: "Uxlash",
    school: "Maktab",
    play: "O'yin",
    activities: "Kundalik faoliyatlar",
    whatDoYouDo: "Bu vaqtda nima qilasiz?",
    showAnswer: "Javobni ko'rsat",
    lives: "Jon"
  },
  ru: {
    title: "Учим время",
    subtitle: "Научись определять время!",
    back: "Назад",
    learn: "Учить",
    quiz: "Викторина",
    daily: "Режим дня",
    whatTime: "Который час?",
    setTime: "Установи время:",
    correct: "Правильно! 🎉",
    wrong: "Неправильно 😢",
    score: "Счёт",
    next: "Дальше",
    check: "Проверить",
    tryAgain: "Ещё раз",
    completed: "Молодец! 🏆",
    hour: "час",
    minute: "минут",
    oclock: "ровно",
    half: "половина",
    quarter: "четверть",
    easy: "Легко",
    medium: "Средне",
    hard: "Сложно",
    selectDifficulty: "Выберите сложность",
    morning: "Утро",
    afternoon: "День",
    evening: "Вечер",
    night: "Ночь",
    breakfast: "Завтрак",
    lunch: "Обед",
    dinner: "Ужин",
    sleep: "Сон",
    school: "Школа",
    play: "Игра",
    activities: "Режим дня",
    whatDoYouDo: "Что ты делаешь в это время?",
    showAnswer: "Показать ответ",
    lives: "Жизни"
  },
  en: {
    title: "Learn Time",
    subtitle: "Learn to tell time!",
    back: "Back",
    learn: "Learn",
    quiz: "Quiz",
    daily: "Daily",
    whatTime: "What time is it?",
    setTime: "Set the time:",
    correct: "Correct! 🎉",
    wrong: "Wrong 😢",
    score: "Score",
    next: "Next",
    check: "Check",
    tryAgain: "Try Again",
    completed: "Well Done! 🏆",
    hour: "hour",
    minute: "minutes",
    oclock: "o'clock",
    half: "half past",
    quarter: "quarter",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    selectDifficulty: "Select difficulty",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    sleep: "Sleep",
    school: "School",
    play: "Play",
    activities: "Daily Activities",
    whatDoYouDo: "What do you do at this time?",
    showAnswer: "Show Answer",
    lives: "Lives"
  }
}

// Daily activities with times
const DAILY_ACTIVITIES = [
  { time: [7, 0], activity: 'breakfast', emoji: '🍳', period: 'morning' },
  { time: [8, 0], activity: 'school', emoji: '🏫', period: 'morning' },
  { time: [12, 0], activity: 'lunch', emoji: '🍽️', period: 'afternoon' },
  { time: [15, 0], activity: 'play', emoji: '⚽', period: 'afternoon' },
  { time: [18, 0], activity: 'dinner', emoji: '🍝', period: 'evening' },
  { time: [21, 0], activity: 'sleep', emoji: '😴', period: 'night' }
]


// ============================================
// CLOCK FACE COMPONENT - Premium Design
// ============================================
function ClockFace({ hour, minute, size = 220, interactive = false, onHourChange, onMinuteChange, showDigital = true, theme = 'classic' }) {
  const hourAngle = (hour % 12) * 30 + minute * 0.5
  const minuteAngle = minute * 6
  const [seconds, setSeconds] = useState(0)
  const [isDragging, setIsDragging] = useState(null) // 'hour' or 'minute'

  useEffect(() => {
    if (theme === 'animated') {
      const timer = setInterval(() => setSeconds(s => (s + 1) % 60), 1000)
      return () => clearInterval(timer)
    }
  }, [theme])

  const themes = {
    classic: {
      face: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      border: '#e5e7eb',
      hourHand: '#1f2937',
      minuteHand: '#ec4899',
      numbers: '#1f2937'
    },
    colorful: {
      face: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
      border: '#f59e0b',
      hourHand: '#7c3aed',
      minuteHand: '#22c55e',
      numbers: '#7c3aed'
    },
    night: {
      face: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      border: '#3b82f6',
      hourHand: '#f8fafc',
      minuteHand: '#fbbf24',
      numbers: '#f8fafc'
    }
  }

  const currentTheme = themes[theme] || themes.classic

  const handleDrag = useCallback((e, type) => {
    if (!interactive) return
    
    const svg = e.currentTarget.closest('svg')
    const rect = svg.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    
    const x = clientX - rect.left - centerX
    const y = clientY - rect.top - centerY
    
    let angle = Math.atan2(x, -y) * (180 / Math.PI)
    if (angle < 0) angle += 360
    
    if (type === 'hour') {
      const newHour = Math.round(angle / 30) || 12
      onHourChange?.(newHour)
    } else {
      const newMinute = Math.round(angle / 6) % 60
      onMinuteChange?.(newMinute)
    }
  }, [interactive, onHourChange, onMinuteChange])

  return (
    <div className={`clock-face-wrapper theme-${theme}`}>
      <svg viewBox="0 0 200 200" width={size} height={size} className="clock-svg">
        <defs>
          <linearGradient id={`clockGrad-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentTheme.face.includes('#') ? currentTheme.face : '#ffffff'} />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
          <filter id="clockShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.2"/>
          </filter>
          <filter id="handGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Clock circle */}
        <circle cx="100" cy="100" r="95" fill={currentTheme.face} stroke={currentTheme.border} strokeWidth="4" filter="url(#clockShadow)" />
        
        {/* Decorative ring */}
        <circle cx="100" cy="100" r="88" fill="none" stroke={currentTheme.border} strokeWidth="1" opacity="0.3" />
        
        {/* Hour markers and numbers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180
          const x1 = 100 + 72 * Math.cos(angle)
          const y1 = 100 + 72 * Math.sin(angle)
          const x2 = 100 + 85 * Math.cos(angle)
          const y2 = 100 + 85 * Math.sin(angle)
          const isMain = i % 3 === 0
          const displayNum = i === 0 ? 12 : i
          
          return (
            <g key={i}>
              <line 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke={currentTheme.numbers} 
                strokeWidth={isMain ? "4" : "2"} 
                strokeLinecap="round"
                opacity={isMain ? 1 : 0.5}
              />
              <text
                x={100 + 58 * Math.cos(angle)}
                y={100 + 58 * Math.sin(angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isMain ? "18" : "12"}
                fontWeight={isMain ? "bold" : "600"}
                fill={currentTheme.numbers}
              >
                {displayNum}
              </text>
            </g>
          )
        })}
        
        {/* Minute markers */}
        {[...Array(60)].map((_, i) => {
          if (i % 5 === 0) return null
          const angle = (i * 6 - 90) * Math.PI / 180
          const x1 = 100 + 82 * Math.cos(angle)
          const y1 = 100 + 82 * Math.sin(angle)
          const x2 = 100 + 86 * Math.cos(angle)
          const y2 = 100 + 86 * Math.sin(angle)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={currentTheme.numbers} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        })}
        
        {/* Hour hand */}
        <line
          x1="100" y1="100"
          x2={100 + 40 * Math.sin(hourAngle * Math.PI / 180)}
          y2={100 - 40 * Math.cos(hourAngle * Math.PI / 180)}
          stroke={currentTheme.hourHand}
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#handGlow)"
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onMouseDown={() => interactive && setIsDragging('hour')}
          onTouchStart={() => interactive && setIsDragging('hour')}
        />
        
        {/* Minute hand */}
        <line
          x1="100" y1="100"
          x2={100 + 58 * Math.sin(minuteAngle * Math.PI / 180)}
          y2={100 - 58 * Math.cos(minuteAngle * Math.PI / 180)}
          stroke={currentTheme.minuteHand}
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#handGlow)"
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onMouseDown={() => interactive && setIsDragging('minute')}
          onTouchStart={() => interactive && setIsDragging('minute')}
        />
        
        {/* Second hand (animated theme only) */}
        {theme === 'animated' && (
          <line
            x1="100" y1="100"
            x2={100 + 62 * Math.sin(seconds * 6 * Math.PI / 180)}
            y2={100 - 62 * Math.cos(seconds * 6 * Math.PI / 180)}
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        
        {/* Center dot */}
        <circle cx="100" cy="100" r="8" fill={currentTheme.hourHand} />
        <circle cx="100" cy="100" r="4" fill={currentTheme.minuteHand} />
        
        {/* Interactive overlay */}
        {interactive && (
          <circle 
            cx="100" cy="100" r="95" 
            fill="transparent" 
            style={{ cursor: 'pointer' }}
            onMouseMove={(e) => isDragging && handleDrag(e, isDragging)}
            onMouseUp={() => setIsDragging(null)}
            onMouseLeave={() => setIsDragging(null)}
            onTouchMove={(e) => isDragging && handleDrag(e, isDragging)}
            onTouchEnd={() => setIsDragging(null)}
          />
        )}
      </svg>
      
      {/* Digital display */}
      {showDigital && (
        <div className="digital-display">
          <span className="digital-hour">{hour.toString().padStart(2, '0')}</span>
          <span className="digital-colon">:</span>
          <span className="digital-minute">{minute.toString().padStart(2, '0')}</span>
        </div>
      )}
      
      {/* Interactive controls */}
      {interactive && (
        <div className="clock-controls">
          <div className="control-group hour-control">
            <button onClick={() => onHourChange?.((hour % 12) + 1)}>▲</button>
            <span>{hour}</span>
            <button onClick={() => onHourChange?.(((hour - 2 + 12) % 12) + 1)}>▼</button>
          </div>
          <span className="control-separator">:</span>
          <div className="control-group minute-control">
            <button onClick={() => onMinuteChange?.((minute + 5) % 60)}>▲</button>
            <span>{minute.toString().padStart(2, '0')}</span>
            <button onClick={() => onMinuteChange?.((minute - 5 + 60) % 60)}>▼</button>
          </div>
        </div>
      )}
    </div>
  )
}


// Format time in words
function formatTimeWords(hour, minute, lang) {
  const t = translations[lang]
  
  if (minute === 0) {
    return `${hour} ${t.oclock}`
  } else if (minute === 30) {
    return `${t.half} ${hour}`
  } else if (minute === 15) {
    return `${t.quarter} past ${hour}`
  } else if (minute === 45) {
    return `${t.quarter} to ${(hour % 12) + 1}`
  }
  return `${hour}:${minute.toString().padStart(2, '0')}`
}

// ============================================
// LEARN MODE
// ============================================
function LearnMode({ onBack, t, language }) {
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const [theme, setTheme] = useState('classic')

  const presetTimes = [
    { h: 12, m: 0, label: '12:00' },
    { h: 3, m: 0, label: '3:00' },
    { h: 6, m: 30, label: '6:30' },
    { h: 9, m: 15, label: '9:15' },
    { h: 1, m: 45, label: '1:45' },
    { h: 7, m: 30, label: '7:30' }
  ]

  return (
    <div className="clock-game learn-mode">
      <div className="clock-header">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h1>📚 {t.learn}</h1>
        <div className="theme-selector">
          {['classic', 'colorful', 'night'].map(th => (
            <button 
              key={th}
              className={`theme-btn ${theme === th ? 'active' : ''}`}
              onClick={() => setTheme(th)}
            >
              {th === 'classic' ? '⚪' : th === 'colorful' ? '🌈' : '🌙'}
            </button>
          ))}
        </div>
      </div>

      <div className="learn-content">
        <ClockFace 
          hour={hour} 
          minute={minute} 
          size={260}
          interactive
          onHourChange={setHour}
          onMinuteChange={setMinute}
          theme={theme}
        />
        
        <motion.div 
          className="time-display"
          key={`${hour}-${minute}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {formatTimeWords(hour, minute, language)}
        </motion.div>

        <div className="time-presets">
          {presetTimes.map(({ h, m, label }) => (
            <motion.button
              key={label}
              className="preset-btn"
              onClick={() => { setHour(h); setMinute(m); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// QUIZ MODE
// ============================================
function QuizMode({ onBack, t, language, onComplete }) {
  const { addXP } = useGamification()
  const [difficulty, setDifficulty] = useState(null)
  const [level, setLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [feedback, setFeedback] = useState(null)
  const [questions, setQuestions] = useState([])
  const [userHour, setUserHour] = useState(12)
  const [userMinute, setUserMinute] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [quizType, setQuizType] = useState('setTime') // 'setTime' or 'readTime'

  const difficultySettings = {
    easy: { questions: 5, minuteStep: 0, lives: 5 }, // Only full hours
    medium: { questions: 8, minuteStep: 30, lives: 3 }, // Half hours
    hard: { questions: 10, minuteStep: 5, lives: 2 } // Any 5-minute interval
  }

  const generateQuestions = (diff) => {
    const settings = difficultySettings[diff]
    const qs = []
    
    for (let i = 0; i < settings.questions; i++) {
      const hour = Math.floor(Math.random() * 12) + 1
      let minute = 0
      
      if (settings.minuteStep === 30) {
        minute = Math.random() > 0.5 ? 30 : 0
      } else if (settings.minuteStep === 5) {
        minute = Math.floor(Math.random() * 12) * 5
      }
      
      qs.push({ hour, minute, type: Math.random() > 0.5 ? 'setTime' : 'readTime' })
    }
    return qs
  }

  const startQuiz = (diff) => {
    setDifficulty(diff)
    setLevel(0)
    setScore(0)
    setLives(difficultySettings[diff].lives)
    setGameOver(false)
    setQuestions(generateQuestions(diff))
    setUserHour(12)
    setUserMinute(0)
  }

  const checkAnswer = () => {
    if (feedback) return
    
    const q = questions[level]
    const isCorrect = userHour === q.hour && userMinute === q.minute
    
    setFeedback(isCorrect ? 'correct' : 'wrong')
    
    if (isCorrect) {
      const points = difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10
      setScore(s => s + points)
    } else {
      setLives(l => l - 1)
    }

    setTimeout(() => {
      setFeedback(null)
      
      if (!isCorrect && lives <= 1) {
        setGameOver(true)
        addXP(score, 'Clock Quiz')
        if (onComplete) onComplete(score, questions.length * 10)
        return
      }
      
      if (level + 1 < questions.length) {
        setLevel(l => l + 1)
        setUserHour(12)
        setUserMinute(0)
      } else {
        setGameOver(true)
        const finalScore = score + (isCorrect ? (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10) : 0)
        addXP(finalScore, 'Clock Quiz')
        if (onComplete) onComplete(finalScore, questions.length * 10)
      }
    }, 1500)
  }

  // Difficulty selection
  if (!difficulty) {
    return (
      <div className="clock-game quiz-mode">
        <div className="clock-header">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h1>🎯 {t.quiz}</h1>
        </div>
        
        <p className="select-text">{t.selectDifficulty}</p>
        
        <div className="difficulty-selection">
          {['easy', 'medium', 'hard'].map((diff, i) => (
            <motion.button
              key={diff}
              className={`difficulty-btn ${diff}`}
              onClick={() => startQuiz(diff)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="diff-emoji">
                {diff === 'easy' ? '😊' : diff === 'medium' ? '🤔' : '😤'}
              </span>
              <div className="diff-info">
                <span className="diff-name">{t[diff]}</span>
                <span className="diff-desc">
                  {diff === 'easy' ? 'Full hours' : diff === 'medium' ? 'Half hours' : 'Any time'}
                </span>
              </div>
              <span className="diff-lives">
                {'❤️'.repeat(difficultySettings[diff].lives)}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Game over
  if (gameOver) {
    const maxScore = questions.length * (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10)
    const stars = Math.ceil((score / maxScore) * 5)
    
    return (
      <div className="clock-game quiz-mode">
        <div className="clock-header">
          <button className="back-btn" onClick={() => setDifficulty(null)}>← {t.back}</button>
          <h1>🎯 {t.quiz}</h1>
        </div>
        
        <motion.div 
          className="game-complete"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="trophy">{lives > 0 ? '🏆' : '😢'}</span>
          <h2>{lives > 0 ? t.completed : t.tryAgain}</h2>
          <div className="final-stats">
            <p>{t.score}: {score}</p>
            <p>{t.lives}: {'❤️'.repeat(lives)}</p>
          </div>
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < stars ? '⭐' : '☆'}</span>
            ))}
          </div>
          <motion.button
            className="play-again-btn"
            onClick={() => startQuiz(difficulty)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 {t.tryAgain}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const q = questions[level]

  return (
    <div className="clock-game quiz-mode">
      <div className="clock-header">
        <button className="back-btn" onClick={() => setDifficulty(null)}>← {t.back}</button>
        <h1>🎯 {t.quiz}</h1>
        <div className="game-stats">
          <span className="lives-display">{'❤️'.repeat(lives)}</span>
          <span className="score-display">{t.score}: {score}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((level + 1) / questions.length) * 100}%` }} />
        <span className="progress-text">{level + 1}/{questions.length}</span>
      </div>

      <div className="quiz-content">
        <p className="question-text">{t.setTime}</p>
        
        <motion.div 
          className="target-time"
          key={level}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {formatTimeWords(q.hour, q.minute, language)}
        </motion.div>

        <ClockFace 
          hour={userHour} 
          minute={userMinute} 
          size={240}
          interactive
          onHourChange={setUserHour}
          onMinuteChange={setUserMinute}
          theme="colorful"
        />

        <motion.button
          className="check-btn"
          onClick={checkAnswer}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!!feedback}
        >
          ✓ {t.check}
        </motion.button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`feedback-popup ${feedback}`}
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -50 }}
          >
            {feedback === 'correct' ? t.correct : t.wrong}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// ============================================
// DAILY ACTIVITIES MODE
// ============================================
function DailyMode({ onBack, t, language }) {
  const [currentActivity, setCurrentActivity] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const activity = DAILY_ACTIVITIES[currentActivity]

  const getPeriodColor = (period) => {
    switch (period) {
      case 'morning': return '#fbbf24'
      case 'afternoon': return '#22c55e'
      case 'evening': return '#f97316'
      case 'night': return '#6366f1'
      default: return '#8b5cf6'
    }
  }

  return (
    <div className="clock-game daily-mode">
      <div className="clock-header">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h1>📅 {t.activities}</h1>
      </div>

      <div className="daily-content">
        <div className="period-indicator" style={{ background: getPeriodColor(activity.period) }}>
          {t[activity.period]}
        </div>

        <ClockFace 
          hour={activity.time[0]} 
          minute={activity.time[1]} 
          size={220}
          theme={activity.period === 'night' ? 'night' : 'colorful'}
        />

        <motion.div 
          className="activity-card"
          key={currentActivity}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="activity-emoji">{activity.emoji}</span>
          <span className="activity-name">{t[activity.activity]}</span>
          <span className="activity-time">
            {activity.time[0]}:{activity.time[1].toString().padStart(2, '0')}
          </span>
        </motion.div>

        <p className="activity-question">{t.whatDoYouDo}</p>

        <div className="activity-navigation">
          <motion.button
            className="nav-btn prev"
            onClick={() => setCurrentActivity(i => (i - 1 + DAILY_ACTIVITIES.length) % DAILY_ACTIVITIES.length)}
            whileTap={{ scale: 0.9 }}
          >
            ← 
          </motion.button>
          
          <div className="activity-dots">
            {DAILY_ACTIVITIES.map((_, i) => (
              <span 
                key={i} 
                className={`dot ${i === currentActivity ? 'active' : ''}`}
                onClick={() => setCurrentActivity(i)}
              />
            ))}
          </div>
          
          <motion.button
            className="nav-btn next"
            onClick={() => setCurrentActivity(i => (i + 1) % DAILY_ACTIVITIES.length)}
            whileTap={{ scale: 0.9 }}
          >
            →
          </motion.button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN CLOCK GAME COMPONENT
// ============================================
export default function ClockGame({ onBack, onComplete }) {
  const { language } = useLanguage()
  const t = translations[language] || translations.uz
  const [mode, setMode] = useState(null)

  const modes = [
    { id: 'learn', icon: '📚', title: t.learn, color: '#3b82f6', desc: 'Interactive' },
    { id: 'quiz', icon: '🎯', title: t.quiz, color: '#22c55e', desc: '3 levels' },
    { id: 'daily', icon: '📅', title: t.daily, color: '#f97316', desc: '6 activities' }
  ]

  if (mode === 'learn') return <LearnMode onBack={() => setMode(null)} t={t} language={language} />
  if (mode === 'quiz') return <QuizMode onBack={() => setMode(null)} t={t} language={language} onComplete={onComplete} />
  if (mode === 'daily') return <DailyMode onBack={() => setMode(null)} t={t} language={language} />

  return (
    <div className="clock-game">
      <div className="clock-header">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h1>🕐 {t.title}</h1>
      </div>
      
      <p className="clock-subtitle">{t.subtitle}</p>

      {/* Demo clock */}
      <div className="demo-clock">
        <ClockFace hour={10} minute={10} size={180} theme="animated" showDigital={false} />
      </div>

      <div className="mode-selection">
        {modes.map((m, i) => (
          <motion.div
            key={m.id}
            className="mode-card"
            style={{ background: `linear-gradient(135deg, ${m.color} 0%, ${m.color}dd 100%)` }}
            onClick={() => setMode(m.id)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-title">{m.title}</span>
            <span className="mode-desc">{m.desc}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
