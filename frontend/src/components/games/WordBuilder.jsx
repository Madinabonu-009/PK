import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './WordBuilder.css'

const translations = {
  uz: {
    title: "So'z Yasash",
    subtitle: "Harflardan so'z yasa!",
    back: "Orqaga",
    check: "Tekshir",
    hint: "Yordam",
    skip: "O'tkazish",
    shuffle: "Aralashtir",
    clear: "Tozalash",
    correct: "Zo'r!",
    wrong: "Qayta urinib ko'r!",
    score: "Ball",
    completed: "Barakalla!",
    tryAgain: "Qayta o'ynash",
    buildWord: "So'zni yasa",
    streak: "Ketma-ket",
    perfect: "Mukammal!",
    noHints: "Yordam tugadi",
    selectCategory: "Kategoriyani tanlang",
    selectDifficulty: "Qiyinlikni tanlang",
    easy: "Oson",
    medium: "O'rta", 
    hard: "Qiyin",
    words: "so'z",
    categories: {
      animals: "Hayvonlar",
      fruits: "Mevalar",
      nature: "Tabiat",
      home: "Uy-ro'zg'or",
      body: "Tana a'zolari",
      colors: "Ranglar"
    }
  },
  ru: {
    title: "Составь Слово",
    subtitle: "Составь слово из букв!",
    back: "Назад",
    check: "Проверить",
    hint: "Подсказка",
    skip: "Пропустить",
    shuffle: "Перемешать",
    clear: "Очистить",
    correct: "Супер!",
    wrong: "Попробуй ещё!",
    score: "Счёт",
    completed: "Молодец!",
    tryAgain: "Ещё раз",
    buildWord: "Составь слово",
    streak: "Серия",
    perfect: "Идеально!",
    noHints: "Подсказки кончились",
    selectCategory: "Выберите категорию",
    selectDifficulty: "Выберите сложность",
    easy: "Легко",
    medium: "Средне",
    hard: "Сложно",
    words: "слов",
    categories: {
      animals: "Животные",
      fruits: "Фрукты",
      nature: "Природа",
      home: "Дом",
      body: "Части тела",
      colors: "Цвета"
    }
  },
  en: {
    title: "Word Builder",
    subtitle: "Build words from letters!",
    back: "Back",
    check: "Check",
    hint: "Hint",
    skip: "Skip",
    shuffle: "Shuffle",
    clear: "Clear",
    correct: "Great!",
    wrong: "Try again!",
    score: "Score",
    completed: "Well Done!",
    tryAgain: "Play Again",
    buildWord: "Build the word",
    streak: "Streak",
    perfect: "Perfect!",
    noHints: "No hints left",
    selectCategory: "Select Category",
    selectDifficulty: "Select Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    words: "words",
    categories: {
      animals: "Animals",
      fruits: "Fruits",
      nature: "Nature",
      home: "Home",
      body: "Body Parts",
      colors: "Colors"
    }
  }
}


