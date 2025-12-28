import './DailyLifePage.css'

const scheduleData = [
  {
    time: "07:30 - 08:30",
    activity: "Qabul va erkin o'yin",
    type: "arrival",
    icon: "🌅",
    description: "Bolalarni iliq kutib olish, ota-onalar bilan salomlashish. Bolalar o'z xohishlariga ko'ra o'yinchoqlar bilan o'ynaydilar."
  },
  {
    time: "08:30 - 09:00",
    activity: "Nonushta",
    type: "meal",
    icon: "🥣",
    description: "Sog'lom va mazali nonushta. Bolalar birga ovqatlanish madaniyatini o'rganadilar."
  },
  {
    time: "09:00 - 09:30",
    activity: "Ertalabki mashqlar",
    type: "activity",
    icon: "🤸",
    description: "Qiziqarli gimnastika va harakatli o'yinlar. Jismoniy faollik va sog'lom turmush tarzi asoslari."
  },
  {
    time: "09:30 - 10:30",
    activity: "Ta'lim mashg'ulotlari",
    type: "learning",
    icon: "📚",
    description: "Yosh guruhiga mos ta'lim dasturi: alifbo, raqamlar, ranglar, shakllar. Interaktiv va o'yin shaklidagi darslar."
  },
  {
    time: "10:30 - 11:00",
    activity: "Ikkinchi nonushta",
    type: "meal",
    icon: "🍎",
    description: "Yengil taom: mevalar, sut mahsulotlari yoki shirinliklar."
  },
  {
    time: "11:00 - 12:00",
    activity: "Ijodiy mashg'ulotlar",
    type: "creative",
    icon: "🎨",
    description: "Rasm chizish, qo'l mehnati, plastilin bilan ishlash. Bolalarning ijodiy qobiliyatlarini rivojlantirish."
  },
  {
    time: "12:00 - 12:30",
    activity: "Ochiq havoda sayr",
    type: "outdoor",
    icon: "🌳",
    description: "Bog'cha hovlisida o'yinlar, tabiat bilan tanishish, jismoniy faollik."
  },
  {
    time: "12:30 - 13:00",
    activity: "Tushlik",
    type: "meal",
    icon: "🍲",
    description: "To'yimli va foydali tushlik. Sho'rva, ikkinchi taom va ichimlik."
  },
  {
    time: "13:00 - 15:00",
    activity: "Kunduzi uyqu",
    type: "rest",
    icon: "😴",
    description: "Tinch muhitda dam olish. Bolalar uchun qulay yotoqxona va individual karavotlar."
  },
  {
    time: "15:00 - 15:30",
    activity: "Uyg'onish va tushki taom",
    type: "meal",
    icon: "🥛",
    description: "Asta-sekin uyg'onish, yengil gimnastika va mazali tushki taom."
  },
  {
    time: "15:30 - 16:30",
    activity: "Rivojlantiruvchi o'yinlar",
    type: "learning",
    icon: "🧩",
    description: "Mantiqiy o'yinlar, pazllar, konstruktorlar. Fikrlash va muammolarni hal qilish ko'nikmalarini rivojlantirish."
  },
  {
    time: "16:30 - 17:30",
    activity: "Qo'shimcha mashg'ulotlar",
    type: "activity",
    icon: "🎭",
    description: "Musiqa, raqs, ingliz tili yoki sport to'garaklari. Bolalarning qiziqishlariga qarab tanlanadi."
  },
  {
    time: "17:30 - 18:30",
    activity: "Erkin o'yin va uy",
    type: "departure",
    icon: "🏠",
    description: "Bolalar o'z xohishlariga ko'ra o'ynaydilar. Ota-onalar bolalarini olib ketadilar."
  }
]

// CSS variables dan ranglarni olish
const getColorVar = (varName) => getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || varName

