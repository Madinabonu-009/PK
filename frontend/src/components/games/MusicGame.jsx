import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './MusicGame.css'

const translations = {
  uz: {
    title: "Musiqa Dunyosi",
    subtitle: "Kuylar va ritmlar olamiga xush kelibsiz!",
    piano: "Pianino",
    drums: "Baraban",
    xylophone: "Ksilofon",
    guitar: "Gitara",
    flute: "Nay",
    memory: "Musiqa xotirasi",
    freePlay: "Erkin ijro",
    melodies: "Kuylar",
    back: "Orqaga",
    listen: "Tinglang",
    yourTurn: "Sizning navbat!",
    correct: "To'g'ri! 🎉",
    wrong: "Qayta urinib ko'ring",
    level: "Daraja",
    score: "Ball",
    easy: "Oson",
    medium: "O'rta",
    hard: "Qiyin",
    playMelody: "Kuyni chalish",
    recording: "Yozib olinmoqda...",
    play: "Ijro",
    stop: "To'xtatish",
    record: "Yozish",
    tempo: "Tezlik",
    volume: "Ovoz",
    octave: "Oktava",
    completed: "Barakalla! 🏆",
    tryAgain: "Qayta o'ynash",
    selectDifficulty: "Qiyinlik darajasini tanlang"
  },
  ru: {
    title: "Мир Музыки",
    subtitle: "Добро пожаловать в мир мелодий и ритмов!",
    piano: "Пианино",
    drums: "Барабаны",
    xylophone: "Ксилофон",
    guitar: "Гитара",
    flute: "Флейта",
    memory: "Музыкальная память",
    freePlay: "Свободная игра",
    melodies: "Мелодии",
    back: "Назад",
    listen: "Слушайте",
    yourTurn: "Ваша очередь!",
    correct: "Правильно! 🎉",
    wrong: "Попробуйте ещё",
    level: "Уровень",
    score: "Счёт",
    easy: "Легко",
    medium: "Средне",
    hard: "Сложно",
    playMelody: "Сыграть мелодию",
    recording: "Запись...",
    play: "Играть",
    stop: "Стоп",
    record: "Запись",
    tempo: "Темп",
    volume: "Громкость",
    octave: "Октава",
    completed: "Молодец! 🏆",
    tryAgain: "Ещё раз",
    selectDifficulty: "Выберите сложность"
  },
  en: {
    title: "Music World",
    subtitle: "Welcome to the world of melodies and rhythms!",
    piano: "Piano",
    drums: "Drums",
    xylophone: "Xylophone",
    guitar: "Guitar",
    flute: "Flute",
    memory: "Music Memory",
    freePlay: "Free Play",
    melodies: "Melodies",
    back: "Back",
    listen: "Listen",
    yourTurn: "Your turn!",
    correct: "Correct! 🎉",
    wrong: "Try again",
    level: "Level",
    score: "Score",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    playMelody: "Play Melody",
    recording: "Recording...",
    play: "Play",
    stop: "Stop",
    record: "Record",
    tempo: "Tempo",
    volume: "Volume",
    octave: "Octave",
    completed: "Well Done! 🏆",
    tryAgain: "Try Again",
    selectDifficulty: "Select difficulty"
  }
}


// Audio context singleton
let audioContext = null
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

// Enhanced sound synthesis
const playNote = (frequency, duration = 0.4, type = 'sine', volume = 0.3, attack = 0.02, decay = 0.1) => {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    
    osc.type = type
    osc.frequency.value = frequency
    
    filter.type = 'lowpass'
    filter.frequency.value = 2000
    
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)
    
    osc.start(now)
    osc.stop(now + duration)
  } catch (e) {
    console.log('Audio error:', e)
  }
}

// Play chord (multiple notes)
const playChord = (frequencies, duration = 0.5, type = 'sine', volume = 0.2) => {
  frequencies.forEach((freq, i) => {
    setTimeout(() => playNote(freq, duration, type, volume), i * 30)
  })
}

