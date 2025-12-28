import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const GamificationContext = createContext()

// XP thresholds for levels
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 20000]

// Badge definitions
const BADGES = {
  first_game: { id: 'first_game', name: { uz: "Birinchi o'yin", ru: 'Первая игра', en: 'First Game' }, emoji: '🎮', xp: 50 },
  math_master: { id: 'math_master', name: { uz: 'Matematik', ru: 'Математик', en: 'Math Master' }, emoji: '🧮', xp: 100 },
  story_lover: { id: 'story_lover', name: { uz: 'Ertak sevuvchi', ru: 'Любитель сказок', en: 'Story Lover' }, emoji: '📚', xp: 75 },
  perfect_score: { id: 'perfect_score', name: { uz: "Mukammal natija", ru: 'Идеальный результат', en: 'Perfect Score' }, emoji: '⭐', xp: 150 },
  streak_3: { id: 'streak_3', name: { uz: '3 kunlik streak', ru: '3-дневная серия', en: '3 Day Streak' }, emoji: '🔥', xp: 100 },
  streak_7: { id: 'streak_7', name: { uz: '7 kunlik streak', ru: '7-дневная серия', en: '7 Day Streak' }, emoji: '💎', xp: 250 },
  alphabet_complete: { id: 'alphabet_complete', name: { uz: "Alifbo ustasi", ru: 'Мастер алфавита', en: 'Alphabet Master' }, emoji: '🔤', xp: 200 },
  color_expert: { id: 'color_expert', name: { uz: 'Rang bilimdon', ru: 'Знаток цветов', en: 'Color Expert' }, emoji: '🎨', xp: 100 },
  shape_wizard: { id: 'shape_wizard', name: { uz: 'Shakl sehrgari', ru: 'Волшебник фигур', en: 'Shape Wizard' }, emoji: '🔷', xp: 100 },
  counting_pro: { id: 'counting_pro', name: { uz: 'Sanash ustasi', ru: 'Мастер счёта', en: 'Counting Pro' }, emoji: '🔢', xp: 100 },
  daily_champion: { id: 'daily_champion', name: { uz: 'Kun chempioni', ru: 'Чемпион дня', en: 'Daily Champion' }, emoji: '🏆', xp: 50 },
  helper: { id: 'helper', name: { uz: 'Yordamchi', ru: 'Помощник', en: 'Helper' }, emoji: '🤝', xp: 75 },
  explorer: { id: 'explorer', name: { uz: "Kashfiyotchi", ru: 'Исследователь', en: 'Explorer' }, emoji: '🧭', xp: 100 },
  creative: { id: 'creative', name: { uz: 'Ijodkor', ru: 'Творец', en: 'Creative' }, emoji: '✨', xp: 125 },
  speed_demon: { id: 'speed_demon', name: { uz: 'Tezkor', ru: 'Скоростной', en: 'Speed Demon' }, emoji: '⚡', xp: 100 }
}

// Daily rewards
const DAILY_REWARDS = [
  { day: 1, xp: 25, emoji: '🎁' },
  { day: 2, xp: 50, emoji: '🎁' },
  { day: 3, xp: 75, emoji: '🎁' },
  { day: 4, xp: 100, emoji: '🎁' },
  { day: 5, xp: 150, emoji: '🎁' },
  { day: 6, xp: 200, emoji: '🎁' },
  { day: 7, xp: 500, emoji: '🎊' }
]

const STORAGE_KEY = 'playkids_gamification'

