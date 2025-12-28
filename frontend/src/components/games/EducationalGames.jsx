import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import './EducationalGames.css'

// ==================== 1. XOTIRA O'YINI (Memory Game) ====================
const MemoryGame = ({ onClose, texts }) => {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [difficulty, setDifficulty] = useState(null)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bestScores, setBestScores] = useState({ easy: null, medium: null, hard: null })
  const timerRef = useRef(null)

  const difficulties = {
    easy: { pairs: 6, cols: 3, emoji: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒'] },
    medium: { pairs: 8, cols: 4, emoji: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'] },
    hard: { pairs: 12, cols: 4, emoji: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🛵', '🚲', '✈️'] }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (isPlaying && !gameWon) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, gameWon])

  const startGame = (level) => {
    const config = difficulties[level]
    const shuffled = [...config.emoji, ...config.emoji]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }))
    
    setDifficulty(level)
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setTimer(0)
    setGameWon(false)
    setIsPlaying(true)
  }

  const handleCardClick = (index) => {
    if (!isPlaying || flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return
    
    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newFlipped
      
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const newMatched = [...matched, first, second]
          setMatched(newMatched)
          setFlipped([])
          
          if (newMatched.length === cards.length) {
            setGameWon(true)
            setIsPlaying(false)
            const score = timer
            if (!bestScores[difficulty] || score < bestScores[difficulty]) {
              setBestScores(prev => ({ ...prev, [difficulty]: score }))
            }
          }
        }, 300)
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStars = () => {
    const config = difficulties[difficulty]
    const optimalMoves = config.pairs
    if (moves <= optimalMoves * 1.5) return 3
    if (moves <= optimalMoves * 2) return 2
    return 1
  }

  if (!difficulty) {
    return (
      <div className="game-container memory-game">
        <div className="game-header">
          <div className="game-icon">🧠</div>
          <h2>{texts.memoryTitle}</h2>
          <p className="game-subtitle">{texts.memoryDesc}</p>
        </div>
        <div className="difficulty-select">
          <h3>{texts.selectDifficulty}</h3>
          <div className="difficulty-buttons">
            <button className="diff-btn easy" onClick={() => startGame('easy')}>
              <span className="diff-icon">🌱</span>
              <span className="diff-name">{texts.easy}</span>
              <span className="diff-info">6 {texts.pairs}</span>
            </button>
            <button className="diff-btn medium" onClick={() => startGame('medium')}>
              <span className="diff-icon">🌿</span>
              <span className="diff-name">{texts.medium}</span>
              <span className="diff-info">8 {texts.pairs}</span>
            </button>
            <button className="diff-btn hard" onClick={() => startGame('hard')}>
              <span className="diff-icon">🌳</span>
              <span className="diff-name">{texts.hard}</span>
              <span className="diff-info">12 {texts.pairs}</span>
            </button>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  if (gameWon) {
    const stars = getStars()
    return (
      <div className="game-container memory-game">
        <div className="game-complete">
          <div className="confetti-container">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="confetti" style={{ 
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 5)]
              }} />
            ))}
          </div>
          <div className="trophy">🏆</div>
          <h2>{texts.congratulations}!</h2>
          <div className="stars-display">
            {[1, 2, 3].map(i => (
              <span key={i} className={`star ${i <= stars ? 'active' : ''}`}>⭐</span>
            ))}
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">⏱️</span>
              <span className="stat-value">{formatTime(timer)}</span>
              <span className="stat-label">{texts.time}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">👆</span>
              <span className="stat-value">{moves}</span>
              <span className="stat-label">{texts.moves}</span>
            </div>
          </div>
          <div className="complete-buttons">
            <button className="btn-primary" onClick={() => startGame(difficulty)}>{texts.playAgain}</button>
            <button className="btn-secondary" onClick={() => setDifficulty(null)}>{texts.changeDifficulty}</button>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  const config = difficulties[difficulty]

  return (
    <div className="game-container memory-game">
      <div className="game-topbar">
        <div className="topbar-item">
          <span className="topbar-icon">⏱️</span>
          <span className="topbar-value">{formatTime(timer)}</span>
        </div>
        <div className="topbar-item">
          <span className="topbar-icon">👆</span>
          <span className="topbar-value">{moves}</span>
        </div>
        <div className="topbar-item">
          <span className="topbar-icon">✅</span>
          <span className="topbar-value">{matched.length / 2}/{config.pairs}</span>
        </div>
      </div>

      <div 
        className="memory-grid" 
        style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`memory-card ${flipped.includes(index) ? 'flipped' : ''} ${matched.includes(index) ? 'matched' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">
                <span className="card-pattern">?</span>
              </div>
              <div className="card-back">
                <span className="card-emoji">{card.emoji}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="close-btn" onClick={onClose}>{texts.close}</button>
    </div>
  )
}


// ==================== 2. KASBLAR O'YINI (Role Play Game) ====================
const RolePlayGame = ({ onClose, texts }) => {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [selected, setSelected] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [combo, setCombo] = useState(0)
  const [showFeedback, setShowFeedback] = useState(null)
  const [items, setItems] = useState([])

  const levels = [
    { 
      profession: '👨‍⚕️', 
      nameKey: 'doctor',
      bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      correct: ['💊', '🩺', '💉', '🏥'],
      wrong: ['🔧', '📚', '🎨', '🍳']
    },
    { 
      profession: '👨‍🍳', 
      nameKey: 'chef',
      bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      correct: ['🍳', '🥄', '🔪', '👨‍🍳'],
      wrong: ['💊', '🔨', '✂️', '📐']
    },
    { 
      profession: '👨‍🏫', 
      nameKey: 'teacher',
      bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      correct: ['📚', '✏️', '📝', '🎓'],
      wrong: ['🍳', '💊', '🔧', '🚒']
    },
    { 
      profession: '👨‍🚒', 
      nameKey: 'firefighter',
      bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      correct: ['🚒', '🧯', '🪜', '🔥'],
      wrong: ['📚', '🍳', '💊', '✏️']
    },
    { 
      profession: '👮', 
      nameKey: 'police',
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      correct: ['🚔', '🔫', '🚨', '📻'],
      wrong: ['🍳', '📚', '💊', '🔧']
    },
    { 
      profession: '👨‍🌾', 
      nameKey: 'farmer',
      bg: 'linear-gradient(135deg, #96e6a1 0%, #d4fc79 100%)',
      correct: ['🚜', '🌾', '🐄', '🥕'],
      wrong: ['💊', '📚', '🔧', '🚒']
    }
  ]

  const totalLevels = levels.length

  useEffect(() => {
    if (currentLevel < totalLevels && !showResult && !gameOver) {
      const level = levels[currentLevel]
      const allItems = [...level.correct, ...level.wrong].sort(() => Math.random() - 0.5)
      setItems(allItems)
      setSelected([])
    }
  }, [currentLevel, showResult, gameOver])

  const handleItemClick = (item) => {
    if (selected.includes(item) || gameOver || showResult || currentLevel >= totalLevels) return
    
    const level = levels[currentLevel]
    if (!level) return
    
    const isCorrect = level.correct.includes(item)
    
    setSelected(prev => [...prev, item])
    
    if (isCorrect) {
      setScore(s => s + 10 + combo * 5)
      setCombo(c => c + 1)
      setShowFeedback({ type: 'correct', item })
    } else {
      setLives(l => l - 1)
      setCombo(0)
      setShowFeedback({ type: 'wrong', item })
      
      if (lives <= 1) {
        setGameOver(true)
        return
      }
    }
    
    setTimeout(() => setShowFeedback(null), 500)
  }

  const nextLevel = () => {
    if (currentLevel >= totalLevels - 1) {
      setShowResult(true)
    } else {
      setCurrentLevel(c => c + 1)
    }
  }

  const restart = () => {
    setCurrentLevel(0)
    setScore(0)
    setLives(3)
    setSelected([])
    setShowResult(false)
    setGameOver(false)
    setCombo(0)
  }

  const allCorrectSelected = () => {
    if (currentLevel >= levels.length) return false
    const level = levels[currentLevel]
    return level.correct.every(item => selected.includes(item))
  }

  if (showResult) {
    const percentage = Math.round((score / (levels.length * 40)) * 100)
    return (
      <div className="game-container roleplay-game">
        <div className="game-complete">
          <div className="trophy">{percentage >= 80 ? '🏆' : percentage >= 50 ? '🥈' : '🥉'}</div>
          <h2>{texts.congratulations}!</h2>
          <div className="score-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="score-bg" />
              <circle 
                cx="50" cy="50" r="45" 
                className="score-fill"
                style={{ strokeDashoffset: 283 - (283 * percentage / 100) }}
              />
            </svg>
            <span className="score-text">{percentage}%</span>
          </div>
          <p className="final-score">{texts.totalScore}: {score}</p>
          <button className="btn-primary" onClick={restart}>{texts.playAgain}</button>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="game-container roleplay-game">
        <div className="game-over-screen">
          <div className="game-over-icon">💔</div>
          <h2>{texts.gameOver}</h2>
          <p>{texts.yourScore}: {score}</p>
          <p>{texts.reachedLevel}: {currentLevel + 1}/{levels.length}</p>
          <button className="btn-primary" onClick={restart}>{texts.tryAgain}</button>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  const level = levels[currentLevel]
  
  if (!level) {
    return null
  }

  return (
    <div className="game-container roleplay-game" style={{ background: level.bg }}>
      <div className="game-topbar dark">
        <div className="topbar-item">
          <span className="topbar-icon">❤️</span>
          <span className="topbar-value">{lives}</span>
        </div>
        <div className="topbar-item">
          <span className="topbar-icon">⭐</span>
          <span className="topbar-value">{score}</span>
        </div>
        <div className="topbar-item">
          <span className="topbar-icon">🔥</span>
          <span className="topbar-value">x{combo}</span>
        </div>
      </div>

      <div className="level-indicator">
        {levels.map((_, i) => (
          <div key={i} className={`level-dot ${i < currentLevel ? 'completed' : i === currentLevel ? 'current' : ''}`} />
        ))}
      </div>

      <div className="profession-display">
        <div className="profession-avatar">{level.profession}</div>
        <h3>{texts[level.nameKey]}</h3>
        <p>{texts.selectCorrectItems}</p>
      </div>

      <div className="items-grid-pro">
        {items.map((item, index) => {
          const isSelected = selected.includes(item)
          const isCorrect = level.correct.includes(item)
          return (
            <button
              key={index}
              className={`item-btn-pro ${isSelected ? (isCorrect ? 'correct' : 'wrong') : ''}`}
              onClick={() => handleItemClick(item)}
              disabled={isSelected}
            >
              <span className="item-emoji">{item}</span>
              {isSelected && (
                <span className="item-feedback">{isCorrect ? '✓' : '✗'}</span>
              )}
            </button>
          )
        })}
      </div>

      {showFeedback && (
        <div className={`feedback-popup ${showFeedback.type}`}>
          {showFeedback.type === 'correct' ? '+' + (10 + (combo - 1) * 5) : '-1 ❤️'}
        </div>
      )}

      {allCorrectSelected() && (
        <button className="next-level-btn" onClick={nextLevel}>
          {currentLevel < levels.length - 1 ? texts.nextLevel : texts.finish} →
        </button>
      )}

      <button className="close-btn" onClick={onClose}>{texts.close}</button>
    </div>
  )
}


// ==================== 3. TEZKORLIK O'YINI (Reaction Game) ====================
const ReactionGame = ({ onClose, texts }) => {
  const [gameState, setGameState] = useState('menu')
  const [startTime, setStartTime] = useState(0)
  const [reactionTime, setReactionTime] = useState(0)
  const [results, setResults] = useState([])
  const [round, setRound] = useState(0)
  const [totalRounds] = useState(5)
  const [tooEarly, setTooEarly] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const startRound = () => {
    setGameState('waiting')
    setTooEarly(false)
    
    const delay = Math.random() * 3000 + 2000
    timeoutRef.current = setTimeout(() => {
      setGameState('click')
      setStartTime(Date.now())
    }, delay)
  }

  const handleClick = () => {
    if (gameState === 'menu') {
      setResults([])
      setRound(1)
      startRound()
      return
    }

    if (gameState === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setTooEarly(true)
      setGameState('early')
      return
    }

    if (gameState === 'click') {
      const time = Date.now() - startTime
      setReactionTime(time)
      setResults(prev => [...prev, time])
      setGameState('result')
    }

    if (gameState === 'result' || gameState === 'early') {
      if (round < totalRounds) {
        setRound(r => r + 1)
        startRound()
      } else {
        setGameState('complete')
      }
    }
  }

  const getAverage = () => {
    if (results.length === 0) return 0
    return Math.round(results.reduce((a, b) => a + b, 0) / results.length)
  }

  const getBest = () => {
    if (results.length === 0) return 0
    return Math.min(...results)
  }

  const getRank = (time) => {
    if (time < 200) return { emoji: '⚡', text: texts.lightning, color: '#FFD700' }
    if (time < 250) return { emoji: '🚀', text: texts.superFast, color: '#FF6B6B' }
    if (time < 300) return { emoji: '🏃', text: texts.fast, color: '#4ECDC4' }
    if (time < 400) return { emoji: '👍', text: texts.good, color: '#45B7D1' }
    return { emoji: '🐢', text: texts.slow, color: '#96CEB4' }
  }

  const restart = () => {
    setGameState('menu')
    setResults([])
    setRound(0)
  }

  if (gameState === 'complete') {
    const avg = getAverage()
    const best = getBest()
    const rank = getRank(avg)
    
    return (
      <div className="game-container reaction-game">
        <div className="game-complete">
          <div className="rank-badge" style={{ background: rank.color }}>
            <span className="rank-emoji">{rank.emoji}</span>
            <span className="rank-text">{rank.text}</span>
          </div>
          <h2>{texts.results}</h2>
          <div className="reaction-stats">
            <div className="reaction-stat">
              <span className="stat-label">{texts.average}</span>
              <span className="stat-value">{avg}ms</span>
            </div>
            <div className="reaction-stat best">
              <span className="stat-label">{texts.bestTime}</span>
              <span className="stat-value">{best}ms</span>
            </div>
          </div>
          <div className="results-chart">
            {results.map((time, i) => (
              <div key={i} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${Math.min(100, (time / 500) * 100)}%`,
                    background: getRank(time).color
                  }}
                />
                <span className="chart-label">{i + 1}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={restart}>{texts.playAgain}</button>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  return (
    <div className="game-container reaction-game">
      {gameState !== 'menu' && (
        <div className="game-topbar">
          <div className="topbar-item">
            <span className="topbar-icon">🎯</span>
            <span className="topbar-value">{round}/{totalRounds}</span>
          </div>
          {results.length > 0 && (
            <div className="topbar-item">
              <span className="topbar-icon">⚡</span>
              <span className="topbar-value">{getBest()}ms</span>
            </div>
          )}
        </div>
      )}

      <div 
        className={`reaction-area ${gameState}`}
        onClick={handleClick}
      >
        {gameState === 'menu' && (
          <div className="reaction-content">
            <div className="game-icon large">🎯</div>
            <h2>{texts.reactionTitle}</h2>
            <p>{texts.reactionDesc}</p>
            <div className="start-hint">{texts.tapToStart}</div>
          </div>
        )}

        {gameState === 'waiting' && (
          <div className="reaction-content">
            <div className="waiting-animation">
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay"></div>
              <span className="waiting-icon">⏳</span>
            </div>
            <p>{texts.waitForGreen}</p>
          </div>
        )}

        {gameState === 'click' && (
          <div className="reaction-content">
            <div className="click-now-icon">🎯</div>
            <h2>{texts.clickNow}!</h2>
          </div>
        )}

        {gameState === 'early' && (
          <div className="reaction-content">
            <div className="early-icon">😅</div>
            <h2>{texts.tooEarly}!</h2>
            <p>{texts.tapToContinue}</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="reaction-content">
            <div className="result-emoji">{getRank(reactionTime).emoji}</div>
            <div className="result-time">{reactionTime}ms</div>
            <p className="result-rank" style={{ color: getRank(reactionTime).color }}>
              {getRank(reactionTime).text}
            </p>
            <p className="tap-continue">{texts.tapToContinue}</p>
          </div>
        )}
      </div>

      <button className="close-btn" onClick={onClose}>{texts.close}</button>
    </div>
  )
}


