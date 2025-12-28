import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './MatchingPairs.css'

const translations = {
  uz: {
    title: "Juftliklar O'yini",
    subtitle: "Bir xil rasmlarni top!",
    back: "Orqaga",
    score: "Ball",
    moves: "Urinish",
    time: "Vaqt",
    completed: "Barakalla! 🏆",
    tryAgain: "Qayta o'ynash",
    newRecord: "Yangi rekord! 🎉",
    selectTheme: "Mavzuni tanlang",
    selectDifficulty: "Qiyinlikni tanlang",
    easy: "Oson",
    medium: "O'rta",
    hard: "Qiyin",
    pairs: "juft",
    bestTime: "Eng yaxshi",
    combo: "Kombo",
    perfect: "Mukammal!",
    themes: {
      animals: "Hayvonlar",
      fruits: "Mevalar",
      vehicles: "Transport",
      nature: "Tabiat",
      food: "Ovqatlar",
      sports: "Sport"
    }
  },
  ru: {
    title: "Найди Пару",
    subtitle: "Найди одинаковые картинки!",
    back: "Назад",
    score: "Очки",
    moves: "Ходы",
    time: "Время",
    completed: "Молодец! 🏆",
    tryAgain: "Ещё раз",
    newRecord: "Новый рекорд! 🎉",
    selectTheme: "Выберите тему",
    selectDifficulty: "Выберите сложность",
    easy: "Легко",
    medium: "Средне",
    hard: "Сложно",
    pairs: "пар",
    bestTime: "Лучшее",
    combo: "Комбо",
    perfect: "Идеально!",
    themes: {
      animals: "Животные",
      fruits: "Фрукты",
      vehicles: "Транспорт",
      nature: "Природа",
      food: "Еда",
      sports: "Спорт"
    }
  },
  en: {
    title: "Memory Match",
    subtitle: "Find matching pairs!",
    back: "Back",
    score: "Score",
    moves: "Moves",
    time: "Time",
    completed: "Well Done! 🏆",
    tryAgain: "Play Again",
    newRecord: "New Record! 🎉",
    selectTheme: "Select Theme",
    selectDifficulty: "Select Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    pairs: "pairs",
    bestTime: "Best",
    combo: "Combo",
    perfect: "Perfect!",
    themes: {
      animals: "Animals",
      fruits: "Fruits",
      vehicles: "Vehicles",
      nature: "Nature",
      food: "Food",
      sports: "Sports"
    }
  }
}


