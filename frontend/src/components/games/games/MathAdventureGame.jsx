/**
 * Math Adventure Game Component
 * Issue #13: GamesCenter.jsx dan ajratilgan
 */

import { useState, useEffect, useCallback, memo } from 'react'
import PropTypes from 'prop-types'

const villains = ['🧙‍♂️', '👹', '🐉', '👾', '🤖']
const heroes = ['🦸', '🧝', '🧚', '⚔️', '🛡️']

function MathAdventureGame({ t, onBack, onComplete }) {
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [problem, setProblem] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [villainHealth, setVillainHealth] = useState(100)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const generateProblem = useCallback((lvl) => {
    const ops = ['+', '-']
    if (lvl >= 2) ops.push('×')
    const op = ops[Math.floor(Math.random() * ops.length)]
    let a, b, answer
    
    if (op === '+') {
      a = Math.floor(Math.random() * (lvl * 5)) + 1
      b = Math.floor(Math.random() * (lvl * 5)) + 1
      answer = a + b
    } else if (op === '-') {
      a = Math.floor(Math.random() * (lvl * 5)) + lvl
      b = Math.floor(Math.random() * a) + 1
      answer = a - b
    } else {
      a = Math.floor(Math.random() * 5) + 1
      b = Math.floor(Math.random() * 5) + 1
      answer = a * b
    }
    
    return { a, b, op, answer }
  }, [])

  useEffect(() => {
    setProblem(generateProblem(level))
  }, [level, generateProblem])

  const checkAnswer = useCallback(() => {
    if (!userAnswer || !problem) return
    const isCorrect = parseInt(userAnswer) === problem.answer
    
    if (isCorrect) {
      setFeedback('correct')
      setScore(s => s + level * 10)
      setVillainHealth(h => Math.max(0, h - 25))
      
      setTimeout(() => {
        if (villainHealth <= 25) {
          if (level >= 5) {
            setWon(true)
            setGameOver(true)
            onComplete?.(score + level * 10, 250)
          } else {
            setLevel(l => l + 1)
            setVillainHealth(100)
          }
        }
        setProblem(generateProblem(level))
        setUserAnswer('')
        setFeedback(null)
      }, 1000)
    } else {
      setFeedback('wrong')
      setLives(l => l - 1)
      
      setTimeout(() => {
        if (lives <= 1) {
          setGameOver(true)
          onComplete?.(score, 250)
        }
        setUserAnswer('')
        setFeedback(null)
      }, 1000)
    }
  }, [userAnswer, problem, villainHealth, level, lives, score, onComplete, generateProblem])

  const resetGame = useCallback(() => {
    setLevel(1)
    setLives(3)
    setScore(0)
    setVillainHealth(100)
    setGameOver(false)
    setWon(false)
    setProblem(generateProblem(1))
    setUserAnswer('')
  }, [generateProblem])

  if (gameOver) {
    return (
      <div className="game-screen adventure-screen">
        <div className="game-top">
          <button className="back-btn" onClick={onBack}>← {t.back}</button>
          <h2>🦸 {t.mathAdventure}</h2>
        </div>
        <div className="game-won">
          <div className="win-emoji">{won ? '🏆' : '😢'}</div>
          <h3>{won ? t.completed : t.tryAgain}</h3>
          <p className="final-score">{t.score}: {score}</p>
          <p>{t.level}: {level}</p>
          <button className="play-btn" onClick={resetGame}>{t.tryAgain}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen adventure-screen">
      <div className="game-top">
        <button className="back-btn" onClick={onBack}>← {t.back}</button>
        <h2>🦸 {t.mathAdventure}</h2>
        <div className="game-stat">{t.level}: {level}</div>
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
          <div className="score-display">{t.score}: {score}</div>
        </div>

        <div className="battle-scene">
          <div className="hero-side">
            <span className="character hero">{heroes[level - 1]}</span>
          </div>
          
          <div className="vs-text">⚔️</div>
          
          <div className="villain-side">
            <span className="character villain">{villains[level - 1]}</span>
            <div className="health-bar">
              <div className="health-fill" style={{ width: `${villainHealth}%` }}></div>
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
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="?"
                autoFocus
              />
              <button className="solve-btn" onClick={checkAnswer}>
                {t.solve} ⚡
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

MathAdventureGame.propTypes = {
  t: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func
}

export default memo(MathAdventureGame)
