import { useState, useEffect, useRef, useCallback } from 'react'
import { useGamification } from '../../context/GamificationContext'
import PuzzleGame from './PuzzleGame'
import MusicGame from './MusicGame'
import DrawingCanvas from './DrawingCanvas'
import ShapeSorter from './ShapeSorter'
import AlphabetTrace from './AlphabetTrace'
import WordBuilder from './WordBuilder'
import './GamesCenter.css'

// Translations
const translations = {
  uz: {
    title: "O'yinlar Markazi",
    subtitle: "Yulduzlar orasida o'rgan!",
    memory: "Xotira o'yini",
    memoryDesc: "Yulduzli juftlarni top",
    dragDrop: "Kosmik sayohat",
    dragDropDesc: "Sayyoralarni joylashtir",
    quiz: "Bilimdon",
    quizDesc: "Savollarni yech",
    counting: "Sanash ustasi",
    countingDesc: "Yulduzlarni sana",
    mathAdventure: "Matematik jangchi",
    mathAdventureDesc: "Galaktikani qutqar!",
    multiplication: "Ko'paytirish",
    multiplicationDesc: "Jadval ustasi bo'l",
    puzzle: "Puzzle",
    puzzleDesc: "Rasmni yig'",
    music: "Musiqa",
    musicDesc: "Kuy va ritmlar",
    drawing: "Rasm chizish",
    drawingDesc: "Ijodkorligingni ko'rsat",
    shapes: "Shakllar",
    shapesDesc: "Shakllar va ranglar",
    alphabet: "Harflar",
    alphabetDesc: "Harflarni yozish",
    words: "So'z yasash",
    wordsDesc: "Harflardan so'z yasa",
    back: "Orqaga",
    score: "Ball",
    moves: "Urinish",
    correct: "To'g'ri! ⭐",
    wrong: "Qayta urinib ko'r!",
    tryAgain: "Qayta o'ynash",
    completed: "Ajoyib! 🏆",
    start: "Boshlash",
    pairs: "juft",
    next: "Keyingi",
    howMany: "Nechta",
    level: "Daraja",
    lives: "Jon",
    solve: "Yech",
    times: "×",
    stars: "Yulduzlar",
    combo: "Combo",
    perfect: "Mukammal!",
    good: "Yaxshi!",
    timeLeft: "Vaqt",
    hint: "Yordam"
  },
  ru: {
    title: "Игровой Центр",
    subtitle: "Учись среди звёзд!",
    memory: "Игра на память",
    memoryDesc: "Найди звёздные пары",
    dragDrop: "Космическое путешествие",
    dragDropDesc: "Расставь планеты",
    quiz: "Знаток",
    quizDesc: "Реши задачи",
    counting: "Мастер счёта",
    countingDesc: "Считай звёзды",
    mathAdventure: "Математический воин",
    mathAdventureDesc: "Спаси галактику!",
    multiplication: "Умножение",
    multiplicationDesc: "Стань мастером таблицы",
    puzzle: "Пазл",
    puzzleDesc: "Собери картинку",
    music: "Музыка",
    musicDesc: "Мелодии и ритмы",
    drawing: "Рисование",
    drawingDesc: "Покажи креативность",
    shapes: "Фигуры",
    shapesDesc: "Фигуры и цвета",
    alphabet: "Буквы",
    alphabetDesc: "Учись писать",
    words: "Составь слово",
    wordsDesc: "Собери слово из букв",
    back: "Назад",
    score: "Очки",
    moves: "Ходы",
    correct: "Правильно! ⭐",
    wrong: "Попробуй ещё!",
    tryAgain: "Играть снова",
    completed: "Отлично! 🏆",
    start: "Начать",
    pairs: "пар",
    next: "Дальше",
    howMany: "Сколько",
    level: "Уровень",
    lives: "Жизни",
    solve: "Реши",
    times: "×",
    stars: "Звёзды",
    combo: "Комбо",
    perfect: "Идеально!",
    good: "Хорошо!",
    timeLeft: "Время",
    hint: "Подсказка"
  },
  en: {
    title: "Games Center",
    subtitle: "Learn among the stars!",
    memory: "Memory Game",
    memoryDesc: "Find star pairs",
    dragDrop: "Space Journey",
    dragDropDesc: "Place the planets",
    quiz: "Quiz Master",
    quizDesc: "Solve challenges",
    counting: "Counting Master",
    countingDesc: "Count the stars",
    mathAdventure: "Math Warrior",
    mathAdventureDesc: "Save the galaxy!",
    multiplication: "Multiplication",
    multiplicationDesc: "Master the tables",
    puzzle: "Puzzle",
    puzzleDesc: "Arrange the picture",
    music: "Music",
    musicDesc: "Melodies and rhythms",
    drawing: "Drawing",
    drawingDesc: "Show your creativity",
    shapes: "Shapes",
    shapesDesc: "Shapes and colors",
    alphabet: "Letters",
    alphabetDesc: "Learn to write",
    words: "Word Builder",
    wordsDesc: "Build words from letters",
    back: "Back",
    score: "Score",
    moves: "Moves",
    correct: "Correct! ⭐",
    wrong: "Try again!",
    tryAgain: "Play Again",
    completed: "Amazing! 🏆",
    start: "Start",
    pairs: "pairs",
    next: "Next",
    howMany: "How many",
    level: "Level",
    lives: "Lives",
    solve: "Solve",
    times: "×",
    stars: "Stars",
    combo: "Combo",
    perfect: "Perfect!",
    good: "Good!",
    timeLeft: "Time",
    hint: "Hint"
  }
}

