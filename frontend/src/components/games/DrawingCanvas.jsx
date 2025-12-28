import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './DrawingCanvas.css'

const translations = {
  uz: {
    title: "Rasm Studiyasi",
    subtitle: "Ijodkorligingni ko'rsat!",
    colors: "Ranglar",
    brushSize: "Cho'tka",
    tools: "Asboblar",
    clear: "Tozalash",
    save: "Saqlash",
    undo: "Bekor",
    redo: "Qaytarish",
    eraser: "O'chirg'ich",
    brush: "Cho'tka",
    pencil: "Qalam",
    spray: "Spreyli",
    shapes: "Shakllar",
    stickers: "Stikerlar",
    templates: "Shablonlar",
    gallery: "Galereya",
    saved: "Saqlandi!",
    myDrawings: "Mening rasmlarim",
    empty: "Hali rasmlar yo'q",
    delete: "O'chirish",
    back: "Orqaga",
    rainbow: "Kamalak",
    glow: "Yorug'lik",
    mirror: "Ko'zgu",
    freeMode: "Erkin chizish",
    selectTemplate: "Shablon tanlang",
    traceMe: "Meni chizing",
    bgColor: "Fon rangi",
    download: "Yuklab olish"
  },
  ru: {
    title: "Студия Рисования",
    subtitle: "Покажи свою креативность!",
    colors: "Цвета",
    brushSize: "Кисть",
    tools: "Инструменты",
    clear: "Очистить",
    save: "Сохранить",
    undo: "Отмена",
    redo: "Повтор",
    eraser: "Ластик",
    brush: "Кисть",
    pencil: "Карандаш",
    spray: "Спрей",
    shapes: "Фигуры",
    stickers: "Стикеры",
    templates: "Шаблоны",
    gallery: "Галерея",
    saved: "Сохранено!",
    myDrawings: "Мои рисунки",
    empty: "Пока нет рисунков",
    delete: "Удалить",
    back: "Назад",
    rainbow: "Радуга",
    glow: "Свечение",
    mirror: "Зеркало",
    freeMode: "Свободное рисование",
    selectTemplate: "Выберите шаблон",
    traceMe: "Обведи меня",
    bgColor: "Цвет фона",
    download: "Скачать"
  },
  en: {
    title: "Drawing Studio",
    subtitle: "Show your creativity!",
    colors: "Colors",
    brushSize: "Brush",
    tools: "Tools",
    clear: "Clear",
    save: "Save",
    undo: "Undo",
    redo: "Redo",
    eraser: "Eraser",
    brush: "Brush",
    pencil: "Pencil",
    spray: "Spray",
    shapes: "Shapes",
    stickers: "Stickers",
    templates: "Templates",
    gallery: "Gallery",
    saved: "Saved!",
    myDrawings: "My Drawings",
    empty: "No drawings yet",
    delete: "Delete",
    back: "Back",
    rainbow: "Rainbow",
    glow: "Glow",
    mirror: "Mirror",
    freeMode: "Free Drawing",
    selectTemplate: "Select template",
    traceMe: "Trace me",
    bgColor: "Background",
    download: "Download"
  }
}