// Word data with SVG icons
const WORDS = {
  uz: {
    animals: [
      { word: 'IT', hint: 'Uy hayvoni, huradi', icon: '<circle cx="50" cy="50" r="35" fill="#d4a574"/><circle cx="35" cy="40" r="6" fill="#1e293b"/><circle cx="65" cy="40" r="6" fill="#1e293b"/><ellipse cx="50" cy="55" rx="12" ry="8" fill="#1e293b"/><ellipse cx="25" cy="35" rx="10" ry="18" fill="#92400e"/><ellipse cx="75" cy="35" rx="10" ry="18" fill="#92400e"/>' },
      { word: 'MUSHUK', hint: 'Miyovlaydi', icon: '<circle cx="50" cy="50" r="35" fill="#fbbf24"/><circle cx="35" cy="45" r="6" fill="#1e293b"/><circle cx="65" cy="45" r="6" fill="#1e293b"/><path d="M40 58 Q50 68 60 58" stroke="#1e293b" stroke-width="3" fill="none"/><path d="M20 20 L30 40 L40 25" fill="#fbbf24"/><path d="M80 20 L70 40 L60 25" fill="#fbbf24"/>' },
      { word: 'FIL', hint: 'Eng katta hayvon', icon: '<circle cx="50" cy="50" r="35" fill="#9ca3af"/><circle cx="35" cy="40" r="5" fill="#1e293b"/><circle cx="65" cy="40" r="5" fill="#1e293b"/><path d="M50 50 Q45 70 50 85" stroke="#6b7280" stroke-width="8" fill="none"/>' },
      { word: 'SHER', hint: 'Hayvonlar shohi', icon: '<circle cx="50" cy="50" r="25" fill="#fbbf24"/><circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" stroke-width="10"/><circle cx="40" cy="45" r="4" fill="#1e293b"/><circle cx="60" cy="45" r="4" fill="#1e293b"/><ellipse cx="50" cy="55" rx="6" ry="4" fill="#1e293b"/>' },
      { word: 'QUYON', hint: 'Uzun quloqli', icon: '<circle cx="50" cy="55" r="30" fill="#f5f5f4"/><ellipse cx="35" cy="20" rx="8" ry="22" fill="#fecaca"/><ellipse cx="65" cy="20" rx="8" ry="22" fill="#fecaca"/><circle cx="40" cy="50" r="4" fill="#1e293b"/><circle cx="60" cy="50" r="4" fill="#1e293b"/><circle cx="50" cy="58" r="5" fill="#fecaca"/>' },
      { word: 'OT', hint: 'Minib yuriladi', icon: '<ellipse cx="50" cy="55" rx="30" ry="25" fill="#92400e"/><ellipse cx="50" cy="30" rx="15" ry="20" fill="#92400e"/><circle cx="45" cy="25" r="4" fill="#1e293b"/><path d="M55 35 L55 50" stroke="#1e293b" stroke-width="2"/>' }
    ],
    fruits: [
      { word: 'OLMA', hint: 'Qizil meva', icon: '<circle cx="50" cy="55" r="35" fill="#ef4444"/><path d="M50 20 Q55 10 60 15" stroke="#22c55e" stroke-width="3" fill="none"/><ellipse cx="50" cy="15" rx="8" ry="5" fill="#22c55e"/>' },
      { word: 'BANAN', hint: 'Sariq, egri meva', icon: '<path d="M20 70 Q30 20 70 30 Q90 35 85 50 Q75 30 35 40 Q15 50 20 70" fill="#fbbf24"/>' },
      { word: 'UZUM', hint: 'Mayda donali', icon: '<circle cx="40" cy="45" r="12" fill="#8b5cf6"/><circle cx="60" cy="45" r="12" fill="#8b5cf6"/><circle cx="50" cy="60" r="12" fill="#8b5cf6"/><circle cx="35" cy="65" r="10" fill="#8b5cf6"/><circle cx="65" cy="65" r="10" fill="#8b5cf6"/><path d="M50 20 L50 35" stroke="#22c55e" stroke-width="3"/>' },
      { word: 'NOK', hint: 'Yashil, shirin', icon: '<ellipse cx="50" cy="60" rx="25" ry="30" fill="#84cc16"/><ellipse cx="50" cy="35" rx="15" ry="18" fill="#84cc16"/><path d="M50 15 Q55 5 60 10" stroke="#92400e" stroke-width="3" fill="none"/>' },
      { word: 'GILOS', hint: 'Qizil, kichik', icon: '<circle cx="35" cy="60" r="18" fill="#dc2626"/><circle cx="65" cy="60" r="18" fill="#dc2626"/><path d="M35 42 Q50 20 65 42" stroke="#22c55e" stroke-width="3" fill="none"/>' },
      { word: 'ANOR', hint: 'Donali meva', icon: '<circle cx="50" cy="55" r="35" fill="#ef4444"/><path d="M40 20 L50 10 L60 20" fill="#f59e0b"/>' }
    ],
    nature: [
      { word: 'GUL', hint: 'Chiroyli, xushboy', icon: '<circle cx="50" cy="50" r="12" fill="#fbbf24"/><circle cx="50" cy="25" r="15" fill="#ec4899"/><circle cx="50" cy="75" r="15" fill="#ec4899"/><circle cx="25" cy="50" r="15" fill="#ec4899"/><circle cx="75" cy="50" r="15" fill="#ec4899"/>' },
      { word: 'DARAXT', hint: 'Baland, yashil', icon: '<rect x="42" y="60" width="16" height="35" fill="#92400e"/><path d="M50 5 L80 60 L20 60 Z" fill="#22c55e"/>' },
      { word: 'QUYOSH', hint: 'Yoruglik beradi', icon: '<circle cx="50" cy="50" r="25" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="4"><line x1="50" y1="10" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="90"/><line x1="10" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="90" y2="50"/></g>' },
      { word: 'OY', hint: 'Kechasi korinadi', icon: '<path d="M60 15 A35 35 0 1 0 60 85 A28 28 0 1 1 60 15" fill="#fef3c7"/>' },
      { word: 'YULDUZ', hint: 'Osmonda yonadi', icon: '<path d="M50 5 L61 40 L98 40 L68 62 L79 97 L50 75 L21 97 L32 62 L2 40 L39 40 Z" fill="#fbbf24"/>' },
      { word: 'BULUT', hint: 'Osmonda suzadi', icon: '<ellipse cx="50" cy="55" rx="35" ry="20" fill="#e0f2fe"/><circle cx="30" cy="50" r="18" fill="#e0f2fe"/><circle cx="70" cy="50" r="18" fill="#e0f2fe"/><circle cx="50" cy="40" r="20" fill="#e0f2fe"/>' }
    ],
    home: [
      { word: 'UY', hint: 'Yashaymiz', icon: '<rect x="25" y="50" width="50" height="40" fill="#fbbf24"/><path d="M15 55 L50 20 L85 55" fill="#ef4444"/><rect x="40" y="65" width="20" height="25" fill="#92400e"/>' },
      { word: 'STOL', hint: 'Ustida yeymiz', icon: '<rect x="15" y="40" width="70" height="8" fill="#92400e"/><rect x="20" y="48" width="8" height="40" fill="#92400e"/><rect x="72" y="48" width="8" height="40" fill="#92400e"/>' },
      { word: 'KITOB', hint: 'Oqiymiz', icon: '<rect x="20" y="25" width="60" height="50" fill="#3b82f6"/><rect x="48" y="25" width="4" height="50" fill="#1e293b"/><path d="M25 30 L45 30 M25 40 L45 40 M25 50 L45 50" stroke="#bfdbfe" stroke-width="2"/>' },
      { word: 'KALIT', hint: 'Eshikni ochamiz', icon: '<circle cx="30" cy="35" r="15" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/><circle cx="30" cy="35" r="6" fill="none" stroke="#f59e0b" stroke-width="3"/><rect x="40" y="32" width="45" height="6" fill="#fbbf24"/><rect x="70" y="38" width="6" height="12" fill="#fbbf24"/><rect x="80" y="38" width="6" height="8" fill="#fbbf24"/>' },
      { word: 'SOAT', hint: 'Vaqtni korsatadi', icon: '<circle cx="50" cy="50" r="40" fill="#f5f5f4" stroke="#1e293b" stroke-width="3"/><line x1="50" y1="50" x2="50" y2="25" stroke="#1e293b" stroke-width="3"/><line x1="50" y1="50" x2="70" y2="50" stroke="#1e293b" stroke-width="2"/><circle cx="50" cy="50" r="4" fill="#ef4444"/>' }
    ],
    colors: [
      { word: 'QIZIL', hint: 'Olma rangi', icon: '<circle cx="50" cy="50" r="40" fill="#ef4444"/>' },
      { word: 'KOK', hint: 'Osmon rangi', icon: '<circle cx="50" cy="50" r="40" fill="#3b82f6"/>' },
      { word: 'YASHIL', hint: 'Ot rangi', icon: '<circle cx="50" cy="50" r="40" fill="#22c55e"/>' },
      { word: 'SARIQ', hint: 'Quyosh rangi', icon: '<circle cx="50" cy="50" r="40" fill="#eab308"/>' },
      { word: 'OQ', hint: 'Qor rangi', icon: '<circle cx="50" cy="50" r="40" fill="#f5f5f4" stroke="#e5e7eb" stroke-width="2"/>' }
    ]
  },
  en: {
    animals: [
      { word: 'DOG', hint: 'Barks', icon: '<circle cx="50" cy="50" r="35" fill="#d4a574"/><circle cx="35" cy="40" r="6" fill="#1e293b"/><circle cx="65" cy="40" r="6" fill="#1e293b"/><ellipse cx="50" cy="55" rx="12" ry="8" fill="#1e293b"/>' },
      { word: 'CAT', hint: 'Meows', icon: '<circle cx="50" cy="50" r="35" fill="#fbbf24"/><circle cx="35" cy="45" r="6" fill="#1e293b"/><circle cx="65" cy="45" r="6" fill="#1e293b"/><path d="M40 58 Q50 68 60 58" stroke="#1e293b" stroke-width="3" fill="none"/>' },
      { word: 'LION', hint: 'King of animals', icon: '<circle cx="50" cy="50" r="25" fill="#fbbf24"/><circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" stroke-width="10"/><circle cx="40" cy="45" r="4" fill="#1e293b"/><circle cx="60" cy="45" r="4" fill="#1e293b"/>' },
      { word: 'RABBIT', hint: 'Long ears', icon: '<circle cx="50" cy="55" r="30" fill="#f5f5f4"/><ellipse cx="35" cy="20" rx="8" ry="22" fill="#fecaca"/><ellipse cx="65" cy="20" rx="8" ry="22" fill="#fecaca"/>' },
      { word: 'HORSE', hint: 'We ride it', icon: '<ellipse cx="50" cy="55" rx="30" ry="25" fill="#92400e"/><ellipse cx="50" cy="30" rx="15" ry="20" fill="#92400e"/>' },
      { word: 'FOX', hint: 'Clever animal', icon: '<circle cx="50" cy="50" r="35" fill="#f97316"/><circle cx="35" cy="40" r="5" fill="#1e293b"/><circle cx="65" cy="40" r="5" fill="#1e293b"/><path d="M20 25 L35 45" stroke="#f97316" stroke-width="8"/><path d="M80 25 L65 45" stroke="#f97316" stroke-width="8"/>' }
    ],
    fruits: [
      { word: 'APPLE', hint: 'Red fruit', icon: '<circle cx="50" cy="55" r="35" fill="#ef4444"/><path d="M50 20 Q55 10 60 15" stroke="#22c55e" stroke-width="3" fill="none"/>' },
      { word: 'BANANA', hint: 'Yellow, curved', icon: '<path d="M20 70 Q30 20 70 30 Q90 35 85 50 Q75 30 35 40 Q15 50 20 70" fill="#fbbf24"/>' },
      { word: 'GRAPE', hint: 'Small, round', icon: '<circle cx="40" cy="45" r="12" fill="#8b5cf6"/><circle cx="60" cy="45" r="12" fill="#8b5cf6"/><circle cx="50" cy="60" r="12" fill="#8b5cf6"/>' },
      { word: 'ORANGE', hint: 'Orange color', icon: '<circle cx="50" cy="55" r="35" fill="#f97316"/><ellipse cx="50" cy="20" rx="6" ry="4" fill="#22c55e"/>' }
    ],
    nature: [
      { word: 'SUN', hint: 'Gives light', icon: '<circle cx="50" cy="50" r="25" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="4"><line x1="50" y1="10" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="90"/><line x1="10" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="90" y2="50"/></g>' },
      { word: 'MOON', hint: 'Seen at night', icon: '<path d="M60 15 A35 35 0 1 0 60 85 A28 28 0 1 1 60 15" fill="#fef3c7"/>' },
      { word: 'STAR', hint: 'Shines in sky', icon: '<path d="M50 5 L61 40 L98 40 L68 62 L79 97 L50 75 L21 97 L32 62 L2 40 L39 40 Z" fill="#fbbf24"/>' },
      { word: 'TREE', hint: 'Tall, green', icon: '<rect x="42" y="60" width="16" height="35" fill="#92400e"/><path d="M50 5 L80 60 L20 60 Z" fill="#22c55e"/>' },
      { word: 'FLOWER', hint: 'Beautiful', icon: '<circle cx="50" cy="50" r="12" fill="#fbbf24"/><circle cx="50" cy="25" r="15" fill="#ec4899"/><circle cx="50" cy="75" r="15" fill="#ec4899"/><circle cx="25" cy="50" r="15" fill="#ec4899"/><circle cx="75" cy="50" r="15" fill="#ec4899"/>' }
    ],
    home: [
      { word: 'HOME', hint: 'Where we live', icon: '<rect x="25" y="50" width="50" height="40" fill="#fbbf24"/><path d="M15 55 L50 20 L85 55" fill="#ef4444"/><rect x="40" y="65" width="20" height="25" fill="#92400e"/>' },
      { word: 'TABLE', hint: 'We eat on it', icon: '<rect x="15" y="40" width="70" height="8" fill="#92400e"/><rect x="20" y="48" width="8" height="40" fill="#92400e"/><rect x="72" y="48" width="8" height="40" fill="#92400e"/>' },
      { word: 'BOOK', hint: 'We read it', icon: '<rect x="20" y="25" width="60" height="50" fill="#3b82f6"/><rect x="48" y="25" width="4" height="50" fill="#1e293b"/>' },
      { word: 'CLOCK', hint: 'Shows time', icon: '<circle cx="50" cy="50" r="40" fill="#f5f5f4" stroke="#1e293b" stroke-width="3"/><line x1="50" y1="50" x2="50" y2="25" stroke="#1e293b" stroke-width="3"/><line x1="50" y1="50" x2="70" y2="50" stroke="#1e293b" stroke-width="2"/>' }
    ],
    colors: [
      { word: 'RED', hint: 'Apple color', icon: '<circle cx="50" cy="50" r="40" fill="#ef4444"/>' },
      { word: 'BLUE', hint: 'Sky color', icon: '<circle cx="50" cy="50" r="40" fill="#3b82f6"/>' },
      { word: 'GREEN', hint: 'Grass color', icon: '<circle cx="50" cy="50" r="40" fill="#22c55e"/>' },
      { word: 'WHITE', hint: 'Snow color', icon: '<circle cx="50" cy="50" r="40" fill="#f5f5f4" stroke="#e5e7eb" stroke-width="2"/>' }
    ]
  },
  ru: {
    animals: [
      { word: 'КОТ', hint: 'Мяукает', icon: '<circle cx="50" cy="50" r="35" fill="#fbbf24"/><circle cx="35" cy="45" r="6" fill="#1e293b"/><circle cx="65" cy="45" r="6" fill="#1e293b"/>' },
      { word: 'ПЁС', hint: 'Лает', icon: '<circle cx="50" cy="50" r="35" fill="#d4a574"/><circle cx="35" cy="40" r="6" fill="#1e293b"/><circle cx="65" cy="40" r="6" fill="#1e293b"/>' },
      { word: 'СЛОН', hint: 'Самый большой', icon: '<circle cx="50" cy="50" r="35" fill="#9ca3af"/><path d="M50 50 Q45 70 50 85" stroke="#6b7280" stroke-width="8" fill="none"/>' },
      { word: 'ЗАЯЦ', hint: 'Длинные уши', icon: '<circle cx="50" cy="55" r="30" fill="#f5f5f4"/><ellipse cx="35" cy="20" rx="8" ry="22" fill="#fecaca"/><ellipse cx="65" cy="20" rx="8" ry="22" fill="#fecaca"/>' },
      { word: 'ЛИСА', hint: 'Хитрая', icon: '<circle cx="50" cy="50" r="35" fill="#f97316"/><circle cx="35" cy="40" r="5" fill="#1e293b"/><circle cx="65" cy="40" r="5" fill="#1e293b"/>' }
    ],
    fruits: [
      { word: 'ЯБЛОКО', hint: 'Красный фрукт', icon: '<circle cx="50" cy="55" r="35" fill="#ef4444"/>' },
      { word: 'БАНАН', hint: 'Жёлтый', icon: '<path d="M20 70 Q30 20 70 30 Q90 35 85 50 Q75 30 35 40 Q15 50 20 70" fill="#fbbf24"/>' },
      { word: 'ГРУША', hint: 'Зелёная', icon: '<ellipse cx="50" cy="60" rx="25" ry="30" fill="#84cc16"/><ellipse cx="50" cy="35" rx="15" ry="18" fill="#84cc16"/>' }
    ],
    nature: [
      { word: 'СОЛНЦЕ', hint: 'Даёт свет', icon: '<circle cx="50" cy="50" r="25" fill="#fbbf24"/>' },
      { word: 'ЛУНА', hint: 'Видна ночью', icon: '<path d="M60 15 A35 35 0 1 0 60 85 A28 28 0 1 1 60 15" fill="#fef3c7"/>' },
      { word: 'ДЕРЕВО', hint: 'Высокое', icon: '<rect x="42" y="60" width="16" height="35" fill="#92400e"/><path d="M50 5 L80 60 L20 60 Z" fill="#22c55e"/>' }
    ],
    home: [
      { word: 'ДОМ', hint: 'Где живём', icon: '<rect x="25" y="50" width="50" height="40" fill="#fbbf24"/><path d="M15 55 L50 20 L85 55" fill="#ef4444"/>' },
      { word: 'СТОЛ', hint: 'Едим за ним', icon: '<rect x="15" y="40" width="70" height="8" fill="#92400e"/>' },
      { word: 'КНИГА', hint: 'Читаем', icon: '<rect x="20" y="25" width="60" height="50" fill="#3b82f6"/>' }
    ],
    colors: [
      { word: 'КРАСНЫЙ', hint: 'Цвет яблока', icon: '<circle cx="50" cy="50" r="40" fill="#ef4444"/>' },
      { word: 'СИНИЙ', hint: 'Цвет неба', icon: '<circle cx="50" cy="50" r="40" fill="#3b82f6"/>' },
      { word: 'БЕЛЫЙ', hint: 'Цвет снега', icon: '<circle cx="50" cy="50" r="40" fill="#f5f5f4" stroke="#e5e7eb" stroke-width="2"/>' }
    ]
  }
}