// Memory cards with space theme
const memoryCards = [
  { id: 1, emoji: '🌟' }, { id: 2, emoji: '🌙' },
  { id: 3, emoji: '🚀' }, { id: 4, emoji: '🪐' },
  { id: 5, emoji: '👽' }, { id: 6, emoji: '🛸' },
  { id: 7, emoji: '☄️' }, { id: 8, emoji: '🌍' }
]

// Space animals for drag & drop
const spaceAnimals = [
  { id: 1, emoji: '🚀', home: 'mars', homeEmoji: '🔴', name: { uz: 'Raketa', ru: 'Ракета', en: 'Rocket' } },
  { id: 2, emoji: '🛸', home: 'saturn', homeEmoji: '🪐', name: { uz: 'UFO', ru: 'НЛО', en: 'UFO' } },
  { id: 3, emoji: '👨‍🚀', home: 'moon', homeEmoji: '🌙', name: { uz: 'Astronavt', ru: 'Астронавт', en: 'Astronaut' } },
  { id: 4, emoji: '🛰️', home: 'earth', homeEmoji: '🌍', name: { uz: 'Sun\'iy yo\'ldosh', ru: 'Спутник', en: 'Satellite' } },
  { id: 5, emoji: '☄️', home: 'jupiter', homeEmoji: '🟤', name: { uz: 'Kometa', ru: 'Комета', en: 'Comet' } }
]

// Quiz questions - more challenging
const quizQuestions = {
  uz: [
    { q: "Quyosh sistemasida nechta sayyora bor?", options: ['6', '8', '9', '10'], answer: 1, difficulty: 1 },
    { q: "Eng katta sayyora qaysi?", options: ['Yer', 'Mars', 'Yupiter', 'Saturn'], answer: 2, difficulty: 1 },
    { q: "12 + 15 = ?", options: ['25', '27', '28', '26'], answer: 1, difficulty: 2 },
    { q: "Qaysi rang qizil va sariqdan hosil bo'ladi?", options: ['Yashil', 'Binafsha', 'Apelsin', 'Jigarrang'], answer: 2, difficulty: 2 },
    { q: "7 × 8 = ?", options: ['54', '56', '58', '64'], answer: 1, difficulty: 3 },
    { q: "Bir yilda necha kun bor?", options: ['360', '365', '366', '364'], answer: 1, difficulty: 2 },
    { q: "100 - 37 = ?", options: ['63', '67', '73', '53'], answer: 0, difficulty: 3 },
    { q: "Eng kichik tub son qaysi?", options: ['1', '2', '3', '0'], answer: 1, difficulty: 3 }
  ],
  ru: [
    { q: "Сколько планет в Солнечной системе?", options: ['6', '8', '9', '10'], answer: 1, difficulty: 1 },
    { q: "Какая планета самая большая?", options: ['Земля', 'Марс', 'Юпитер', 'Сатурн'], answer: 2, difficulty: 1 },
    { q: "12 + 15 = ?", options: ['25', '27', '28', '26'], answer: 1, difficulty: 2 },
    { q: "Какой цвет получится из красного и жёлтого?", options: ['Зелёный', 'Фиолетовый', 'Оранжевый', 'Коричневый'], answer: 2, difficulty: 2 },
    { q: "7 × 8 = ?", options: ['54', '56', '58', '64'], answer: 1, difficulty: 3 },
    { q: "Сколько дней в году?", options: ['360', '365', '366', '364'], answer: 1, difficulty: 2 },
    { q: "100 - 37 = ?", options: ['63', '67', '73', '53'], answer: 0, difficulty: 3 },
    { q: "Какое наименьшее простое число?", options: ['1', '2', '3', '0'], answer: 1, difficulty: 3 }
  ],
  en: [
    { q: "How many planets in the Solar System?", options: ['6', '8', '9', '10'], answer: 1, difficulty: 1 },
    { q: "Which is the largest planet?", options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 2, difficulty: 1 },
    { q: "12 + 15 = ?", options: ['25', '27', '28', '26'], answer: 1, difficulty: 2 },
    { q: "What color do red and yellow make?", options: ['Green', 'Purple', 'Orange', 'Brown'], answer: 2, difficulty: 2 },
    { q: "7 × 8 = ?", options: ['54', '56', '58', '64'], answer: 1, difficulty: 3 },
    { q: "How many days in a year?", options: ['360', '365', '366', '364'], answer: 1, difficulty: 2 },
    { q: "100 - 37 = ?", options: ['63', '67', '73', '53'], answer: 0, difficulty: 3 },
    { q: "What is the smallest prime number?", options: ['1', '2', '3', '0'], answer: 1, difficulty: 3 }
  ]
}

// Counting levels with increasing difficulty
const countingLevels = [
  { emoji: '⭐', count: 3, time: 15 },
  { emoji: '🌙', count: 5, time: 12 },
  { emoji: '🚀', count: 4, time: 10 },
  { emoji: '🪐', count: 7, time: 10 },
  { emoji: '☄️', count: 6, time: 8 },
  { emoji: '🛸', count: 8, time: 8 },
  { emoji: '👽', count: 9, time: 7 },
  { emoji: '🌟', count: 10, time: 6 }
]