// Professional card data with real images
const THEMES = {
  animals: {
    icon: '🦁',
    color: '#f59e0b',
    cards: [
      { id: 'lion', emoji: '🦁', image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=200&h=200&fit=crop' },
      { id: 'elephant', emoji: '🐘', image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=200&h=200&fit=crop' },
      { id: 'panda', emoji: '🐼', image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=200&h=200&fit=crop' },
      { id: 'fox', emoji: '🦊', image: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=200&h=200&fit=crop' },
      { id: 'rabbit', emoji: '🐰', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop' },
      { id: 'cat', emoji: '🐱', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop' },
      { id: 'dog', emoji: '🐶', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop' },
      { id: 'owl', emoji: '🦉', image: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=200&h=200&fit=crop' },
      { id: 'dolphin', emoji: '🐬', image: 'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=200&h=200&fit=crop' },
      { id: 'butterfly', emoji: '🦋', image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=200&h=200&fit=crop' }
    ]
  },
  fruits: {
    icon: '🍎',
    color: '#ef4444',
    cards: [
      { id: 'apple', emoji: '🍎', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop' },
      { id: 'banana', emoji: '🍌', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop' },
      { id: 'orange', emoji: '🍊', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200&h=200&fit=crop' },
      { id: 'strawberry', emoji: '🍓', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop' },
      { id: 'grape', emoji: '🍇', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200&h=200&fit=crop' },
      { id: 'watermelon', emoji: '🍉', image: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=200&h=200&fit=crop' },
      { id: 'pineapple', emoji: '🍍', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200&h=200&fit=crop' },
      { id: 'cherry', emoji: '🍒', image: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=200&h=200&fit=crop' },
      { id: 'peach', emoji: '🍑', image: 'https://images.unsplash.com/photo-1629828874514-c1e5103f2150?w=200&h=200&fit=crop' },
      { id: 'lemon', emoji: '🍋', image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=200&h=200&fit=crop' }
    ]
  },
  vehicles: {
    icon: '🚗',
    color: '#3b82f6',
    cards: [
      { id: 'car', emoji: '🚗', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=200&fit=crop' },
      { id: 'bus', emoji: '🚌', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&h=200&fit=crop' },
      { id: 'plane', emoji: '✈️', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&h=200&fit=crop' },
      { id: 'train', emoji: '🚂', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=200&h=200&fit=crop' },
      { id: 'ship', emoji: '🚢', image: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=200&h=200&fit=crop' },
      { id: 'bike', emoji: '🚲', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&h=200&fit=crop' },
      { id: 'helicopter', emoji: '🚁', image: 'https://images.unsplash.com/photo-1534786676178-a8e5e9c52f1f?w=200&h=200&fit=crop' },
      { id: 'rocket', emoji: '🚀', image: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=200&h=200&fit=crop' },
      { id: 'motorcycle', emoji: '🏍️', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&h=200&fit=crop' },
      { id: 'tractor', emoji: '🚜', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=200&h=200&fit=crop' }
    ]
  },
  nature: {
    icon: '🌸',
    color: '#ec4899',
    cards: [
      { id: 'flower', emoji: '🌸', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop' },
      { id: 'tree', emoji: '🌳', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&h=200&fit=crop' },
      { id: 'sun', emoji: '☀️', image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=200&h=200&fit=crop' },
      { id: 'moon', emoji: '🌙', image: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=200&h=200&fit=crop' },
      { id: 'rainbow', emoji: '🌈', image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=200&h=200&fit=crop' },
      { id: 'mountain', emoji: '⛰️', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop' },
      { id: 'ocean', emoji: '🌊', image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&h=200&fit=crop' },
      { id: 'star', emoji: '⭐', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&h=200&fit=crop' },
      { id: 'leaf', emoji: '🍀', image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=200&h=200&fit=crop' },
      { id: 'snowflake', emoji: '❄️', image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=200&h=200&fit=crop' }
    ]
  },
  food: {
    icon: '🍕',
    color: '#f97316',
    cards: [
      { id: 'pizza', emoji: '🍕', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop' },
      { id: 'burger', emoji: '🍔', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
      { id: 'icecream', emoji: '🍦', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&h=200&fit=crop' },
      { id: 'cake', emoji: '🎂', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop' },
      { id: 'cookie', emoji: '🍪', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop' },
      { id: 'donut', emoji: '🍩', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop' },
      { id: 'hotdog', emoji: '🌭', image: 'https://images.unsplash.com/photo-1612392062631-94e9e8a8e8e8?w=200&h=200&fit=crop' },
      { id: 'fries', emoji: '🍟', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop' },
      { id: 'sushi', emoji: '🍣', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop' },
      { id: 'bread', emoji: '🍞', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop' }
    ]
  },
  sports: {
    icon: '⚽',
    color: '#22c55e',
    cards: [
      { id: 'soccer', emoji: '⚽', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&h=200&fit=crop' },
      { id: 'basketball', emoji: '🏀', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&h=200&fit=crop' },
      { id: 'tennis', emoji: '🎾', image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200&h=200&fit=crop' },
      { id: 'baseball', emoji: '⚾', image: 'https://images.unsplash.com/photo-1508344928928-7165b0a59f4c?w=200&h=200&fit=crop' },
      { id: 'swimming', emoji: '🏊', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&h=200&fit=crop' },
      { id: 'cycling', emoji: '🚴', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=200&h=200&fit=crop' },
      { id: 'skiing', emoji: '⛷️', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop' },
      { id: 'golf', emoji: '⛳', image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=200&h=200&fit=crop' },
      { id: 'boxing', emoji: '🥊', image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=200&h=200&fit=crop' },
      { id: 'volleyball', emoji: '🏐', image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=200&h=200&fit=crop' }
    ]
  }
}

const DIFFICULTY = {
  easy: { pairs: 4, cols: 4, rows: 2, time: null },
  medium: { pairs: 6, cols: 4, rows: 3, time: 90 },
  hard: { pairs: 10, cols: 5, rows: 4, time: 60 }
}


// Sound effects
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    if (type === 'flip') {
      osc.frequency.value = 600
      gain.gain.value = 0.05
      osc.start()
      setTimeout(() => { osc.stop(); ctx.close() }, 80)
    } else if (type === 'match') {
      osc.frequency.value = 800
      gain.gain.value = 0.08
      osc.start()
      setTimeout(() => { osc.frequency.value = 1000 }, 100)
      setTimeout(() => { osc.stop(); ctx.close() }, 200)
    } else if (type === 'wrong') {
      osc.frequency.value = 300
      gain.gain.value = 0.05
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
          g.gain.value = 0.08
          o.start()
          setTimeout(() => o.stop(), 150)
        }, i * 150)
      })
      setTimeout(() => ctx.close(), 800)
    }
  } catch (e) {}
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function MatchingPairs({ onBack, onComplete }) {
  const { language } = useLanguage()
  const { addXP, awardBadge, trackGameComplete } = useGamification()
  const t = translations[language] || translations.uz
  
  const [gameState, setGameState] = useState('theme') // theme, difficulty, playing, won
  const [theme, setTheme] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const [gameTime, setGameTime] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [perfectGame, setPerfectGame] = useState(true)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const timerRef = useRef(null)

  // Preload images
  useEffect(() => {
    if (theme && difficulty) {
      setImagesLoaded(false)
      const themeData = THEMES[theme]
      const imagesToLoad = themeData.cards.slice(0, DIFFICULTY[difficulty].pairs)
      let loaded = 0
      
      imagesToLoad.forEach(card => {
        const img = new Image()
        img.onload = () => {
          loaded++
          if (loaded === imagesToLoad.length) {
            setImagesLoaded(true)
          }
        }
        img.onerror = () => {
          loaded++
          if (loaded === imagesToLoad.length) {
            setImagesLoaded(true)
          }
        }
        img.src = card.image
      })
    }
  }, [theme, difficulty])

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setGameTime(t => t + 1)
        if (timeLeft !== null) {
          setTimeLeft(t => {
            if (t <= 1) {
              clearInterval(timerRef.current)
              setGameState('lost')
              return 0
            }
            return t - 1
          })
        }
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [gameState])

  const initGame = useCallback(() => {
    const config = DIFFICULTY[difficulty]
    const themeCards = THEMES[theme].cards.slice(0, config.pairs)
    
    const gameCards = [...themeCards, ...themeCards]
      .map((card, index) => ({ ...card, uniqueId: index }))
      .sort(() => Math.random() - 0.5)
    
    setCards(gameCards)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setGameTime(0)
    setTimeLeft(config.time)
    setPerfectGame(true)
    setGameState('playing')
  }, [theme, difficulty])

  useEffect(() => {
    if (theme && difficulty && imagesLoaded) {
      initGame()
    }
  }, [imagesLoaded])

  const handleCardClick = (uniqueId) => {
    if (gameState !== 'playing') return
    if (flipped.length === 2) return
    if (flipped.includes(uniqueId)) return
    if (matched.includes(uniqueId)) return

    playSound('flip')
    const newFlipped = [...flipped, uniqueId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      
      const [first, second] = newFlipped
      const firstCard = cards.find(c => c.uniqueId === first)
      const secondCard = cards.find(c => c.uniqueId === second)

      if (firstCard.id === secondCard.id) {
        // Match!
        playSound('match')
        const newMatched = [...matched, first, second]
        setMatched(newMatched)
        setFlipped([])
        
        const newCombo = combo + 1
        setCombo(newCombo)
        if (newCombo > maxCombo) setMaxCombo(newCombo)
        
        // Score calculation
        let points = 100
        if (newCombo >= 2) points += newCombo * 25
        if (timeLeft && timeLeft > 30) points += 20
        setScore(s => s + points)
        
        if (newCombo >= 2) {
          setShowCombo(true)
          setTimeout(() => setShowCombo(false), 800)
        }
        
        // Check win
        if (newMatched.length === cards.length) {
          clearInterval(timerRef.current)
          playSound('win')
          handleWin()
        }
      } else {
        // No match
        playSound('wrong')
        setCombo(0)
        setPerfectGame(false)
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  const handleWin = () => {
    setGameState('won')
    
    const config = DIFFICULTY[difficulty]
    let finalScore = score
    
    // Bonuses
    if (perfectGame) finalScore += 500
    if (maxCombo >= 3) finalScore += maxCombo * 50
    if (timeLeft && timeLeft > config.time / 2) finalScore += 200
    
    const diffMultiplier = difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1
    const xp = Math.round(finalScore * diffMultiplier / 10)
    
    addXP(xp, 'Memory Match')
    trackGameComplete('matching', finalScore, config.pairs * 200)
    
    if (perfectGame && difficulty === 'hard') {
      awardBadge('memory_master')
    }
    
    if (onComplete) onComplete(finalScore, config.pairs * 200)
  }

  const selectTheme = (themeName) => {
    setTheme(themeName)
    setGameState('difficulty')
  }

  const selectDifficulty = (diff) => {
    setDifficulty(diff)
  }

  const resetGame = () => {
    setTheme(null)
    setDifficulty(null)
    setGameState('theme')
  }


  // Theme Selection Screen
  if (gameState === 'theme') {
    return (
      <div className="matching-game">
        <div className="game-header">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h1>🎴 {t.title}</h1>
          <div />
        </div>
        
        <p className="game-subtitle">{t.selectTheme}</p>
        
        <div className="theme-grid">
          {Object.entries(THEMES).map(([key, data], i) => (
            <motion.div
              key={key}
              className="theme-card"
              style={{ '--theme-color': data.color }}
              onClick={() => selectTheme(key)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="theme-preview">
                {data.cards.slice(0, 4).map((card, j) => (
                  <motion.div 
                    key={card.id} 
                    className="preview-card"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08 + j * 0.05 }}
                  >
                    <img src={card.image} alt="" loading="lazy" />
                  </motion.div>
                ))}
              </div>
              <div className="theme-info">
                <span className="theme-icon">{data.icon}</span>
                <span className="theme-name">{t.themes[key]}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Difficulty Selection Screen
  if (gameState === 'difficulty') {
    return (
      <div className="matching-game">
        <div className="game-header">
          <button className="back-btn" onClick={() => setGameState('theme')}>← {t.back}</button>
          <h1>{THEMES[theme].icon} {t.themes[theme]}</h1>
          <div />
        </div>
        
        <p className="game-subtitle">{t.selectDifficulty}</p>
        
        <div className="difficulty-grid">
          {Object.entries(DIFFICULTY).map(([key, config], i) => (
            <motion.div
              key={key}
              className={`difficulty-card ${key}`}
              onClick={() => selectDifficulty(key)}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="diff-icon">
                {key === 'easy' ? '😊' : key === 'medium' ? '🤔' : '😤'}
              </div>
              <h3>{t[key]}</h3>
              <div className="diff-info">
                <span>{config.pairs} {t.pairs}</span>
                <span>{config.cols}x{config.rows}</span>
                {config.time && <span>⏱️ {config.time}s</span>}
              </div>
              <div className="diff-preview">
                {[...Array(Math.min(config.pairs, 6))].map((_, j) => (
                  <span key={j} className="mini-card" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        
        {!imagesLoaded && difficulty && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <p>Loading...</p>
          </div>
        )}
      </div>
    )
  }

  // Win Screen
  if (gameState === 'won') {
    const config = DIFFICULTY[difficulty]
    const stars = Math.min(5, Math.ceil((score / (config.pairs * 200)) * 5))
    
    return (
      <div className="matching-game game-over">
        <motion.div 
          className="win-modal"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <div className="win-trophy">{perfectGame ? '👑' : '🏆'}</div>
          <h2>{perfectGame ? t.perfect : t.completed}</h2>
          
          <div className="win-stats">
            <div className="stat-item">
              <span className="stat-icon">⏱️</span>
              <span className="stat-value">{formatTime(gameTime)}</span>
              <span className="stat-label">{t.time}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">👆</span>
              <span className="stat-value">{moves}</span>
              <span className="stat-label">{t.moves}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <span className="stat-value">{maxCombo}x</span>
              <span className="stat-label">{t.combo}</span>
            </div>
          </div>
          
          <div className="win-score">{score} {t.score}</div>
          
          <div className="win-stars">
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                {i < stars ? '⭐' : '☆'}
              </motion.span>
            ))}
          </div>
          
          <div className="win-buttons">
            <motion.button 
              className="btn-primary"
              onClick={initGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 {t.tryAgain}
            </motion.button>
            <motion.button 
              className="btn-secondary"
              onClick={resetGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎮 {t.back}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Game Screen
  const config = DIFFICULTY[difficulty]
  
  return (
    <div className="matching-game playing">
      <div className="game-header">
        <button className="back-btn" onClick={resetGame}>← {t.back}</button>
        <h1>{THEMES[theme].icon} {t.themes[theme]}</h1>
        <div className="game-stats">
          {timeLeft !== null && (
            <span className={`stat time ${timeLeft <= 10 ? 'warning' : ''}`}>
              ⏱️ {formatTime(timeLeft)}
            </span>
          )}
          <span className="stat">👆 {moves}</span>
          <span className="stat">💎 {score}</span>
        </div>
      </div>

      <div className="progress-bar">
        <motion.div 
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${(matched.length / cards.length) * 100}%` }}
          style={{ background: THEMES[theme].color }}
        />
      </div>

      <div 
        className="cards-grid"
        style={{ 
          gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
          maxWidth: `${config.cols * 90}px`
        }}
      >
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(card.uniqueId)
          const isMatched = matched.includes(card.uniqueId)
          
          return (
            <motion.div
              key={card.uniqueId}
              className={`game-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.uniqueId)}
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: isMatched ? 1 : 1.05 }}
            >
              <div className="card-inner">
                <div className="card-front" style={{ background: THEMES[theme].color }}>
                  <span className="card-pattern">✦</span>
                </div>
                <div className="card-back">
                  <img src={card.image} alt="" />
                  <span className="card-emoji">{card.emoji}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="match-counter">
        {matched.length / 2} / {cards.length / 2} 🎯
      </div>

      <AnimatePresence>
        {showCombo && combo >= 2 && (
          <motion.div
            className="combo-popup"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            🔥 {combo}x {t.combo}!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
