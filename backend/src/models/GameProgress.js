/**
 * GameProgress Model
 * Tracks child's game progress and adaptive difficulty
 */

import { readData, writeData } from '../utils/db.js'

const COLLECTION = 'gameProgress'

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 1,
  EASY: 2,
  MEDIUM: 3,
  HARD: 4,
  EXPERT: 5
}

// Game types
export const GAME_TYPES = {
  MEMORY: 'memory',
  QUIZ: 'quiz',
  COUNTING: 'counting',
  MATH_ADVENTURE: 'mathAdventure',
  MULTIPLICATION: 'multiplication',
  DRAG_DROP: 'dragDrop',
  ALPHABET: 'alphabet',
  COLORS: 'colors',
  SHAPES: 'shapes'
}

/**
 * GameProgress Schema:
 * {
 *   id: string,
 *   childId: string,
 *   gameType: string,
 *   difficulty: number (1-5),
 *   totalAttempts: number,
 *   successfulAttempts: number,
 *   averageScore: number,
 *   averageTime: number (seconds),
 *   streakCount: number,
 *   lastPlayed: ISO date string,
 *   history: [{ date, score, time, difficulty }],
 *   adaptiveMetrics: {
 *     accuracyRate: number (0-1),
 *     speedTrend: 'improving' | 'stable' | 'declining',
 *     recommendedDifficulty: number,
 *     strengthAreas: string[],
 *     weaknessAreas: string[]
 *   },
 *   createdAt: ISO date string,
 *   updatedAt: ISO date string
 * }
 */

// Get all progress for a child
export async function getChildProgress(childId) {
  const data = await readData(COLLECTION)
  return data.filter(p => p.childId === childId)
}

// Get progress for specific game
export async function getGameProgress(childId, gameType) {
  const data = await readData(COLLECTION)
  return data.find(p => p.childId === childId && p.gameType === gameType)
}

// Create or update progress
export async function updateGameProgress(childId, gameType, sessionData) {
  const data = await readData(COLLECTION)
  let progress = data.find(p => p.childId === childId && p.gameType === gameType)
  
  const now = new Date().toISOString()
  
  if (!progress) {
    // Create new progress record
    progress = {
      id: `${childId}_${gameType}_${Date.now()}`,
      childId,
      gameType,
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      totalAttempts: 0,
      successfulAttempts: 0,
      averageScore: 0,
      averageTime: 0,
      streakCount: 0,
      lastPlayed: now,
      history: [],
      adaptiveMetrics: {
        accuracyRate: 0,
        speedTrend: 'stable',
        recommendedDifficulty: DIFFICULTY_LEVELS.BEGINNER,
        strengthAreas: [],
        weaknessAreas: []
      },
      createdAt: now,
      updatedAt: now
    }
    data.push(progress)
  }
  
  // Update with session data
  const { score, maxScore, timeSpent, completed } = sessionData
  
  progress.totalAttempts++
  if (completed && score >= maxScore * 0.7) {
    progress.successfulAttempts++
    progress.streakCount++
  } else {
    progress.streakCount = 0
  }
  
  // Update averages
  const historyLength = progress.history.length
  progress.averageScore = ((progress.averageScore * historyLength) + (score / maxScore * 100)) / (historyLength + 1)
  progress.averageTime = ((progress.averageTime * historyLength) + timeSpent) / (historyLength + 1)
  
  // Add to history (keep last 50)
  progress.history.push({
    date: now,
    score,
    maxScore,
    time: timeSpent,
    difficulty: progress.difficulty
  })
  if (progress.history.length > 50) {
    progress.history = progress.history.slice(-50)
  }
  
  // Calculate adaptive metrics
  progress.adaptiveMetrics = calculateAdaptiveMetrics(progress)
  
  // Update difficulty based on performance
  progress.difficulty = progress.adaptiveMetrics.recommendedDifficulty
  
  progress.lastPlayed = now
  progress.updatedAt = now
  
  await writeData(COLLECTION, data)
  return progress
}

