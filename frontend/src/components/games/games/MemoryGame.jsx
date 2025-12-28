/**
 * Memory Game Component
 * Issue #13: GamesCenter.jsx dan ajratilgan
 */

import { useState, useEffect, useCallback, memo } from 'react'
import PropTypes from 'prop-types'

const memoryCards = [
  { id: 1, emoji: '🐶' }, { id: 2, emoji: '🐱' },
  { id: 3, emoji: '🐰' }, { id: 4, emoji: '🦁' },
  { id: 5, emoji: '🐼' }, { id: 6, emoji: '🦊' }
]

function MemoryGame({ t, onBack, onComplete }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)

  const startGame = useCallback(() => {
    const shuffled = [...memoryCards, ...memoryCards]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, uniqueId: index }))
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameWon(false)
  }, [])

  useEffect(() => {
    startGame()
  }, [startGame])

  const handleCardClick = useCallback((uniqueId) => {
    if (flipped.length === 2 || flipped.includes(uniqueId) || matched.includes(uniqueId)) return

    const newFlipped = [...flipped, uniqueId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newFlipped
      const firstCard = cards.find(c => c.uniqueId === first)
      const secondCard = cards.find(c => c.uniqueId === second)

      if (firstCard.id === secondCard.id) {
        const newMatched = [...matched, first, second]
        setMatched(newMatched)
        setFlipped([])
        if (newMatched.length === cards.length) {
          setGameWon(true)
          onComplete?.(Math.max(0, 12 - moves), 12)
        }
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }, [flipped, matched, cards, moves, onComplete])

  return (
    <div className="game-screen">
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🧠 {t.memory}</h2>
        <div className="game-stat">{t.moves}: {moves}</div>
      </div>

      {gameWon ? (
        <div className="game-won">
          <div className="win-emoji">🏆</div>
          <h3>{t.completed}</h3>
          <p>{t.moves}: {moves}</p>
          <button className="play-btn" onClick={startGame}>{t.tryAgain}</button>
        </div>
      ) : (
        <div className="memory-grid">
          {cards.map(card => (
            <div
              key={card.uniqueId}
              className={`memory-card ${flipped.includes(card.uniqueId) ? 'flipped' : ''} ${matched.includes(card.uniqueId) ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.uniqueId)}
            >
              <div className="card-inner">
                <div className="card-front">❓</div>
                <div className="card-back">{card.emoji}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

MemoryGame.propTypes = {
  t: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func
}

export default memo(MemoryGame)
