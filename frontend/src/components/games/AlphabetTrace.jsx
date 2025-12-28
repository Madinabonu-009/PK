import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './AlphabetTrace.css'

const translations = {
  uz: {
    title: "Harflarni yoz",
    subtitle: "Harflarni chizib o'rgan!",
    back: "Orqaga",
    clear: "Tozalash",
    next: "Keyingi",
    prev: "Oldingi",
    great: "Ajoyib!",
    letters: "Harflar",
    numbers: "Raqamlar",
    shapes: "Shakllar",
    uppercase: "Katta",
    lowercase: "Kichik",
    progress: "Jarayon",
    showGuide: "Yo'riqnoma",
    hideGuide: "Yashirish",
    brushColor: "Rang",
    sound: "Ovoz"
  },
  ru: {
    title: "Пиши буквы",
    subtitle: "Учись писать буквы!",
    back: "Назад",
    clear: "Очистить",
    next: "Дальше",
    prev: "Назад",
    great: "Отлично!",
    letters: "Буквы",
    numbers: "Цифры",
    shapes: "Фигуры",
    uppercase: "Большие",
    lowercase: "Маленькие",
    progress: "Прогресс",
    showGuide: "Показать",
    hideGuide: "Скрыть",
    brushColor: "Цвет",
    sound: "Звук"
  },
  en: {
    title: "Trace Letters",
    subtitle: "Learn to write letters!",
    back: "Back",
    clear: "Clear",
    next: "Next",
    prev: "Previous",
    great: "Great!",
    letters: "Letters",
    numbers: "Numbers",
    shapes: "Shapes",
    uppercase: "Uppercase",
    lowercase: "Lowercase",
    progress: "Progress",
    showGuide: "Show Guide",
    hideGuide: "Hide Guide",
    brushColor: "Color",
    sound: "Sound"
  }
}

