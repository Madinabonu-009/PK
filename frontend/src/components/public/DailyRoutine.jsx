/**
 * Daily Routine Component
 * Kunlik jadval - bolalar kun davomida nima qilishadi
 */
import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './DailyRoutine.css'

const ROUTINE_DATA = {
  uz: {
    title: "Kunlik jadval",
    subtitle: "Har bir kun bolalarimiz uchun yangi sarguzasht!",
    items: [
      { time: "08:00", icon: "🌅", title: "Qabul qilish", desc: "Bolalarni iliq kutib olish va ertalabki salomlashish" },
      { time: "08:30", icon: "🏃", title: "Ertalabki mashqlar", desc: "Qiziqarli gimnastika va harakatli o'yinlar" },
      { time: "09:00", icon: "🍳", title: "Nonushta", desc: "Foydali va mazali nonushta" },
      { time: "09:30", icon: "📚", title: "O'quv mashg'ulotlari", desc: "Interaktiv darslar va ijodiy faoliyat" },
      { time: "11:00", icon: "🎨", title: "Ijodiy vaqt", desc: "Rasm chizish, qo'shiq aytish, raqs" },
      { time: "12:00", icon: "🍽️", title: "Tushlik", desc: "To'yimli va sog'lom tushlik" },
      { time: "13:00", icon: "😴", title: "Kunduzi uyqu", desc: "Dam olish va kuch to'plash" },
      { time: "15:00", icon: "🍎", title: "Poldnik", desc: "Yengil tamaddi va mevalar" },
      { time: "15:30", icon: "🎮", title: "O'yin vaqti", desc: "Erkin o'yinlar va sport mashg'ulotlari" },
      { time: "17:00", icon: "👋", title: "Uyga jo'nash", desc: "Ota-onalar bilan uchrashish" }
    ]
  },
  ru: {
    title: "Распорядок дня",
    subtitle: "Каждый день - новое приключение для наших детей!",
    items: [
      { time: "08:00", icon: "🌅", title: "Приём детей", desc: "Тёплая встреча и утреннее приветствие" },
      { time: "08:30", icon: "🏃", title: "Утренняя зарядка", desc: "Весёлая гимнастика и подвижные игры" },
      { time: "09:00", icon: "🍳", title: "Завтрак", desc: "Полезный и вкусный завтрак" },
      { time: "09:30", icon: "📚", title: "Занятия", desc: "Интерактивные уроки и творчество" },
      { time: "11:00", icon: "🎨", title: "Творческое время", desc: "Рисование, пение, танцы" },
      { time: "12:00", icon: "🍽️", title: "Обед", desc: "Сытный и здоровый обед" },
      { time: "13:00", icon: "😴", title: "Дневной сон", desc: "Отдых и восстановление сил" },
      { time: "15:00", icon: "🍎", title: "Полдник", desc: "Лёгкий перекус и фрукты" },
      { time: "15:30", icon: "🎮", title: "Игровое время", desc: "Свободные игры и спорт" },
      { time: "17:00", icon: "👋", title: "Уход домой", desc: "Встреча с родителями" }
    ]
  },
  en: {
    title: "Daily Routine",
    subtitle: "Every day is a new adventure for our children!",
    items: [
      { time: "08:00", icon: "🌅", title: "Arrival", desc: "Warm welcome and morning greeting" },
      { time: "08:30", icon: "🏃", title: "Morning Exercise", desc: "Fun gymnastics and active games" },
      { time: "09:00", icon: "🍳", title: "Breakfast", desc: "Healthy and delicious breakfast" },
      { time: "09:30", icon: "📚", title: "Learning Time", desc: "Interactive lessons and creativity" },
      { time: "11:00", icon: "🎨", title: "Creative Time", desc: "Drawing, singing, dancing" },
      { time: "12:00", icon: "🍽️", title: "Lunch", desc: "Nutritious and healthy lunch" },
      { time: "13:00", icon: "😴", title: "Nap Time", desc: "Rest and recharge" },
      { time: "15:00", icon: "🍎", title: "Snack Time", desc: "Light snack and fruits" },
      { time: "15:30", icon: "🎮", title: "Play Time", desc: "Free play and sports" },
      { time: "17:00", icon: "👋", title: "Going Home", desc: "Meeting with parents" }
    ]
  }
}

const RoutineItem = memo(function RoutineItem({ item, index, isLeft }) {
  return (
    <motion.div 
      className={`routine-item ${isLeft ? 'routine-item--left' : 'routine-item--right'}`}
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="routine-item__time">{item.time}</div>
      <div className="routine-item__dot">
        <span className="routine-item__icon">{item.icon}</span>
      </div>
      <div className="routine-item__content">
        <h4 className="routine-item__title">{item.title}</h4>
        <p className="routine-item__desc">{item.desc}</p>
      </div>
    </motion.div>
  )
})

const DailyRoutine = memo(function DailyRoutine() {
  const { language } = useLanguage()
  const data = useMemo(() => ROUTINE_DATA[language], [language])

  return (
    <section className="daily-routine">
      <div className="daily-routine__container">
        <motion.div 
          className="daily-routine__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="daily-routine__badge">⏰ {data.title}</span>
          <h2 className="daily-routine__title">{data.title}</h2>
          <p className="daily-routine__subtitle">{data.subtitle}</p>
        </motion.div>

        <div className="daily-routine__timeline">
          <div className="timeline-line" />
          {data.items.map((item, index) => (
            <RoutineItem 
              key={index} 
              item={item} 
              index={index}
              isLeft={index % 2 === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
})

export default DailyRoutine
