import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useGamification } from '../../context/GamificationContext'
import './Library.css'

const translations = {
  uz: {
    title: "Ertaklar Dunyosi",
    subtitle: "Qiziqarli multfilm ertaklar!",
    back: "Orqaga",
    watch: "Ko'rish",
    duration: "daqiqa",
    completed: "Ko'rildi!",
    progress: "Jarayon",
    play: "Boshlash",
    pause: "To'xtatish",
    fullscreen: "To'liq ekran",
    moral: "Saboq",
    characters: "Qahramonlar",
    newBadge: "Yangi"
  },
  ru: {
    title: "Мир Сказок",
    subtitle: "Интересные мультфильмы!",
    back: "Назад",
    watch: "Смотреть",
    duration: "минут",
    completed: "Просмотрено!",
    progress: "Прогресс",
    play: "Играть",
    pause: "Пауза",
    fullscreen: "Полный экран",
    moral: "Мораль",
    characters: "Герои",
    newBadge: "Новое"
  },
  en: {
    title: "World of Tales",
    subtitle: "Exciting cartoon stories!",
    back: "Back",
    watch: "Watch",
    duration: "minutes",
    completed: "Watched!",
    progress: "Progress",
    play: "Play",
    pause: "Pause",
    fullscreen: "Fullscreen",
    moral: "Moral",
    characters: "Characters",
    newBadge: "New"
  }
}

