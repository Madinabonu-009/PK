/**
 * FAQ Component - Ko'p so'raladigan savollar
 */
import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './FAQ.css'

const FAQ_DATA = {
  uz: {
    title: "Ko'p so'raladigan savollar",
    subtitle: "Sizni qiziqtirgan savollarga javoblar",
    questions: [
      {
        q: "Bolani qanday ro'yxatdan o'tkazish mumkin?",
        a: "Ro'yxatdan o'tish uchun saytimizda 'Ro'yxatdan o'tish' tugmasini bosing yoki bizga qo'ng'iroq qiling. Kerakli hujjatlar: tug'ilganlik haqida guvohnoma, ota-onaning pasporti, tibbiy ma'lumotnoma."
      },
      {
        q: "Bog'cha qancha turadi?",
        a: "Bog'chamizda rus tili va ingliz tili guruhlari mavjud. Guruhlar 2-6 yoshli bolalar uchun mo'ljallangan. To'lov miqdori va batafsil ma'lumot uchun biz bilan bog'laning: +998 94 514 09 49"
      },
      {
        q: "Ish vaqti qanday?",
        a: "Bog'chamiz dushanba-juma kunlari soat 7:00 dan 19:00 gacha ishlaydi. Shanba kuni soat 8:00 dan 14:00 gacha. Yakshanba - dam olish kuni."
      },
      {
        q: "Qanday yoshdagi bolalar qabul qilinadi?",
        a: "Biz 1.5 yoshdan 7 yoshgacha bo'lgan bolalarni qabul qilamiz. Har bir yosh guruhi uchun alohida dastur mavjud."
      },
      {
        q: "Ovqatlanish qanday tashkil etilgan?",
        a: "Kuniga 4 mahal ovqatlanish: nonushta, tushlik, yengil tamaddi va kechki ovqat. Barcha taomlar sog'lom va bolalar uchun maxsus tayyorlanadi."
      },
      {
        q: "Xavfsizlik qanday ta'minlangan?",
        a: "Bog'chamizda 24 soatlik video kuzatuv, xavfsizlik xizmati va kirish nazorati mavjud. Faqat ro'yxatdan o'tgan ota-onalar bolani olib ketishi mumkin."
      }
    ]
  },
  ru: {
    title: "Часто задаваемые вопросы",
    subtitle: "Ответы на интересующие вас вопросы",
    questions: [
      {
        q: "Как записать ребёнка?",
        a: "Для записи нажмите кнопку 'Записаться' на сайте или позвоните нам. Необходимые документы: свидетельство о рождении, паспорт родителя, медицинская справка."
      },
      {
        q: "Сколько стоит детский сад?",
        a: "В нашем саду есть группы русского и английского языка для детей 2-6 лет. Для информации о стоимости и деталях свяжитесь с нами: +998 94 514 09 49"
      },
      {
        q: "Какой режим работы?",
        a: "Наш сад работает понедельник-пятница с 7:00 до 19:00. В субботу с 8:00 до 14:00. Воскресенье - выходной."
      },
      {
        q: "Детей какого возраста принимаете?",
        a: "Мы принимаем детей от 1.5 до 7 лет. Для каждой возрастной группы есть отдельная программа."
      },
      {
        q: "Как организовано питание?",
        a: "4-разовое питание в день: завтрак, обед, полдник и ужин. Все блюда здоровые и специально приготовлены для детей."
      },
      {
        q: "Как обеспечена безопасность?",
        a: "В нашем саду 24-часовое видеонаблюдение, охрана и контроль доступа. Только зарегистрированные родители могут забрать ребёнка."
      }
    ]
  },
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Answers to your questions",
    questions: [
      {
        q: "How to enroll a child?",
        a: "To enroll, click the 'Register' button on our website or call us. Required documents: birth certificate, parent's passport, medical certificate."
      },
      {
        q: "How much does it cost?",
        a: "We offer Russian and English language groups for children aged 2-6. For pricing information and details, contact us: +998 94 514 09 49"
      },
      {
        q: "What are the working hours?",
        a: "Our kindergarten works Monday-Friday from 7:00 to 19:00. Saturday from 8:00 to 14:00. Sunday is a day off."
      },
      {
        q: "What age children do you accept?",
        a: "We accept children from 1.5 to 7 years old. Each age group has a separate program."
      },
      {
        q: "How is nutrition organized?",
        a: "4 meals a day: breakfast, lunch, snack and dinner. All dishes are healthy and specially prepared for children."
      },
      {
        q: "How is security ensured?",
        a: "Our kindergarten has 24-hour video surveillance, security service and access control. Only registered parents can pick up the child."
      }
    ]
  }
}

const FAQItem = memo(function FAQItem({ question, answer, isOpen, onClick, index }) {
  return (
    <motion.div 
      className={`faq-item ${isOpen ? 'open' : ''} ripple-effect`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <button className="faq-item__question magnetic-hover" onClick={onClick}>
        <span className="faq-item__icon wow-heartbeat">❓</span>
        <span className="faq-item__text">{question}</span>
        <motion.span 
          className="faq-item__arrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="faq-item__answer holographic"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

const FAQ = memo(function FAQ() {
  const { language } = useLanguage()
  const data = useMemo(() => FAQ_DATA[language] || FAQ_DATA.uz, [language])
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="faq-section">
      <div className="faq-section__container">
        <motion.div 
          className="faq-section__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="faq-section__badge liquid-btn">❓ FAQ</span>
          <h2 className="faq-section__title rainbow-text">{data.title}</h2>
          <p className="faq-section__subtitle">{data.subtitle}</p>
        </motion.div>

        <div className="faq-list">
          {data.questions.map((item, idx) => (
            <FAQItem
              key={idx}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === idx}
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  )
})

export default FAQ