export function GamificationProvider({ children }) {
  const [state, setState] = useState({
    xp: 0,
    level: 1,
    badges: [],
    streak: 0,
    lastLoginDate: null,
    dailyRewardClaimed: false,
    gamesPlayed: 0,
    storiesRead: 0,
    perfectScores: 0,
    totalPlayTime: 0,
    achievements: {},
    recentActivity: []
  })

  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showBadge, setShowBadge] = useState(null)
  const [showReward, setShowReward] = useState(null)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error('Failed to load gamification data:', e)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Check daily streak on mount
  useEffect(() => {
    const today = new Date().toDateString()
    if (state.lastLoginDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      setState(prev => {
        const isConsecutive = prev.lastLoginDate === yesterday.toDateString()
        return {
          ...prev,
          lastLoginDate: today,
          streak: isConsecutive ? prev.streak + 1 : 1,
          dailyRewardClaimed: false
        }
      })
    }
  }, [])

  // Calculate level from XP
  const calculateLevel = useCallback((xp) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
    }
    return 1
  }, [])

  // Add XP
  const addXP = useCallback((amount, reason = '') => {
    setState(prev => {
      const newXP = prev.xp + amount
      const newLevel = calculateLevel(newXP)
      
      if (newLevel > prev.level) {
        setShowLevelUp(true)
        setTimeout(() => setShowLevelUp(false), 3000)
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        recentActivity: [
          { type: 'xp', amount, reason, timestamp: Date.now() },
          ...prev.recentActivity.slice(0, 19)
        ]
      }
    })
  }, [calculateLevel])

  // Award badge
  const awardBadge = useCallback((badgeId) => {
    if (!BADGES[badgeId]) return false
    
    setState(prev => {
      if (prev.badges.includes(badgeId)) return prev
      
      const badge = BADGES[badgeId]
      setShowBadge(badge)
      setTimeout(() => setShowBadge(null), 4000)

      return {
        ...prev,
        badges: [...prev.badges, badgeId],
        xp: prev.xp + badge.xp,
        level: calculateLevel(prev.xp + badge.xp),
        recentActivity: [
          { type: 'badge', badgeId, timestamp: Date.now() },
          ...prev.recentActivity.slice(0, 19)
        ]
      }
    })
    return true
  }, [calculateLevel])

  // Claim daily reward
  const claimDailyReward = useCallback(() => {
    if (state.dailyRewardClaimed) return null
    
    const dayIndex = Math.min(state.streak - 1, 6)
    const reward = DAILY_REWARDS[dayIndex]
    
    setShowReward(reward)
    setTimeout(() => setShowReward(null), 3000)
    
    setState(prev => ({
      ...prev,
      xp: prev.xp + reward.xp,
      level: calculateLevel(prev.xp + reward.xp),
      dailyRewardClaimed: true,
      recentActivity: [
        { type: 'daily_reward', day: dayIndex + 1, xp: reward.xp, timestamp: Date.now() },
        ...prev.recentActivity.slice(0, 19)
      ]
    }))
    
    return reward
  }, [state.dailyRewardClaimed, state.streak, calculateLevel])

  // Track game completion
  const trackGameComplete = useCallback((gameId, score, maxScore) => {
    setState(prev => {
      const newState = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1
      }
      
      // Check for first game badge
      if (newState.gamesPlayed === 1) {
        awardBadge('first_game')
      }
      
      // Check for perfect score
      if (score === maxScore) {
        newState.perfectScores = prev.perfectScores + 1
        if (!prev.badges.includes('perfect_score')) {
          awardBadge('perfect_score')
        }
      }
      
      return newState
    })
    
    // Award XP based on score
    const percentage = score / maxScore
    const baseXP = 20
    const bonusXP = Math.floor(percentage * 30)
    addXP(baseXP + bonusXP, `${gameId} completed`)
  }, [addXP, awardBadge])

  // Track story read
  const trackStoryRead = useCallback((storyId) => {
    setState(prev => {
      const newCount = prev.storiesRead + 1
      if (newCount === 5 && !prev.badges.includes('story_lover')) {
        awardBadge('story_lover')
      }
      return { ...prev, storiesRead: newCount }
    })
    addXP(15, 'Story read')
  }, [addXP, awardBadge])

  // Get progress to next level
  const getProgressToNextLevel = useCallback(() => {
    const currentThreshold = LEVEL_THRESHOLDS[state.level - 1] || 0
    const nextThreshold = LEVEL_THRESHOLDS[state.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    const progress = state.xp - currentThreshold
    const needed = nextThreshold - currentThreshold
    return { progress, needed, percentage: Math.min((progress / needed) * 100, 100) }
  }, [state.xp, state.level])

  // Check streak badges
  useEffect(() => {
    if (state.streak >= 3 && !state.badges.includes('streak_3')) {
      awardBadge('streak_3')
    }
    if (state.streak >= 7 && !state.badges.includes('streak_7')) {
      awardBadge('streak_7')
    }
  }, [state.streak, state.badges, awardBadge])

  const value = {
    ...state,
    BADGES,
    DAILY_REWARDS,
    LEVEL_THRESHOLDS,
    addXP,
    awardBadge,
    claimDailyReward,
    trackGameComplete,
    trackStoryRead,
    getProgressToNextLevel,
    showLevelUp,
    showBadge,
    showReward
  }

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider')
  }
  return context
}

export default GamificationContext