// 12 ta ertak videolari - YouTube embed formatida
const STORIES = [
  {
    id: 'three-bears',
    emoji: '🐻',
    color: '#8b5cf6',
    videoUrl: 'https://www.youtube.com/embed/Pk7Syl8ZGCg',
    duration: 10,
    title: {
      uz: "Uch ayiq va Oltinsoch",
      ru: "Три медведя и Златовласка",
      en: "Three Bears and Goldilocks"
    },
    description: {
      uz: "Oltinsoch uch ayiqning uyiga kirib qoladi va qiziqarli sarguzashtlar boshlanadi.",
      ru: "Златовласка попадает в дом трёх медведей и начинаются интересные приключения.",
      en: "Goldilocks enters the house of three bears and exciting adventures begin."
    },
    characters: ['🐻', '🐻', '🧸', '👧'],
    moral: {
      uz: "Begona uylarga ruxsatsiz kirmaslik kerak!",
      ru: "Нельзя заходить в чужие дома без разрешения!",
      en: "Never enter strangers' houses without permission!"
    }
  },
  {
    id: 'red-riding-hood',
    emoji: '🧒',
    color: '#ef4444',
    videoUrl: 'https://www.youtube.com/embed/JiaJkvZoY-Y',
    duration: 8,
    title: {
      uz: "Qizil qalpoqcha",
      ru: "Красная Шапочка",
      en: "Little Red Riding Hood"
    },
    description: {
      uz: "Qizil qalpoqcha buvinikiga pirojki olib boradi va yo'lda bo'ri bilan uchrashadi.",
      ru: "Красная Шапочка несёт пирожки бабушке и встречает волка по дороге.",
      en: "Little Red Riding Hood takes cakes to grandma and meets a wolf on the way."
    },
    characters: ['👧', '🐺', '👵', '🪓'],
    moral: {
      uz: "Notanish odamlar bilan gaplashmaslik kerak!",
      ru: "Нельзя разговаривать с незнакомцами!",
      en: "Don't talk to strangers!"
    }
  },
  {
    id: 'ugly-duckling',
    emoji: '🦢',
    color: '#06b6d4',
    videoUrl: 'https://www.youtube.com/embed/7L304-Crf1A',
    duration: 9,
    title: {
      uz: "Irkit o'rdakcha",
      ru: "Гадкий утёнок",
      en: "The Ugly Duckling"
    },
    description: {
      uz: "Boshqalardan farq qiluvchi o'rdakcha oxirida chiroyli oqqushga aylanadi.",
      ru: "Утёнок, отличающийся от других, в конце превращается в прекрасного лебедя.",
      en: "A duckling different from others finally becomes a beautiful swan."
    },
    characters: ['🐣', '🦆', '🦢', '🌸'],
    moral: {
      uz: "Tashqi ko'rinish muhim emas, ichki go'zallik muhim!",
      ru: "Внешность не важна, важна внутренняя красота!",
      en: "Appearance doesn't matter, inner beauty does!"
    }
  },
  {
    id: 'lion-mouse',
    emoji: '🦁',
    color: '#f59e0b',
    videoUrl: 'https://www.youtube.com/embed/K7sY4cO-dgo',
    duration: 6,
    title: {
      uz: "Sher va sichqon",
      ru: "Лев и мышь",
      en: "The Lion and the Mouse"
    },
    description: {
      uz: "Kichkina sichqon kuchli sherga qanday yordam berganini ko'ring.",
      ru: "Посмотрите, как маленькая мышка помогла могучему льву.",
      en: "See how a little mouse helped a mighty lion."
    },
    characters: ['🦁', '🐭', '🪤', '🌳'],
    moral: {
      uz: "Kichkina do'stlar ham katta yordam bera oladi!",
      ru: "Маленькие друзья тоже могут оказать большую помощь!",
      en: "Small friends can also give big help!"
    }
  },
  {
    id: 'tortoise-hare',
    emoji: '🐢',
    color: '#22c55e',
    videoUrl: 'https://www.youtube.com/embed/7Ji1_XSTFsg',
    duration: 7,
    title: {
      uz: "Toshbaqa va quyon",
      ru: "Черепаха и заяц",
      en: "The Tortoise and the Hare"
    },
    description: {
      uz: "Sekin yuruvchi toshbaqa tez yuguradigan quyonni qanday yengganini ko'ring.",
      ru: "Посмотрите, как медленная черепаха победила быстрого зайца.",
      en: "See how the slow tortoise beat the fast hare."
    },
    characters: ['🐢', '🐰', '🏁', '🌲'],
    moral: {
      uz: "Sekin-asta, lekin izchil harakat g'alabaga olib keladi!",
      ru: "Медленно, но верно - путь к победе!",
      en: "Slow and steady wins the race!"
    }
  },
  {
    id: 'cinderella',
    emoji: '👸',
    color: '#ec4899',
    videoUrl: 'https://www.youtube.com/embed/3wTZwqFczso',
    duration: 12,
    title: {
      uz: "Zolushka",
      ru: "Золушка",
      en: "Cinderella"
    },
    description: {
      uz: "Mehribon qiz sehrgar ona yordamida shahzoda bilan uchrashadi.",
      ru: "Добрая девушка с помощью феи встречает принца.",
      en: "A kind girl meets a prince with the help of a fairy godmother."
    },
    characters: ['👸', '🧚', '👠', '🎃'],
    moral: {
      uz: "Yaxshilik har doim mukofotlanadi!",
      ru: "Доброта всегда вознаграждается!",
      en: "Kindness is always rewarded!"
    }
  },
  {
    id: 'three-pigs',
    emoji: '🐷',
    color: '#f97316',
    videoUrl: 'https://www.youtube.com/embed/QGlHQhj4GS0',
    duration: 8,
    title: {
      uz: "Uchta cho'chqacha",
      ru: "Три поросёнка",
      en: "Three Little Pigs"
    },
    description: {
      uz: "Uchta cho'chqacha o'z uylarini quradi va bo'ridan himoyalanadi.",
      ru: "Три поросёнка строят свои дома и защищаются от волка.",
      en: "Three little pigs build their houses and protect themselves from the wolf."
    },
    characters: ['🐷', '🐷', '🐷', '🐺'],
    moral: {
      uz: "Ishni puxta qilish kerak!",
      ru: "Нужно делать работу качественно!",
      en: "Do your work properly!"
    }
  },
  {
    id: 'kolobok',
    emoji: '🥯',
    color: '#fbbf24',
    videoUrl: 'https://www.youtube.com/embed/oIwg4VLmrfw',
    duration: 7,
    title: {
      uz: "Bo'g'irsoq",
      ru: "Колобок",
      en: "The Gingerbread Man"
    },
    description: {
      uz: "Bo'g'irsoq uydan qochib ketadi va turli hayvonlar bilan uchrashadi.",
      ru: "Колобок убегает из дома и встречает разных животных.",
      en: "The Gingerbread Man runs away from home and meets various animals."
    },
    characters: ['🥯', '🐰', '🐺', '🦊'],
    moral: {
      uz: "Ota-onangizni tinglang!",
      ru: "Слушайте своих родителей!",
      en: "Listen to your parents!"
    }
  },
  {
    id: 'turnip',
    emoji: '🥕',
    color: '#84cc16',
    videoUrl: 'https://www.youtube.com/embed/TZ4V080ngoo',
    duration: 6,
    title: {
      uz: "Sholg'om ertagi",
      ru: "Репка",
      en: "The Giant Turnip"
    },
    description: {
      uz: "Katta sholg'omni surib olish uchun butun oila birlashadi.",
      ru: "Вся семья объединяется, чтобы вытащить большую репку.",
      en: "The whole family unites to pull out a giant turnip."
    },
    characters: ['👴', '👵', '👧', '🐕'],
    moral: {
      uz: "Birgalikda kuch bor!",
      ru: "В единстве - сила!",
      en: "Unity is strength!"
    }
  },
  {
    id: 'wolf-kids',
    emoji: '🐐',
    color: '#14b8a6',
    videoUrl: 'https://www.youtube.com/embed/pUYhEcDCll0',
    duration: 9,
    title: {
      uz: "Echki va yetti uloq",
      ru: "Волк и семеро козлят",
      en: "The Wolf and Seven Kids"
    },
    description: {
      uz: "Echki onasi bolalarini bo'ridan qanday himoya qilganini ko'ring.",
      ru: "Посмотрите, как мама-коза защитила своих детей от волка.",
      en: "See how mother goat protected her kids from the wolf."
    },
    characters: ['🐐', '🐐', '🐐', '🐺'],
    moral: {
      uz: "Eshikni notanish odamlarga ochmang!",
      ru: "Не открывайте дверь незнакомцам!",
      en: "Don't open the door to strangers!"
    }
  },
  {
    id: 'zumrad-qimmat',
    emoji: '💎',
    color: '#6366f1',
    videoUrl: 'https://www.youtube.com/embed/TY0Zxw6ep9Q',
    duration: 11,
    title: {
      uz: "Zumrad va Qimmat",
      ru: "Зумрад и Киммат",
      en: "Zumrad and Kimmat"
    },
    description: {
      uz: "Ikki opa-singil haqidagi o'zbek xalq ertagi.",
      ru: "Узбекская народная сказка о двух сёстрах.",
      en: "Uzbek folk tale about two sisters."
    },
    characters: ['👧', '👧', '👵', '💎'],
    moral: {
      uz: "Mehnatsevarlik va kamtarlik mukofotlanadi!",
      ru: "Трудолюбие и скромность вознаграждаются!",
      en: "Hard work and humility are rewarded!"
    }
  },
  {
    id: 'shepherd-boy',
    emoji: '🐑',
    color: '#a855f7',
    videoUrl: 'https://www.youtube.com/embed/3kx5kcq6WF8',
    duration: 5,
    title: {
      uz: "Yolg'onchi cho'pon",
      ru: "Мальчик-пастух и волк",
      en: "The Boy Who Cried Wolf"
    },
    description: {
      uz: "Yolg'on gapirgan cho'pon bola haqidagi ibratli ertak.",
      ru: "Поучительная сказка о мальчике-пастухе, который лгал.",
      en: "A moral tale about a shepherd boy who lied."
    },
    characters: ['👦', '🐑', '🐺', '👨‍🌾'],
    moral: {
      uz: "Yolg'on gapirmaslik kerak!",
      ru: "Нельзя лгать!",
      en: "Never tell lies!"
    }
  }
]


