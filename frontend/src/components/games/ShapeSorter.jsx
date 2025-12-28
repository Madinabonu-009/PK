import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './ShapeSorter.css'

const translations = {
  uz: {
    title: "Shakllar va Ranglar",
    subtitle: "Shakllarni tanib ol!",
    back: "Orqaga",
    score: "Ball",
    correct: "Zo'r!",
    wrong: "Qayta urinib ko'r!",
    completed: "Barakalla!",
    tryAgain: "Qayta o'ynash",
    selectMode: "Rejimni tanlang",
    selectDifficulty: "Qiyinlikni tanlang",
    modes: { shapes: "Shakllar", colors: "Ranglar", mixed: "Aralash" },
    easy: "Oson",
    medium: "O'rta",
    hard: "Qiyin",
    findShape: "Bu qaysi shakl?",
    findColor: "Bu qaysi rang?",
    streak: "Ketma-ket",
    perfect: "Mukammal!",
    questions: "savol",
    options: "variant"
  },
  ru: {
    title: "Фигуры и Цвета",
    subtitle: "Узнай фигуры!",
    back: "Назад",
    score: "Очки",
    correct: "Супер!",
    wrong: "Попробуй ещё!",
    completed: "Молодец!",
    tryAgain: "Ещё раз",
    selectMode: "Выберите режим",
    selectDifficulty: "Выберите сложность",
    modes: { shapes: "Фигуры", colors: "Цвета", mixed: "Смешанный" },
    easy: "Легко",
    medium: "Средне",
    hard: "Сложно",
    findShape: "Какая это фигура?",
    findColor: "Какой это цвет?",
    streak: "Серия",
    perfect: "Идеально!",
    questions: "вопросов",
    options: "вариантов"
  },
  en: {
    title: "Shapes & Colors",
    subtitle: "Learn shapes!",
    back: "Back",
    score: "Score",
    correct: "Great!",
    wrong: "Try again!",
    completed: "Well Done!",
    tryAgain: "Play Again",
    selectMode: "Select Mode",
    selectDifficulty: "Select Difficulty",
    modes: { shapes: "Shapes", colors: "Colors", mixed: "Mixed" },
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    findShape: "What shape is this?",
    findColor: "What color is this?",
    streak: "Streak",
    perfect: "Perfect!",
    questions: "questions",
    options: "options"
  }
}


// Shape definitions with SVG paths
const SHAPES = [
  { id: 'circle', name: { uz: 'Doira', ru: 'Круг', en: 'Circle' }, path: 'M50,10 a40,40 0 1,0 0,80 a40,40 0 1,0 0,-80' },
  { id: 'square', name: { uz: 'Kvadrat', ru: 'Квадрат', en: 'Square' }, path: 'M15,15 h70 v70 h-70 z' },
  { id: 'triangle', name: { uz: 'Uchburchak', ru: 'Треугольник', en: 'Triangle' }, path: 'M50,10 L90,90 L10,90 Z' },
  { id: 'star', name: { uz: 'Yulduz', ru: 'Звезда', en: 'Star' }, path: 'M50,5 L61,40 L98,40 L68,62 L79,97 L50,75 L21,97 L32,62 L2,40 L39,40 Z' },
  { id: 'heart', name: { uz: 'Yurak', ru: 'Сердце', en: 'Heart' }, path: 'M50,88 C20,60 5,40 25,20 C40,5 50,15 50,30 C50,15 60,5 75,20 C95,40 80,60 50,88 Z' },
  { id: 'diamond', name: { uz: 'Romb', ru: 'Ромб', en: 'Diamond' }, path: 'M50,5 L95,50 L50,95 L5,50 Z' },
  { id: 'hexagon', name: { uz: 'Oltiburchak', ru: 'Шестиугольник', en: 'Hexagon' }, path: 'M50,5 L90,27 L90,73 L50,95 L10,73 L10,27 Z' },
  { id: 'pentagon', name: { uz: 'Beshburchak', ru: 'Пятиугольник', en: 'Pentagon' }, path: 'M50,5 L95,38 L77,95 L23,95 L5,38 Z' },
  { id: 'oval', name: { uz: 'Oval', ru: 'Овал', en: 'Oval' }, path: 'M50,10 a35,45 0 1,0 0,80 a35,45 0 1,0 0,-80' },
  { id: 'crescent', name: { uz: 'Yarim oy', ru: 'Полумесяц', en: 'Crescent' }, path: 'M50,5 a45,45 0 1,1 0,90 a35,35 0 1,0 0,-90' }
]

