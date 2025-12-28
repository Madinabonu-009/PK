/**
 * Counting Game Component
 * Issue #13: GamesCenter.jsx dan ajratilgan
 */

import { useState, useMemo, useCallback, memo } from 'react'
import PropTypes from 'prop-types'

const countingLevels = [
  { emoji: '🍎', count: 3 },
  { emoji: '⭐', count: 5 },
  { emoji: '🐱', count: 4 },
  { emoji: '🌸', count: 6 },
  { emoji: '🎈', count: 7 }
]

function CountingGame({ t, onBack, onComplete }) {
  const [level, setLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [gameOver, setGameOver] = useState(false)

  const current = countingLevels[level]
  
  const options = useMemo(() => {
    return [current.count - 1, current.count, current.count + 1, current.count + 2]
      .filter(n => n > 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
  }, [current.count])

  const handleAnswer = useCallback((num) => {
    if (answered !== null) return
    setAnswered(num)
    const isCorrect = num === current.count
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      if (level + 1 < countingLevels.length) {
        setLevel(l => l + 1)
        setAnswered(null)
      } else {
        setGameOver(true)
        onComplete?.(score + (isCorrect ? 1 : 0), countingLevels.length)
      }
    }, 1200)
  }, [answered, current.count, level, score, onComplete])

  const resetGame = useCallback(() => {
    setLevel(0)
    setScore(0)
    setAnswered(null)
    setGameOver(false)
  }, [])

  if (gameOver) {
    return (
      <div className="game-screen">
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>🔢 {t.counting}</h2>
        </div>
        <div className="game-won">
          <div className="win-emoji">🎉</div>
          <h3>{t.completed}</h3>
          <p className="final-score">{score} / {countingLevels.length}</p>
          <button className="play-btn" onClick={resetGame}>{t.tryAgain}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen">
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🔢 {t.counting}</h2>
        <div className="game-stat">{level + 1}/{countingLevels.length}</div>
      </div>

      <div className="counting-content">
        <h3>{t.howMany} {current.emoji}?</h3>
        <div className="counting-items">
          {[...Array(current.count)].map((_, i) => (
            <span key={i} className="count-item" style={{ animationDelay: `${i * 0.1}s` }}>
              {current.emoji}
            </span>
          ))}
        </div>
        <div className="counting-options">
          {options.map((num, i) => (
            <button
              key={i}
              className={`count-option ${answered !== null ? (num === current.count ? 'correct' : num === answered ? 'wrong' : '') : ''}`}
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

CountingGame.propTypes = {
  t: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func
}

export default memo(CountingGame)