// Extended color palette
const COLOR_PALETTES = {
  basic: ['#1e293b', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'],
  pastel: ['#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#a5f3fc', '#c7d2fe', '#e9d5ff', '#fbcfe8', '#fce7f3', '#f5f5f4'],
  neon: ['#ff0080', '#ff00ff', '#8000ff', '#0080ff', '#00ffff', '#00ff80', '#80ff00', '#ffff00', '#ff8000', '#ff0000'],
  nature: ['#166534', '#15803d', '#84cc16', '#a3e635', '#65a30d', '#854d0e', '#92400e', '#78350f', '#0369a1', '#0891b2']
}


// Sticker categories - using cartoon SVG icons instead of emoji
const STICKER_CATEGORIES = {
  animals: [
    { id: 'cat', svg: '<circle cx="50" cy="50" r="40" fill="#fbbf24"/><circle cx="35" cy="40" r="8" fill="#1e293b"/><circle cx="65" cy="40" r="8" fill="#1e293b"/><path d="M40 60 Q50 70 60 60" stroke="#1e293b" stroke-width="3" fill="none"/><path d="M20 20 L30 40 L40 25" fill="#fbbf24"/><path d="M80 20 L70 40 L60 25" fill="#fbbf24"/>' },
    { id: 'dog', svg: '<circle cx="50" cy="50" r="40" fill="#d4a574"/><circle cx="35" cy="40" r="8" fill="#1e293b"/><circle cx="65" cy="40" r="8" fill="#1e293b"/><ellipse cx="50" cy="60" rx="15" ry="10" fill="#1e293b"/><ellipse cx="25" cy="35" rx="12" ry="20" fill="#92400e"/><ellipse cx="75" cy="35" rx="12" ry="20" fill="#92400e"/>' },
    { id: 'rabbit', svg: '<circle cx="50" cy="55" r="35" fill="#f5f5f4"/><ellipse cx="35" cy="15" rx="8" ry="25" fill="#fecaca"/><ellipse cx="65" cy="15" rx="8" ry="25" fill="#fecaca"/><circle cx="40" cy="50" r="5" fill="#1e293b"/><circle cx="60" cy="50" r="5" fill="#1e293b"/><circle cx="50" cy="60" r="6" fill="#fecaca"/>' },
    { id: 'bear', svg: '<circle cx="50" cy="50" r="40" fill="#92400e"/><circle cx="25" cy="25" r="12" fill="#92400e"/><circle cx="75" cy="25" r="12" fill="#92400e"/><circle cx="35" cy="45" r="6" fill="#1e293b"/><circle cx="65" cy="45" r="6" fill="#1e293b"/><ellipse cx="50" cy="60" rx="12" ry="8" fill="#fbbf24"/>' },
    { id: 'panda', svg: '<circle cx="50" cy="50" r="40" fill="#f5f5f4"/><ellipse cx="30" cy="40" rx="12" ry="10" fill="#1e293b"/><ellipse cx="70" cy="40" rx="12" ry="10" fill="#1e293b"/><circle cx="30" cy="40" r="5" fill="#f5f5f4"/><circle cx="70" cy="40" r="5" fill="#f5f5f4"/><ellipse cx="50" cy="60" rx="8" ry="6" fill="#1e293b"/>' },
    { id: 'lion', svg: '<circle cx="50" cy="50" r="30" fill="#fbbf24"/><circle cx="50" cy="50" r="42" fill="none" stroke="#f59e0b" stroke-width="12"/><circle cx="40" cy="45" r="5" fill="#1e293b"/><circle cx="60" cy="45" r="5" fill="#1e293b"/><ellipse cx="50" cy="58" rx="8" ry="5" fill="#1e293b"/>' }
  ],
  nature: [
    { id: 'sun', svg: '<circle cx="50" cy="50" r="25" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="4"><line x1="50" y1="10" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="90"/><line x1="10" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="90" y2="50"/><line x1="22" y1="22" x2="29" y2="29"/><line x1="71" y1="71" x2="78" y2="78"/><line x1="22" y1="78" x2="29" y2="71"/><line x1="71" y1="29" x2="78" y2="22"/></g>' },
    { id: 'moon', svg: '<path d="M60 15 A35 35 0 1 0 60 85 A28 28 0 1 1 60 15" fill="#fef3c7"/>' },
    { id: 'star', svg: '<path d="M50 5 L61 40 L98 40 L68 62 L79 97 L50 75 L21 97 L32 62 L2 40 L39 40 Z" fill="#fbbf24"/>' },
    { id: 'cloud', svg: '<ellipse cx="50" cy="55" rx="35" ry="20" fill="#e0f2fe"/><circle cx="30" cy="50" r="18" fill="#e0f2fe"/><circle cx="70" cy="50" r="18" fill="#e0f2fe"/><circle cx="50" cy="40" r="20" fill="#e0f2fe"/>' },
    { id: 'flower', svg: '<circle cx="50" cy="50" r="12" fill="#fbbf24"/><circle cx="50" cy="25" r="15" fill="#ec4899"/><circle cx="50" cy="75" r="15" fill="#ec4899"/><circle cx="25" cy="50" r="15" fill="#ec4899"/><circle cx="75" cy="50" r="15" fill="#ec4899"/>' },
    { id: 'tree', svg: '<rect x="42" y="60" width="16" height="35" fill="#92400e"/><path d="M50 5 L80 60 L20 60 Z" fill="#22c55e"/>' }
  ],
  objects: [
    { id: 'heart', svg: '<path d="M50 85 C20 55 5 35 25 18 C40 5 50 15 50 28 C50 15 60 5 75 18 C95 35 80 55 50 85 Z" fill="#ef4444"/>' },
    { id: 'star2', svg: '<path d="M50 10 L58 35 L85 35 L63 52 L72 80 L50 62 L28 80 L37 52 L15 35 L42 35 Z" fill="#8b5cf6"/>' },
    { id: 'balloon', svg: '<ellipse cx="50" cy="40" rx="25" ry="30" fill="#3b82f6"/><path d="M50 70 Q45 80 50 95" stroke="#64748b" stroke-width="2" fill="none"/><path d="M45 70 L50 75 L55 70" fill="#3b82f6"/>' },
    { id: 'rainbow', svg: '<path d="M10 80 A40 40 0 0 1 90 80" fill="none" stroke="#ef4444" stroke-width="8"/><path d="M18 80 A32 32 0 0 1 82 80" fill="none" stroke="#f97316" stroke-width="8"/><path d="M26 80 A24 24 0 0 1 74 80" fill="none" stroke="#eab308" stroke-width="8"/><path d="M34 80 A16 16 0 0 1 66 80" fill="none" stroke="#22c55e" stroke-width="8"/><path d="M42 80 A8 8 0 0 1 58 80" fill="none" stroke="#3b82f6" stroke-width="8"/>' },
    { id: 'house', svg: '<rect x="25" y="50" width="50" height="40" fill="#fbbf24"/><path d="M15 55 L50 20 L85 55" fill="#ef4444"/><rect x="40" y="65" width="20" height="25" fill="#92400e"/><rect x="30" y="58" width="12" height="12" fill="#bfdbfe"/><rect x="58" y="58" width="12" height="12" fill="#bfdbfe"/>' },
    { id: 'car', svg: '<rect x="15" y="45" width="70" height="25" rx="5" fill="#3b82f6"/><path d="M25 45 L35 25 L65 25 L75 45" fill="#3b82f6"/><rect x="38" y="30" width="24" height="12" fill="#bfdbfe"/><circle cx="30" cy="70" r="10" fill="#1e293b"/><circle cx="70" cy="70" r="10" fill="#1e293b"/>' }
  ]
}


// Drawing templates
const TEMPLATES = [
  { id: 'cat', name: 'Mushuk', difficulty: 'easy', svg: '<circle cx="50" cy="50" r="35" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><path d="M20 25 L30 45 L40 30" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><path d="M80 25 L70 45 L60 30" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'house', name: 'Uy', difficulty: 'easy', svg: '<rect x="25" y="50" width="50" height="40" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><path d="M15 55 L50 20 L85 55" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'sun', name: 'Quyosh', difficulty: 'easy', svg: '<circle cx="50" cy="50" r="25" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'flower', name: 'Gul', difficulty: 'easy', svg: '<circle cx="50" cy="50" r="10" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><circle cx="50" cy="30" r="12" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><circle cx="50" cy="70" r="12" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><circle cx="30" cy="50" r="12" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><circle cx="70" cy="50" r="12" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'tree', name: 'Daraxt', difficulty: 'medium', svg: '<rect x="42" y="60" width="16" height="30" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><path d="M50 10 L80 60 L20 60 Z" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'car', name: 'Mashina', difficulty: 'medium', svg: '<rect x="15" y="45" width="70" height="25" rx="5" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><path d="M25 45 L35 25 L65 25 L75 45" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><circle cx="30" cy="70" r="10" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><circle cx="70" cy="70" r="10" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/>' },
  { id: 'butterfly', name: 'Kapalak', difficulty: 'medium', svg: '<ellipse cx="30" cy="40" rx="20" ry="25" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><ellipse cx="70" cy="40" rx="20" ry="25" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><ellipse cx="30" cy="70" rx="15" ry="18" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><ellipse cx="70" cy="70" rx="15" ry="18" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><line x1="50" y1="20" x2="50" y2="90" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8"/>' },
  { id: 'fish', name: 'Baliq', difficulty: 'hard', svg: '<ellipse cx="45" cy="50" rx="35" ry="20" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/><path d="M80 50 L95 35 L95 65 Z" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,8" fill="none"/>' }
]

// Brush sizes
const BRUSH_SIZES = [4, 8, 12, 18, 26, 36]

// Background colors
const BG_COLORS = ['#ffffff', '#f8fafc', '#fef3c7', '#dcfce7', '#e0f2fe', '#fce7f3', '#f3e8ff', '#1e293b']

// Rainbow colors for rainbow brush
const RAINBOW_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

export default function DrawingCanvas({ onBack }) {
  const { language } = useLanguage()
  const { addXP, awardBadge } = useGamification()
  const t = translations[language] || translations.uz
  
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#1e293b')
  const [brushSize, setBrushSize] = useState(8)
  const [tool, setTool] = useState('brush')
  const [selectedSticker, setSelectedSticker] = useState(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showGallery, setShowGallery] = useState(false)
  const [savedDrawings, setSavedDrawings] = useState([])
  const [showSaved, setShowSaved] = useState(false)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [mirrorMode, setMirrorMode] = useState(false)
  const [activeColorPalette, setActiveColorPalette] = useState('basic')
  const [activeStickerCategory, setActiveStickerCategory] = useState('animals')
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [rainbowIndex, setRainbowIndex] = useState(0)


  // Load saved drawings
  useEffect(() => {
    const saved = localStorage.getItem('kids_drawings_v3')
    if (saved) {
      setSavedDrawings(JSON.parse(saved))
    }
  }, [])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (selectedTemplate) {
      drawTemplate(ctx, selectedTemplate)
    }
    
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    saveToHistory()
  }, [bgColor, selectedTemplate])

  const drawTemplate = (ctx, template) => {
    const img = new Image()
    const svgBlob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="300" height="300">${template.svg}</svg>`], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      ctx.globalAlpha = 0.4
      ctx.drawImage(img, (ctx.canvas.width - 300) / 2, (ctx.canvas.height - 300) / 2, 300, 300)
      ctx.globalAlpha = 1
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(canvas.toDataURL())
    
    if (newHistory.length > 25) newHistory.shift()
    
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

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
    
    if (tool === 'sticker' && selectedSticker) {
      placeSticker(e)
      return
    }
    
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    if (tool === 'eraser') {
      ctx.strokeStyle = bgColor
      ctx.lineWidth = brushSize * 2
    } else if (tool === 'rainbow') {
      ctx.strokeStyle = RAINBOW_COLORS[rainbowIndex]
      ctx.lineWidth = brushSize
    } else if (tool === 'glow') {
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.shadowColor = color
      ctx.shadowBlur = 15
    } else if (tool === 'pencil') {
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(2, brushSize / 3)
    } else {
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.shadowBlur = 0
    }
  }


  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)
    
    if (tool === 'spray') {
      for (let i = 0; i < 15; i++) {
        const offsetX = (Math.random() - 0.5) * brushSize * 2
        const offsetY = (Math.random() - 0.5) * brushSize * 2
        ctx.fillStyle = color
        ctx.fillRect(x + offsetX, y + offsetY, 2, 2)
      }
    } else if (tool === 'rainbow') {
      ctx.strokeStyle = RAINBOW_COLORS[rainbowIndex % RAINBOW_COLORS.length]
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
      setRainbowIndex(i => i + 1)
    } else {
      ctx.lineTo(x, y)
      ctx.stroke()
      
      if (mirrorMode) {
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(canvas.width - x, y)
        ctx.lineTo(canvas.width - x, y)
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.shadowBlur = 0
      saveToHistory()
    }
  }

  const placeSticker = (e) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e)
    
    const img = new Image()
    const size = brushSize * 4
    const svgBlob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${selectedSticker.svg}</svg>`], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      ctx.drawImage(img, x - size/2, y - size/2, size, size)
      URL.revokeObjectURL(url)
      saveToHistory()
    }
    img.src = url
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (selectedTemplate) {
      drawTemplate(ctx, selectedTemplate)
    }
    
    saveToHistory()
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

  const saveDrawing = () => {
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL()
    const newDrawing = {
      id: Date.now(),
      image: dataUrl,
      date: new Date().toISOString(),
      template: selectedTemplate?.name || null
    }
    
    const updated = [newDrawing, ...savedDrawings].slice(0, 25)
    setSavedDrawings(updated)
    localStorage.setItem('kids_drawings_v3', JSON.stringify(updated))
    
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
    
    addXP(25, 'Drawing saved')
    if (savedDrawings.length === 0) {
      awardBadge('creative')
    }
  }

  const deleteDrawing = (id) => {
    const updated = savedDrawings.filter(d => d.id !== id)
    setSavedDrawings(updated)
    localStorage.setItem('kids_drawings_v3', JSON.stringify(updated))
  }

  const loadDrawing = (drawing) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      saveToHistory()
    }
    img.src = drawing.image
    setShowGallery(false)
  }

  const downloadDrawing = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `rasm-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }


  // Template selection view
  if (showTemplates) {
    return (
      <div className="drawing-templates">
        <div className="templates-header">
          <button className="back-btn" onClick={() => setShowTemplates(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {t.back}
          </button>
          <h2>{t.templates}</h2>
        </div>
        
        <p className="templates-subtitle">{t.selectTemplate}</p>
        
        <div className="templates-grid">
          {TEMPLATES.map((template, i) => (
            <motion.div
              key={template.id}
              className={`template-card ${template.difficulty}`}
              onClick={() => {
                setSelectedTemplate(template)
                setShowTemplates(false)
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="template-preview">
                <svg viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: template.svg }} />
              </div>
              <span className="template-name">{template.name}</span>
              <span className={`difficulty-badge ${template.difficulty}`}>
                {template.difficulty === 'easy' ? '★' : template.difficulty === 'medium' ? '★★' : '★★★'}
              </span>
            </motion.div>
          ))}
        </div>
        
        <motion.button
          className="free-draw-btn"
          onClick={() => {
            setSelectedTemplate(null)
            setShowTemplates(false)
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          </svg>
          {t.freeMode}
        </motion.button>
      </div>
    )
  }

  // Gallery view
  if (showGallery) {
    return (
      <div className="drawing-gallery">
        <div className="gallery-header">
          <button className="back-btn" onClick={() => setShowGallery(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {t.back}
          </button>
          <h2>{t.myDrawings}</h2>
        </div>
        
        {savedDrawings.length === 0 ? (
          <div className="empty-gallery">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <p>{t.empty}</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {savedDrawings.map((drawing, i) => (
              <motion.div
                key={drawing.id}
                className="gallery-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <img src={drawing.image} alt="Drawing" onClick={() => loadDrawing(drawing)} />
                <button 
                  className="delete-btn"
                  onClick={() => deleteDrawing(drawing.id)}
                  aria-label={t.delete}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }


  return (
    <div className="drawing-canvas-page">
      {/* Night sky background */}
      <div className="night-sky-bg">
        <div className="stars-layer"></div>
      </div>

      <div className="drawing-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.back}
        </button>
        <h2>{t.title}</h2>
        <div className="header-actions">
          <button className="action-icon-btn" onClick={() => setShowTemplates(true)} title={t.templates}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button className="action-icon-btn" onClick={() => setShowGallery(true)} title={t.gallery}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </button>
        </div>
      </div>

      {selectedTemplate && (
        <div className="template-indicator">
          <span>{t.traceMe}: {selectedTemplate.name}</span>
          <button onClick={() => setSelectedTemplate(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Tools Bar */}
      <div className="tools-bar">
        <div className="tool-group">
          <span className="tool-label">{t.tools}</span>
          <div className="tool-buttons">
            {[
              { id: 'brush', icon: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>' },
              { id: 'pencil', icon: '<path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>' },
              { id: 'spray', icon: '<circle cx="12" cy="12" r="3"/><circle cx="6" cy="8" r="1"/><circle cx="18" cy="8" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/><circle cx="12" cy="6" r="1"/><circle cx="12" cy="18" r="1"/>' },
              { id: 'eraser', icon: '<path d="M20 20H7L3 16c-.6-.6-.6-1.5 0-2.1l10-10c.6-.6 1.5-.6 2.1 0l6 6c.6.6.6 1.5 0 2.1L13 20"/><path d="M6 11l8 8"/>' },
              { id: 'rainbow', icon: '<path d="M22 17a10 10 0 00-20 0"/><path d="M19 17a7 7 0 00-14 0"/><path d="M16 17a4 4 0 00-8 0"/>' },
              { id: 'glow', icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
              { id: 'sticker', icon: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>' }
            ].map(toolItem => (
              <button 
                key={toolItem.id}
                className={`tool-btn ${tool === toolItem.id ? 'active' : ''}`}
                onClick={() => { setTool(toolItem.id); if (toolItem.id !== 'sticker') setSelectedSticker(null) }}
                aria-label={t[toolItem.id] || toolItem.id}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" dangerouslySetInnerHTML={{ __html: toolItem.icon }} />
              </button>
            ))}
          </div>
        </div>

        <div className="tool-group">
          <span className="tool-label">{t.brushSize}</span>
          <div className="brush-sizes">
            {BRUSH_SIZES.map(size => (
              <button
                key={size}
                className={`size-btn ${brushSize === size ? 'active' : ''}`}
                onClick={() => setBrushSize(size)}
              >
                <span style={{ 
                  width: Math.min(size, 20), 
                  height: Math.min(size, 20), 
                  background: color,
                  borderRadius: '50%',
                  display: 'block'
                }} />
              </button>
            ))}
          </div>
        </div>

        <button 
          className={`mirror-btn ${mirrorMode ? 'active' : ''}`}
          onClick={() => setMirrorMode(!mirrorMode)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v18M3 12h4M17 12h4M6 6l2 2M16 6l-2 2M6 18l2-2M16 18l-2-2"/>
          </svg>
          {t.mirror}
        </button>
      </div>


      {/* Color Palette */}
      <div className="color-palette">
        <div className="palette-tabs">
          {Object.keys(COLOR_PALETTES).map(palette => (
            <button
              key={palette}
              className={`palette-tab ${activeColorPalette === palette ? 'active' : ''}`}
              onClick={() => setActiveColorPalette(palette)}
            >
              {palette === 'basic' ? 'A' : palette === 'pastel' ? 'P' : palette === 'neon' ? 'N' : 'T'}
            </button>
          ))}
        </div>
        <div className="colors-row">
          {COLOR_PALETTES[activeColorPalette].map(c => (
            <button
              key={c}
              className={`color-btn ${color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      {/* Stickers Panel */}
      <AnimatePresence>
        {tool === 'sticker' && (
          <motion.div 
            className="stickers-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="sticker-tabs">
              {Object.keys(STICKER_CATEGORIES).map(cat => (
                <button
                  key={cat}
                  className={`sticker-tab ${activeStickerCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveStickerCategory(cat)}
                >
                  {cat === 'animals' ? 'Hayvonlar' : cat === 'nature' ? 'Tabiat' : 'Narsalar'}
                </button>
              ))}
            </div>
            <div className="stickers-grid">
              {STICKER_CATEGORIES[activeStickerCategory].map(sticker => (
                <button
                  key={sticker.id}
                  className={`sticker-btn ${selectedSticker?.id === sticker.id ? 'active' : ''}`}
                  onClick={() => setSelectedSticker(sticker)}
                >
                  <svg viewBox="0 0 100 100" width="40" height="40" dangerouslySetInnerHTML={{ __html: sticker.svg }} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Color */}
      <div className="bg-color-bar">
        <span className="tool-label">{t.bgColor}</span>
        <div className="bg-colors">
          {BG_COLORS.map(bg => (
            <button
              key={bg}
              className={`bg-color-btn ${bgColor === bg ? 'active' : ''}`}
              style={{ background: bg }}
              onClick={() => setBgColor(bg)}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={380}
          height={420}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ background: bgColor }}
        />
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <motion.button 
          className="action-btn undo"
          onClick={undo}
          whileTap={{ scale: 0.9 }}
          disabled={historyIndex <= 0}
          aria-label={t.undo}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
          </svg>
          {t.undo}
        </motion.button>
        <motion.button 
          className="action-btn redo"
          onClick={redo}
          whileTap={{ scale: 0.9 }}
          disabled={historyIndex >= history.length - 1}
          aria-label={t.redo}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
          </svg>
          {t.redo}
        </motion.button>
        <motion.button 
          className="action-btn clear"
          onClick={clearCanvas}
          whileTap={{ scale: 0.9 }}
          aria-label={t.clear}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          {t.clear}
        </motion.button>
        <motion.button 
          className="action-btn download"
          onClick={downloadDrawing}
          whileTap={{ scale: 0.9 }}
          aria-label={t.download}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </motion.button>
        <motion.button 
          className="action-btn save"
          onClick={saveDrawing}
          whileTap={{ scale: 0.9 }}
          aria-label={t.save}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          {t.save}
        </motion.button>
      </div>

      {/* Saved notification */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            className="saved-notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {t.saved}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}