const COLORS = [
  { id: 'red', name: { uz: 'Qizil', ru: 'Красный', en: 'Red' }, hex: '#ef4444', light: '#fecaca' },
  { id: 'blue', name: { uz: "Ko'k", ru: 'Синий', en: 'Blue' }, hex: '#3b82f6', light: '#bfdbfe' },
  { id: 'green', name: { uz: 'Yashil', ru: 'Зелёный', en: 'Green' }, hex: '#22c55e', light: '#bbf7d0' },
  { id: 'yellow', name: { uz: 'Sariq', ru: 'Жёлтый', en: 'Yellow' }, hex: '#eab308', light: '#fef08a' },
  { id: 'purple', name: { uz: 'Binafsha', ru: 'Фиолетовый', en: 'Purple' }, hex: '#a855f7', light: '#e9d5ff' },
  { id: 'orange', name: { uz: "To'q sariq", ru: 'Оранжевый', en: 'Orange' }, hex: '#f97316', light: '#fed7aa' },
  { id: 'pink', name: { uz: 'Pushti', ru: 'Розовый', en: 'Pink' }, hex: '#ec4899', light: '#fbcfe8' },
  { id: 'cyan', name: { uz: 'Moviy', ru: 'Голубой', en: 'Cyan' }, hex: '#06b6d4', light: '#a5f3fc' },
  { id: 'brown', name: { uz: 'Jigarrang', ru: 'Коричневый', en: 'Brown' }, hex: '#a16207', light: '#fde68a' },
  { id: 'gray', name: { uz: 'Kulrang', ru: 'Серый', en: 'Gray' }, hex: '#6b7280', light: '#e5e7eb' }
]

const DIFFICULTY = {
  easy: { questions: 6, options: 3, time: null, shapes: 4, colors: 4 },
  medium: { questions: 8, options: 4, time: 15, shapes: 6, colors: 6 },
  hard: { questions: 10, options: 5, time: 10, shapes: 8, colors: 8 }
}

// Shape SVG Component
function ShapeIcon({ shape, color, size = 80, animate = false }) {
  return (
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100"
      animate={animate ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <defs>
        <linearGradient id={`grad-${shape.id}-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
        <filter id="shapeShadow">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>
      <path 
        d={shape.path} 
        fill={`url(#grad-${shape.id}-${color})`}
        stroke="rgba(0,0,0,0.2)" 
        strokeWidth="2" 
        filter="url(#shapeShadow)"
      />
    </motion.svg>
  )
}

// Sound effects
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    if (type === 'correct') {
      osc.frequency.value = 800
      gain.gain.value = 0.06
      osc.start()
      setTimeout(() => { osc.frequency.value = 1000 }, 100)
      setTimeout(() => { osc.stop(); ctx.close() }, 200)
    } else if (type === 'wrong') {
      osc.frequency.value = 300
      gain.gain.value = 0.04
      osc.start()
      setTimeout(() => { osc.stop(); ctx.close() }, 150)
    } else if (type === 'win') {
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.connect(g)
          g.connect(ctx.destination)
          o.frequency.value = freq
          g.gain.value = 0.06
          o.start()
          setTimeout(() => o.stop(), 150)
        }, i * 150)
      })
      setTimeout(() => ctx.close(), 800)
    }
  } catch (e) {}
}