const CATEGORIES = {
  animals: { icon: '<circle cx="50" cy="50" r="35" fill="#fbbf24"/><circle cx="35" cy="45" r="6" fill="#1e293b"/><circle cx="65" cy="45" r="6" fill="#1e293b"/><path d="M40 58 Q50 68 60 58" stroke="#1e293b" stroke-width="3" fill="none"/>', color: '#f59e0b' },
  fruits: { icon: '<circle cx="50" cy="55" r="35" fill="#ef4444"/><path d="M50 20 Q55 10 60 15" stroke="#22c55e" stroke-width="3" fill="none"/>', color: '#ef4444' },
  nature: { icon: '<circle cx="50" cy="50" r="25" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="4"><line x1="50" y1="10" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="90"/><line x1="10" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="90" y2="50"/></g>', color: '#ec4899' },
  home: { icon: '<rect x="25" y="50" width="50" height="40" fill="#fbbf24"/><path d="M15 55 L50 20 L85 55" fill="#ef4444"/><rect x="40" y="65" width="20" height="25" fill="#92400e"/>', color: '#3b82f6' },
  colors: { icon: '<circle cx="30" cy="50" r="20" fill="#ef4444"/><circle cx="50" cy="50" r="20" fill="#22c55e"/><circle cx="70" cy="50" r="20" fill="#3b82f6"/>', color: '#22c55e' }
}

