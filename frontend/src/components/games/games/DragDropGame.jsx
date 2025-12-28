/**
 * Drag & Drop Game Component
 * Issue #13: GamesCenter.jsx dan ajratilgan
 */

import { useState, useCallback, memo } from 'react'
import PropTypes from 'prop-types'

const animals = [
  { id: 1, emoji: '🐶', home: 'house', homeEmoji: '🏠' },
  { id: 2, emoji: '🐟', home: 'water', homeEmoji: '🌊' },
  { id: 3, emoji: '🐦', home: 'tree', homeEmoji: '🌳' },
  { id: 4, emoji: '🐝', home: 'flower', homeEmoji: '🌸' }
]

const homeNames = {
  uz: { house: 'Uy', water: 'Suv', tree: 'Daraxt', flower: 'Gul' },
  ru: { house: 'Дом', water: 'Вода', tree: 'Дерево', flower: 'Цветок' },
  en: { house: 'House', water: 'Water', tree: 'Tree', flower: 'Flower' }
}

function DragDropGame({ lang = 'uz', t, onBack, onComplete }) {
  const [placed, setPlaced] = useState({})
  const [draggedAnimal, setDraggedAnimal] = useState(null)
  const [gameWon, setGameWon] = useState(false)

  const homes = [
    { id: 'house', emoji: '🏠', name: homeNames[lang]?.house || 'House' },
    { id: 'water', emoji: '🌊', name: homeNames[lang]?.water || 'Water' },
    { id: 'tree', emoji: '🌳', name: homeNames[lang]?.tree || 'Tree' },
    { id: 'flower', emoji: '🌸', name: homeNames[lang]?.flower || 'Flower' }
  ]

  const handleDrop = useCallback((home) => {
    if (!draggedAnimal) return
    if (draggedAnimal.home === home) {
      const newPlaced = { ...placed, [draggedAnimal.id]: home }
      setPlaced(newPlaced)
      if (Object.keys(newPlaced).length === animals.length) {
        setGameWon(true)
        onComplete?.(animals.length, animals.length)
      }
    }
    setDraggedAnimal(null)
  }, [draggedAnimal, placed, onComplete])

  const resetGame = useCallback(() => {
    setPlaced({})
    setDraggedAnimal(null)
    setGameWon(false)
  }, [])

  return (
    <div className="game-screen">
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🎯 {t.dragDrop}</h2>
        <div className="game-stat">{Object.keys(placed).length}/{animals.length}</div>
      </div>

      {gameWon ? (
        <div className="game-won">
          <div className="win-emoji">🎉</div>
          <h3>{t.completed}</h3>
          <button className="play-btn" onClick={resetGame}>{t.tryAgain}</button>
        </div>
      ) : (
        <>
          <div className="animals-row">
            {animals.filter(a => !placed[a.id]).map(animal => (
              <div
                key={animal.id}
                className={`draggable-animal ${draggedAnimal?.id === animal.id ? 'dragging' : ''}`}
                draggable
                onDragStart={() => setDraggedAnimal(animal)}
                onClick={() => setDraggedAnimal(draggedAnimal?.id === animal.id ? null : animal)}
              >
                {animal.emoji}
              </div>
            ))}
          </div>

          <div className="homes-row">
            {homes.map(home => (
              <div
                key={home.id}
                className={`home-zone ${draggedAnimal?.home === home.id ? 'highlight' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(home.id)}
                onClick={() => draggedAnimal && handleDrop(home.id)}
              >
                <span className="home-emoji">{home.emoji}</span>
                <span className="home-name">{home.name}</span>
                <div className="placed-animals">
                  {animals.filter(a => placed[a.id] === home.id).map(a => (
                    <span key={a.id}>{a.emoji}</span>
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

DragDropGame.propTypes = {
  lang: PropTypes.oneOf(['uz', 'ru', 'en']),
  t: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func
}

export default memo(DragDropGame)
