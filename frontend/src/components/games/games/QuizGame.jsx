/**
 * Quiz Game Component
 * Issue #13: GamesCenter.jsx dan ajratilgan
 */

import { useState, useCallback, memo } from 'react'
import PropTypes from 'prop-types'

const quizQuestions = {
  uz: [
    { q: "Qaysi hayvon sut beradi?", options: ['🐄', '🐍', '🦅', '🐟'], answer: 0 },
    { q: "Qaysi meva sariq rangda?", options: ['🍎', '🍇', '🍌', '🍓'], answer: 2 },
    { q: "2 + 3 = ?", options: ['4', '5', '6', '7'], answer: 1 },
    { q: "Qaysi transport havoda uchadi?", options: ['🚗', '🚢', '✈️', '🚂'], answer: 2 },
    { q: "Qaysi rang qizil?", options: ['🔵', '🟢', '🔴', '🟡'], answer: 2 }
  ],
  ru: [
    { q: "Какое животное даёт молоко?", options: ['🐄', '🐍', '🦅', '🐟'], answer: 0 },
    { q: "Какой фрукт жёлтый?", options: ['🍎', '🍇', '🍌', '🍓'], answer: 2 },
    { q: "2 + 3 = ?", options: ['4', '5', '6', '7'], answer: 1 },
    { q: "Какой транспорт летает?", options: ['🚗', '🚢', '✈️', '🚂'], answer: 2 },
    { q: "Какой цвет красный?", options: ['🔵', '🟢', '🔴', '🟡'], answer: 2 }
  ],
  en: [
    { q: "Which animal gives milk?", options: ['🐄', '🐍', '🦅', '🐟'], answer: 0 },
    { q: "Which fruit is yellow?", options: ['🍎', '🍇', '🍌', '🍓'], answer: 2 },
    { q: "2 + 3 = ?", options: ['4', '5', '6', '7'], answer: 1 },
    { q: "Which transport flies?", options: ['🚗', '🚢', '✈️', '🚂'], answer: 2 },
    { q: "Which color is red?", options: ['🔵', '🟢', '🔴', '🟡'], answer: 2 }
  ]
}

function QuizGame({ lang = 'uz', t, onBack, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const questions = quizQuestions[lang] || quizQuestions.en

  const handleAnswer = useCallback((index) => {
    if (answered !== null) return
    setAnswered(index)
    const isCorrect = index === questions[currentQ].answer
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(q => q + 1)
        setAnswered(null)
      } else {
        setGameOver(true)
        onComplete?.(score + (isCorrect ? 1 : 0), questions.length)
      }
    }, 1200)
  }, [answered, currentQ, questions, score, onComplete])

  const resetGame = useCallback(() => {
    setCurrentQ(0)
    setScore(0)
    setAnswered(null)
    setGameOver(false)
  }, [])

  if (gameOver) {
    return (
      <div className="game-screen">
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>❓ {t.quiz}</h2>
        </div>
        <div className="game-won">
          <div className="win-emoji">🏆</div>
          <h3>{t.completed}</h3>
          <p className="final-score">{score} / {questions.length}</p>
          <div className="score-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.ceil(score / questions.length * 5) ? '⭐' : '☆'}</span>
            ))}
          </div>
          <button className="play-btn" onClick={resetGame}>{t.tryAgain}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen">
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>❓ {t.quiz}</h2>
        <div className="game-stat">{currentQ + 1}/{questions.length}</div>
      </div>

      <div className="quiz-content">
        <div className="quiz-question">
          <h3>{questions[currentQ].q}</h3>
        </div>
        <div className="quiz-options">
          {questions[currentQ].options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option ${answered !== null ? (index === questions[currentQ].answer ? 'correct' : index === answered ? 'wrong' : '') : ''}`}
              onClick={() => handleAnswer(index)}
              disabled={answered !== null}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>
    </div>
  )
}

QuizGame.propTypes = {
  lang: PropTypes.oneOf(['uz', 'ru', 'en']),
  t: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func
}

export default memo(QuizGame)