const DIFFICULTY = {
  easy: { words: 5, hints: 3, extraLetters: 1, time: null },
  medium: { words: 6, hints: 2, extraLetters: 2, time: 60 },
  hard: { words: 8, hints: 1, extraLetters: 3, time: 45 }
}

// Sound effects
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    if (type === 'click') {
      osc.frequency.value = 500
      gain.gain.value = 0.04
      osc.start()
      setTimeout(() => { osc.stop(); ctx.close() }, 60)
    } else if (type === 'correct') {
      const notes = [523, 659, 784]
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.connect(g)
          g.connect(ctx.destination)
          o.frequency.value = freq
          g.gain.value = 0.06
          o.start()
          setTimeout(() => o.stop(), 120)
        }, i * 100)
      })
      setTimeout(() => ctx.close(), 500)
    } else if (type === 'wrong') {
      osc.frequency.value = 250
      gain.gain.value = 0.04
      osc.start()
      setTimeout(() => { osc.stop(); ctx.close() }, 200)
    } else if (type === 'win') {
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.connect(g)
          g.connect(ctx.destination)
          o.frequency.value = freq
          g.gain.value = 0.06
          o.start()
          setTimeout(() => o.stop(), 150)
        }, i * 150)
      })
      setTimeout(() => ctx.close(), 800)
    }
  } catch (e) {}
}