// Piano notes - 2 octaves
const PIANO_NOTES = [
  { note: 'C4', freq: 261.63, color: 'white', label: 'До' },
  { note: 'C#4', freq: 277.18, color: 'black', label: '' },
  { note: 'D4', freq: 293.66, color: 'white', label: 'Ре' },
  { note: 'D#4', freq: 311.13, color: 'black', label: '' },
  { note: 'E4', freq: 329.63, color: 'white', label: 'Ми' },
  { note: 'F4', freq: 349.23, color: 'white', label: 'Фа' },
  { note: 'F#4', freq: 369.99, color: 'black', label: '' },
  { note: 'G4', freq: 392.00, color: 'white', label: 'Соль' },
  { note: 'G#4', freq: 415.30, color: 'black', label: '' },
  { note: 'A4', freq: 440.00, color: 'white', label: 'Ля' },
  { note: 'A#4', freq: 466.16, color: 'black', label: '' },
  { note: 'B4', freq: 493.88, color: 'white', label: 'Си' },
  { note: 'C5', freq: 523.25, color: 'white', label: 'До' },
  { note: 'C#5', freq: 554.37, color: 'black', label: '' },
  { note: 'D5', freq: 587.33, color: 'white', label: 'Ре' }
]

// Xylophone with rainbow colors
const XYLOPHONE_NOTES = [
  { note: 'C', freq: 523.25, color: '#ef4444', emoji: '🔴', height: 180 },
  { note: 'D', freq: 587.33, color: '#f97316', emoji: '🟠', height: 165 },
  { note: 'E', freq: 659.25, color: '#eab308', emoji: '🟡', height: 150 },
  { note: 'F', freq: 698.46, color: '#22c55e', emoji: '🟢', height: 135 },
  { note: 'G', freq: 783.99, color: '#06b6d4', emoji: '🔵', height: 120 },
  { note: 'A', freq: 880.00, color: '#3b82f6', emoji: '💙', height: 105 },
  { note: 'B', freq: 987.77, color: '#8b5cf6', emoji: '🟣', height: 90 },
  { note: 'C2', freq: 1046.50, color: '#ec4899', emoji: '💗', height: 75 }
]

// Drum kit with realistic sounds
const DRUMS = [
  { id: 'kick', name: 'Kick', emoji: '🥁', freq: 55, type: 'sine', color: '#ef4444' },
  { id: 'snare', name: 'Snare', emoji: '🪘', freq: 180, type: 'triangle', color: '#3b82f6' },
  { id: 'hihat', name: 'Hi-Hat', emoji: '🔔', freq: 800, type: 'square', color: '#eab308' },
  { id: 'tom1', name: 'Tom 1', emoji: '📯', freq: 100, type: 'sine', color: '#22c55e' },
  { id: 'tom2', name: 'Tom 2', emoji: '🎺', freq: 80, type: 'sine', color: '#8b5cf6' },
  { id: 'crash', name: 'Crash', emoji: '💥', freq: 600, type: 'sawtooth', color: '#ec4899' },
  { id: 'ride', name: 'Ride', emoji: '🔊', freq: 500, type: 'triangle', color: '#06b6d4' },
  { id: 'clap', name: 'Clap', emoji: '👏', freq: 250, type: 'square', color: '#f97316' }
]

// Guitar strings
const GUITAR_STRINGS = [
  { note: 'E2', freq: 82.41, color: '#fbbf24', thickness: 6 },
  { note: 'A2', freq: 110.00, color: '#f97316', thickness: 5 },
  { note: 'D3', freq: 146.83, color: '#ef4444', thickness: 4 },
  { note: 'G3', freq: 196.00, color: '#ec4899', thickness: 3 },
  { note: 'B3', freq: 246.94, color: '#8b5cf6', thickness: 2 },
  { note: 'E4', freq: 329.63, color: '#3b82f6', thickness: 1 }
]