export default function ShapeSorter({ onBack, onComplete }) {
  const { language } = useLanguage()
  const { addXP, awardBadge, trackGameComplete } = useGamification()
  const t = translations[language] || translations.uz
  
  const [gameState, setGameState] = useState('mode')
  const [mode, setMode] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [perfectGame, setPerfectGame] = useState(true)

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft === null) return
    if (timeLeft <= 0) {
      handleTimeout()
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, gameState])

  const handleTimeout = () => {
    setFeedback('timeout')
    setStreak(0)
    setPerfectGame(false)
    setTimeout(() => {
      setFeedback(null)
      nextQuestion()
    }, 1000)
  }

  const generateQuestions = useCallback(() => {
    const config = DIFFICULTY[difficulty]
    const qs = []
    const availableShapes = SHAPES.slice(0, config.shapes)
    const availableColors = COLORS.slice(0, config.colors)
    
    for (let i = 0; i < config.questions; i++) {
      const targetShape = availableShapes[Math.floor(Math.random() * availableShapes.length)]
      const targetColor = availableColors[Math.floor(Math.random() * availableColors.length)]
      
      if (mode === 'shapes' || (mode === 'mixed' && i % 2 === 0)) {
        const options = [targetShape]
        while (options.length < config.options) {
          const randomShape = availableShapes[Math.floor(Math.random() * availableShapes.length)]
          if (!options.find(o => o.id === randomShape.id)) {
            options.push(randomShape)
          }
        }
        qs.push({
          type: 'shape',
          target: targetShape,
          color: targetColor,
          options: options.sort(() => Math.random() - 0.5)
        })
      } else {
        const options = [targetColor]
        while (options.length < config.options) {
          const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)]
          if (!options.find(o => o.id === randomColor.id)) {
            options.push(randomColor)
          }
        }
        qs.push({
          type: 'color',
          target: targetColor,
          shape: targetShape,
          options: options.sort(() => Math.random() - 0.5)
        })
      }
    }
    return qs
  }, [mode, difficulty])

  const initGame = useCallback(() => {
    const config = DIFFICULTY[difficulty]
    setQuestions(generateQuestions())
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setPerfectGame(true)
    setTimeLeft(config.time)
    setGameState('playing')
  }, [difficulty, generateQuestions])

  useEffect(() => {
    if (mode && difficulty) {
      initGame()
    }
  }, [mode, difficulty])

  const handleAnswer = (answer) => {
    if (feedback) return
    
    const q = questions[currentIndex]
    const isCorrect = answer.id === q.target.id
    
    if (isCorrect) {
      playSound('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > maxStreak) setMaxStreak(newStreak)
      
      let points = 100
      if (newStreak >= 2) points += newStreak * 20
      if (timeLeft && timeLeft > DIFFICULTY[difficulty].time / 2) points += 30
      setScore(s => s + points)
      
      setFeedback('correct')
    } else {
      playSound('wrong')
      setStreak(0)
      setPerfectGame(false)
      setFeedback('wrong')
    }

    setTimeout(() => {
      setFeedback(null)
      nextQuestion()
    }, 1000)
  }

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(i => i + 1)
      if (DIFFICULTY[difficulty].time) {
        setTimeLeft(DIFFICULTY[difficulty].time)
      }
    } else {
      endGame()
    }
  }

  const endGame = () => {
    playSound('win')
    setGameState('won')
    
    const config = DIFFICULTY[difficulty]
    let finalScore = score
    if (perfectGame) finalScore += 300
    if (maxStreak >= 3) finalScore += maxStreak * 25
    
    const diffMultiplier = difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1
    const xp = Math.round(finalScore * diffMultiplier / 10)
    
    addXP(xp, 'Shape Sorter')
    trackGameComplete('shapesorter', finalScore, config.questions * 100)
    
    if (perfectGame && difficulty === 'hard') {
      awardBadge('shape_master')
    }
    
    if (onComplete) onComplete(finalScore, config.questions * 100)
  }

  const resetGame = () => {
    setMode(null)
    setDifficulty(null)
    setGameState('mode')
  }


  // Mode Selection
  if (gameState === 'mode') {
    return (
      <div className="shape-sorter">
        <div className="night-sky-bg"><div className="stars-layer"></div></div>
        
        <div className="game-header">
          <button className="back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {t.back}
          </button>
          <h1>{t.title}</h1>
          <div />
        </div>
        
        <p className="game-subtitle">{t.selectMode}</p>
        
        <div className="mode-grid">
          <motion.div
            className="mode-card shapes"
            onClick={() => { setMode('shapes'); setGameState('difficulty') }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="mode-preview">
              {SHAPES.slice(0, 4).map((s, i) => (
                <ShapeIcon key={s.id} shape={s} color={COLORS[i].hex} size={40} />
              ))}
            </div>
            <h3>{t.modes.shapes}</h3>
          </motion.div>

          <motion.div
            className="mode-card colors"
            onClick={() => { setMode('colors'); setGameState('difficulty') }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="color-preview">
              {COLORS.slice(0, 6).map(c => (
                <span key={c.id} className="color-dot" style={{ background: c.hex }} />
              ))}
            </div>
            <h3>{t.modes.colors}</h3>
          </motion.div>

          <motion.div
            className="mode-card mixed"
            onClick={() => { setMode('mixed'); setGameState('difficulty') }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="mixed-preview">
              <ShapeIcon shape={SHAPES[0]} color={COLORS[0].hex} size={35} />
              <span className="plus">+</span>
              <span className="color-dot large" style={{ background: COLORS[1].hex }} />
            </div>
            <h3>{t.modes.mixed}</h3>
          </motion.div>
        </div>
      </div>
    )
  }

  // Difficulty Selection
  if (gameState === 'difficulty') {
    return (
      <div className="shape-sorter">
        <div className="night-sky-bg"><div className="stars-layer"></div></div>
        
        <div className="game-header">
          <button className="back-btn" onClick={() => setGameState('mode')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {t.back}
          </button>
          <h1>{t.modes[mode]}</h1>
          <div />
        </div>
        
        <p className="game-subtitle">{t.selectDifficulty}</p>
        
        <div className="difficulty-grid">
          {Object.entries(DIFFICULTY).map(([key, config], i) => (
            <motion.div
              key={key}
              className={`difficulty-card ${key}`}
              onClick={() => setDifficulty(key)}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="diff-icon">
                <svg width="48" height="48" viewBox="0 0 100 100">
                  <path d={SHAPES[i].path} fill={key === 'easy' ? '#22c55e' : key === 'medium' ? '#f59e0b' : '#ef4444'} />
                </svg>
              </div>
              <h3>{t[key]}</h3>
              <div className="diff-info">
                <span>{config.questions} {t.questions}</span>
                <span>{config.options} {t.options}</span>
                {config.time && <span>⏱️ {config.time}s</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }


  // Win Screen
  if (gameState === 'won') {
    const config = DIFFICULTY[difficulty]
    const stars = Math.min(5, Math.ceil((score / (config.questions * 100)) * 5))
    
    return (
      <div className="shape-sorter game-over">
        <div className="night-sky-bg"><div className="stars-layer"></div></div>
        
        <motion.div 
          className="win-modal"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <div className="win-trophy">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={perfectGame ? '#fbbf24' : '#f59e0b'} strokeWidth="1.5">
              <path d="M8 21h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C21 14.72 21 13.88 21 12.2V6.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C18.72 2 17.88 2 16.2 2H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C3 4.28 3 5.12 3 6.8v5.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C5.28 17 6.12 17 7.8 17z"/>
            </svg>
          </div>
          <h2>{perfectGame ? t.perfect : t.completed}</h2>
          
          <div className="win-stats">
            <div className="stat-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
              <span className="stat-value">{maxStreak}</span>
              <span className="stat-label">{t.streak}</span>
            </div>
            <div className="stat-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span className="stat-value">{Math.round((score / (config.questions * 100)) * 100)}%</span>
              <span className="stat-label">{t.correct}</span>
            </div>
          </div>
          
          <div className="win-score">{score} {t.score}</div>
          
          <div className="win-stars">
            {[...Array(5)].map((_, i) => (
              <motion.svg
                key={i}
                width="32" height="32" viewBox="0 0 24 24"
                fill={i < stars ? '#fbbf24' : 'none'}
                stroke="#fbbf24" strokeWidth="2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </motion.svg>
            ))}
          </div>
          
          <div className="win-buttons">
            <motion.button className="btn-primary" onClick={initGame} whileHover={{ scale: 1.05 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              {t.tryAgain}
            </motion.button>
            <motion.button className="btn-secondary" onClick={resetGame} whileHover={{ scale: 1.05 }}>
              {t.back}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Game Screen
  if (questions.length === 0) return null
  const q = questions[currentIndex]
  const config = DIFFICULTY[difficulty]

  return (
    <div className="shape-sorter playing">
      <div className="night-sky-bg"><div className="stars-layer"></div></div>
      
      <div className="game-header">
        <button className="back-btn" onClick={resetGame}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.back}
        </button>
        <h1>{t.modes[mode]}</h1>
        <div className="game-stats">
          {timeLeft !== null && (
            <span className={`stat time ${timeLeft <= 3 ? 'warning' : ''}`}>⏱️ {timeLeft}s</span>
          )}
          <span className="stat">{score}</span>
          {streak >= 2 && <span className="stat streak">{streak}x</span>}
        </div>
      </div>

      <div className="progress-bar">
        <motion.div className="progress-fill" animate={{ width: `${(currentIndex / questions.length) * 100}%` }} />
      </div>

      <div className="progress-dots">
        {questions.map((_, i) => (
          <span key={i} className={`dot ${i === currentIndex ? 'active' : i < currentIndex ? 'done' : ''}`} />
        ))}
      </div>

      <div className="question-area">
        <p className="question-text">{q.type === 'shape' ? t.findShape : t.findColor}</p>
        
        <motion.div 
          className="target-display"
          key={currentIndex}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          {q.type === 'shape' ? (
            <ShapeIcon shape={q.target} color={q.color.hex} size={120} animate />
          ) : (
            <ShapeIcon shape={q.shape} color={q.target.hex} size={120} animate />
          )}
        </motion.div>
        
        <p className="target-name">{q.type === 'shape' ? q.target.name[language] : q.target.name[language]}</p>
      </div>

      <div className={`options-grid cols-${Math.min(config.options, 3)}`}>
        {q.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            className={`option-btn ${feedback === 'correct' && opt.id === q.target.id ? 'correct' : ''} ${feedback === 'wrong' && opt.id === q.target.id ? 'show-correct' : ''}`}
            onClick={() => handleAnswer(opt)}
            disabled={!!feedback}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: feedback ? 1 : 1.08, y: feedback ? 0 : -5 }}
            whileTap={{ scale: 0.95 }}
          >
            {q.type === 'shape' ? (
              <ShapeIcon shape={opt} color={q.color.hex} size={60} />
            ) : (
              <div className="color-option">
                <span className="color-circle" style={{ background: opt.hex }} />
                <span className="color-name">{opt.name[language]}</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`feedback-popup ${feedback}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {feedback === 'correct' ? t.correct : feedback === 'timeout' ? '⏱️' : t.wrong}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}