export default function WordBuilder({ onBack, onComplete }) {
  const { language } = useLanguage()
  const { addXP, awardBadge, trackGameComplete } = useGamification()
  const t = translations[language] || translations.uz
  
  const [gameState, setGameState] = useState('category')
  const [category, setCategory] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedLetters, setSelectedLetters] = useState([])
  const [availableLetters, setAvailableLetters] = useState([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [hintsLeft, setHintsLeft] = useState(3)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [perfectGame, setPerfectGame] = useState(true)

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft === null) return
    if (timeLeft <= 0) {
      handleTimeout()
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, gameState])

  const handleTimeout = () => {
    setFeedback('timeout')
    setStreak(0)
    setPerfectGame(false)
    setTimeout(() => {
      setFeedback(null)
      nextWord()
    }, 1000)
  }

  const initGame = useCallback(() => {
    const config = DIFFICULTY[difficulty]
    const langWords = WORDS[language]?.[category] || WORDS.uz[category] || []
    const shuffled = [...langWords].sort(() => Math.random() - 0.5).slice(0, config.words)
    
    setWords(shuffled)
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setHintsLeft(config.hints)
    setPerfectGame(true)
    setTimeLeft(config.time)
    setGameState('playing')
  }, [category, difficulty, language])

  useEffect(() => {
    if (category && difficulty) {
      initGame()
    }
  }, [category, difficulty])

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length && gameState === 'playing') {
      setupWord()
    }
  }, [currentIndex, words, gameState])

  const setupWord = () => {
    const word = words[currentIndex].word
    const config = DIFFICULTY[difficulty]
    
    const alphabet = language === 'ru' 
      ? 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    const extraLetters = alphabet.split('')
      .filter(l => !word.includes(l))
      .sort(() => Math.random() - 0.5)
      .slice(0, config.extraLetters)
    
    const allLetters = [...word.split(''), ...extraLetters]
      .sort(() => Math.random() - 0.5)
      .map((letter, i) => ({ id: i, letter, used: false }))
    
    setAvailableLetters(allLetters)
    setSelectedLetters([])
    setShowHint(false)
    
    if (config.time) {
      setTimeLeft(config.time)
    }
  }

  const selectLetter = (letterObj) => {
    if (letterObj.used) return
    if (selectedLetters.length >= words[currentIndex].word.length) return
    
    playSound('click')
    setAvailableLetters(prev => 
      prev.map(l => l.id === letterObj.id ? { ...l, used: true } : l)
    )
    setSelectedLetters(prev => [...prev, letterObj])
  }

  const removeLetter = (index) => {
    const letterObj = selectedLetters[index]
    playSound('click')
    setAvailableLetters(prev =>
      prev.map(l => l.id === letterObj.id ? { ...l, used: false } : l)
    )
    setSelectedLetters(prev => prev.filter((_, i) => i !== index))
  }

  const shuffleLetters = () => {
    playSound('click')
    setAvailableLetters(prev => [...prev].sort(() => Math.random() - 0.5))
  }

  const clearLetters = () => {
    playSound('click')
    setAvailableLetters(prev => prev.map(l => ({ ...l, used: false })))
    setSelectedLetters([])
  }

  const useHint = () => {
    if (hintsLeft <= 0) return
    
    const word = words[currentIndex].word
    const nextIndex = selectedLetters.length
    
    if (nextIndex < word.length) {
      const correctLetter = word[nextIndex]
      const letterObj = availableLetters.find(l => l.letter === correctLetter && !l.used)
      
      if (letterObj) {
        selectLetter(letterObj)
        setHintsLeft(h => h - 1)
        setShowHint(true)
      }
    }
  }

  const checkWord = () => {
    const builtWord = selectedLetters.map(l => l.letter).join('')
    const correctWord = words[currentIndex].word
    
    if (builtWord === correctWord) {
      playSound('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > maxStreak) setMaxStreak(newStreak)
      
      let points = correctWord.length * 20
      if (newStreak >= 2) points += newStreak * 15
      if (timeLeft && timeLeft > 30) points += 25
      setScore(s => s + points)
      
      setFeedback('correct')
      setTimeout(() => {
        setFeedback(null)
        nextWord()
      }, 1000)
    } else {
      playSound('wrong')
      setFeedback('wrong')
      setStreak(0)
      setPerfectGame(false)
      setTimeout(() => setFeedback(null), 800)
    }
  }

  const nextWord = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex(i => i + 1)
    } else {
      endGame()
    }
  }

  const skipWord = () => {
    setStreak(0)
    setPerfectGame(false)
    nextWord()
  }

  const endGame = () => {
    playSound('win')
    setGameState('won')
    
    const config = DIFFICULTY[difficulty]
    let finalScore = score
    if (perfectGame) finalScore += 200
    if (maxStreak >= 3) finalScore += maxStreak * 30
    
    const diffMultiplier = difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1
    const xp = Math.round(finalScore * diffMultiplier / 10)
    
    addXP(xp, 'Word Builder')
    trackGameComplete('wordbuilder', finalScore, config.words * 100)
    
    if (perfectGame && difficulty === 'hard') {
      awardBadge('word_master')
    }
    
    if (onComplete) onComplete(finalScore, config.words * 100)
  }

  const resetGame = () => {
    setCategory(null)
    setDifficulty(null)
    setGameState('category')
  }


  // Category Selection
  if (gameState === 'category') {
    return (
      <div className="word-builder">
        <div className="night-sky-bg"><div className="stars-layer"></div></div>
        
        <div className="game-header">
          <button className="back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {t.back}
          </button>
          <h1>{t.title}</h1>
          <div />
        </div>
        
        <p className="game-subtitle">{t.selectCategory}</p>
        
        <div className="category-grid">
          {Object.entries(CATEGORIES).map(([key, data], i) => (
            <motion.div
              key={key}
              className="category-card"
              style={{ '--cat-color': data.color }}
              onClick={() => { setCategory(key); setGameState('difficulty') }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="cat-icon">
                <svg viewBox="0 0 100 100" width="50" height="50" dangerouslySetInnerHTML={{ __html: data.icon }} />
              </div>
              <span className="cat-name">{t.categories[key]}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Difficulty Selection
  if (gameState === 'difficulty') {
    return (
      <div className="word-builder">
        <div className="night-sky-bg"><div className="stars-layer"></div></div>
        
        <div className="game-header">
          <button className="back-btn" onClick={() => setGameState('category')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {t.back}
          </button>
          <h1>{t.categories[category]}</h1>
          <div />
        </div>
        
        <p className="game-subtitle">{t.selectDifficulty}</p>
        
        <div className="difficulty-grid">
          {Object.entries(DIFFICULTY).map(([key, config], i) => (
            <motion.div
              key={key}
              className={`difficulty-card ${key}`}
              onClick={() => setDifficulty(key)}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="diff-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={key === 'easy' ? '#22c55e' : key === 'medium' ? '#f59e0b' : '#ef4444'} strokeWidth="2">
                  {key === 'easy' && <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>}
                  {key === 'medium' && <><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>}
                  {key === 'hard' && <><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>}
                </svg>
              </div>
              <h3>{t[key]}</h3>
              <div className="diff-info">
                <span>{config.words} {t.words}</span>
                <span>💡 {config.hints}</span>
                {config.time && <span>⏱️ {config.time}s</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Win Screen
  if (gameState === 'won') {
    const config = DIFFICULTY[difficulty]
    const stars = Math.min(5, Math.ceil((score / (config.words * 100)) * 5))
    
    return (
      <div className="word-builder game-over">
        <div className="night-sky-bg"><div className="stars-layer"></div></div>
        
        <motion.div 
          className="win-modal"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <div className="win-trophy">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={perfectGame ? '#fbbf24' : '#f59e0b'} strokeWidth="1.5">
              <path d="M8 21h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C21 14.72 21 13.88 21 12.2V6.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C18.72 2 17.88 2 16.2 2H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C3 4.28 3 5.12 3 6.8v5.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C5.28 17 6.12 17 7.8 17z"/>
            </svg>
          </div>
          <h2>{perfectGame ? t.perfect : t.completed}</h2>
          
          <div className="win-stats">
            <div className="stat-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
              <span className="stat-value">{maxStreak}</span>
              <span className="stat-label">{t.streak}</span>
            </div>
            <div className="stat-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span className="stat-value">{Math.round((score / (config.words * 100)) * 100)}%</span>
              <span className="stat-label">{t.correct}</span>
            </div>
          </div>
          
          <div className="win-score">{score} {t.score}</div>
          
          <div className="win-stars">
            {[...Array(5)].map((_, i) => (
              <motion.svg
                key={i}
                width="32" height="32" viewBox="0 0 24 24"
                fill={i < stars ? '#fbbf24' : 'none'}
                stroke="#fbbf24" strokeWidth="2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </motion.svg>
            ))}
          </div>
          
          <div className="win-buttons">
            <motion.button className="btn-primary" onClick={initGame} whileHover={{ scale: 1.05 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              {t.tryAgain}
            </motion.button>
            <motion.button className="btn-secondary" onClick={resetGame} whileHover={{ scale: 1.05 }}>
              {t.back}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }


  // Game Screen
  if (words.length === 0) return null
  const currentWord = words[currentIndex]
  const config = DIFFICULTY[difficulty]

  return (
    <div className="word-builder playing">
      <div className="night-sky-bg"><div className="stars-layer"></div></div>
      
      <div className="game-header">
        <button className="back-btn" onClick={resetGame}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.back}
        </button>
        <h1>{t.title}</h1>
        <div className="game-stats">
          {timeLeft !== null && (
            <span className={`stat time ${timeLeft <= 10 ? 'warning' : ''}`}>⏱️ {timeLeft}s</span>
          )}
          <span className="stat">{score}</span>
          {streak >= 2 && <span className="stat streak">{streak}x</span>}
        </div>
      </div>

      <div className="progress-bar">
        <motion.div 
          className="progress-fill"
          animate={{ width: `${((currentIndex) / words.length) * 100}%` }}
          style={{ background: CATEGORIES[category]?.color || '#8b5cf6' }}
        />
      </div>

      <div className="progress-dots">
        {words.map((_, i) => (
          <span key={i} className={`dot ${i === currentIndex ? 'active' : i < currentIndex ? 'done' : ''}`} />
        ))}
      </div>

      <div className="word-area">
        <motion.div 
          className="word-image"
          key={currentIndex}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          <svg viewBox="0 0 100 100" width="100" height="100" dangerouslySetInnerHTML={{ __html: currentWord.icon }} />
        </motion.div>
        
        <p className="build-text">{t.buildWord}</p>

        <div className="selected-area">
          {currentWord.word.split('').map((_, i) => (
            <motion.div 
              key={i} 
              className={`letter-slot ${selectedLetters[i] ? 'filled' : ''}`}
              onClick={() => selectedLetters[i] && removeLetter(i)}
              whileHover={{ scale: selectedLetters[i] ? 1.1 : 1 }}
              whileTap={{ scale: 0.95 }}
            >
              {selectedLetters[i]?.letter || ''}
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showHint && (
            <motion.div
              className="hint-box"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              💡 {currentWord.hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="letters-area">
        {availableLetters.map((letterObj, i) => (
          <motion.button
            key={letterObj.id}
            className={`letter-btn ${letterObj.used ? 'used' : ''}`}
            onClick={() => selectLetter(letterObj)}
            disabled={letterObj.used}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: letterObj.used ? 1 : 1.15, y: letterObj.used ? 0 : -5 }}
            whileTap={{ scale: 0.9 }}
          >
            {letterObj.letter}
          </motion.button>
        ))}
      </div>

      <div className="action-buttons">
        <motion.button className="action-btn" onClick={shuffleLetters} whileTap={{ scale: 0.9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
            <line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
          {t.shuffle}
        </motion.button>
        <motion.button className="action-btn" onClick={clearLetters} whileTap={{ scale: 0.9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          {t.clear}
        </motion.button>
        <motion.button 
          className="action-btn hint" 
          onClick={useHint} 
          disabled={hintsLeft <= 0}
          whileTap={{ scale: 0.9 }}
        >
          💡 {hintsLeft > 0 ? `${t.hint} (${hintsLeft})` : t.noHints}
        </motion.button>
        <motion.button 
          className="action-btn check"
          onClick={checkWord}
          disabled={selectedLetters.length !== currentWord.word.length}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {t.check}
        </motion.button>
        <motion.button className="action-btn skip" onClick={skipWord} whileTap={{ scale: 0.9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
          {t.skip}
        </motion.button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`feedback-popup ${feedback}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {feedback === 'correct' ? t.correct : feedback === 'timeout' ? '⏱️' : t.wrong}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}