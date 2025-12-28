import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './PuzzleGame.css'

const translations = {
  uz: {
    title: "Puzzle O'yini",
    subtitle: "Rasmni to'g'ri joylashtir!",
    moves: "Urinish",
    time: "Vaqt",
    shuffle: "Aralashtirish",
    hint: "Yordam",
    solved: "Barakalla! 🎉",
    selectImage: "Rasm tanlang",
    selectDifficulty: "Qiyinlik darajasini tanlang",
    easy: "Oson (2x2)",
    medium: "O'rta (3x3)",
    hard: "Qiyin (4x4)",
    back: "Orqaga",
    start: "Boshlash",
    playAgain: "Qayta o'ynash",
    newImage: "Boshqa rasm",
    dragHint: "Bo'lakni sudrab to'g'ri joyga qo'ying"
  },
  ru: {
    title: "Пазл",
    subtitle: "Собери картинку!",
    moves: "Ходы",
    time: "Время",
    shuffle: "Перемешать",
    hint: "Подсказка",
    solved: "Молодец! 🎉",
    selectImage: "Выберите картинку",
    selectDifficulty: "Выберите сложность",
    easy: "Легко (2x2)",
    medium: "Средне (3x3)",
    hard: "Сложно (4x4)",
    back: "Назад",
    start: "Начать",
    playAgain: "Играть снова",
    newImage: "Другая картинка",
    dragHint: "Перетащите кусочек на правильное место"
  },
  en: {
    title: "Puzzle Game",
    subtitle: "Arrange the picture!",
    moves: "Moves",
    time: "Time",
    shuffle: "Shuffle",
    hint: "Hint",
    solved: "Well Done! 🎉",
    selectImage: "Select image",
    selectDifficulty: "Select difficulty",
    easy: "Easy (2x2)",
    medium: "Medium (3x3)",
    hard: "Hard (4x4)",
    back: "Back",
    start: "Start",
    playAgain: "Play Again",
    newImage: "New Image",
    dragHint: "Drag pieces to the correct position"
  }
}

const PUZZLE_IMAGES = [
  { 
    id: 'panda', 
    emoji: '🐼', 
    name: { uz: 'Panda', ru: 'Панда', en: 'Panda' },
    image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=400&fit=crop'
  },
  { 
    id: 'cat', 
    emoji: '🐱', 
    name: { uz: 'Mushuk', ru: 'Кошка', en: 'Cat' },
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'
  },
  { 
    id: 'dog', 
    emoji: '🐶', 
    name: { uz: 'It', ru: 'Собака', en: 'Dog' },
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop'
  },
  { 
    id: 'butterfly', 
    emoji: '🦋', 
    name: { uz: 'Kapalak', ru: 'Бабочка', en: 'Butterfly' },
    image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=400&fit=crop'
  },
  { 
    id: 'flower', 
    emoji: '🌸', 
    name: { uz: 'Gul', ru: 'Цветок', en: 'Flower' },
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop'
  },
  { 
    id: 'rainbow', 
    emoji: '🌈', 
    name: { uz: 'Kamalak', ru: 'Радуга', en: 'Rainbow' },
    image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=400&fit=crop'
  }
]

const DIFFICULTIES = [
  { id: 'easy', size: 2, label: 'easy' },
  { id: 'medium', size: 3, label: 'medium' },
  { id: 'hard', size: 4, label: 'hard' }
]