// Calculate adaptive metrics
function calculateAdaptiveMetrics(progress) {
  const recentHistory = progress.history.slice(-10)
  
  // Calculate accuracy rate
  const accuracyRate = progress.totalAttempts > 0 
    ? progress.successfulAttempts / progress.totalAttempts 
    : 0
  
  // Calculate speed trend
  let speedTrend = 'stable'
  if (recentHistory.length >= 5) {
    const firstHalf = recentHistory.slice(0, Math.floor(recentHistory.length / 2))
    const secondHalf = recentHistory.slice(Math.floor(recentHistory.length / 2))
    
    const avgFirst = firstHalf.reduce((sum, h) => sum + h.time, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((sum, h) => sum + h.time, 0) / secondHalf.length
    
    if (avgSecond < avgFirst * 0.9) speedTrend = 'improving'
    else if (avgSecond > avgFirst * 1.1) speedTrend = 'declining'
  }
  
  // Calculate recommended difficulty
  let recommendedDifficulty = progress.difficulty
  
  if (recentHistory.length >= 3) {
    const recentAccuracy = recentHistory.filter(h => h.score >= h.maxScore * 0.7).length / recentHistory.length
    
    if (recentAccuracy >= 0.8 && progress.streakCount >= 3) {
      // Increase difficulty
      recommendedDifficulty = Math.min(progress.difficulty + 1, DIFFICULTY_LEVELS.EXPERT)
    } else if (recentAccuracy < 0.4) {
      // Decrease difficulty
      recommendedDifficulty = Math.max(progress.difficulty - 1, DIFFICULTY_LEVELS.BEGINNER)
    }
  }
  
  // Identify strength and weakness areas
  const strengthAreas = []
  const weaknessAreas = []
  
  if (accuracyRate >= 0.7) strengthAreas.push('accuracy')
  else if (accuracyRate < 0.4) weaknessAreas.push('accuracy')
  
  if (speedTrend === 'improving') strengthAreas.push('speed')
  else if (speedTrend === 'declining') weaknessAreas.push('speed')
  
  if (progress.streakCount >= 5) strengthAreas.push('consistency')
  
  return {
    accuracyRate,
    speedTrend,
    recommendedDifficulty,
    strengthAreas,
    weaknessAreas
  }
}

// Get recommended games for a child
export async function getRecommendedGames(childId) {
  const allProgress = await getChildProgress(childId)
  
  const recommendations = []
  
  // Find games that need practice (low accuracy)
  const needsPractice = allProgress
    .filter(p => p.adaptiveMetrics.accuracyRate < 0.6)
    .map(p => ({
      gameType: p.gameType,
      reason: 'needs_practice',
      priority: 1
    }))
  
  // Find games not played recently
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const notPlayedRecently = allProgress
    .filter(p => p.lastPlayed < dayAgo)
    .map(p => ({
      gameType: p.gameType,
      reason: 'not_played_recently',
      priority: 2
    }))
  
  // Find new games (not played yet)
  const playedGames = allProgress.map(p => p.gameType)
  const newGames = Object.values(GAME_TYPES)
    .filter(g => !playedGames.includes(g))
    .map(g => ({
      gameType: g,
      reason: 'new_game',
      priority: 3
    }))
  
  // Find games with good streaks (for confidence)
  const goodStreaks = allProgress
    .filter(p => p.streakCount >= 3)
    .map(p => ({
      gameType: p.gameType,
      reason: 'good_streak',
      priority: 4
    }))
  
  return [...needsPractice, ...notPlayedRecently, ...newGames, ...goodStreaks]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
}

// Get child's overall stats
export async function getChildStats(childId) {
  const allProgress = await getChildProgress(childId)
  
  if (allProgress.length === 0) {
    return {
      totalGamesPlayed: 0,
      totalTime: 0,
      overallAccuracy: 0,
      favoriteGame: null,
      currentLevel: 1,
      badges: []
    }
  }
  
  const totalGamesPlayed = allProgress.reduce((sum, p) => sum + p.totalAttempts, 0)
  const totalTime = allProgress.reduce((sum, p) => sum + (p.averageTime * p.totalAttempts), 0)
  const overallAccuracy = allProgress.reduce((sum, p) => sum + p.adaptiveMetrics.accuracyRate, 0) / allProgress.length
  
  // Find favorite game (most played)
  const favoriteGame = allProgress.reduce((max, p) => 
    p.totalAttempts > (max?.totalAttempts || 0) ? p : max, null
  )?.gameType
  
  // Calculate overall level
  const avgDifficulty = allProgress.reduce((sum, p) => sum + p.difficulty, 0) / allProgress.length
  const currentLevel = Math.round(avgDifficulty)
  
  return {
    totalGamesPlayed,
    totalTime: Math.round(totalTime),
    overallAccuracy: Math.round(overallAccuracy * 100),
    favoriteGame,
    currentLevel,
    gamesProgress: allProgress.map(p => ({
      gameType: p.gameType,
      difficulty: p.difficulty,
      accuracy: Math.round(p.adaptiveMetrics.accuracyRate * 100),
      streak: p.streakCount
    }))
  }
}

export default {
  getChildProgress,
  getGameProgress,
  updateGameProgress,
  getRecommendedGames,
  getChildStats,
  DIFFICULTY_LEVELS,
  GAME_TYPES
}