const activityTypes = [
  { type: "learning", label: "Ta'lim", colorVar: '--chart-primary', icon: "📚" },
  { type: "meal", label: "Ovqatlanish", colorVar: '--chart-warning', icon: "🍽️" },
  { type: "rest", label: "Dam olish", colorVar: '--chart-purple', icon: "😴" },
  { type: "activity", label: "Faoliyat", colorVar: '--chart-success', icon: "⚡" },
  { type: "creative", label: "Ijod", colorVar: '--chart-pink', icon: "🎨" },
  { type: "outdoor", label: "Ochiq havo", colorVar: '--chart-cyan', icon: "🌳" },
  { type: "arrival", label: "Qabul", colorVar: '--chart-lime', icon: "🌅" },
  { type: "departure", label: "Ketish", colorVar: '--chart-orange', icon: "🏠" }
]


const educationalActivities = [
  {
    icon: "🔤",
    title: "Til rivojlanishi",
    description: "Alifbo, so'z boyligi, nutq madaniyati va kitob o'qish ko'nikmalarini shakllantirish",
    ageGroups: "2-6 yosh"
  },
  {
    icon: "🔢",
    title: "Matematika asoslari",
    description: "Raqamlar, sanash, oddiy amallar, geometrik shakllar va mantiqiy fikrlash",
    ageGroups: "3-6 yosh"
  },
  {
    icon: "🌍",
    title: "Atrofimizdagi olam",
    description: "Tabiat, hayvonlar, o'simliklar, fasllar va atrof-muhit haqida bilimlar",
    ageGroups: "2-6 yosh"
  },
  {
    icon: "🇬🇧",
    title: "Ingliz tili",
    description: "O'yin orqali ingliz tilini o'rganish, oddiy so'zlar va iboralar",
    ageGroups: "4-6 yosh"
  }
]

const playActivities = [
  {
    icon: "🎭",
    title: "Rol o'yinlari",
    description: "Ijtimoiy ko'nikmalarni rivojlantiruvchi dramatik o'yinlar"
  },
  {
    icon: "🧱",
    title: "Konstruktor o'yinlari",
    description: "LEGO, kubiklar va boshqa qurilish o'yinlari"
  },
  {
    icon: "⚽",
    title: "Sport o'yinlari",
    description: "To'p o'yinlari, yugurish, sakrash va boshqa harakatli o'yinlar"
  },
  {
    icon: "🎵",
    title: "Musiqa va raqs",
    description: "Qo'shiqlar, ritmik harakatlar va musiqa asboblari bilan tanishish"
  }
]

const DailyLifePage = () => {
  const getTypeColor = (type) => {
    const found = activityTypes.find(t => t.type === type)
    if (!found) return 'var(--chart-primary)'
    return `var(${found.colorVar})`
  }

  return (
    <div className="daily-life-page">
      {/* Hero Section */}
      <section className="daily-hero">
        <div className="daily-container">
          <h1 className="daily-main-title">Kundalik hayot</h1>
          <p className="daily-subtitle">
            Bog'chamizda har bir kun bolalar uchun qiziqarli va foydali mashg'ulotlar bilan to'la
          </p>
        </div>
      </section>

      {/* Activity Types Legend */}
      <section className="activity-legend">
        <div className="daily-container">
          <div className="legend-grid">
            {activityTypes.map((item, index) => (
              <div key={index} className="legend-item">
                <span 
                  className="legend-dot" 
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="legend-icon">{item.icon}</span>
                <span className="legend-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Schedule */}
      <section className="daily-schedule">
        <div className="daily-container">
          <h2 className="section-title">Kunlik jadval</h2>
          <div className="schedule-timeline">
            {scheduleData.map((item, index) => (
              <div 
                key={index} 
                className="schedule-item"
                style={{ '--accent-color': getTypeColor(item.type) }}
              >
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

      {/* Educational Activities */}
      <section className="educational-activities">
        <div className="daily-container">
          <h2 className="section-title">Ta'lim mashg'ulotlari</h2>
          <p className="section-subtitle">
            Bolalarning yosh xususiyatlariga mos ravishda tuzilgan ta'lim dasturi
          </p>
          <div className="activities-grid">
            {educationalActivities.map((activity, index) => (
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

      {/* Play Activities */}
      <section className="play-activities">
        <div className="daily-container">
          <h2 className="section-title">O'yin faoliyatlari</h2>
          <p className="section-subtitle">
            O'yin - bolaning asosiy faoliyati. Biz turli xil o'yinlar orqali rivojlanishni ta'minlaymiz
          </p>
          <div className="activities-grid">
            {playActivities.map((activity, index) => (
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