export default function PuzzleGame({ onBack, onComplete }) {
  const { language } = useLanguage()
  const { addXP, trackGameComplete } = useGamification()
  const t = translations[language] || translations.uz

  const [gameState, setGameState] = useState('select')
  const [selectedImage, setSelectedImage] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [pieces, setPieces] = useState([])
  const [placedPieces, setPlacedPieces] = useState({})
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)

  // Timer
  useEffect(() => {
    let interval
    if (gameState === 'playing') {
      interval = setInterval(() => setTime(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [gameState])

  // Preload image
  useEffect(() => {
    if (selectedImage) {
      setImageLoaded(false)
      const img = new Image()
      img.onload = () => setImageLoaded(true)
      img.src = selectedImage.image
    }
  }, [selectedImage])

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const initGame = (diff) => {
    const size = diff.size
    const totalPieces = size * size
    
    // Create pieces with their correct positions
    const newPieces = Array.from({ length: totalPieces }, (_, i) => ({
      id: i,
      correctRow: Math.floor(i / size),
      correctCol: i % size
    }))
    
    // Shuffle pieces for the pool
    const shuffledPieces = shuffleArray(newPieces)
    
    setPieces(shuffledPieces)
    setPlacedPieces({})
    setMoves(0)
    setTime(0)
    setDifficulty(diff)
    setGameState('playing')
  }

  const handleDragStart = (e, piece, fromSlot = null) => {
    setDraggedPiece({ piece, fromSlot })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, slotIndex) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverSlot(slotIndex)
  }

  const handleDragLeave = () => {
    setDragOverSlot(null)
  }

  const handleDrop = (e, targetSlot) => {
    e.preventDefault()
    setDragOverSlot(null)
    
    if (!draggedPiece) return
    
    const { piece, fromSlot } = draggedPiece
    const size = difficulty.size
    
    // Check if target slot already has a piece
    const existingPiece = placedPieces[targetSlot]
    
    // Create new placed pieces state
    const newPlacedPieces = { ...placedPieces }
    
    // If dragging from another slot, remove from old slot
    if (fromSlot !== null) {
      delete newPlacedPieces[fromSlot]
    }
    
    // Place piece in new slot
    newPlacedPieces[targetSlot] = piece
    
    // Update pieces pool
    let newPieces = [...pieces]
    
    // If there was an existing piece in target slot, add it back to pool
    if (existingPiece) {
      if (fromSlot === null) {
        // Dragging from pool to occupied slot - swap
        newPieces = newPieces.filter(p => p.id !== piece.id)
        newPieces.push(existingPiece)
      } else {
        // Dragging from slot to occupied slot - swap
        newPlacedPieces[fromSlot] = existingPiece
      }
    } else {
      // Target slot was empty
      if (fromSlot === null) {
        // Remove from pool
        newPieces = newPieces.filter(p => p.id !== piece.id)
      }
    }
    
    setPieces(newPieces)
    setPlacedPieces(newPlacedPieces)
    setMoves(m => m + 1)
    setDraggedPiece(null)
    
    // Check if puzzle is solved
    const totalSlots = size * size
    if (Object.keys(newPlacedPieces).length === totalSlots) {
      const isSolved = Object.entries(newPlacedPieces).every(([slot, p]) => {
        const slotIndex = parseInt(slot)
        const correctIndex = p.correctRow * size + p.correctCol
        return slotIndex === correctIndex
      })
      
      if (isSolved) {
        setGameState('solved')
        const score = Math.max(100 - moves * 2, 20)
        addXP(score, 'Puzzle completed')
        if (onComplete) onComplete(score, 100)
        trackGameComplete('puzzle', score, 100)
      }
    }
  }

  const handleDropToPool = (e) => {
    e.preventDefault()
    
    if (!draggedPiece || draggedPiece.fromSlot === null) return
    
    const { piece, fromSlot } = draggedPiece
    
    // Remove from slot and add back to pool
    const newPlacedPieces = { ...placedPieces }
    delete newPlacedPieces[fromSlot]
    
    setPieces([...pieces, piece])
    setPlacedPieces(newPlacedPieces)
    setDraggedPiece(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectImage = (img) => {
    setSelectedImage(img)
    setGameState('difficulty')
  }

  const handleBackToSelect = () => {
    setSelectedImage(null)
    setDifficulty(null)
    setGameState('select')
  }

  // Image Selection Screen
  if (gameState === 'select') {
    return (
      <div className="puzzle-game">
        <div className="puzzle-header">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h1>🧩 {t.title}</h1>
          <div></div>
        </div>

        <div className="selection-screen">
          <h2>{t.selectImage}</h2>
          <div className="image-grid">
            {PUZZLE_IMAGES.map((img, index) => (
              <motion.div
                key={img.id}
                className="image-card"
                onClick={() => handleSelectImage(img)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="image-preview">
                  <img src={img.image} alt={img.name[language]} loading="lazy" />
                  <div className="image-overlay">
                    <span className="image-emoji">{img.emoji}</span>
                  </div>
                </div>
                <span className="image-name">{img.name[language]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Difficulty Selection Screen
  if (gameState === 'difficulty') {
    return (
      <div className="puzzle-game">
        <div className="puzzle-header">
          <button className="back-btn" onClick={handleBackToSelect}>← {t.back}</button>
          <h1>{selectedImage.emoji} {selectedImage.name[language]}</h1>
          <div></div>
        </div>

        <div className="difficulty-screen">
          <div className="selected-image-preview">
            <img src={selectedImage.image} alt={selectedImage.name[language]} />
          </div>
          
          <h2>{t.selectDifficulty}</h2>
          
          <div className="difficulty-buttons">
            {DIFFICULTIES.map((diff, index) => (
              <motion.button
                key={diff.id}
                className={`difficulty-btn ${diff.id}`}
                onClick={() => initGame(diff)}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!imageLoaded}
              >
                <span className="diff-grid">
                  {[...Array(diff.size * diff.size)].map((_, i) => (
                    <span key={i} className="diff-cell" />
                  ))}
                </span>
                <span className="diff-label">{t[diff.label]}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const size = difficulty?.size || 3

  // Calculate background position for piece
  const getPieceStyle = (piece) => {
    const col = piece.correctCol
    const row = piece.correctRow
    // For background-position with percentage, we need to calculate based on (size-1)
    const xPos = size > 1 ? (col / (size - 1)) * 100 : 0
    const yPos = size > 1 ? (row / (size - 1)) * 100 : 0
    
    return {
      backgroundImage: `url(${selectedImage.image})`,
      backgroundSize: `${size * 100}%`,
      backgroundPosition: `${xPos}% ${yPos}%`
    }
  }

  // Game Screen
  return (
    <div className="puzzle-game playing">
      <div className="puzzle-header">
        <button className="back-btn" onClick={handleBackToSelect}>← {t.back}</button>
        <h1>{selectedImage.emoji} {t.title}</h1>
        <div className="game-stats">
          <span className="stat">🎯 {moves}</span>
          <span className="stat">⏱️ {formatTime(time)}</span>
        </div>
      </div>

      <div className="puzzle-main-container">
        {/* Puzzle Board - where pieces should be placed */}
        <div className="puzzle-board-section">
          <div className="puzzle-board-wrapper">
            {/* Reference image (faded) */}
            <div className="puzzle-reference">
              <img src={selectedImage.image} alt="Reference" />
            </div>
            
            {/* Puzzle slots grid */}
            <div 
              className="puzzle-board"
              style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
              {Array.from({ length: size * size }, (_, slotIndex) => {
                const placedPiece = placedPieces[slotIndex]
                const isCorrect = placedPiece && 
                  (placedPiece.correctRow * size + placedPiece.correctCol) === slotIndex
                
                return (
                  <div
                    key={slotIndex}
                    className={`puzzle-slot ${dragOverSlot === slotIndex ? 'drag-over' : ''} ${isCorrect ? 'correct' : ''}`}
                    onDragOver={(e) => handleDragOver(e, slotIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, slotIndex)}
                  >
                    {placedPiece && (
                      <div
                        className={`puzzle-piece placed ${isCorrect ? 'correct' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, placedPiece, slotIndex)}
                        style={getPieceStyle(placedPiece)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Pieces Pool - draggable pieces */}
        <div 
          className="pieces-pool"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropToPool}
        >
          <div className="pool-header">
            <span>📦 {t.dragHint}</span>
          </div>
          <div className="pool-pieces">
            {pieces.map((piece) => (
              <motion.div
                key={piece.id}
                className="puzzle-piece in-pool"
                draggable
                onDragStart={(e) => handleDragStart(e, piece, null)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                style={getPieceStyle(piece)}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="puzzle-controls">
          <motion.button 
            className="control-btn hint"
            onClick={() => setShowHint(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            💡 {t.hint}
          </motion.button>
          <motion.button 
            className="control-btn shuffle"
            onClick={() => initGame(difficulty)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔀 {t.shuffle}
          </motion.button>
        </div>
      </div>

      {/* Hint overlay */}
      <AnimatePresence>
        {showHint && (
          <motion.div 
            className="hint-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHint(false)}
          >
            <div className="hint-content">
              <img src={selectedImage.image} alt="Hint" />
              <p>Tap to close</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win Screen */}
      <AnimatePresence>
        {gameState === 'solved' && (
          <motion.div
            className="win-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="win-content"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <div className="win-image">
                <img src={selectedImage.image} alt="Completed" />
              </div>
              <div className="win-trophy">🏆</div>
              <h2>{t.solved}</h2>
              <div className="win-stats">
                <div className="win-stat">
                  <span className="stat-value">{moves}</span>
                  <span className="stat-label">{t.moves}</span>
                </div>
                <div className="win-stat">
                  <span className="stat-value">{formatTime(time)}</span>
                  <span className="stat-label">{t.time}</span>
                </div>
              </div>
              <div className="win-stars">
                {[...Array(5)].map((_, i) => (
                  <motion.span 
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {i < Math.max(5 - Math.floor(moves / 5), 1) ? '⭐' : '☆'}
                  </motion.span>
                ))}
              </div>
              <div className="win-buttons">
                <motion.button 
                  className="win-btn primary"
                  onClick={() => initGame(difficulty)}
                  whileHover={{ scale: 1.05 }}
                >
                  🔄 {t.playAgain}
                </motion.button>
                <motion.button 
                  className="win-btn secondary"
                  onClick={handleBackToSelect}
                  whileHover={{ scale: 1.05 }}
                >
                  🎨 {t.newImage}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