// ==================== 4. RASM CHIZISH O'YINI (Drawing Game) ====================
const DrawingGame = ({ onClose, texts }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#FF6B6B')
  const [brushSize, setBrushSize] = useState(8)
  const [tool, setTool] = useState('brush') // brush, eraser, circle, rectangle, triangle, line
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [challenge, setChallenge] = useState(null)
  const [gameState, setGameState] = useState('menu')
  const [rating, setRating] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [completedChallenges, setCompletedChallenges] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [startPos, setStartPos] = useState(null)

  // Kengaytirilgan ranglar palitrasi
  const colors = [
    // Asosiy ranglar
    '#FF0000', '#FF6B6B', '#FF8E53', '#FFA500', '#FECA57', '#FFFF00',
    '#00FF00', '#1DD1A1', '#27ae60', '#00FFFF', '#48DBFB', '#00D2D3',
    '#0000FF', '#3498db', '#54A0FF', '#667eea', '#9b59b6', '#5F27CD',
    '#FF00FF', '#FF9FF3', '#e91e63', '#8b4513', '#222F3E', '#FFFFFF'
  ]

  // Vazifalar - geometrik shakllar qo'shildi
  const challenges = [
    { 
      emoji: '🔴', 
      nameKey: 'circle',
      difficulty: 1,
      expectedColors: ['#FF0000', '#FF6B6B', '#e74c3c'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#e74c3c" stroke="#c0392b" stroke-width="3"/></svg>')}`
    },
    { 
      emoji: '🟦', 
      nameKey: 'square',
      difficulty: 1,
      expectedColors: ['#0000FF', '#3498db', '#2980b9'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" fill="#3498db" stroke="#2980b9" stroke-width="3"/></svg>')}`
    },
    { 
      emoji: '🔺', 
      nameKey: 'triangle',
      difficulty: 2,
      expectedColors: ['#FFFF00', '#f1c40f', '#f39c12'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,10 10,90 90,90" fill="#f1c40f" stroke="#f39c12" stroke-width="3"/></svg>')}`
    },
    { 
      emoji: '🏠', 
      nameKey: 'house',
      difficulty: 3,
      expectedColors: ['#e74c3c', '#f39c12', '#8b4513', '#3498db'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,10 10,50 90,50" fill="#e74c3c"/><rect x="20" y="50" width="60" height="40" fill="#f39c12"/><rect x="40" y="60" width="20" height="30" fill="#8b4513"/><rect x="25" y="60" width="12" height="12" fill="#3498db"/><rect x="63" y="60" width="12" height="12" fill="#3498db"/></svg>')}`
    },
    { 
      emoji: '🌳', 
      nameKey: 'tree',
      difficulty: 2,
      expectedColors: ['#27ae60', '#2ecc71', '#8b4513'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="42" y="60" width="16" height="35" fill="#8b4513"/><circle cx="50" cy="35" r="30" fill="#27ae60"/><circle cx="35" cy="45" r="20" fill="#2ecc71"/><circle cx="65" cy="45" r="20" fill="#2ecc71"/></svg>')}`
    },
    { 
      emoji: '🌞', 
      nameKey: 'sun',
      difficulty: 2,
      expectedColors: ['#f1c40f', '#f39c12', '#FFFF00'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="25" fill="#f1c40f"/><g stroke="#f39c12" stroke-width="3"><line x1="50" y1="10" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="90"/><line x1="10" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="90" y2="50"/><line x1="22" y1="22" x2="29" y2="29"/><line x1="71" y1="71" x2="78" y2="78"/><line x1="22" y1="78" x2="29" y2="71"/><line x1="71" y1="29" x2="78" y2="22"/></g></svg>')}`
    },
    { 
      emoji: '❤️', 
      nameKey: 'heart',
      difficulty: 3,
      expectedColors: ['#e74c3c', '#FF0000', '#c0392b'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,88 C20,60 5,40 15,25 C25,10 40,15 50,30 C60,15 75,10 85,25 C95,40 80,60 50,88Z" fill="#e74c3c"/></svg>')}`
    },
    { 
      emoji: '🌸', 
      nameKey: 'flower',
      difficulty: 3,
      expectedColors: ['#e91e63', '#27ae60', '#f1c40f'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><line x1="50" y1="50" x2="50" y2="95" stroke="#27ae60" stroke-width="4"/><circle cx="50" cy="35" r="10" fill="#f1c40f"/><circle cx="50" cy="18" r="12" fill="#e91e63"/><circle cx="35" cy="25" r="12" fill="#e91e63"/><circle cx="65" cy="25" r="12" fill="#e91e63"/><circle cx="38" cy="42" r="12" fill="#e91e63"/><circle cx="62" cy="42" r="12" fill="#e91e63"/></svg>')}`
    },
    { 
      emoji: '⭐', 
      nameKey: 'star',
      difficulty: 4,
      expectedColors: ['#f1c40f', '#f39c12', '#FFFF00'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="#f1c40f" stroke="#f39c12" stroke-width="2"/></svg>')}`
    },
    { 
      emoji: '🚗', 
      nameKey: 'car',
      difficulty: 4,
      expectedColors: ['#e74c3c', '#3498db', '#2c3e50'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="45" width="80" height="25" rx="5" fill="#e74c3c"/><path d="M25,45 L35,25 L65,25 L75,45" fill="#e74c3c"/><rect x="38" y="28" width="24" height="15" fill="#3498db"/><circle cx="28" cy="70" r="10" fill="#2c3e50"/><circle cx="72" cy="70" r="10" fill="#2c3e50"/></svg>')}`
    },
    { 
      emoji: '🦋', 
      nameKey: 'butterfly',
      difficulty: 4,
      expectedColors: ['#9b59b6', '#3498db', '#8b4513'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="5" ry="25" fill="#8b4513"/><ellipse cx="30" cy="35" rx="20" ry="25" fill="#9b59b6"/><ellipse cx="70" cy="35" rx="20" ry="25" fill="#9b59b6"/><ellipse cx="30" cy="65" rx="15" ry="20" fill="#3498db"/><ellipse cx="70" cy="65" rx="15" ry="20" fill="#3498db"/></svg>')}`
    },
    { 
      emoji: '🐱', 
      nameKey: 'cat',
      difficulty: 5,
      expectedColors: ['#f39c12', '#2c3e50', '#e91e63'],
      sampleImage: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="60" rx="30" ry="25" fill="#f39c12"/><circle cx="50" cy="35" r="22" fill="#f39c12"/><polygon points="32,20 28,5 40,18" fill="#f39c12"/><polygon points="68,20 72,5 60,18" fill="#f39c12"/><circle cx="42" cy="32" r="4" fill="#2c3e50"/><circle cx="58" cy="32" r="4" fill="#2c3e50"/><ellipse cx="50" cy="42" rx="3" ry="2" fill="#e91e63"/></svg>')}`
    }
  ]

  // Avtomatik baholash funksiyasi - bolalar uchun rag'batlantiruvchi
  const analyzeDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas || !challenge) return 6

    try {
      const ctx = canvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      let coloredPixels = 0
      const totalPixels = canvas.width * canvas.height
      const colorSet = new Set()

      // Piksellarni tahlil qilish
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        
        // Oq rangdan farqli piksellarni hisoblash (250 dan past)
        if (r < 250 || g < 250 || b < 250) {
          coloredPixels++
          // Ranglarni guruhlash (har 50 qiymatda - kamroq guruh)
          const rGroup = Math.floor(r / 50)
          const gGroup = Math.floor(g / 50)
          const bGroup = Math.floor(b / 50)
          colorSet.add(`${rGroup}-${gGroup}-${bGroup}`)
        }
      }

      const coveragePercent = (coloredPixels / totalPixels) * 100
      const uniqueColorGroups = colorSet.size

      // Bolalar uchun rag'batlantiruvchi baholash
      // Asosiy baho 5 dan boshlanadi
      let score = 5

      // Biror narsa chizilganmi?
      if (coloredPixels > 50) {
        score = 6 // Harakat qildi
      }
      
      if (coloredPixels > 500) {
        score = 7 // Yaxshi harakat
      }
      
      if (coveragePercent > 1) {
        score = 7
      }
      
      if (coveragePercent > 3) {
        score = 8 // Ko'p chizdi
      }
      
      if (coveragePercent > 5 && uniqueColorGroups >= 2) {
        score = 8
      }
      
      if (coveragePercent > 8 && uniqueColorGroups >= 3) {
        score = 9 // Juda yaxshi
      }
      
      if (coveragePercent > 12 && uniqueColorGroups >= 4) {
        score = 10 // Zo'r!
      }

      // Agar hech narsa chizilmagan bo'lsa
      if (coloredPixels < 20) {
        score = 3
      }

      return score
    } catch (error) {
      return 7 // Default good score on error
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      saveToHistory()
    }
  }, [])

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const imageData = canvas.toDataURL()
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(imageData)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      loadFromHistory(newIndex)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      loadFromHistory(newIndex)
    }
  }

  const loadFromHistory = (index) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history[index]
  }

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const { x, y } = getCoordinates(e)
    setStartPos({ x, y })
    setIsDrawing(true)
    
    if (tool === 'brush' || tool === 'eraser') {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)

    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = (e) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (startPos && (tool === 'circle' || tool === 'rectangle' || tool === 'triangle' || tool === 'line')) {
      const { x, y } = e ? getCoordinates(e) : startPos
      
      ctx.fillStyle = color
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      
      if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
        ctx.beginPath()
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (tool === 'rectangle') {
        const width = x - startPos.x
        const height = y - startPos.y
        ctx.fillRect(startPos.x, startPos.y, width, height)
        ctx.strokeRect(startPos.x, startPos.y, width, height)
      } else if (tool === 'triangle') {
        ctx.beginPath()
        ctx.moveTo(startPos.x + (x - startPos.x) / 2, startPos.y)
        ctx.lineTo(startPos.x, y)
        ctx.lineTo(x, y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else if (tool === 'line') {
        ctx.beginPath()
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    }
    
    setIsDrawing(false)
    setStartPos(null)
    saveToHistory()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
  }

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  const startNewChallenge = () => {
    const availableChallenges = challenges.filter(c => c !== challenge)
    const random = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]
    setChallenge(random)
    setGameState('drawing')
    setRating(0)
    setHistory([])
    setHistoryIndex(-1)
    setTimeout(() => {
      initCanvas()
      saveToHistory()
    }, 100)
  }

  const submitDrawing = () => {
    // AVVAL tahlil qilish (canvas hali mavjud)
    const autoRating = analyzeDrawing()
    
    // Keyin animatsiya ko'rsatish
    setIsAnalyzing(true)
    
    setTimeout(() => {
      setRating(autoRating)
      setIsAnalyzing(false)
      setTotalScore(prev => prev + autoRating)
      setCompletedChallenges(prev => prev + 1)
      setGameState('result')
    }, 1500)
  }

  const continueDrawing = () => {
    startNewChallenge()
  }

  const finishGame = () => {
    setGameState('menu')
    setTotalScore(0)
    setCompletedChallenges(0)
    setChallenge(null)
  }

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="game-container drawing-game">
        <div className="game-header">
          <div className="game-icon">🎨</div>
          <h2>{texts.drawingTitle}</h2>
          <p className="game-subtitle">{texts.drawingDesc}</p>
        </div>
        <div className="drawing-menu">
          <div className="sample-gallery">
            {challenges.slice(0, 6).map((c, i) => (
              <div key={i} className="sample-item">
                <img src={c.sampleImage} alt={texts[c.nameKey]} />
                <span>{c.emoji}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary large" onClick={startNewChallenge}>
            🎮 {texts.startGame}
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  // Analyzing screen
  if (isAnalyzing) {
    return (
      <div className="game-container drawing-game analyzing-mode">
        <div className="analyzing-screen">
          <div className="analyzing-animation">
            <div className="analyzing-circle"></div>
            <div className="analyzing-icon">🔍</div>
          </div>
          <h2>{texts.analyzing}...</h2>
          <p>{texts.pleaseWait}</p>
        </div>
      </div>
    )
  }

  // Result screen
  if (gameState === 'result') {
    const avgScore = completedChallenges > 0 ? (totalScore / completedChallenges).toFixed(1) : 0
    return (
      <div className="game-container drawing-game">
        <div className="result-screen">
          <div className="result-icon">
            {rating >= 8 ? '🏆' : rating >= 5 ? '⭐' : '🎨'}
          </div>
          <h2>{rating >= 8 ? texts.excellent : rating >= 5 ? texts.goodJob : texts.keepPracticing}!</h2>
          
          <div className="result-stats">
            <div className="result-stat">
              <span className="stat-value">{rating}/10</span>
              <span className="stat-label">{texts.thisDrawing}</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{completedChallenges}</span>
              <span className="stat-label">{texts.completed}</span>
            </div>
            <div className="result-stat">
              <span className="stat-value">{avgScore}</span>
              <span className="stat-label">{texts.average}</span>
            </div>
          </div>

          <div className="result-buttons">
            <button className="btn-primary" onClick={continueDrawing}>
              🎲 {texts.nextChallenge}
            </button>
            <button className="btn-secondary" onClick={finishGame}>
              {texts.finish}
            </button>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  // Drawing screen
  return (
    <div className="game-container drawing-game">
      <div className="drawing-header">
        <div className="challenge-info">
          <span className="challenge-emoji">{challenge?.emoji}</span>
          <div className="challenge-text">
            <span className="challenge-label">{texts.draw}:</span>
            <span className="challenge-name">{texts[challenge?.nameKey]}</span>
          </div>
          <span className="difficulty-badge">{'⭐'.repeat(challenge?.difficulty || 1)}</span>
        </div>
        <div className="sample-preview" title={texts.sample}>
          <img src={challenge?.sampleImage} alt="Sample" />
        </div>
      </div>

      <div className="drawing-toolbar">
        <div className="tool-group">
          <button 
            className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
            onClick={() => setTool('brush')}
            title={texts.brush}
          >
            🖌️
          </button>
          <button 
            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title={texts.eraser}
          >
            🧽
          </button>
          <button 
            className={`tool-btn ${tool === 'circle' ? 'active' : ''}`}
            onClick={() => setTool('circle')}
            title={texts.circleShape}
          >
            ⭕
          </button>
          <button 
            className={`tool-btn ${tool === 'rectangle' ? 'active' : ''}`}
            onClick={() => setTool('rectangle')}
            title={texts.rectangleShape}
          >
            ⬜
          </button>
          <button 
            className={`tool-btn ${tool === 'triangle' ? 'active' : ''}`}
            onClick={() => setTool('triangle')}
            title={texts.triangleShape}
          >
            🔺
          </button>
          <button 
            className={`tool-btn ${tool === 'line' ? 'active' : ''}`}
            onClick={() => setTool('line')}
            title={texts.lineShape}
          >
            📏
          </button>
        </div>
      </div>

      <div className="color-palette-large">
        {colors.map(c => (
          <button
            key={c}
            className={`color-btn ${color === c ? 'active' : ''}`}
            style={{ backgroundColor: c, border: c === '#FFFFFF' ? '2px solid #ddd' : 'none' }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>

      <div className="brush-size-control">
        <span>📏</span>
        <input
          type="range"
          min="2"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />
        <span className="brush-preview" style={{ 
          width: Math.min(brushSize * 1.5, 30), 
          height: Math.min(brushSize * 1.5, 30),
          backgroundColor: color 
        }} />
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={400}
          height={280}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="drawing-actions">
        <button className="action-btn" onClick={undo} disabled={historyIndex <= 0}>
          ↩️
        </button>
        <button className="action-btn" onClick={redo} disabled={historyIndex >= history.length - 1}>
          ↪️
        </button>
        <button className="action-btn" onClick={clearCanvas}>
          🗑️
        </button>
        <button className="action-btn submit" onClick={submitDrawing}>
          ✅ {texts.done}
        </button>
      </div>

      <button className="close-btn" onClick={onClose}>{texts.close}</button>
    </div>
  )
}


// ==================== 5. PUZZLE O'YINI (Construction Game) ====================
const PuzzleGame = ({ onClose, texts }) => {
  const [pieces, setPieces] = useState([])
  const [completed, setCompleted] = useState(false)
  const [moves, setMoves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [difficulty, setDifficulty] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const timerRef = useRef(null)

  const difficulties = {
    easy: { 
      size: 3, 
      image: '🌈',
      pieces: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤']
    },
    medium: { 
      size: 4, 
      image: '🎨',
      pieces: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘']
    },
    hard: { 
      size: 5, 
      image: '🧩',
      pieces: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🥭', '🍍', '🥥', '🍌', '🫐', '🍈', '🍐', '🍏', '🍅', '🥑', '🥦', '🌽', '🥕', '🧄', '🧅', '🥔', '🍆']
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (isPlaying && !completed) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, completed])

  const startGame = (level) => {
    const config = difficulties[level]
    const shuffled = [...config.pieces].sort(() => Math.random() - 0.5)
    setPieces(shuffled)
    setDifficulty(level)
    setMoves(0)
    setTimer(0)
    setCompleted(false)
    setIsPlaying(true)
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return
    
    const newPieces = [...pieces]
    const temp = newPieces[draggedIndex]
    newPieces[draggedIndex] = newPieces[targetIndex]
    newPieces[targetIndex] = temp
    
    setPieces(newPieces)
    setMoves(m => m + 1)
    setDraggedIndex(null)

    const config = difficulties[difficulty]
    if (newPieces.every((piece, i) => piece === config.pieces[i])) {
      setCompleted(true)
      setIsPlaying(false)
    }
  }

  const handlePieceClick = (index) => {
    if (draggedIndex === null) {
      setDraggedIndex(index)
    } else if (draggedIndex === index) {
      setDraggedIndex(null)
    } else {
      handleDrop(index)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStars = () => {
    const config = difficulties[difficulty]
    const optimal = config.size * config.size
    if (moves <= optimal * 2) return 3
    if (moves <= optimal * 4) return 2
    return 1
  }

  if (!difficulty) {
    return (
      <div className="game-container puzzle-game">
        <div className="game-header">
          <div className="game-icon">🧩</div>
          <h2>{texts.puzzleTitle}</h2>
          <p className="game-subtitle">{texts.puzzleDesc}</p>
        </div>
        <div className="difficulty-select">
          <h3>{texts.selectDifficulty}</h3>
          <div className="difficulty-buttons">
            <button className="diff-btn easy" onClick={() => startGame('easy')}>
              <span className="diff-icon">🌱</span>
              <span className="diff-name">{texts.easy}</span>
              <span className="diff-info">3×3</span>
            </button>
            <button className="diff-btn medium" onClick={() => startGame('medium')}>
              <span className="diff-icon">🌿</span>
              <span className="diff-name">{texts.medium}</span>
              <span className="diff-info">4×4</span>
            </button>
            <button className="diff-btn hard" onClick={() => startGame('hard')}>
              <span className="diff-icon">🌳</span>
              <span className="diff-name">{texts.hard}</span>
              <span className="diff-info">5×5</span>
            </button>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  if (completed) {
    const stars = getStars()
    return (
      <div className="game-container puzzle-game">
        <div className="game-complete">
          <div className="confetti-container">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="confetti" style={{ 
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 5)]
              }} />
            ))}
          </div>
          <div className="trophy">🏆</div>
          <h2>{texts.congratulations}!</h2>
          <div className="stars-display">
            {[1, 2, 3].map(i => (
              <span key={i} className={`star ${i <= stars ? 'active' : ''}`}>⭐</span>
            ))}
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">⏱️</span>
              <span className="stat-value">{formatTime(timer)}</span>
              <span className="stat-label">{texts.time}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">👆</span>
              <span className="stat-value">{moves}</span>
              <span className="stat-label">{texts.moves}</span>
            </div>
          </div>
          <div className="complete-buttons">
            <button className="btn-primary" onClick={() => startGame(difficulty)}>{texts.playAgain}</button>
            <button className="btn-secondary" onClick={() => setDifficulty(null)}>{texts.changeDifficulty}</button>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  const config = difficulties[difficulty]

  return (
    <div className="game-container puzzle-game">
      <div className="game-topbar">
        <div className="topbar-item">
          <span className="topbar-icon">⏱️</span>
          <span className="topbar-value">{formatTime(timer)}</span>
        </div>
        <div className="topbar-item">
          <span className="topbar-icon">👆</span>
          <span className="topbar-value">{moves}</span>
        </div>
      </div>

      <p className="puzzle-instruction">{texts.puzzleInstruction}</p>

      <div className="target-preview">
        <span className="preview-label">{texts.target}:</span>
        <div className="target-grid" style={{ gridTemplateColumns: `repeat(${config.size}, 1fr)` }}>
          {config.pieces.map((piece, i) => (
            <span key={i} className="target-piece">{piece}</span>
          ))}
        </div>
      </div>

      <div 
        className="puzzle-grid" 
        style={{ gridTemplateColumns: `repeat(${config.size}, 1fr)` }}
      >
        {pieces.map((piece, index) => (
          <div
            key={index}
            className={`puzzle-piece ${draggedIndex === index ? 'selected' : ''} ${piece === config.pieces[index] ? 'correct' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            onClick={() => handlePieceClick(index)}
          >
            {piece}
          </div>
        ))}
      </div>

      <button className="close-btn" onClick={onClose}>{texts.close}</button>
    </div>
  )
}


// ==================== 6. MUSIQA O'YINI (Music Game) ====================
const MusicGame = ({ onClose, texts }) => {
  const [sequence, setSequence] = useState([])
  const [playerSequence, setPlayerSequence] = useState([])
  const [gameState, setGameState] = useState('menu')
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [activeNote, setActiveNote] = useState(null)
  const [highScore, setHighScore] = useState(0)
  const audioContextRef = useRef(null)

  const notes = [
    { id: 0, color: '#FF6B6B', freq: 261.63, key: 'C' },
    { id: 1, color: '#4ECDC4', freq: 293.66, key: 'D' },
    { id: 2, color: '#45B7D1', freq: 329.63, key: 'E' },
    { id: 3, color: '#96CEB4', freq: 349.23, key: 'F' },
    { id: 4, color: '#FFEAA7', freq: 392.00, key: 'G' },
    { id: 5, color: '#DDA0DD', freq: 440.00, key: 'A' },
  ]

  const playSound = (frequency) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.4)
    } catch (e) {
      // Audio not supported - silently fail
    }
  }

  const startGame = () => {
    setLevel(1)
    setScore(0)
    setSequence([])
    setPlayerSequence([])
    addToSequence([])
  }

  const addToSequence = (currentSeq) => {
    const newNote = Math.floor(Math.random() * notes.length)
    const newSequence = [...currentSeq, newNote]
    setSequence(newSequence)
    setPlayerSequence([])
    playSequence(newSequence)
  }

  const playSequence = async (seq) => {
    setGameState('watch')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    for (let i = 0; i < seq.length; i++) {
      setActiveNote(seq[i])
      playSound(notes[seq[i]].freq)
      await new Promise(resolve => setTimeout(resolve, 400))
      setActiveNote(null)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setGameState('play')
  }

  const handleNoteClick = (noteId) => {
    if (gameState !== 'play') return
    
    playSound(notes[noteId].freq)
    setActiveNote(noteId)
    setTimeout(() => setActiveNote(null), 150)

    const newPlayerSequence = [...playerSequence, noteId]
    setPlayerSequence(newPlayerSequence)

    const currentIndex = newPlayerSequence.length - 1
    
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      setGameState('gameover')
      if (score > highScore) {
        setHighScore(score)
      }
      return
    }

    if (newPlayerSequence.length === sequence.length) {
      const points = level * 10
      setScore(s => s + points)
      setLevel(l => l + 1)
      
      setTimeout(() => {
        addToSequence(sequence)
      }, 800)
    }
  }

  const restart = () => {
    setGameState('menu')
    setSequence([])
    setPlayerSequence([])
  }

  if (gameState === 'menu') {
    return (
      <div className="game-container music-game">
        <div className="game-header">
          <div className="game-icon">🎵</div>
          <h2>{texts.musicTitle}</h2>
          <p className="game-subtitle">{texts.musicDesc}</p>
        </div>
        {highScore > 0 && (
          <div className="high-score-badge">
            🏆 {texts.highScore}: {highScore}
          </div>
        )}
        <div className="music-preview">
          {notes.map(note => (
            <div 
              key={note.id} 
              className="preview-note"
              style={{ backgroundColor: note.color }}
            >
              {note.key}
            </div>
          ))}
        </div>
        <button className="btn-primary large" onClick={startGame}>
          🎮 {texts.startGame}
        </button>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  if (gameState === 'gameover') {
    return (
      <div className="game-container music-game">
        <div className="game-over-screen">
          <div className="game-over-icon">🎵</div>
          <h2>{texts.gameOver}</h2>
          <div className="final-stats">
            <div className="final-stat">
              <span className="stat-label">{texts.level}</span>
              <span className="stat-value">{level}</span>
            </div>
            <div className="final-stat">
              <span className="stat-label">{texts.score}</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>
          {score >= highScore && score > 0 && (
            <div className="new-record">🎉 {texts.newRecord}!</div>
          )}
          <button className="btn-primary" onClick={startGame}>{texts.playAgain}</button>
          <button className="btn-secondary" onClick={restart}>{texts.backToMenu}</button>
        </div>
        <button className="close-btn" onClick={onClose}>{texts.close}</button>
      </div>
    )
  }

  return (
    <div className="game-container music-game playing">
      <div className="game-topbar">
        <div className="topbar-item">
          <span className="topbar-icon">📊</span>
          <span className="topbar-value">{texts.level} {level}</span>
        </div>
        <div className="topbar-item">
          <span className="topbar-icon">⭐</span>
          <span className="topbar-value">{score}</span>
        </div>
      </div>

      <div className="game-status">
        {gameState === 'watch' && (
          <div className="status-watch">
            <span className="status-icon">👀</span>
            <span>{texts.watchSequence}</span>
          </div>
        )}
        {gameState === 'play' && (
          <div className="status-play">
            <span className="status-icon">🎯</span>
            <span>{texts.yourTurn} ({playerSequence.length}/{sequence.length})</span>
          </div>
        )}
      </div>

      <div className="music-pad">
        {notes.map(note => (
          <button
            key={note.id}
            className={`music-note ${activeNote === note.id ? 'active' : ''}`}
            style={{ 
              backgroundColor: note.color,
              boxShadow: activeNote === note.id ? `0 0 30px ${note.color}` : 'none'
            }}
            onClick={() => handleNoteClick(note.id)}
            disabled={gameState !== 'play'}
          >
            <span className="note-key">{note.key}</span>
          </button>
        ))}
      </div>

      <div className="sequence-progress">
        {sequence.map((_, i) => (
          <div 
            key={i} 
            className={`progress-dot ${i < playerSequence.length ? 'filled' : ''}`}
          />
        ))}
      </div>

      <button className="close-btn" onClick={onClose}>{texts.close}</button>
    </div>
  )
}


// ==================== MAIN COMPONENT ====================
const EducationalGames = ({ gameType, onClose }) => {
  const { language } = useLanguage()

  const texts = {
    uz: {
      // Common
      close: 'Yopish',
      playAgain: 'Qayta o\'ynash',
      congratulations: 'Tabriklaymiz',
      gameOver: 'O\'yin tugadi',
      tryAgain: 'Qayta urinish',
      startGame: 'O\'yinni boshlash',
      score: 'Ball',
      level: 'Daraja',
      time: 'Vaqt',
      moves: 'Harakatlar',
      yourScore: 'Sizning ballingiz',
      totalScore: 'Jami ball',
      reachedLevel: 'Erishilgan daraja',
      selectDifficulty: 'Qiyinlik darajasini tanlang',
      easy: 'Oson',
      medium: 'O\'rta',
      hard: 'Qiyin',
      pairs: 'juftlik',
      changeDifficulty: 'Qiyinlikni o\'zgartirish',
      next: 'Keyingi',
      nextLevel: 'Keyingi daraja',
      finish: 'Tugatish',
      backToMenu: 'Menyuga qaytish',
      newRecord: 'Yangi rekord',
      highScore: 'Eng yuqori ball',
      target: 'Maqsad',

      // Memory Game
      memoryTitle: 'Xotira o\'yini',
      memoryDesc: 'Kartochkalarni juftlab toping va xotirangizni sinang',

      // Role Play Game
      doctor: 'Shifokor',
      chef: 'Oshpaz',
      teacher: 'O\'qituvchi',
      firefighter: 'O\'t o\'chiruvchi',
      police: 'Politsiyachi',
      farmer: 'Fermer',
      selectCorrectItems: 'Bu kasbga kerakli narsalarni tanlang',

      // Reaction Game
      reactionTitle: 'Tezkorlik o\'yini',
      reactionDesc: 'Reaksiya tezligingizni sinab ko\'ring',
      tapToStart: 'Boshlash uchun bosing',
      waitForGreen: 'Yashil rangni kuting...',
      clickNow: 'HOZIR BOSING',
      tooEarly: 'Juda erta',
      tapToContinue: 'Davom etish uchun bosing',
      results: 'Natijalar',
      average: 'O\'rtacha',
      bestTime: 'Eng yaxshi',
      lightning: 'Chaqmoq tezligida',
      superFast: 'Juda tez',
      fast: 'Tez',
      good: 'Yaxshi',
      slow: 'Sekin',

      // Drawing Game
      drawingTitle: 'Rasm chizish',
      drawingDesc: 'Namunaga qarab rasm chizing va o\'zingizni baholang',
      brush: 'Cho\'tka',
      eraser: 'O\'chirg\'ich',
      clear: 'Tozalash',
      undo: 'Bekor qilish',
      redo: 'Qaytarish',
      newChallenge: 'Yangi vazifa',
      draw: 'Chizing',
      house: 'Uy',
      tree: 'Daraxt',
      sun: 'Quyosh',
      cat: 'Mushuk',
      car: 'Mashina',
      flower: 'Gul',
      butterfly: 'Kapalak',
      star: 'Yulduz',
      circle: 'Aylana',
      square: 'Kvadrat',
      triangle: 'Uchburchak',
      heart: 'Yurak',
      done: 'Tayyor',
      sample: 'Namuna',
      yourDrawing: 'Sizning rasmingiz',
      analyzing: 'Tahlil qilinmoqda',
      pleaseWait: 'Iltimos kuting',
      keepPracticing: 'Mashq qiling',
      goodJob: 'Yaxshi',
      great: 'Ajoyib',
      excellent: 'Zo\'r',
      thisDrawing: 'Bu rasm',
      completed: 'Bajarildi',
      nextChallenge: 'Keyingi vazifa',
      circleShape: 'Aylana',
      rectangleShape: 'To\'rtburchak',
      triangleShape: 'Uchburchak',
      lineShape: 'Chiziq',

      // Puzzle Game
      puzzleTitle: 'Puzzle o\'yini',
      puzzleDesc: 'Shakllarni to\'g\'ri tartibda joylashtiring',
      puzzleInstruction: 'Shakllarni bosib yoki sudrab joylashtiring',

      // Music Game
      musicTitle: 'Musiqa o\'yini',
      musicDesc: 'Ketma-ketlikni eslang va takrorlang',
      watchSequence: 'Ketma-ketlikni kuzating',
      yourTurn: 'Sizning navbatingiz'
    },
    ru: {
      // Common
      close: 'Закрыть',
      playAgain: 'Играть снова',
      congratulations: 'Поздравляем',
      gameOver: 'Игра окончена',
      tryAgain: 'Попробовать снова',
      startGame: 'Начать игру',
      score: 'Счёт',
      level: 'Уровень',
      time: 'Время',
      moves: 'Ходы',
      yourScore: 'Ваш счёт',
      totalScore: 'Общий счёт',
      reachedLevel: 'Достигнутый уровень',
      selectDifficulty: 'Выберите сложность',
      easy: 'Легко',
      medium: 'Средне',
      hard: 'Сложно',
      pairs: 'пар',
      changeDifficulty: 'Изменить сложность',
      next: 'Далее',
      nextLevel: 'Следующий уровень',
      finish: 'Завершить',
      backToMenu: 'Вернуться в меню',
      newRecord: 'Новый рекорд',
      highScore: 'Лучший результат',
      target: 'Цель',

      // Memory Game
      memoryTitle: 'Игра на память',
      memoryDesc: 'Найдите пары карточек и проверьте свою память',

      // Role Play Game
      doctor: 'Врач',
      chef: 'Повар',
      teacher: 'Учитель',
      firefighter: 'Пожарный',
      police: 'Полицейский',
      farmer: 'Фермер',
      selectCorrectItems: 'Выберите предметы для этой профессии',

      // Reaction Game
      reactionTitle: 'Игра на реакцию',
      reactionDesc: 'Проверьте скорость своей реакции',
      tapToStart: 'Нажмите чтобы начать',
      waitForGreen: 'Ждите зелёный цвет...',
      clickNow: 'НАЖМИТЕ СЕЙЧАС',
      tooEarly: 'Слишком рано',
      tapToContinue: 'Нажмите чтобы продолжить',
      results: 'Результаты',
      average: 'Среднее',
      bestTime: 'Лучшее',
      lightning: 'Молниеносно',
      superFast: 'Супер быстро',
      fast: 'Быстро',
      good: 'Хорошо',
      slow: 'Медленно',

      // Drawing Game
      drawingTitle: 'Рисование',
      drawingDesc: 'Рисуйте по образцу и оцените себя',
      brush: 'Кисть',
      eraser: 'Ластик',
      clear: 'Очистить',
      undo: 'Отменить',
      redo: 'Повторить',
      newChallenge: 'Новое задание',
      draw: 'Нарисуйте',
      house: 'Дом',
      tree: 'Дерево',
      sun: 'Солнце',
      cat: 'Кошка',
      car: 'Машина',
      flower: 'Цветок',
      butterfly: 'Бабочка',
      star: 'Звезда',
      circle: 'Круг',
      square: 'Квадрат',
      triangle: 'Треугольник',
      heart: 'Сердце',
      done: 'Готово',
      sample: 'Образец',
      yourDrawing: 'Ваш рисунок',
      analyzing: 'Анализируется',
      pleaseWait: 'Пожалуйста подождите',
      keepPracticing: 'Продолжайте практиковаться',
      goodJob: 'Хорошо',
      great: 'Отлично',
      excellent: 'Превосходно',
      thisDrawing: 'Этот рисунок',
      completed: 'Выполнено',
      nextChallenge: 'Следующее задание',
      circleShape: 'Круг',
      rectangleShape: 'Прямоугольник',
      triangleShape: 'Треугольник',
      lineShape: 'Линия',

      // Puzzle Game
      puzzleTitle: 'Пазл',
      puzzleDesc: 'Расположите фигуры в правильном порядке',
      puzzleInstruction: 'Нажимайте или перетаскивайте фигуры',

      // Music Game
      musicTitle: 'Музыкальная игра',
      musicDesc: 'Запомните последовательность и повторите',
      watchSequence: 'Смотрите последовательность',
      yourTurn: 'Ваша очередь'
    },
    en: {
      // Common
      close: 'Close',
      playAgain: 'Play Again',
      congratulations: 'Congratulations',
      gameOver: 'Game Over',
      tryAgain: 'Try Again',
      startGame: 'Start Game',
      score: 'Score',
      level: 'Level',
      time: 'Time',
      moves: 'Moves',
      yourScore: 'Your score',
      totalScore: 'Total score',
      reachedLevel: 'Reached level',
      selectDifficulty: 'Select difficulty',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      pairs: 'pairs',
      changeDifficulty: 'Change difficulty',
      next: 'Next',
      nextLevel: 'Next level',
      finish: 'Finish',
      backToMenu: 'Back to menu',
      newRecord: 'New record',
      highScore: 'High score',
      target: 'Target',

      // Memory Game
      memoryTitle: 'Memory Game',
      memoryDesc: 'Find matching pairs and test your memory',

      // Role Play Game
      doctor: 'Doctor',
      chef: 'Chef',
      teacher: 'Teacher',
      firefighter: 'Firefighter',
      police: 'Police Officer',
      farmer: 'Farmer',
      selectCorrectItems: 'Select items for this profession',

      // Reaction Game
      reactionTitle: 'Reaction Game',
      reactionDesc: 'Test your reaction speed',
      tapToStart: 'Tap to start',
      waitForGreen: 'Wait for green...',
      clickNow: 'CLICK NOW',
      tooEarly: 'Too early',
      tapToContinue: 'Tap to continue',
      results: 'Results',
      average: 'Average',
      bestTime: 'Best',
      lightning: 'Lightning fast',
      superFast: 'Super fast',
      fast: 'Fast',
      good: 'Good',
      slow: 'Slow',

      // Drawing Game
      drawingTitle: 'Drawing',
      drawingDesc: 'Draw by example and rate yourself',
      brush: 'Brush',
      eraser: 'Eraser',
      clear: 'Clear',
      undo: 'Undo',
      redo: 'Redo',
      newChallenge: 'New challenge',
      draw: 'Draw',
      house: 'House',
      tree: 'Tree',
      sun: 'Sun',
      cat: 'Cat',
      car: 'Car',
      flower: 'Flower',
      butterfly: 'Butterfly',
      star: 'Star',
      circle: 'Circle',
      square: 'Square',
      triangle: 'Triangle',
      heart: 'Heart',
      done: 'Done',
      sample: 'Sample',
      yourDrawing: 'Your drawing',
      analyzing: 'Analyzing',
      pleaseWait: 'Please wait',
      keepPracticing: 'Keep practicing',
      goodJob: 'Good job',
      great: 'Great',
      excellent: 'Excellent',
      thisDrawing: 'This drawing',
      completed: 'Completed',
      nextChallenge: 'Next challenge',
      circleShape: 'Circle',
      rectangleShape: 'Rectangle',
      triangleShape: 'Triangle',
      lineShape: 'Line',

      // Puzzle Game
      puzzleTitle: 'Puzzle Game',
      puzzleDesc: 'Arrange shapes in the correct order',
      puzzleInstruction: 'Click or drag pieces to swap',

      // Music Game
      musicTitle: 'Music Game',
      musicDesc: 'Remember the sequence and repeat',
      watchSequence: 'Watch the sequence',
      yourTurn: 'Your turn'
    }
  }

  const txt = texts[language]

  const renderGame = () => {
    switch (gameType) {
      case 'didactic':
        return <MemoryGame onClose={onClose} texts={txt} />
      case 'roleplay':
        return <RolePlayGame onClose={onClose} texts={txt} />
      case 'active':
        return <ReactionGame onClose={onClose} texts={txt} />
      case 'creative':
        return <DrawingGame onClose={onClose} texts={txt} />
      case 'construction':
        return <PuzzleGame onClose={onClose} texts={txt} />
      case 'music':
        return <MusicGame onClose={onClose} texts={txt} />
      default:
        return null
    }
  }

  return (
    <div className="game-modal-overlay" onClick={onClose}>
      <div className="game-modal" onClick={e => e.stopPropagation()}>
        {renderGame()}
      </div>
    </div>
  )
}

export default EducationalGames
