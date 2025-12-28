import { useLanguage } from '../../context/LanguageContext'
import { PandaMascot, CartoonCloud, CartoonStar, ScrollReveal } from '../../components/animations'
import './AboutPage.css'

const AboutPage = () => {
  const { t, language } = useLanguage()

  const missionData = {
    uz: {
      title: "Bizning missiyamiz",
      description: "Play Kids - bu har bir bolaning noyob qobiliyatlarini kashf etish va rivojlantirishga bag'ishlangan zamonaviy ta'lim maskani. Biz bolalarning baxtli bolalik davri va porloq kelajagiga asos solamiz.",
      slogan: "Farzandingiz baxtli bo'lsa — kelajak porloq bo'ladi"
    },
    ru: {
      title: "Наша миссия",
      description: "Play Kids - это современный образовательный центр, посвященный раскрытию и развитию уникальных способностей каждого ребенка. Мы закладываем основу для счастливого детства и светлого будущего.",
      slogan: "Счастливый ребёнок — светлое будущее"
    },
    en: {
      title: "Our Mission",
      description: "Play Kids is a modern educational center dedicated to discovering and developing each child's unique abilities. We lay the foundation for a happy childhood and a bright future.",
      slogan: "Happy Child — Bright Future"
    }
  }

  const philosophyData = {
    uz: {
      title: "Bizning falsafamiz",
      points: [
        { icon: "🌱", title: "Tabiiy rivojlanish", description: "Har bir bola o'z sur'atida rivojlanadi. Biz bolaning tabiiy qiziqishlarini qo'llab-quvvatlaymiz." },
        { icon: "🎯", title: "Individual yondashuv", description: "Har bir bolaga individual e'tibor beramiz va uning kuchli tomonlarini rivojlantiramiz." },
        { icon: "💡", title: "O'yin orqali o'rganish", description: "Bolalar o'yin orqali eng yaxshi o'rganadilar. Bizning barcha mashg'ulotlarimiz qiziqarli va interaktiv." }
      ]
    },
    ru: {
      title: "Наша философия",
      points: [
        { icon: "🌱", title: "Естественное развитие", description: "Каждый ребенок развивается в своем темпе. Мы поддерживаем естественные интересы ребенка." },
        { icon: "🎯", title: "Индивидуальный подход", description: "Мы уделяем индивидуальное внимание каждому ребенку и развиваем его сильные стороны." },
        { icon: "💡", title: "Обучение через игру", description: "Дети лучше всего учатся через игру. Все наши занятия интересные и интерактивные." }
      ]
    },
    en: {
      title: "Our Philosophy",
      points: [
        { icon: "🌱", title: "Natural Development", description: "Each child develops at their own pace. We support the child's natural interests." },
        { icon: "🎯", title: "Individual Approach", description: "We give individual attention to each child and develop their strengths." },
        { icon: "💡", title: "Learning Through Play", description: "Children learn best through play. All our activities are interesting and interactive." }
      ]
    }
  }

  const methodologyData = {
    uz: {
      title: "Ta'lim metodologiyasi",
      description: "Biz zamonaviy pedagogik yondashuvlarni an'anaviy qadriyatlar bilan uyg'unlashtirgan holda, bolalarning har tomonlama rivojlanishini ta'minlaymiz.",
      methods: [
        { icon: "🎨", title: "Montessori elementi", description: "Bolaning mustaqilligini rivojlantirish va o'z-o'zini boshqarish ko'nikmalarini shakllantirish" },
        { icon: "🧩", title: "STEAM ta'lim", description: "Fan, texnologiya, muhandislik, san'at va matematikani integratsiyalashgan holda o'rgatish" },
        { icon: "🗣️", title: "Til rivojlanishi", description: "Ona tili va chet tillarini o'rganish uchun immersiv muhit yaratish" },
        { icon: "🤝", title: "Ijtimoiy ko'nikmalar", description: "Guruhda ishlash, muloqot qilish va emotsional intellektni rivojlantirish" }
      ]
    },
    ru: {
      title: "Методология обучения",
      description: "Мы сочетаем современные педагогические подходы с традиционными ценностями для всестороннего развития детей.",
      methods: [
        { icon: "🎨", title: "Элементы Монтессори", description: "Развитие самостоятельности ребенка и навыков самоуправления" },
        { icon: "🧩", title: "STEAM образование", description: "Интегрированное обучение науке, технологиям, инженерии, искусству и математике" },
        { icon: "🗣️", title: "Языковое развитие", description: "Создание иммерсивной среды для изучения родного и иностранных языков" },
        { icon: "🤝", title: "Социальные навыки", description: "Развитие навыков работы в группе, общения и эмоционального интеллекта" }
      ]
    },
    en: {
      title: "Teaching Methodology",
      description: "We combine modern pedagogical approaches with traditional values to ensure comprehensive development of children.",
      methods: [
        { icon: "🎨", title: "Montessori Elements", description: "Developing child's independence and self-management skills" },
        { icon: "🧩", title: "STEAM Education", description: "Integrated teaching of science, technology, engineering, art and mathematics" },
        { icon: "🗣️", title: "Language Development", description: "Creating an immersive environment for learning native and foreign languages" },
        { icon: "🤝", title: "Social Skills", description: "Developing teamwork, communication and emotional intelligence" }
      ]
    }
  }

  const valuesData = {
    uz: [
      { icon: "❤️", title: "Mehr-muhabbat", description: "Har bir bolaga oilaviy muhitda mehr va g'amxo'rlik ko'rsatamiz" },
      { icon: "🌟", title: "Sifat", description: "Ta'lim va tarbiyada eng yuqori standartlarga amal qilamiz" },
      { icon: "🤲", title: "Ishonch", description: "Ota-onalar bilan ochiq va samimiy munosabatlar o'rnatamiz" },
      { icon: "🔬", title: "Innovatsiya", description: "Zamonaviy ta'lim metodlari va texnologiyalarni qo'llaymiz" },
      { icon: "🌈", title: "Ijodkorlik", description: "Bolalarning ijodiy fikrlashini rag'batlantiramiz" },
      { icon: "🛡️", title: "Xavfsizlik", description: "Bolalar uchun xavfsiz va sog'lom muhit yaratamiz" }
    ],
    ru: [
      { icon: "❤️", title: "Любовь и забота", description: "Мы проявляем любовь и заботу к каждому ребенку в семейной атмосфере" },
      { icon: "🌟", title: "Качество", description: "Мы придерживаемся высочайших стандартов в образовании и воспитании" },
      { icon: "🤲", title: "Доверие", description: "Мы строим открытые и искренние отношения с родителями" },
      { icon: "🔬", title: "Инновации", description: "Мы применяем современные методы обучения и технологии" },
      { icon: "🌈", title: "Творчество", description: "Мы поощряем творческое мышление детей" },
      { icon: "🛡️", title: "Безопасность", description: "Мы создаем безопасную и здоровую среду для детей" }
    ],
    en: [
      { icon: "❤️", title: "Love & Care", description: "We show love and care to every child in a family atmosphere" },
      { icon: "🌟", title: "Quality", description: "We adhere to the highest standards in education and upbringing" },
      { icon: "🤲", title: "Trust", description: "We build open and sincere relationships with parents" },
      { icon: "🔬", title: "Innovation", description: "We apply modern teaching methods and technologies" },
      { icon: "🌈", title: "Creativity", description: "We encourage creative thinking in children" },
      { icon: "🛡️", title: "Safety", description: "We create a safe and healthy environment for children" }
    ]
  }

  const mission = missionData[language]
  const philosophy = philosophyData[language]
  const methodology = methodologyData[language]
  const values = valuesData[language]

  return (
    <div className="about-page">
      {/* Decorative Elements */}
      <div className="about-decorations">
        <CartoonCloud className="about-cloud about-cloud--1" />
        <CartoonCloud className="about-cloud about-cloud--2" size="small" />
        <CartoonStar className="about-star about-star--1" color="#ffd54f" />
        <CartoonStar className="about-star about-star--2" color="#ff9ff3" size={30} />
      </div>
      
      {/* Floating Panda */}
      <div className="about-panda-float">
        <PandaMascot size={70} mood="curious" />
      </div>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="about-container">
          <ScrollReveal>
            <h1 className="about-main-title">{t('aboutTitle')}</h1>
          </ScrollReveal>
          <div className="mission-content">
            <div className="mission-panda">
              <PandaMascot size={100} mood="wave" />
            </div>
            <ScrollReveal delay={0.1}>
              <h2 className="section-title">{mission.title}</h2>
              <p className="mission-description">{mission.description}</p>
              <blockquote className="mission-slogan">
                "{mission.slogan}"
              </blockquote>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="about-philosophy">
        <div className="about-container">
          <ScrollReveal>
            <h2 className="section-title">{philosophy.title}</h2>
          </ScrollReveal>
          <div className="philosophy-grid">
            {philosophy.points.map((point, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="philosophy-card">
                  <div className="philosophy-icon">{point.icon}</div>
                  <h3 className="philosophy-title">{point.title}</h3>
                  <p className="philosophy-description">{point.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="about-methodology">
        <div className="about-container">
          <h2 className="section-title">{methodology.title}</h2>
          <p className="methodology-intro">{methodology.description}</p>
          <div className="methodology-grid">
            {methodology.methods.map((method, index) => (
              <div key={index} className="methodology-card">
                <div className="methodology-icon">{method.icon}</div>
                <h3 className="methodology-title">{method.title}</h3>
                <p className="methodology-description">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="about-container">
          <h2 className="section-title">{t('ourValues')}</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
