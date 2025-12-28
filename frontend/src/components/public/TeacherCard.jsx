import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { WobblyCard, LiquidCard } from '../animations'
import './TeacherCard.css'

// Orqa fon uchun emojilar
const bgEmojis = ['🎨', '📚', '🎭', '🎪', '🌟', '🎈', '🎯', '🎵']

const TeacherCard = ({ teacher, index = 0 }) => {
  const { language } = useLanguage()
  const { name, role, experience, education, photo, bio } = teacher

  // Ko'p tilli ma'lumotlarni olish
  const getLocalizedText = (field) => {
    if (typeof field === 'object' && field !== null) {
      return field[language] || field['uz'] || ''
    }
    return field || ''
  }

  return (
    <WobblyCard>
      <div className="teacher-card">
        {/* Orqa fon emojilar */}
        <div className="teacher-card-bg-emojis">
          {bgEmojis.slice(0, 4).map((emoji, i) => (
            <motion.span
              key={i}
              className={`bg-emoji bg-emoji-${i + 1}`}
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{ 
                duration: 3 + i, 
                repeat: Infinity,
                delay: i * 0.5
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
        
        <div className="teacher-photo-container">
          <motion.img 
            src={photo} 
            alt={name} 
            className="teacher-photo"
            loading="lazy"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onError={(e) => {
              e.target.src = '/images/teacher-1.jpg'
            }}
          />
        </div>
        <LiquidCard className="teacher-info">
          <h3 className="teacher-name">{name}</h3>
          <motion.p 
            className="teacher-role"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {getLocalizedText(role)}
          </motion.p>
          <div className="teacher-details">
            <motion.div 
              className="teacher-detail"
              whileHover={{ x: 5 }}
            >
              <motion.span 
                className="detail-icon"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              >
                📚
              </motion.span>
              <span className="detail-text">{getLocalizedText(education)}</span>
            </motion.div>
            <motion.div 
              className="teacher-detail"
              whileHover={{ x: 5 }}
            >
              <motion.span 
                className="detail-icon"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                ⏱️
              </motion.span>
              <span className="detail-text">{getLocalizedText(experience)}</span>
            </motion.div>
          </div>
          <motion.p 
            className="teacher-bio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {getLocalizedText(bio)}
          </motion.p>
        </LiquidCard>
      </div>
    </WobblyCard>
  )
}

export default TeacherCard