// Story Card Component
function StoryCard({ story, lang, t, onClick, isWatched }) {
  return (
    <motion.div
      className="story-card"
      style={{ '--card-color': story.color }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {isWatched && <div className="watched-badge">✓</div>}
      <div className="story-thumbnail">
        <div className="thumbnail-emoji-bg" style={{ background: `linear-gradient(135deg, ${story.color}40 0%, ${story.color}20 100%)` }}>
          <span className="thumbnail-emoji">{story.emoji}</span>
        </div>
        <div className="play-overlay">
          <span className="play-icon">▶</span>
        </div>
        <div className="duration-badge">
          {story.duration} {t.duration}
        </div>
      </div>
      <div className="story-info">
        <div className="story-emoji-title">
          <h3>{story.title[lang]}</h3>
        </div>
        <p className="story-description">{story.description[lang]}</p>
        <div className="story-characters">
          {story.characters.map((c, i) => (
            <span key={i} className="char-emoji">{c}</span>
          ))}
        </div>
      </div>
      <button className="watch-btn" style={{ background: story.color }}>
        ▶ {t.watch}
      </button>
    </motion.div>
  )
}

// Video Player Component
function VideoPlayer({ story, lang, t, onClose, onComplete }) {
  const { addXP } = useGamification()
  const [hasWatched, setHasWatched] = useState(false)

  const handleWatched = () => {
    if (!hasWatched) {
      setHasWatched(true)
      addXP(50, `Watched: ${story.title[lang]}`)
      if (onComplete) onComplete(story.id)
    }
  }

  // Mark as watched after 30 seconds
  useEffect(() => {
    const timer = setTimeout(handleWatched, 30000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      className="video-player-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="video-player" style={{ '--story-color': story.color }}>
        {/* Header */}
        <div className="player-header" style={{ background: story.color }}>
          <button className="close-btn" onClick={onClose}>✕</button>
          <h2>{story.emoji} {story.title[lang]}</h2>
          <div className="header-spacer" />
        </div>

        {/* Video Container - YouTube Embed */}
        <div className="video-container">
          <iframe
            src={`${story.videoUrl}?autoplay=1&rel=0&modestbranding=1`}
            title={story.title[lang]}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="youtube-player"
          />
        </div>

        {/* Story Info */}
        <div className="story-details">
          <div className="moral-box">
            <span className="moral-icon">💡</span>
            <div>
              <h4>{t.moral}</h4>
              <p>{story.moral[lang]}</p>
            </div>
          </div>
          
          <div className="characters-box">
            <h4>{t.characters}</h4>
            <div className="characters-row">
              {story.characters.map((c, i) => (
                <motion.span 
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {c}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Main Library Component
export default function Library({ onBack }) {
  const { language } = useLanguage()
  const t = translations[language] || translations.uz
  const [selectedStory, setSelectedStory] = useState(null)
  const [watchedStories, setWatchedStories] = useState(() => {
    const saved = localStorage.getItem('watched_stories')
    return saved ? JSON.parse(saved) : []
  })

  const handleStoryComplete = (storyId) => {
    if (!watchedStories.includes(storyId)) {
      const updated = [...watchedStories, storyId]
      setWatchedStories(updated)
      localStorage.setItem('watched_stories', JSON.stringify(updated))
    }
  }

  return (
    <div className="library">
      <AnimatePresence mode="wait">
        {selectedStory ? (
          <VideoPlayer
            key="player"
            story={selectedStory}
            lang={language}
            t={t}
            onClose={() => setSelectedStory(null)}
            onComplete={handleStoryComplete}
          />
        ) : (
          <motion.div
            key="library"
            className="library-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="library-header">
              <button className="back-btn" onClick={onBack}>← {t.back}</button>
              <motion.span 
                className="header-icon"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📺
              </motion.span>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>

            {/* Progress */}
            <div className="watching-progress">
              <div className="progress-info">
                <span>{t.progress}: {watchedStories.length}/{STORIES.length}</span>
                <div className="progress-bar">
                  <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(watchedStories.length / STORIES.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stories Grid */}
            <div className="stories-grid">
              {STORIES.map((story, i) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  lang={language}
                  t={t}
                  onClick={() => setSelectedStory(story)}
                  isWatched={watchedStories.includes(story.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