// ============ SHOOTING STARS BACKGROUND ============
function ShootingStars() {
  return (
    <div className="shooting-stars">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="shooting-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  )
}

// ============ TWINKLING STARS ============
function TwinklingStars() {
  return (
    <div className="twinkling-stars">
      {[...Array(100)].map((_, i) => (
        <div 
          key={i} 
          className="twinkle-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 3}px`,
            height: `${1 + Math.random() * 3}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  )
}

// ============ MEMORY GAME - ADVANCED ============
function MemoryGame({ t, onBack, onComplete }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [score, setScore] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [difficulty, setDifficulty] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const difficulties = {
    easy: { pairs: 6, time: 60, gridCols: 3 },
    medium: { pairs: 8, time: 90, gridCols: 4 },
    hard: { pairs: 12, time: 120, gridCols: 4 }
  }

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameWon) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStarted && !gameWon) {
      setGameWon(true)
      if (onComplete) onComplete(score, difficulties[difficulty].pairs * 20)
    }
  }, [timeLeft, gameStarted, gameWon])

  const startGame = (diff) => {
    setDifficulty(diff)
    const config = difficulties[diff]
    const selectedCards = memoryCards.slice(0, config.pairs)
    const shuffled = [...selectedCards, ...selectedCards]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, uniqueId: index }))
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setCombo(0)
    setMaxCombo(0)
    setScore(0)
    setGameWon(false)
    setTimeLeft(config.time)
    setGameStarted(true)
  }

  const handleCardClick = (uniqueId) => {
    if (flipped.length === 2 || flipped.includes(uniqueId) || matched.includes(uniqueId)) return

    const newFlipped = [...flipped, uniqueId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newFlipped
      const firstCard = cards.find(c => c.uniqueId === first)
      const secondCard = cards.find(c => c.uniqueId === second)

      if (firstCard.id === secondCard.id) {
        const newCombo = combo + 1
        setCombo(newCombo)
        if (newCombo > maxCombo) setMaxCombo(newCombo)
        
        const comboBonus = newCombo * 5
        const timeBonus = Math.floor(timeLeft / 10)
        const pointsEarned = 10 + comboBonus + timeBonus
        setScore(s => s + pointsEarned)
        
        const newMatched = [...matched, first, second]
        setMatched(newMatched)
        setFlipped([])
        
        if (newMatched.length === cards.length) {
          setGameWon(true)
          const finalScore = score + pointsEarned + (timeLeft * 2)
          if (onComplete) onComplete(finalScore, difficulties[difficulty].pairs * 20)
        }
      } else {
        setCombo(0)
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  if (!difficulty) {
    return (
      <div className="game-screen memory-screen">
        <ShootingStars />
        <TwinklingStars />
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>🧠 {t.memory}</h2>
        </div>
        <div className="difficulty-select">
          <h3>Qiyinlik darajasini tanlang</h3>
          <div className="difficulty-buttons">
            <button className="diff-btn easy" onClick={() => startGame('easy')}>
              <span className="diff-icon">⭐</span>
              <span className="diff-name">Oson</span>
              <span className="diff-info">6 juft • 60s</span>
            </button>
            <button className="diff-btn medium" onClick={() => startGame('medium')}>
              <span className="diff-icon">⭐⭐</span>
              <span className="diff-name">O'rta</span>
              <span className="diff-info">8 juft • 90s</span>
            </button>
            <button className="diff-btn hard" onClick={() => startGame('hard')}>
              <span className="diff-icon">⭐⭐⭐</span>
              <span className="diff-name">Qiyin</span>
              <span className="diff-info">12 juft • 120s</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen memory-screen">
      <ShootingStars />
      <TwinklingStars />
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🧠 {t.memory}</h2>
        <div className="game-stats-row">
          <div className="game-stat time">{t.timeLeft}: {timeLeft}s</div>
          <div className="game-stat">{t.score}: {score}</div>
          {combo > 1 && <div className="game-stat combo">{t.combo}: {combo}x</div>}
        </div>
      </div>

      {gameWon ? (
        <div className="game-won cosmic">
          <div className="win-emoji">🏆</div>
          <h3>{matched.length === cards.length ? t.completed : 'Vaqt tugadi!'}</h3>
          <div className="win-stats">
            <p>{t.score}: <strong>{score}</strong></p>
            <p>{t.moves}: <strong>{moves}</strong></p>
            <p>Max {t.combo}: <strong>{maxCombo}x</strong></p>
          </div>
          <div className="score-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.ceil(score / (difficulties[difficulty].pairs * 4)) ? '⭐' : '☆'}</span>
            ))}
          </div>
          <button className="play-btn cosmic" onClick={() => setDifficulty(null)}>{t.tryAgain}</button>
        </div>
      ) : (
        <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${difficulties[difficulty].gridCols}, 1fr)` }}>
          {cards.map(card => (
            <div
              key={card.uniqueId}
              className={`memory-card ${flipped.includes(card.uniqueId) ? 'flipped' : ''} ${matched.includes(card.uniqueId) ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.uniqueId)}
            >
              <div className="card-inner">
                <div className="card-front">✨</div>
                <div className="card-back">{card.emoji}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ DRAG & DROP GAME - SPACE THEME ============
function DragDropGame({ lang, t, onBack, onComplete }) {
  const [placed, setPlaced] = useState({})
  const [draggedItem, setDraggedItem] = useState(null)
  const [gameWon, setGameWon] = useState(false)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const homes = [
    { id: 'mars', emoji: '🔴', name: { uz: 'Mars', ru: 'Марс', en: 'Mars' } },
    { id: 'saturn', emoji: '🪐', name: { uz: 'Saturn', ru: 'Сатурн', en: 'Saturn' } },
    { id: 'moon', emoji: '🌙', name: { uz: 'Oy', ru: 'Луна', en: 'Moon' } },
    { id: 'earth', emoji: '🌍', name: { uz: 'Yer', ru: 'Земля', en: 'Earth' } },
    { id: 'jupiter', emoji: '🟤', name: { uz: 'Yupiter', ru: 'Юпитер', en: 'Jupiter' } }
  ]

  const handleDrop = (homeId) => {
    if (!draggedItem) return
    setAttempts(a => a + 1)
    
    if (draggedItem.home === homeId) {
      const newPlaced = { ...placed, [draggedItem.id]: homeId }
      setPlaced(newPlaced)
      setScore(s => s + 20)
      
      if (Object.keys(newPlaced).length === spaceAnimals.length) {
        setGameWon(true)
        const finalScore = score + 20 + Math.max(0, (50 - attempts) * 2)
        if (onComplete) onComplete(finalScore, spaceAnimals.length * 20)
      }
    } else {
      setScore(s => Math.max(0, s - 5))
    }
    setDraggedItem(null)
  }

  const resetGame = () => {
    setPlaced({})
    setDraggedItem(null)
    setGameWon(false)
    setScore(0)
    setAttempts(0)
    setShowHint(false)
  }

  return (
    <div className="game-screen dragdrop-screen">
      <ShootingStars />
      <TwinklingStars />
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🚀 {t.dragDrop}</h2>
        <div className="game-stats-row">
          <div className="game-stat">{t.score}: {score}</div>
          <button className="hint-btn" onClick={() => setShowHint(!showHint)}>
            {t.hint} 💡
          </button>
        </div>
      </div>

      {gameWon ? (
        <div className="game-won cosmic">
          <div className="win-emoji">🚀</div>
          <h3>{t.completed}</h3>
          <div className="win-stats">
            <p>{t.score}: <strong>{score}</strong></p>
            <p>Urinishlar: <strong>{attempts}</strong></p>
          </div>
          <button className="play-btn cosmic" onClick={resetGame}>{t.tryAgain}</button>
        </div>
      ) : (
        <>
          <div className="space-items-row">
            {spaceAnimals.filter(a => !placed[a.id]).map(item => (
              <div
                key={item.id}
                className={`space-item ${draggedItem?.id === item.id ? 'dragging' : ''}`}
                draggable
                onDragStart={() => setDraggedItem(item)}
                onClick={() => setDraggedItem(draggedItem?.id === item.id ? null : item)}
              >
                <span className="item-emoji">{item.emoji}</span>
                <span className="item-name">{item.name[lang]}</span>
                {showHint && <span className="item-hint">→ {homes.find(h => h.id === item.home)?.emoji}</span>}
              </div>
            ))}
          </div>

          <div className="planets-row">
            {homes.map(home => (
              <div
                key={home.id}
                className={`planet-zone ${draggedItem?.home === home.id ? 'highlight' : ''} ${placed[Object.keys(placed).find(k => placed[k] === home.id)] ? 'filled' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(home.id)}
                onClick={() => draggedItem && handleDrop(home.id)}
              >
                <span className="planet-emoji">{home.emoji}</span>
                <span className="planet-name">{home.name[lang]}</span>
                <div className="placed-items">
                  {spaceAnimals.filter(a => placed[a.id] === home.id).map(a => (
                    <span key={a.id} className="placed-item">{a.emoji}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ============ QUIZ GAME - ADVANCED ============
function QuizGame({ lang, t, onBack, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [difficulty, setDifficulty] = useState(1)
  
  const questions = quizQuestions[lang].filter(q => q.difficulty <= difficulty + 1)

  useEffect(() => {
    if (timeLeft > 0 && answered === null && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && answered === null) {
      handleAnswer(-1)
    }
  }, [timeLeft, answered, gameOver])

  const handleAnswer = (index) => {
    if (answered !== null) return
    setAnswered(index)
    const isCorrect = index === questions[currentQ].answer
    
    if (isCorrect) {
      const timeBonus = timeLeft * 2
      const streakBonus = streak * 5
      const difficultyBonus = questions[currentQ].difficulty * 10
      setScore(s => s + 10 + timeBonus + streakBonus + difficultyBonus)
      setStreak(s => s + 1)
      if (streak + 1 > maxStreak) setMaxStreak(streak + 1)
      if (streak > 0 && streak % 3 === 2) setDifficulty(d => Math.min(3, d + 1))
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(q => q + 1)
        setAnswered(null)
        setTimeLeft(15 - difficulty * 2)
      } else {
        setGameOver(true)
        if (onComplete) onComplete(score + (isCorrect ? 10 : 0), questions.length * 30)
      }
    }, 1500)
  }

  const resetGame = () => {
    setCurrentQ(0)
    setScore(0)
    setAnswered(null)
    setGameOver(false)
    setStreak(0)
    setMaxStreak(0)
    setTimeLeft(15)
    setDifficulty(1)
  }

  if (gameOver) {
    return (
      <div className="game-screen quiz-screen">
        <ShootingStars />
        <TwinklingStars />
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>🧠 {t.quiz}</h2>
        </div>
        <div className="game-won cosmic">
          <div className="win-emoji">🏆</div>
          <h3>{t.completed}</h3>
          <div className="win-stats">
            <p>{t.score}: <strong>{score}</strong></p>
            <p>Max Streak: <strong>{maxStreak}🔥</strong></p>
          </div>
          <div className="score-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.ceil(score / (questions.length * 6)) ? '⭐' : '☆'}</span>
            ))}
          </div>
          <button className="play-btn cosmic" onClick={resetGame}>{t.tryAgain}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen quiz-screen">
      <ShootingStars />
      <TwinklingStars />
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🧠 {t.quiz}</h2>
        <div className="game-stats-row">
          <div className={`game-stat time ${timeLeft <= 5 ? 'warning' : ''}`}>{timeLeft}s</div>
          <div className="game-stat">{t.score}: {score}</div>
          {streak > 1 && <div className="game-stat streak">{streak}🔥</div>}
        </div>
      </div>

      <div className="quiz-content">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
          </div>
          <span>{currentQ + 1}/{questions.length}</span>
        </div>

        <div className="quiz-question cosmic">
          <div className="difficulty-badge">
            {'⭐'.repeat(questions[currentQ].difficulty)}
          </div>
          <h3>{questions[currentQ].q}</h3>
        </div>

        <div className="quiz-options">
          {questions[currentQ].options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option ${answered !== null ? (index === questions[currentQ].answer ? 'correct' : index === answered ? 'wrong' : 'disabled') : ''}`}
              onClick={() => handleAnswer(index)}
              disabled={answered !== null}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        <div className="time-bar">
          <div className="time-fill" style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
        </div>
      </div>
    </div>
  )
}

// ============ COUNTING GAME - ADVANCED ============
function CountingGame({ t, onBack, onComplete }) {
  const [level, setLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(countingLevels[0].time)
  const [streak, setStreak] = useState(0)
  const [positions, setPositions] = useState([])

  useEffect(() => {
    generatePositions()
  }, [level])

  useEffect(() => {
    if (timeLeft > 0 && answered === null && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && answered === null) {
      handleAnswer(-1)
    }
  }, [timeLeft, answered, gameOver])

  const generatePositions = () => {
    const current = countingLevels[level]
    const newPositions = []
    for (let i = 0; i < current.count; i++) {
      newPositions.push({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 60,
        delay: i * 0.15,
        rotation: Math.random() * 30 - 15
      })
    }
    setPositions(newPositions)
  }

  const current = countingLevels[level]
  const options = [current.count - 2, current.count - 1, current.count, current.count + 1, current.count + 2]
    .filter(n => n > 0)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)

  const handleAnswer = (num) => {
    if (answered !== null) return
    setAnswered(num)
    const isCorrect = num === current.count
    
    if (isCorrect) {
      const timeBonus = timeLeft * 3
      const streakBonus = streak * 10
      setScore(s => s + 15 + timeBonus + streakBonus)
      setStreak(s => s + 1)
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (level + 1 < countingLevels.length) {
        setLevel(l => l + 1)
        setAnswered(null)
        setTimeLeft(countingLevels[level + 1].time)
      } else {
        setGameOver(true)
        if (onComplete) onComplete(score + (isCorrect ? 15 : 0), countingLevels.length * 30)
      }
    }, 1200)
  }

  const resetGame = () => {
    setLevel(0)
    setScore(0)
    setAnswered(null)
    setGameOver(false)
    setTimeLeft(countingLevels[0].time)
    setStreak(0)
  }

  if (gameOver) {
    return (
      <div className="game-screen counting-screen">
        <ShootingStars />
        <TwinklingStars />
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>🔢 {t.counting}</h2>
        </div>
        <div className="game-won cosmic">
          <div className="win-emoji">🎉</div>
          <h3>{t.completed}</h3>
          <div className="win-stats">
            <p>{t.score}: <strong>{score}</strong></p>
            <p>{t.level}: <strong>{level + 1}/{countingLevels.length}</strong></p>
          </div>
          <button className="play-btn cosmic" onClick={resetGame}>{t.tryAgain}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen counting-screen">
      <ShootingStars />
      <TwinklingStars />
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🔢 {t.counting}</h2>
        <div className="game-stats-row">
          <div className={`game-stat time ${timeLeft <= 3 ? 'warning' : ''}`}>{timeLeft}s</div>
          <div className="game-stat">{t.score}: {score}</div>
          <div className="game-stat">{t.level}: {level + 1}</div>
        </div>
      </div>

      <div className="counting-content">
        <h3>{t.howMany} {current.emoji}?</h3>
        <div className="counting-area">
          {positions.map((pos, i) => (
            <span 
              key={i} 
              className="count-item floating"
              style={{ 
                left: `${pos.x}%`, 
                top: `${pos.y}%`,
                animationDelay: `${pos.delay}s`,
                transform: `rotate(${pos.rotation}deg)`
              }}
            >
              {current.emoji}
            </span>
          ))}
        </div>
        <div className="counting-options">
          {options.map((num, i) => (
            <button
              key={i}
              className={`count-option ${answered !== null ? (num === current.count ? 'correct' : num === answered ? 'wrong' : 'disabled') : ''}`}
              onClick={() => handleAnswer(num)}
              disabled={answered !== null}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ MATH ADVENTURE GAME - GALACTIC BATTLE ============
function MathAdventureGame({ t, onBack, onComplete }) {
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [problem, setProblem] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [enemyHealth, setEnemyHealth] = useState(100)
  const [gameOver, setGameOver] = useState(false)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [difficulty, setDifficulty] = useState(null)

  const enemies = [
    { emoji: '👾', name: 'Alien Scout', health: 100 },
    { emoji: '🤖', name: 'Robot Guard', health: 120 },
    { emoji: '👹', name: 'Space Demon', health: 150 },
    { emoji: '🐉', name: 'Cosmic Dragon', health: 200 },
    { emoji: '💀', name: 'Dark Lord', health: 250 }
  ]

  const difficulties = {
    easy: { maxNum: 10, operations: ['+', '-'], time: 25, damage: 25 },
    medium: { maxNum: 20, operations: ['+', '-', '×'], time: 20, damage: 30 },
    hard: { maxNum: 50, operations: ['+', '-', '×', '÷'], time: 15, damage: 35 }
  }

  const generateProblem = useCallback(() => {
    if (!difficulty) return
    const config = difficulties[difficulty]
    const op = config.operations[Math.floor(Math.random() * config.operations.length)]
    let a, b, correctAnswer

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * config.maxNum) + 1
        b = Math.floor(Math.random() * config.maxNum) + 1
        correctAnswer = a + b
        break
      case '-':
        a = Math.floor(Math.random() * config.maxNum) + 5
        b = Math.floor(Math.random() * Math.min(a, config.maxNum)) + 1
        correctAnswer = a - b
        break
      case '×':
        a = Math.floor(Math.random() * 12) + 1
        b = Math.floor(Math.random() * 12) + 1
        correctAnswer = a * b
        break
      case '÷':
        b = Math.floor(Math.random() * 10) + 1
        correctAnswer = Math.floor(Math.random() * 10) + 1
        a = b * correctAnswer
        break
      default:
        a = 1; b = 1; correctAnswer = 2
    }

    setProblem({ a, b, op, answer: correctAnswer })
    setAnswer('')
    setFeedback(null)
    setTimeLeft(config.time)
  }, [difficulty])

  useEffect(() => {
    if (difficulty && !gameOver && !problem) {
      generateProblem()
    }
  }, [difficulty, gameOver, problem, generateProblem])

  useEffect(() => {
    if (timeLeft > 0 && !feedback && !gameOver && problem) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !feedback && problem) {
      handleWrongAnswer()
    }
  }, [timeLeft, feedback, gameOver, problem])

  const handleWrongAnswer = () => {
    setFeedback('wrong')
    setLives(l => l - 1)
    setStreak(0)
    
    setTimeout(() => {
      if (lives <= 1) {
        setGameOver(true)
        if (onComplete) onComplete(score, level * 100)
      } else {
        generateProblem()
      }
    }, 1500)
  }

  const checkAnswer = () => {
    if (!problem || answer === '') return
    
    const isCorrect = parseInt(answer) === problem.answer
    
    if (isCorrect) {
      setFeedback('correct')
      const config = difficulties[difficulty]
      const timeBonus = timeLeft * 2
      const streakBonus = streak * 10
      setScore(s => s + 20 + timeBonus + streakBonus)
      setStreak(s => s + 1)
      
      const newHealth = enemyHealth - config.damage - (streak * 5)
      
      if (newHealth <= 0) {
        setEnemyHealth(0)
        setTimeout(() => {
          if (level < enemies.length) {
            setLevel(l => l + 1)
            setEnemyHealth(enemies[level].health)
            generateProblem()
          } else {
            setGameOver(true)
            if (onComplete) onComplete(score + 100, level * 100)
          }
        }, 1500)
      } else {
        setEnemyHealth(newHealth)
        setTimeout(() => generateProblem(), 1000)
      }
    } else {
      handleWrongAnswer()
    }
  }

  const startGame = (diff) => {
    setDifficulty(diff)
    setLevel(1)
    setScore(0)
    setLives(3)
    setEnemyHealth(enemies[0].health)
    setGameOver(false)
    setStreak(0)
    setProblem(null)
  }

  const resetGame = () => {
    setDifficulty(null)
    setProblem(null)
  }

  if (!difficulty) {
    return (
      <div className="game-screen adventure-screen">
        <ShootingStars />
        <TwinklingStars />
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>⚔️ {t.mathAdventure}</h2>
        </div>
        <div className="difficulty-select">
          <h3>Qiyinlik darajasini tanlang</h3>
          <div className="difficulty-buttons">
            <button className="diff-btn easy" onClick={() => startGame('easy')}>
              <span className="diff-icon">⭐</span>
              <span className="diff-name">Oson</span>
              <span className="diff-info">+, - (1-10)</span>
            </button>
            <button className="diff-btn medium" onClick={() => startGame('medium')}>
              <span className="diff-icon">⭐⭐</span>
              <span className="diff-name">O'rta</span>
              <span className="diff-info">+, -, × (1-20)</span>
            </button>
            <button className="diff-btn hard" onClick={() => startGame('hard')}>
              <span className="diff-icon">⭐⭐⭐</span>
              <span className="diff-name">Qiyin</span>
              <span className="diff-info">+, -, ×, ÷ (1-50)</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="game-screen adventure-screen">
        <ShootingStars />
        <TwinklingStars />
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>⚔️ {t.mathAdventure}</h2>
        </div>
        <div className="game-won cosmic">
          <div className="win-emoji">{lives > 0 ? '🏆' : '💫'}</div>
          <h3>{lives > 0 ? 'Galaktika qutqarildi!' : 'Jang tugadi!'}</h3>
          <div className="win-stats">
            <p>{t.score}: <strong>{score}</strong></p>
            <p>{t.level}: <strong>{level}/{enemies.length}</strong></p>
          </div>
          <div className="score-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.ceil(score / 100) ? '⭐' : '☆'}</span>
            ))}
          </div>
          <button className="play-btn cosmic" onClick={resetGame}>{t.tryAgain}</button>
        </div>
      </div>
    )
  }

  const currentEnemy = enemies[level - 1]

  return (
    <div className="game-screen adventure-screen">
      <ShootingStars />
      <TwinklingStars />
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>⚔️ {t.mathAdventure}</h2>
        <div className="game-stats-row">
          <div className={`game-stat time ${timeLeft <= 5 ? 'warning' : ''}`}>{timeLeft}s</div>
          <div className="game-stat">{t.score}: {score}</div>
          {streak > 1 && <div className="game-stat streak">{streak}🔥</div>}
        </div>
      </div>

      <div className="adventure-content">
        <div className="adventure-stats">
          <div className="lives">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={i < lives ? 'heart-full' : 'heart-empty'}>
                {i < lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
          <div className="level-badge">{t.level} {level}</div>
        </div>

        <div className="battle-scene">
          <div className="character hero">
            <span>🦸</span>
            <div className="char-name">Qahramon</div>
          </div>
          <div className="vs-text">⚔️</div>
          <div className="character villain">
            <span>{currentEnemy.emoji}</span>
            <div className="char-name">{currentEnemy.name}</div>
            <div className="health-bar">
              <div 
                className="health-fill" 
                style={{ width: `${(enemyHealth / currentEnemy.health) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {problem && (
          <div className={`math-problem ${feedback || ''}`}>
            <div className="problem-text">
              {problem.a} {problem.op} {problem.b} = ?
            </div>
            <div className="answer-input">
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="?"
                autoFocus
              />
              <button className="solve-btn" onClick={checkAnswer}>
                {t.solve} ⚡
              </button>
            </div>
            {feedback === 'correct' && <div className="feedback-text correct">✓ {t.correct}</div>}
            {feedback === 'wrong' && <div className="feedback-text wrong">✗ Javob: {problem.answer}</div>}
          </div>
        )}

        <div className="time-bar">
          <div className="time-fill" style={{ width: `${(timeLeft / difficulties[difficulty].time) * 100}%` }}></div>
        </div>
      </div>
    </div>
  )
}

// ============ MULTIPLICATION GAME - SPACE THEME ============
function MultiplicationGame({ t, onBack, onComplete }) {
  const [selectedTable, setSelectedTable] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [questions, setQuestions] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [mode, setMode] = useState(null)

  const generateQuestions = (table) => {
    const qs = []
    for (let i = 1; i <= 10; i++) {
      const correct = table * i
      const options = [correct]
      while (options.length < 4) {
        const wrong = correct + (Math.floor(Math.random() * 20) - 10)
        if (wrong > 0 && !options.includes(wrong)) {
          options.push(wrong)
        }
      }
      qs.push({
        a: table,
        b: i,
        answer: correct,
        options: options.sort(() => Math.random() - 0.5)
      })
    }
    return qs.sort(() => Math.random() - 0.5)
  }

  const generateMixedQuestions = () => {
    const qs = []
    for (let i = 0; i < 15; i++) {
      const a = Math.floor(Math.random() * 9) + 2
      const b = Math.floor(Math.random() * 10) + 1
      const correct = a * b
      const options = [correct]
      while (options.length < 4) {
        const wrong = correct + (Math.floor(Math.random() * 20) - 10)
        if (wrong > 0 && !options.includes(wrong)) {
          options.push(wrong)
        }
      }
      qs.push({
        a, b,
        answer: correct,
        options: options.sort(() => Math.random() - 0.5)
      })
    }
    return qs
  }

  useEffect(() => {
    if (timeLeft > 0 && answered === null && !gameOver && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && answered === null && questions.length > 0) {
      handleAnswer(-1)
    }
  }, [timeLeft, answered, gameOver, questions])

  const startTable = (table) => {
    setSelectedTable(table)
    setQuestions(generateQuestions(table))
    setCurrentQ(0)
    setScore(0)
    setAnswered(null)
    setGameOver(false)
    setStreak(0)
    setTimeLeft(10)
    setMode('single')
  }

  const startMixed = () => {
    setSelectedTable(null)
    setQuestions(generateMixedQuestions())
    setCurrentQ(0)
    setScore(0)
    setAnswered(null)
    setGameOver(false)
    setStreak(0)
    setTimeLeft(12)
    setMode('mixed')
  }

  const handleAnswer = (option) => {
    if (answered !== null) return
    setAnswered(option)
    
    const isCorrect = option === questions[currentQ].answer
    
    if (isCorrect) {
      const timeBonus = timeLeft * 3
      const streakBonus = streak * 5
      setScore(s => s + 10 + timeBonus + streakBonus)
      setStreak(s => s + 1)
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(q => q + 1)
        setAnswered(null)
        setTimeLeft(mode === 'mixed' ? 12 : 10)
      } else {
        setGameOver(true)
        if (onComplete) onComplete(score + (isCorrect ? 10 : 0), questions.length * 25)
      }
    }, 1200)
  }

  const resetGame = () => {
    setSelectedTable(null)
    setQuestions([])
    setMode(null)
  }

  if (!mode) {
    return (
      <div className="game-screen mult-screen">
        <ShootingStars />
        <TwinklingStars />
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>✖️ {t.multiplication}</h2>
        </div>
        <div className="table-select">
          <h3>Ko'paytirish jadvalini tanlang</h3>
          <div className="table-grid">
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button key={num} className="table-btn" onClick={() => startTable(num)}>
                {num} {t.times}
              </button>
            ))}
          </div>
          <button className="mixed-btn" onClick={startMixed}>
            🎲 Aralash (2-10)
          </button>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="game-screen mult-screen">
        <ShootingStars />
        <TwinklingStars />
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>✖️ {t.multiplication}</h2>
        </div>
        <div className="game-won cosmic">
          <div className="win-emoji">🏆</div>
          <h3>{t.completed}</h3>
          <div className="win-stats">
            <p>{t.score}: <strong>{score}</strong></p>
            <p>{mode === 'single' ? `${selectedTable} jadvali` : 'Aralash'}</p>
          </div>
          <div className="score-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.ceil(score / (questions.length * 5)) ? '⭐' : '☆'}</span>
            ))}
          </div>
          <div className="mult-buttons">
            <button className="play-btn cosmic" onClick={resetGame}>{t.tryAgain}</button>
          </div>
        </div>
      </div>
    )
  }

  const current = questions[currentQ]

  return (
    <div className="game-screen mult-screen">
      <ShootingStars />
      <TwinklingStars />
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>✖️ {t.multiplication}</h2>
        <div className="game-stats-row">
          <div className={`game-stat time ${timeLeft <= 3 ? 'warning' : ''}`}>{timeLeft}s</div>
          <div className="game-stat">{t.score}: {score}</div>
          {streak > 1 && <div className="game-stat streak">{streak}🔥</div>}
        </div>
      </div>

      <div className="mult-content">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
          </div>
          <span>{currentQ + 1}/{questions.length}</span>
        </div>

        <div className="mult-question">
          <span className="mult-num">{current.a}</span>
          <span className="mult-sign">×</span>
          <span className="mult-num">{current.b}</span>
          <span className="mult-sign">=</span>
          <span className="answer-box">?</span>
        </div>

        <div className="mult-options">
          {current.options.map((option, i) => (
            <button
              key={i}
              className={`mult-option ${answered !== null ? (option === current.answer ? 'correct' : option === answered ? 'wrong' : 'disabled') : ''}`}
              onClick={() => handleAnswer(option)}
              disabled={answered !== null}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="time-bar">
          <div className="time-fill" style={{ width: `${(timeLeft / (mode === 'mixed' ? 12 : 10)) * 100}%` }}></div>
        </div>
      </div>
    </div>
  )
}

// ============ MAIN GAMES CENTER COMPONENT ============
export default function GamesCenter() {
  const [currentGame, setCurrentGame] = useState(null)
  const [lang, setLang] = useState('uz')
  const { addXP } = useGamification()

  const t = translations[lang]

  const handleGameComplete = (score, maxScore) => {
    const xpEarned = Math.floor((score / maxScore) * 50)
    if (addXP) addXP(xpEarned)
  }

  const games = [
    { id: 'memory', icon: '🧠', color: '#8b5cf6', name: t.memory, desc: t.memoryDesc },
    { id: 'dragdrop', icon: '🚀', color: '#10b981', name: t.dragDrop, desc: t.dragDropDesc },
    { id: 'quiz', icon: '❓', color: '#f59e0b', name: t.quiz, desc: t.quizDesc },
    { id: 'counting', icon: '🔢', color: '#ec4899', name: t.counting, desc: t.countingDesc },
    { id: 'adventure', icon: '⚔️', color: '#6366f1', name: t.mathAdventure, desc: t.mathAdventureDesc },
    { id: 'multiplication', icon: '✖️', color: '#0ea5e9', name: t.multiplication, desc: t.multiplicationDesc },
    { id: 'puzzle', icon: '🧩', color: '#14b8a6', name: t.puzzle, desc: t.puzzleDesc },
    { id: 'music', icon: '🎵', color: '#f43f5e', name: t.music, desc: t.musicDesc },
    { id: 'drawing', icon: '🎨', color: '#a855f7', name: t.drawing, desc: t.drawingDesc },
    { id: 'shapes', icon: '🔷', color: '#3b82f6', name: t.shapes, desc: t.shapesDesc },
    { id: 'alphabet', icon: '🔤', color: '#22c55e', name: t.alphabet, desc: t.alphabetDesc },
    { id: 'words', icon: '📝', color: '#eab308', name: t.words, desc: t.wordsDesc }
  ]

  const renderGame = () => {
    switch (currentGame) {
      case 'memory':
        return <MemoryGame t={t} onBack={() => setCurrentGame(null)} onComplete={handleGameComplete} />
      case 'dragdrop':
        return <DragDropGame lang={lang} t={t} onBack={() => setCurrentGame(null)} onComplete={handleGameComplete} />
      case 'quiz':
        return <QuizGame lang={lang} t={t} onBack={() => setCurrentGame(null)} onComplete={handleGameComplete} />
      case 'counting':
        return <CountingGame t={t} onBack={() => setCurrentGame(null)} onComplete={handleGameComplete} />
      case 'adventure':
        return <MathAdventureGame t={t} onBack={() => setCurrentGame(null)} onComplete={handleGameComplete} />
      case 'multiplication':
        return <MultiplicationGame t={t} onBack={() => setCurrentGame(null)} onComplete={handleGameComplete} />
      case 'puzzle':
        return <PuzzleGame onBack={() => setCurrentGame(null)} />
      case 'music':
        return <MusicGame onBack={() => setCurrentGame(null)} />
      case 'drawing':
        return <DrawingCanvas onBack={() => setCurrentGame(null)} />
      case 'shapes':
        return <ShapeSorter onBack={() => setCurrentGame(null)} />
      case 'alphabet':
        return <AlphabetTrace onBack={() => setCurrentGame(null)} />
      case 'words':
        return <WordBuilder onBack={() => setCurrentGame(null)} />
      default:
        return null
    }
  }

  if (currentGame) {
    return renderGame()
  }

  return (
    <div className="games-center">
      <ShootingStars />
      <TwinklingStars />
      
      <div className="games-header">
        <span className="header-icon">🎮</span>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        
        <div className="lang-selector">
          {['uz', 'ru', 'en'].map(l => (
            <button
              key={l}
              className={`lang-btn ${lang === l ? 'active' : ''}`}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="games-grid">
        {games.map((game, index) => (
          <div
            key={game.id}
            className="game-card"
            style={{ 
              '--game-color': game.color,
              animationDelay: `${index * 0.1}s`
            }}
            onClick={() => setCurrentGame(game.id)}
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setCurrentGame(game.id)}
          >
            <span className="game-icon">{game.icon}</span>
            <h3>{game.name}</h3>
            <p>{game.desc}</p>
            <button className="play-btn">{t.start}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