// Letters with associated words and images
const LETTER_DATA = {
  uz: {
    'A': { word: 'Ayiq', image: '/images/panda.png' },
    'B': { word: 'Banan', image: null },
    'D': { word: 'Daraxt', image: null },
    'E': { word: 'Ertak', image: null },
    'F': { word: 'Fil', image: null },
    'G': { word: 'Gul', image: null },
    'H': { word: 'Hayvon', image: null },
    'I': { word: 'Ilon', image: null },
    'J': { word: 'Jirafa', image: null },
    'K': { word: 'Kema', image: null },
    'L': { word: 'Lola', image: null },
    'M': { word: 'Mushuk', image: null },
    'N': { word: 'Non', image: null },
    'O': { word: 'Olma', image: null },
    'P': { word: 'Panda', image: '/images/panda.png' },
    'Q': { word: 'Quyosh', image: null },
    'R': { word: 'Rak', image: null },
    'S': { word: 'Sher', image: null },
    'T': { word: 'Tuxum', image: null },
    'U': { word: 'Uy', image: null },
    'V': { word: 'Vagon', image: null },
    'X': { word: 'Xurmo', image: null },
    'Y': { word: 'Yulduz', image: null },
    'Z': { word: 'Zebra', image: null }
  },
  ru: {
    'А': { word: 'Арбуз', image: null },
    'Б': { word: 'Банан', image: null },
    'В': { word: 'Волк', image: null },
    'Г': { word: 'Гриб', image: null },
    'Д': { word: 'Дом', image: null },
    'Е': { word: 'Ёжик', image: null },
    'Ж': { word: 'Жираф', image: null },
    'З': { word: 'Заяц', image: null },
    'И': { word: 'Игра', image: null },
    'К': { word: 'Кот', image: null },
    'Л': { word: 'Лев', image: null },
    'М': { word: 'Мяч', image: null },
    'Н': { word: 'Носок', image: null },
    'О': { word: 'Облако', image: null },
    'П': { word: 'Панда', image: '/images/panda.png' },
    'Р': { word: 'Рыба', image: null },
    'С': { word: 'Солнце', image: null },
    'Т': { word: 'Тигр', image: null },
    'У': { word: 'Утка', image: null },
    'Ф': { word: 'Фрукт', image: null },
    'Х': { word: 'Хлеб', image: null },
    'Ц': { word: 'Цветок', image: null },
    'Ч': { word: 'Часы', image: null },
    'Ш': { word: 'Шар', image: null }
  },
  en: {
    'A': { word: 'Apple', image: null },
    'B': { word: 'Bear', image: null },
    'C': { word: 'Cat', image: null },
    'D': { word: 'Dog', image: null },
    'E': { word: 'Elephant', image: null },
    'F': { word: 'Fish', image: null },
    'G': { word: 'Giraffe', image: null },
    'H': { word: 'House', image: null },
    'I': { word: 'Ice cream', image: null },
    'J': { word: 'Juice', image: null },
    'K': { word: 'Kite', image: null },
    'L': { word: 'Lion', image: null },
    'M': { word: 'Moon', image: null },
    'N': { word: 'Nest', image: null },
    'O': { word: 'Orange', image: null },
    'P': { word: 'Panda', image: '/images/panda.png' },
    'Q': { word: 'Queen', image: null },
    'R': { word: 'Rainbow', image: null },
    'S': { word: 'Sun', image: null },
    'T': { word: 'Tree', image: null },
    'U': { word: 'Umbrella', image: null },
    'V': { word: 'Violin', image: null },
    'W': { word: 'Whale', image: null },
    'X': { word: 'Xylophone', image: null },
    'Y': { word: 'Yacht', image: null },
    'Z': { word: 'Zebra', image: null }
  }
}

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const SHAPES = [
  { id: 'circle', name: 'Doira', svg: '<circle cx="50" cy="50" r="35" stroke="#d1d5db" stroke-width="3" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'square', name: 'Kvadrat', svg: '<rect x="15" y="15" width="70" height="70" stroke="#d1d5db" stroke-width="3" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'triangle', name: 'Uchburchak', svg: '<path d="M50 15 L85 85 L15 85 Z" stroke="#d1d5db" stroke-width="3" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'star', name: 'Yulduz', svg: '<path d="M50 10 L61 40 L95 40 L68 58 L79 90 L50 70 L21 90 L32 58 L5 40 L39 40 Z" stroke="#d1d5db" stroke-width="3" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'heart', name: 'Yurak', svg: '<path d="M50 85 C20 55 5 35 25 18 C40 5 50 15 50 28 C50 15 60 5 75 18 C95 35 80 55 50 85 Z" stroke="#d1d5db" stroke-width="3" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'diamond', name: 'Romb', svg: '<path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="#d1d5db" stroke-width="3" stroke-dasharray="8,8" fill="none"/>' }
]

const BRUSH_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899']
const BRUSH_SIZES = [8, 12, 16, 20]


export default function AlphabetTrace({ onBack }) {
  const { language } = useLanguage()
  const { addXP, awardBadge } = useGamification()
  const t = translations[language] || translations.uz
  
  const canvasRef = useRef(null)
  const [mode, setMode] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [showGreat, setShowGreat] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const [showGuide, setShowGuide] = useState(true)
  const [brushColor, setBrushColor] = useState('#3b82f6')
  const [brushSize, setBrushSize] = useState(12)
  const [isUppercase, setIsUppercase] = useState(true)
  const [progress, setProgress] = useState({})
  const [soundEnabled, setSoundEnabled] = useState(true)

  const letters = Object.keys(LETTER_DATA[language] || LETTER_DATA.uz)
  const items = mode === 'letters' ? letters : mode === 'numbers' ? NUMBERS : SHAPES.map(s => s.id)
  const currentItem = items?.[currentIndex]
  const letterInfo = mode === 'letters' ? LETTER_DATA[language]?.[currentItem] : null
  const currentShape = mode === 'shapes' ? SHAPES.find(s => s.id === currentItem) : null

  useEffect(() => {
    const saved = localStorage.getItem('alphabet_trace_progress_v2')
    if (saved) {
      setProgress(JSON.parse(saved))
    }
  }, [])

  const saveProgress = useCallback((item) => {
    const newProgress = { ...progress, [item]: (progress[item] || 0) + 1 }
    setProgress(newProgress)
    localStorage.setItem('alphabet_trace_progress_v2', JSON.stringify(newProgress))
  }, [progress])

  useEffect(() => {
    if (canvasRef.current && mode) {
      initCanvas()
    }
  }, [currentIndex, mode, showGuide, isUppercase])

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw guide lines
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()
    ctx.setLineDash([])
    
    if (showGuide) {
      if (mode === 'shapes' && currentShape) {
        const img = new Image()
        const svgBlob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">${currentShape.svg}</svg>`], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(svgBlob)
        img.onload = () => {
          ctx.drawImage(img, (canvas.width - 200) / 2, (canvas.height - 200) / 2, 200, 200)
          URL.revokeObjectURL(url)
        }
        img.src = url
      } else {
        ctx.font = 'bold 180px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeStyle = '#d1d5db'
        ctx.lineWidth = 3
        ctx.setLineDash([8, 8])
        
        let displayItem = currentItem
        if (mode === 'letters' && !isUppercase) {
          displayItem = currentItem.toLowerCase()
        }
        
        ctx.strokeText(displayItem, canvas.width / 2, canvas.height / 2)
        ctx.setLineDash([])
        ctx.fillStyle = '#f3f4f6'
        ctx.fillText(displayItem, canvas.width / 2, canvas.height / 2)
      }
    }
    
    setHasDrawn(false)
  }

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    setHasDrawn(true)
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    initCanvas()
  }

  const playSound = () => {
    if (!soundEnabled) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.value = 0.08
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch (e) {}
  }

  const handleNext = () => {
    if (hasDrawn) {
      setShowGreat(true)
      setCompletedCount(c => c + 1)
      saveProgress(currentItem)
      addXP(15, `Traced ${currentItem}`)
      playSound()
      
      setTimeout(() => {
        setShowGreat(false)
        if (currentIndex + 1 < items.length) {
          setCurrentIndex(i => i + 1)
        } else {
          awardBadge('writer')
          setCurrentIndex(0)
        }
      }, 1000)
    } else if (currentIndex + 1 < items.length) {
      setCurrentIndex(i => i + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }


  // Mode selection
  if (!mode) {
    return (
      <div className="alphabet-trace">
        <div className="night-sky-bg"><div className="stars-layer"></div></div>
        
        <div className="trace-header">
          <button className="back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {t.back}
          </button>
          <h1>{t.title}</h1>
        </div>
        <p className="trace-subtitle">{t.subtitle}</p>

        <div className="mode-selection">
          <motion.div
            className="mode-card letters-mode"
            onClick={() => setMode('letters')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="mode-preview">
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>
            <h3>{t.letters}</h3>
            <span className="mode-count">{letters.length} {t.letters.toLowerCase()}</span>
          </motion.div>

          <motion.div
            className="mode-card numbers-mode"
            onClick={() => setMode('numbers')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="mode-preview">
              <span>1</span>
              <span>2</span>
              <span>3</span>
            </div>
            <h3>{t.numbers}</h3>
            <span className="mode-count">10 {t.numbers.toLowerCase()}</span>
          </motion.div>

          <motion.div
            className="mode-card shapes-mode"
            onClick={() => setMode('shapes')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="mode-preview shapes-icons">
              <svg viewBox="0 0 100 100" width="30" height="30"><circle cx="50" cy="50" r="35" fill="#ec4899"/></svg>
              <svg viewBox="0 0 100 100" width="30" height="30"><rect x="15" y="15" width="70" height="70" fill="#8b5cf6"/></svg>
              <svg viewBox="0 0 100 100" width="30" height="30"><path d="M50 15 L85 85 L15 85 Z" fill="#22c55e"/></svg>
            </div>
            <h3>{t.shapes}</h3>
            <span className="mode-count">6 {t.shapes.toLowerCase()}</span>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="alphabet-trace">
      <div className="night-sky-bg"><div className="stars-layer"></div></div>
      
      <div className="trace-header">
        <button className="back-btn" onClick={() => setMode(null)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.back}
        </button>
        <h1>{mode === 'letters' ? t.letters : mode === 'numbers' ? t.numbers : t.shapes}</h1>
        <span className="progress-badge">{currentIndex + 1}/{items.length}</span>
      </div>

      {/* Letter info card */}
      {letterInfo && (
        <motion.div 
          className="letter-info-card"
          key={currentItem}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {letterInfo.image ? (
            <img src={letterInfo.image} alt={letterInfo.word} className="info-image" />
          ) : (
            <div className="info-letter-icon">{currentItem}</div>
          )}
          <div className="info-text">
            <span className="info-letter">{currentItem}</span>
            <span className="info-word">{letterInfo.word}</span>
          </div>
        </motion.div>
      )}

      {/* Shape info */}
      {currentShape && (
        <motion.div 
          className="shape-info-card"
          key={currentItem}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg viewBox="0 0 100 100" width="50" height="50">
            <defs>
              <linearGradient id="shapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#ec4899"/>
              </linearGradient>
            </defs>
            {currentShape.id === 'circle' && <circle cx="50" cy="50" r="35" fill="url(#shapeGrad)"/>}
            {currentShape.id === 'square' && <rect x="15" y="15" width="70" height="70" fill="url(#shapeGrad)"/>}
            {currentShape.id === 'triangle' && <path d="M50 15 L85 85 L15 85 Z" fill="url(#shapeGrad)"/>}
            {currentShape.id === 'star' && <path d="M50 10 L61 40 L95 40 L68 58 L79 90 L50 70 L21 90 L32 58 L5 40 L39 40 Z" fill="url(#shapeGrad)"/>}
            {currentShape.id === 'heart' && <path d="M50 85 C20 55 5 35 25 18 C40 5 50 15 50 28 C50 15 60 5 75 18 C95 35 80 55 50 85 Z" fill="url(#shapeGrad)"/>}
            {currentShape.id === 'diamond' && <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="url(#shapeGrad)"/>}
          </svg>
          <span className="shape-name">{currentShape.name}</span>
        </motion.div>
      )}

      {/* Tools bar */}
      <div className="tools-bar">
        {mode === 'letters' && (
          <div className="case-toggle">
            <button 
              className={`case-btn ${isUppercase ? 'active' : ''}`}
              onClick={() => setIsUppercase(true)}
            >
              ABC
            </button>
            <button 
              className={`case-btn ${!isUppercase ? 'active' : ''}`}
              onClick={() => setIsUppercase(false)}
            >
              abc
            </button>
          </div>
        )}
        
        <div className="brush-colors">
          {BRUSH_COLORS.map(color => (
            <button
              key={color}
              className={`color-btn ${brushColor === color ? 'active' : ''}`}
              style={{ background: color }}
              onClick={() => setBrushColor(color)}
            />
          ))}
        </div>
        
        <div className="brush-sizes">
          {BRUSH_SIZES.map(size => (
            <button
              key={size}
              className={`size-btn ${brushSize === size ? 'active' : ''}`}
              onClick={() => setBrushSize(size)}
            >
              <span style={{ width: size, height: size, background: brushColor, borderRadius: '50%' }} />
            </button>
          ))}
        </div>
        
        <button 
          className={`guide-btn ${showGuide ? 'active' : ''}`}
          onClick={() => setShowGuide(!showGuide)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          {showGuide ? t.hideGuide : t.showGuide}
        </button>
        
        <button 
          className={`sound-btn ${soundEnabled ? 'active' : ''}`}
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {soundEnabled ? (
              <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></>
            ) : (
              <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
            )}
          </svg>
        </button>
      </div>


      {/* Canvas */}
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        <AnimatePresence>
          {showGreat && (
            <motion.div
              className="great-overlay"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {t.great}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item selector */}
      <div className="item-selector">
        {items.map((item, i) => {
          const displayItem = mode === 'letters' && !isUppercase ? item.toLowerCase() : 
                             mode === 'shapes' ? SHAPES.find(s => s.id === item)?.name.charAt(0) : item
          const isCompleted = progress[item] > 0
          
          return (
            <button
              key={item}
              className={`item-btn ${i === currentIndex ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => setCurrentIndex(i)}
            >
              {displayItem}
              {isCompleted && (
                <span className="check-mark">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="trace-controls">
        <motion.button
          className="control-btn prev"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.prev}
        </motion.button>
        
        <motion.button
          className="control-btn clear"
          onClick={clearCanvas}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          {t.clear}
        </motion.button>
        
        <motion.button
          className="control-btn next"
          onClick={handleNext}
          whileTap={{ scale: 0.9 }}
        >
          {hasDrawn && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {t.next}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.button>
      </div>

      {/* Progress indicator */}
      <div className="progress-indicator">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(Object.keys(progress).filter(k => items.includes(k)).length / items.length) * 100}%` }} 
          />
        </div>
        <span className="progress-text">
          {t.progress}: {Object.keys(progress).filter(k => items.includes(k)).length}/{items.length}
        </span>
      </div>
    </div>
  )
}