import { useLanguage } from '../../context/LanguageContext'
import './DailyLifePage.css'

const DailyLifePage = () => {
  const { language } = useLanguage()

  const texts = {
    uz: {
      title: "Kundalik hayot",
      subtitle: "Bog'chamizda har bir kun bolalar uchun qiziqarli va foydali mashg'ulotlar bilan to'la",
      schedule: "Kunlik jadval",
      education: "Ta'lim mashg'ulotlari",
      educationDesc: "Bolalarning yosh xususiyatlariga mos ravishda tuzilgan ta'lim dasturi",
      play: "O'yin faoliyatlari",
      playDesc: "O'yin - bolaning asosiy faoliyati. Biz turli xil o'yinlar orqali rivojlanishni ta'minlaymiz",
      activityTypes: {
        learning: "Ta'lim",
        meal: "Ovqatlanish",
        rest: "Dam olish",
        activity: "Faoliyat",
        creative: "Ijod",
        outdoor: "Ochiq havo",
        arrival: "Qabul",
        departure: "Ketish"
      }
    },
    ru: {
      title: "Ежедневная жизнь",
      subtitle: "Каждый день в нашем детском саду наполнен интересными и полезными занятиями для детей",
      schedule: "Распорядок дня",
      education: "Образовательные занятия",
      educationDesc: "Образовательная программа, составленная с учетом возрастных особенностей детей",
      play: "Игровая деятельность",
      playDesc: "Игра - основная деятельность ребенка. Мы обеспечиваем развитие через различные игры",
      activityTypes: {
        learning: "Обучение",
        meal: "Питание",
        rest: "Отдых",
        activity: "Активность",
        creative: "Творчество",
        outdoor: "На воздухе",
        arrival: "Приём",
        departure: "Уход"
      }
    },
    en: {
      title: "Daily Life",
      subtitle: "Every day in our kindergarten is filled with interesting and useful activities for children",
      schedule: "Daily Schedule",
      education: "Educational Activities",
      educationDesc: "Educational program designed according to children's age characteristics",
      play: "Play Activities",
      playDesc: "Play is the main activity of a child. We ensure development through various games",
      activityTypes: {
        learning: "Learning",
        meal: "Meals",
        rest: "Rest",
        activity: "Activity",
        creative: "Creative",
        outdoor: "Outdoor",
        arrival: "Arrival",
        departure: "Departure"
      }
    }
  }

  const txt = texts[language] || texts.uz

  const scheduleData = {
    uz: [
      { time: "07:30 - 08:30", activity: "Qabul va erkin o'yin", type: "arrival", icon: "🌅", description: "Bolalarni iliq kutib olish" },
      { time: "08:30 - 09:00", activity: "Nonushta", type: "meal", icon: "🥣", description: "Sog'lom va mazali nonushta" },
      { time: "09:00 - 09:30", activity: "Ertalabki mashqlar", type: "activity", icon: "🤸", description: "Qiziqarli gimnastika" },
      { time: "09:30 - 10:30", activity: "Ta'lim mashg'ulotlari", type: "learning", icon: "📚", description: "Interaktiv darslar" },
      { time: "10:30 - 11:00", activity: "Ikkinchi nonushta", type: "meal", icon: "🍎", description: "Yengil taom" },
      { time: "11:00 - 12:00", activity: "Ijodiy mashg'ulotlar", type: "creative", icon: "🎨", description: "Rasm, qo'l mehnati" },
      { time: "12:00 - 12:30", activity: "Ochiq havoda sayr", type: "outdoor", icon: "🌳", description: "Bog'cha hovlisida o'yinlar" },
      { time: "12:30 - 13:00", activity: "Tushlik", type: "meal", icon: "🍲", description: "To'yimli tushlik" },
      { time: "13:00 - 15:00", activity: "Kunduzgi uyqu", type: "rest", icon: "😴", description: "Tinch muhitda dam olish" },
      { time: "15:00 - 15:30", activity: "Uyg'onish va tushki taom", type: "meal", icon: "🥛", description: "Yengil taom" },
      { time: "15:30 - 16:30", activity: "Rivojlantiruvchi o'yinlar", type: "learning", icon: "🧩", description: "Mantiqiy o'yinlar" },
      { time: "16:30 - 17:30", activity: "Qo'shimcha mashg'ulotlar", type: "activity", icon: "🎭", description: "Musiqa, raqs, sport" },
      { time: "17:30 - 18:30", activity: "Erkin o'yin va uy", type: "departure", icon: "🏠", description: "Ota-onalar olib ketadi" }
    ],
    ru: [
      { time: "07:30 - 08:30", activity: "Приём и свободная игра", type: "arrival", icon: "🌅", description: "Тёплый приём детей" },
      { time: "08:30 - 09:00", activity: "Завтрак", type: "meal", icon: "🥣", description: "Здоровый и вкусный завтрак" },
      { time: "09:00 - 09:30", activity: "Утренняя зарядка", type: "activity", icon: "🤸", description: "Весёлая гимнастика" },
      { time: "09:30 - 10:30", activity: "Образовательные занятия", type: "learning", icon: "📚", description: "Интерактивные уроки" },
      { time: "10:30 - 11:00", activity: "Второй завтрак", type: "meal", icon: "🍎", description: "Лёгкий перекус" },
      { time: "11:00 - 12:00", activity: "Творческие занятия", type: "creative", icon: "🎨", description: "Рисование, поделки" },
      { time: "12:00 - 12:30", activity: "Прогулка на воздухе", type: "outdoor", icon: "🌳", description: "Игры во дворе" },
      { time: "12:30 - 13:00", activity: "Обед", type: "meal", icon: "🍲", description: "Сытный обед" },
      { time: "13:00 - 15:00", activity: "Дневной сон", type: "rest", icon: "😴", description: "Отдых в тихой обстановке" },
      { time: "15:00 - 15:30", activity: "Подъём и полдник", type: "meal", icon: "🥛", description: "Лёгкий перекус" },
      { time: "15:30 - 16:30", activity: "Развивающие игры", type: "learning", icon: "🧩", description: "Логические игры" },
      { time: "16:30 - 17:30", activity: "Дополнительные занятия", type: "activity", icon: "🎭", description: "Музыка, танцы, спорт" },
      { time: "17:30 - 18:30", activity: "Свободная игра и уход", type: "departure", icon: "🏠", description: "Родители забирают детей" }
    ],
    en: [
      { time: "07:30 - 08:30", activity: "Arrival and free play", type: "arrival", icon: "🌅", description: "Warm welcome for children" },
      { time: "08:30 - 09:00", activity: "Breakfast", type: "meal", icon: "🥣", description: "Healthy and tasty breakfast" },
      { time: "09:00 - 09:30", activity: "Morning exercises", type: "activity", icon: "🤸", description: "Fun gymnastics" },
      { time: "09:30 - 10:30", activity: "Educational activities", type: "learning", icon: "📚", description: "Interactive lessons" },
      { time: "10:30 - 11:00", activity: "Second breakfast", type: "meal", icon: "🍎", description: "Light snack" },
      { time: "11:00 - 12:00", activity: "Creative activities", type: "creative", icon: "🎨", description: "Drawing, crafts" },
      { time: "12:00 - 12:30", activity: "Outdoor walk", type: "outdoor", icon: "🌳", description: "Games in the yard" },
      { time: "12:30 - 13:00", activity: "Lunch", type: "meal", icon: "🍲", description: "Hearty lunch" },
      { time: "13:00 - 15:00", activity: "Nap time", type: "rest", icon: "😴", description: "Rest in quiet environment" },
      { time: "15:00 - 15:30", activity: "Wake up and snack", type: "meal", icon: "🥛", description: "Light snack" },
      { time: "15:30 - 16:30", activity: "Educational games", type: "learning", icon: "🧩", description: "Logic games" },
      { time: "16:30 - 17:30", activity: "Extra activities", type: "activity", icon: "🎭", description: "Music, dance, sports" },
      { time: "17:30 - 18:30", activity: "Free play and departure", type: "departure", icon: "🏠", description: "Parents pick up children" }
    ]
  }

  const educationalActivities = {
    uz: [
      { icon: "🔤", title: "Til rivojlanishi", description: "Alifbo, so'z boyligi, nutq madaniyati", ageGroups: "2-6 yosh" },
      { icon: "🔢", title: "Matematika asoslari", description: "Raqamlar, sanash, geometrik shakllar", ageGroups: "3-6 yosh" },
      { icon: "🌍", title: "Atrofimizdagi olam", description: "Tabiat, hayvonlar, o'simliklar", ageGroups: "2-6 yosh" },
      { icon: "🇬🇧", title: "Ingliz tili", description: "O'yin orqali ingliz tilini o'rganish", ageGroups: "4-6 yosh" }
    ],
    ru: [
      { icon: "🔤", title: "Развитие речи", description: "Алфавит, словарный запас, культура речи", ageGroups: "2-6 лет" },
      { icon: "🔢", title: "Основы математики", description: "Числа, счёт, геометрические фигуры", ageGroups: "3-6 лет" },
      { icon: "🌍", title: "Окружающий мир", description: "Природа, животные, растения", ageGroups: "2-6 лет" },
      { icon: "🇬🇧", title: "Английский язык", description: "Изучение английского через игру", ageGroups: "4-6 лет" }
    ],
    en: [
      { icon: "🔤", title: "Language Development", description: "Alphabet, vocabulary, speech culture", ageGroups: "2-6 years" },
      { icon: "🔢", title: "Math Basics", description: "Numbers, counting, geometric shapes", ageGroups: "3-6 years" },
      { icon: "🌍", title: "World Around Us", description: "Nature, animals, plants", ageGroups: "2-6 years" },
      { icon: "🇬🇧", title: "English Language", description: "Learning English through play", ageGroups: "4-6 years" }
    ]
  }

  const playActivities = {
    uz: [
      { icon: "🎭", title: "Rol o'yinlari", description: "Ijtimoiy ko'nikmalarni rivojlantiruvchi o'yinlar" },
      { icon: "🧱", title: "Konstruktor o'yinlari", description: "LEGO, kubiklar va qurilish o'yinlari" },
      { icon: "⚽", title: "Sport o'yinlari", description: "To'p o'yinlari, yugurish, sakrash" },
      { icon: "🎵", title: "Musiqa va raqs", description: "Qo'shiqlar, ritmik harakatlar" }
    ],
    ru: [
      { icon: "🎭", title: "Ролевые игры", description: "Игры для развития социальных навыков" },
      { icon: "🧱", title: "Конструкторы", description: "LEGO, кубики и строительные игры" },
      { icon: "⚽", title: "Спортивные игры", description: "Игры с мячом, бег, прыжки" },
      { icon: "🎵", title: "Музыка и танцы", description: "Песни, ритмические движения" }
    ],
    en: [
      { icon: "🎭", title: "Role-playing games", description: "Games for developing social skills" },
      { icon: "🧱", title: "Construction games", description: "LEGO, blocks and building games" },
      { icon: "⚽", title: "Sports games", description: "Ball games, running, jumping" },
      { icon: "🎵", title: "Music and dance", description: "Songs, rhythmic movements" }
    ]
  }

  const activityTypes = [
    { type: "learning", icon: "📚" },
    { type: "meal", icon: "🍽️" },
    { type: "rest", icon: "😴" },
    { type: "activity", icon: "⚡" },
    { type: "creative", icon: "🎨" },
    { type: "outdoor", icon: "🌳" },
    { type: "arrival", icon: "🌅" },
    { type: "departure", icon: "🏠" }
  ]

  const schedule = scheduleData[language] || scheduleData.uz
  const eduActivities = educationalActivities[language] || educationalActivities.uz
  const playActs = playActivities[language] || playActivities.uz

  return (
    <div className="daily-life-page">
      <section className="daily-hero">
        <div className="daily-container">
          <h1 className="daily-main-title">{txt.title}</h1>
          <p className="daily-subtitle">{txt.subtitle}</p>
        </div>
      </section>

      <section className="activity-legend">
        <div className="daily-container">
          <div className="legend-grid">
            {activityTypes.map((item, index) => (
              <div key={index} className="legend-item">
                <span className="legend-icon">{item.icon}</span>
                <span className="legend-label">{txt.activityTypes[item.type]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="daily-schedule">
        <div className="daily-container">
          <h2 className="section-title">{txt.schedule}</h2>
          <div className="schedule-timeline">
            {schedule.map((item, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-time">
                  <span className="time-text">{item.time}</span>
                </div>
                <div className="schedule-connector">
                  <div className="connector-dot"></div>
                  <div className="connector-line"></div>
                </div>
                <div className="schedule-content">
                  <div className="schedule-icon">{item.icon}</div>
                  <div className="schedule-details">
                    <h3 className="schedule-activity">{item.activity}</h3>
                    <p className="schedule-description">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="educational-activities">
        <div className="daily-container">
          <h2 className="section-title">{txt.education}</h2>
          <p className="section-subtitle">{txt.educationDesc}</p>
          <div className="activities-grid">
            {eduActivities.map((activity, index) => (
              <div key={index} className="activity-card educational">
                <div className="activity-icon">{activity.icon}</div>
                <h3 className="activity-title">{activity.title}</h3>
                <p className="activity-description">{activity.description}</p>
                <span className="activity-age">{activity.ageGroups}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="play-activities">
        <div className="daily-container">
          <h2 className="section-title">{txt.play}</h2>
          <p className="section-subtitle">{txt.playDesc}</p>
          <div className="activities-grid">
            {playActs.map((activity, index) => (
              <div key={index} className="activity-card play">
                <div className="activity-icon">{activity.icon}</div>
                <h3 className="activity-title">{activity.title}</h3>
                <p className="activity-description">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default DailyLifePage
