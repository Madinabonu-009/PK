/**
 * Multiplication Game Component
 * Issue #13: GamesCenter.jsx dan ajratilgan
 */

import { useState, useCallback, memo } from 'react'
import PropTypes from 'prop-types'

const tables = [2, 3, 4, 5, 6, 7, 8, 9, 10]

function MultiplicationGame({ lang = 'uz', t, onBack, onComplete }) {
  const [table, setTable] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [questions, setQuestions] = useState([])
  const [gameOver, setGameOver] = useState(false)

  const startTable = useCallback((num) => {
    const qs = []
    for (let i = 1; i <= 10; i++) {
      const answer = num * i
      const options = [answer]
      while (options.length < 4) {
        const wrong = answer + Math.floor(Math.random() * 10) - 5
        if (wrong > 0 && wrong !== answer && !options.includes(wrong)) {
          options.push(wrong)
        }
      }
      qs.push({ a: num, b: i, answer, options: options.sort(() => Math.random() - 0.5) })
    }
    setQuestions(qs)
    setTable(num)
    setCurrentQ(0)
    setScore(0)
    setGameOver(false)
  }, [])

  const handleAnswer = useCallback((ans) => {
    if (answered !== null) return
    setAnswered(ans)
    const isCorrect = ans === questions[currentQ].answer
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(q => q + 1)
        setAnswered(null)
      } else {
        setGameOver(true)
        onComplete?.(score + (isCorrect ? 1 : 0), 10)
      }
    }, 1000)
  }, [answered, currentQ, questions, score, onComplete])

  const tableSelectText = {
    uz: "Qaysi jadvalni o'rganamiz?",
    ru: "Какую таблицу учим?",
    en: "Which table to learn?"
  }

  if (!table) {
    return (
      <div className="game-screen">
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>✖️ {t.multiplication}</h2>
        </div>
        <div className="table-select">
          <h3>{tableSelectText[lang] || tableSelectText.en}</h3>
          <div className="table-grid">
            {tables.map(num => (
              <button key={num} className="table-btn" onClick={() => startTable(num)}>
                {num} {t.times}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="game-screen">
        <div className="game-top">
          <button className="back-btn" onClick={() => setTable(null)}>← {t.back}</button>
          <h2>✖️ {table} {t.times}</h2>
        </div>
        <div className="game-won">
          <div className="win-emoji">{score >= 8 ? '🏆' : score >= 5 ? '⭐' : '📚'}</div>
          <h3>{t.completed}</h3>
          <p className="final-score">{score} / 10</p>
          <div className="score-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.ceil(score / 2) ? '⭐' : '☆'}</span>
            ))}
          </div>
          <div className="mult-buttons">
            <button className="play-btn" onClick={() => startTable(table)}>{t.tryAgain}</button>
            <button className="play-btn secondary" onClick={() => setTable(null)}>{t.back}</button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[currentQ]

  return (
    <div className="game-screen">
      <div className="game-top">
        <button className="back-btn" onClick={() => setTable(null)}>← {t.back}</button>
        <h2>✖️ {table} {t.times}</h2>
        <div className="game-stat">{currentQ + 1}/10</div>
      </div>

      <div className="mult-content">
        <div className="mult-question">
          <span className="mult-num">{q.a}</span>
          <span className="mult-sign">×</span>
          <span className="mult-num">{q.b}</span>
          <span className="mult-sign">=</span>
          <span className="mult-num answer-box">?</span>
        </div>

        <div className="mult-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`mult-option ${answered !== null ? (opt === q.answer ? 'correct' : opt === answered ? 'wrong' : '') : ''}`}
              onClick={() => handleAnswer(opt)}
              disabled={answered !== null}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentQ + 1) / 10) * 100}%` }}></div>
        </div>
      </div>
    </div>
  )
}

MultiplicationGame.propTypes = {
  lang: PropTypes.oneOf(['uz', 'ru', 'en']),
  t: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func
}

export default memo(MultiplicationGame)