// Famous melodies for kids
const MELODIES = {
  uz: [
    { name: "Bolajon", notes: [261, 261, 392, 392, 440, 440, 392], emoji: '👶' },
    { name: "Qo'shiq", notes: [329, 329, 349, 392, 392, 349, 329, 293], emoji: '🎵' },
    { name: "Bahor", notes: [261, 293, 329, 261, 261, 293, 329, 261], emoji: '🌸' }
  ],
  ru: [
    { name: "В лесу", notes: [261, 261, 392, 392, 440, 440, 392], emoji: '🌲' },
    { name: "Песенка", notes: [329, 329, 349, 392, 392, 349, 329, 293], emoji: '🎵' },
    { name: "Весна", notes: [261, 293, 329, 261, 261, 293, 329, 261], emoji: '🌸' }
  ],
  en: [
    { name: "Twinkle", notes: [261, 261, 392, 392, 440, 440, 392], emoji: '⭐' },
    { name: "Happy", notes: [329, 329, 349, 392, 392, 349, 329, 293], emoji: '😊' },
    { name: "Spring", notes: [261, 293, 329, 261, 261, 293, 329, 261], emoji: '🌸' }
  ]
}


// ============================================
// PIANO COMPONENT - Professional Design
// ============================================
function Piano({ onBack, t }) {
  const [activeKeys, setActiveKeys] = useState(new Set())
  const [octave, setOctave] = useState(0)
  const [sustainPedal, setSustainPedal] = useState(false)

  const playKey = (note) => {
    const freq = note.freq * Math.pow(2, octave)
    setActiveKeys(prev => new Set([...prev, note.note]))
    playNote(freq, sustainPedal ? 1.5 : 0.5, 'sine', 0.4)
    
    if (!sustainPedal) {
      setTimeout(() => {
        setActiveKeys(prev => {
          const next = new Set(prev)
          next.delete(note.note)
          return next
        })
      }, 200)
    }
  }

  // Keyboard support
  useEffect(() => {
    const keyMap = { 'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12 }
    
    const handleKeyDown = (e) => {
      const index = keyMap[e.key.toLowerCase()]
      if (index !== undefined && PIANO_NOTES[index]) {
        playKey(PIANO_NOTES[index])
      }
      if (e.key === ' ') setSustainPedal(true)
    }
    
    const handleKeyUp = (e) => {
      if (e.key === ' ') {
        setSustainPedal(false)
        setActiveKeys(new Set())
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [octave, sustainPedal])

  return (
    <div className="instrument-screen piano-screen">
      <div className="instrument-header">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🎹 {t.piano}</h2>
        <div className="piano-controls">
          <button 
            className={`octave-btn ${octave === -1 ? 'active' : ''}`}
            onClick={() => setOctave(-1)}
          >-1</button>
          <span className="octave-label">{t.octave}</span>
          <button 
            className={`octave-btn ${octave === 1 ? 'active' : ''}`}
            onClick={() => setOctave(1)}
          >+1</button>
        </div>
      </div>
      
      <div className="piano-body">
        <div className="piano-lid"></div>
        <div className="piano-keys-container">
          <div className="piano-keys">
            {PIANO_NOTES.map((note, i) => (
              <motion.div
                key={note.note}
                className={`piano-key ${note.color} ${activeKeys.has(note.note) ? 'active' : ''}`}
                onClick={() => playKey(note)}
                whileTap={{ scale: 0.98 }}
              >
                {note.color === 'white' && note.label && (
                  <span className="key-label">{note.label}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        <div className={`sustain-pedal ${sustainPedal ? 'active' : ''}`}
          onClick={() => setSustainPedal(!sustainPedal)}
        >
          <span>🦶</span>
        </div>
      </div>
      
      <p className="hint">🎵 Klaviaturadan foydalaning: A-K tugmalari, Probel - pedal</p>
    </div>
  )
}

// ============================================
// XYLOPHONE COMPONENT
// ============================================
function Xylophone({ onBack, t }) {
  const [activeBar, setActiveBar] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const playBar = (note, index) => {
    setActiveBar(index)
    playNote(note.freq, 0.6, 'triangle', 0.35)
    setTimeout(() => setActiveBar(null), 300)
  }

  const playScale = async () => {
    setIsPlaying(true)
    for (let i = 0; i < XYLOPHONE_NOTES.length; i++) {
      playBar(XYLOPHONE_NOTES[i], i)
      await new Promise(r => setTimeout(r, 300))
    }
    setIsPlaying(false)
  }

  return (
    <div className="instrument-screen xylophone-screen">
      <div className="instrument-header">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🎵 {t.xylophone}</h2>
        <button className="play-scale-btn" onClick={playScale} disabled={isPlaying}>
          🎶 {t.playMelody}
        </button>
      </div>
      
      <div className="xylophone-frame">
        <div className="xylophone-bars">
          {XYLOPHONE_NOTES.map((note, i) => (
            <motion.div
              key={note.note}
              className={`xylo-bar ${activeBar === i ? 'active' : ''}`}
              style={{ 
                background: `linear-gradient(180deg, ${note.color} 0%, ${note.color}dd 100%)`,
                height: `${note.height}px`
              }}
              onClick={() => playBar(note, i)}
              whileTap={{ scale: 0.95, y: 5 }}
              whileHover={{ scale: 1.02 }}
              animate={activeBar === i ? { 
                boxShadow: `0 0 30px ${note.color}`,
                scale: 1.05
              } : {}}
            >
              <span className="bar-note">{note.note}</span>
            </motion.div>
          ))}
        </div>
        <div className="xylophone-mallets">
          <span className="mallet">🥢</span>
          <span className="mallet">🥢</span>
        </div>
      </div>
      
      <p className="hint">🌈 Rangli tayoqchalarni bosib kuy chaling!</p>
    </div>
  )
}

// ============================================
// DRUMS COMPONENT - Full Drum Kit
// ============================================
function Drums({ onBack, t }) {
  const [activeDrums, setActiveDrums] = useState(new Set())
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBeats, setRecordedBeats] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)

  const playDrum = (drum) => {
    setActiveDrums(prev => new Set([...prev, drum.id]))
    
    if (drum.id === 'kick') {
      playNote(drum.freq, 0.3, 'sine', 0.5)
    } else if (drum.id === 'snare') {
      playNote(drum.freq, 0.15, 'triangle', 0.4)
      playNote(400, 0.1, 'square', 0.1)
    } else if (drum.id === 'hihat' || drum.id === 'crash') {
      playNote(drum.freq, 0.1, 'square', 0.2)
    } else {
      playNote(drum.freq, 0.2, drum.type, 0.35)
    }
    
    if (isRecording) {
      setRecordedBeats(prev => [...prev, { drum, time: Date.now() }])
    }
    
    setTimeout(() => {
      setActiveDrums(prev => {
        const next = new Set(prev)
        next.delete(drum.id)
        return next
      })
    }, 100)
  }

  const playRecording = async () => {
    if (recordedBeats.length === 0) return
    setIsPlaying(true)
    
    const startTime = recordedBeats[0].time
    for (const beat of recordedBeats) {
      await new Promise(r => setTimeout(r, beat.time - startTime - (recordedBeats.indexOf(beat) > 0 ? recordedBeats[recordedBeats.indexOf(beat) - 1].time - startTime : 0)))
      playDrum(beat.drum)
    }
    
    setIsPlaying(false)
  }

  // Keyboard support
  useEffect(() => {
    const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7 }
    
    const handleKeyDown = (e) => {
      const index = keyMap[e.key]
      if (index !== undefined && DRUMS[index]) {
        playDrum(DRUMS[index])
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRecording])

  return (
    <div className="instrument-screen drums-screen">
      <div className="instrument-header">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🥁 {t.drums}</h2>
        <div className="drum-controls">
          <button 
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={() => {
              if (isRecording) {
                setIsRecording(false)
              } else {
                setRecordedBeats([])
                setIsRecording(true)
              }
            }}
          >
            {isRecording ? '⏹️' : '🔴'} {isRecording ? t.stop : t.record}
          </button>
          <button 
            className="play-btn"
            onClick={playRecording}
            disabled={recordedBeats.length === 0 || isPlaying}
          >
            ▶️ {t.play}
          </button>
        </div>
      </div>
      
      <div className="drum-kit">
        {DRUMS.map((drum, i) => (
          <motion.div
            key={drum.id}
            className={`drum-pad ${drum.id} ${activeDrums.has(drum.id) ? 'active' : ''}`}
            style={{ background: `linear-gradient(135deg, ${drum.color} 0%, ${drum.color}aa 100%)` }}
            onClick={() => playDrum(drum)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="drum-emoji">{drum.emoji}</span>
            <span className="drum-name">{drum.name}</span>
            <span className="drum-key">{i + 1}</span>
          </motion.div>
        ))}
      </div>
      
      {isRecording && (
        <motion.div 
          className="recording-indicator"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          🔴 {t.recording}
        </motion.div>
      )}
      
      <p className="hint">🎶 1-8 tugmalarini bosing yoki ekranga teging!</p>
    </div>
  )
}


// ============================================
// GUITAR COMPONENT
// ============================================
function Guitar({ onBack, t }) {
  const [activeStrings, setActiveStrings] = useState(new Set())
  const [fret, setFret] = useState(0)

  const playString = (string, index) => {
    const freq = string.freq * Math.pow(2, fret / 12)
    setActiveStrings(prev => new Set([...prev, index]))
    playNote(freq, 1.0, 'sawtooth', 0.25, 0.01, 0.3)
    
    setTimeout(() => {
      setActiveStrings(prev => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }, 500)
  }

  const strumAll = async (direction = 'down') => {
    const strings = direction === 'down' ? GUITAR_STRINGS : [...GUITAR_STRINGS].reverse()
    for (let i = 0; i < strings.length; i++) {
      playString(strings[i], direction === 'down' ? i : 5 - i)
      await new Promise(r => setTimeout(r, 50))
    }
  }

  return (
    <div className="instrument-screen guitar-screen">
      <div className="instrument-header">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🎸 {t.guitar}</h2>
      </div>
      
      <div className="guitar-body">
        <div className="guitar-neck">
          <div className="fret-selector">
            {[0, 1, 2, 3, 4, 5].map(f => (
              <button 
                key={f}
                className={`fret-btn ${fret === f ? 'active' : ''}`}
                onClick={() => setFret(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="guitar-strings">
            {GUITAR_STRINGS.map((string, i) => (
              <motion.div
                key={string.note}
                className={`guitar-string ${activeStrings.has(i) ? 'active' : ''}`}
                style={{ 
                  background: string.color,
                  height: `${string.thickness + 2}px`
                }}
                onClick={() => playString(string, i)}
                animate={activeStrings.has(i) ? {
                  y: [0, -3, 3, -2, 2, 0],
                  transition: { duration: 0.3 }
                } : {}}
              >
                <span className="string-note">{string.note}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="strum-buttons">
          <motion.button 
            className="strum-btn down"
            onClick={() => strumAll('down')}
            whileTap={{ scale: 0.9 }}
          >
            ⬇️ Strum Down
          </motion.button>
          <motion.button 
            className="strum-btn up"
            onClick={() => strumAll('up')}
            whileTap={{ scale: 0.9 }}
          >
            ⬆️ Strum Up
          </motion.button>
        </div>
      </div>
      
      <p className="hint">🎸 Torlarni bosing yoki strum tugmalarini ishlating!</p>
    </div>
  )
}

// ============================================
// MUSIC MEMORY GAME - Enhanced
// ============================================
function MusicMemory({ onBack, t, onComplete }) {
  const { addXP } = useGamification()
  const [difficulty, setDifficulty] = useState(null)
  const [level, setLevel] = useState(1)
  const [sequence, setSequence] = useState([])
  const [playerSequence, setPlayerSequence] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [activeNote, setActiveNote] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [lives, setLives] = useState(3)

  const difficultySettings = {
    easy: { notes: 4, speed: 800, lives: 5 },
    medium: { notes: 6, speed: 600, lives: 3 },
    hard: { notes: 8, speed: 400, lives: 2 }
  }

  const notes = XYLOPHONE_NOTES.slice(0, difficultySettings[difficulty]?.notes || 4)

  const startGame = (diff) => {
    setDifficulty(diff)
    setLevel(1)
    setScore(0)
    setLives(difficultySettings[diff].lives)
    setGameOver(false)
    setSequence([])
    setTimeout(() => startRound([]), 500)
  }

  const startRound = (currentSeq) => {
    const newNote = notes[Math.floor(Math.random() * notes.length)]
    const newSequence = [...currentSeq, newNote]
    setSequence(newSequence)
    setPlayerSequence([])
    setIsPlayerTurn(false)
    playSequence(newSequence)
  }

  const playSequence = async (seq) => {
    setIsPlaying(true)
    const speed = difficultySettings[difficulty]?.speed || 600
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, speed))
      setActiveNote(seq[i].note)
      playNote(seq[i].freq, 0.4, 'triangle', 0.4)
      await new Promise(resolve => setTimeout(resolve, speed * 0.6))
      setActiveNote(null)
    }
    
    setIsPlaying(false)
    setIsPlayerTurn(true)
  }

  const handleNoteClick = (note) => {
    if (!isPlayerTurn || isPlaying) return

    setActiveNote(note.note)
    playNote(note.freq, 0.3, 'triangle', 0.4)
    setTimeout(() => setActiveNote(null), 200)

    const newPlayerSequence = [...playerSequence, note]
    setPlayerSequence(newPlayerSequence)

    const currentIndex = newPlayerSequence.length - 1
    
    if (note.note !== sequence[currentIndex].note) {
      // Wrong!
      setFeedback('wrong')
      const newLives = lives - 1
      setLives(newLives)
      
      if (newLives <= 0) {
        setGameOver(true)
        addXP(score * 10, 'Music Memory')
        if (onComplete) onComplete(score, level * 10)
      } else {
        setTimeout(() => {
          setFeedback(null)
          setPlayerSequence([])
          playSequence(sequence)
        }, 1500)
      }
      return
    }

    if (newPlayerSequence.length === sequence.length) {
      // Correct sequence!
      setFeedback('correct')
      const points = level * (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10)
      setScore(s => s + points)
      setLevel(l => l + 1)
      
      setTimeout(() => {
        setFeedback(null)
        startRound(sequence)
      }, 1000)
    }
  }

  // Difficulty selection
  if (!difficulty) {
    return (
      <div className="instrument-screen memory-screen">
        <div className="instrument-header">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>🧠 {t.memory}</h2>
        </div>
        
        <p className="select-text">{t.selectDifficulty}</p>
        
        <div className="difficulty-selection">
          {['easy', 'medium', 'hard'].map((diff, i) => (
            <motion.button
              key={diff}
              className={`difficulty-btn ${diff}`}
              onClick={() => startGame(diff)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="diff-emoji">
                {diff === 'easy' ? '😊' : diff === 'medium' ? '🤔' : '😤'}
              </span>
              <span className="diff-name">{t[diff]}</span>
              <span className="diff-info">
                {difficultySettings[diff].notes} notes • {difficultySettings[diff].lives} ❤️
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Game over
  if (gameOver) {
    return (
      <div className="instrument-screen memory-screen">
        <div className="instrument-header">
          <button className="back-btn" onClick={() => setDifficulty(null)}>← {t.back}</button>
          <h2>🧠 {t.memory}</h2>
        </div>
        
        <motion.div 
          className="game-complete"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="trophy">🏆</span>
          <h3>{t.completed}</h3>
          <div className="final-stats">
            <p>{t.level}: {level}</p>
            <p>{t.score}: {score}</p>
          </div>
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.min(5, Math.floor(level / 2)) ? '⭐' : '☆'}</span>
            ))}
          </div>
          <motion.button
            className="play-again-btn"
            onClick={() => startGame(difficulty)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 {t.tryAgain}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="instrument-screen memory-screen">
      <div className="instrument-header">
        <button className="back-btn" onClick={() => setDifficulty(null)}>← {t.back}</button>
        <h2>🧠 {t.memory}</h2>
        <div className="game-stats">
          <span className="lives">{'❤️'.repeat(lives)}</span>
          <span>{t.level}: {level}</span>
          <span>{t.score}: {score}</span>
        </div>
      </div>

      <div className="memory-status">
        {isPlaying && (
          <motion.span 
            className="status-text listening"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            👀 {t.listen}...
          </motion.span>
        )}
        {isPlayerTurn && !isPlaying && (
          <span className="status-text your-turn">🎯 {t.yourTurn}</span>
        )}
      </div>

      <div className="memory-notes">
        {notes.map((note) => (
          <motion.div
            key={note.note}
            className={`memory-note ${activeNote === note.note ? 'active' : ''}`}
            style={{ background: note.color }}
            onClick={() => handleNoteClick(note)}
            whileTap={isPlayerTurn ? { scale: 0.9 } : {}}
            animate={activeNote === note.note ? { 
              scale: 1.2,
              boxShadow: `0 0 40px ${note.color}`
            } : { scale: 1 }}
          >
            <span>{note.emoji}</span>
          </motion.div>
        ))}
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
// MELODIES PLAYER
// ============================================
function MelodiesPlayer({ onBack, t, language }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMelody, setCurrentMelody] = useState(null)
  const [activeNote, setActiveNote] = useState(null)

  const melodies = MELODIES[language] || MELODIES.uz

  const playMelody = async (melody) => {
    if (isPlaying) return
    setIsPlaying(true)
    setCurrentMelody(melody.name)
    
    for (const freq of melody.notes) {
      setActiveNote(freq)
      playNote(freq, 0.4, 'sine', 0.4)
      await new Promise(r => setTimeout(r, 400))
      setActiveNote(null)
      await new Promise(r => setTimeout(r, 100))
    }
    
    setIsPlaying(false)
    setCurrentMelody(null)
  }

  return (
    <div className="instrument-screen melodies-screen">
      <div className="instrument-header">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🎼 {t.melodies}</h2>
      </div>
      
      <div className="melodies-grid">
        {melodies.map((melody, i) => (
          <motion.div
            key={melody.name}
            className={`melody-card ${currentMelody === melody.name ? 'playing' : ''}`}
            onClick={() => playMelody(melody)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="melody-emoji">{melody.emoji}</span>
            <span className="melody-name">{melody.name}</span>
            {currentMelody === melody.name && (
              <motion.div 
                className="playing-indicator"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                🎵
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      <p className="hint">🎶 Kuyni tanlang va tinglang!</p>
    </div>
  )
}

// ============================================
// MAIN MUSIC GAME COMPONENT
// ============================================
export default function MusicGame({ onBack, onComplete }) {
  const { language } = useLanguage()
  const t = translations[language] || translations.uz
  const [selectedInstrument, setSelectedInstrument] = useState(null)

  const instruments = [
    { id: 'piano', icon: '🎹', title: t.piano, color: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', desc: '15 keys' },
    { id: 'xylophone', icon: '🎵', title: t.xylophone, color: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', desc: '8 bars' },
    { id: 'drums', icon: '🥁', title: t.drums, color: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', desc: '8 pads' },
    { id: 'guitar', icon: '🎸', title: t.guitar, color: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', desc: '6 strings' },
    { id: 'memory', icon: '🧠', title: t.memory, color: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)', desc: '3 levels' },
    { id: 'melodies', icon: '🎼', title: t.melodies, color: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', desc: '3 songs' }
  ]

  const handleBack = () => setSelectedInstrument(null)

  if (selectedInstrument === 'piano') return <Piano onBack={handleBack} t={t} />
  if (selectedInstrument === 'xylophone') return <Xylophone onBack={handleBack} t={t} />
  if (selectedInstrument === 'drums') return <Drums onBack={handleBack} t={t} />
  if (selectedInstrument === 'guitar') return <Guitar onBack={handleBack} t={t} />
  if (selectedInstrument === 'memory') return <MusicMemory onBack={handleBack} t={t} onComplete={onComplete} />
  if (selectedInstrument === 'melodies') return <MelodiesPlayer onBack={handleBack} t={t} language={language} />

  return (
    <div className="music-game">
      <div className="music-header">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h1><span>🎶</span> {t.title}</h1>
      </div>
      
      <p className="music-subtitle">{t.subtitle}</p>

      <div className="instruments-grid">
        {instruments.map((inst, i) => (
          <motion.div
            key={inst.id}
            className="instrument-card"
            style={{ background: inst.color }}
            onClick={() => setSelectedInstrument(inst.id)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="instrument-icon">{inst.icon}</span>
            <span className="instrument-title">{inst.title}</span>
            <span className="instrument-desc">{inst.desc}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="music-footer">
        <p>🎧 Quloqlik tavsiya etiladi!</p>
      </div>
    </div>
  )
}
