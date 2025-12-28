import { memo, useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { FadeUp, ScaleIn } from '../animations'
import api from '../../services/api'
import './Testimonials.css'

const TEXTS = {
  uz: { title: 'Ota-onalar fikrlari', subtitle: 'Bizning xizmatlarimizdan foydalangan oilalar nima deyishadi' },
  ru: { title: 'Отзывы родителей', subtitle: 'Что говорят семьи, которые пользуются нашими услугами' },
  en: { title: 'Parent Reviews', subtitle: 'What families who use our services say' }
}

const DEFAULT_TESTIMONIALS = [
  { id: 1, parentName: 'Nilufar Karimova', rating: 5, comment: "Bolam Play Kids ga borishni juda yaxshi ko'radi. O'qituvchilar juda mehribon va professional." },
  { id: 2, parentName: 'Jasur Aliyev', rating: 5, comment: "Maktabga tayyorgarlik dasturi juda yaxshi. Bolam ko'p narsalarni o'rgandi." },
  { id: 3, parentName: 'Madina Rahimova', rating: 5, comment: "Ovqatlanish menyusi juda yaxshi tuzilgan. Bolam sog'lom ovqatlanishni o'rgandi." }
]

const TestimonialCard = memo(function TestimonialCard({ testimonial, index }) {
  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)
  
  return (
    <ScaleIn delay={index * 0.15}>
      <motion.div className="testimonial-card" whileHover={{ y: -10 }} transition={{ type: 'spring', stiffness: 300 }}>
        <div className="testimonial-quote">"</div>
        <div className="testimonial-content">
          <div className="testimonial-rating">{renderStars(testimonial.rating)}</div>
          <p className="testimonial-text">{testimonial.comment}</p>
        </div>
        <div className="testimonial-author">
          <div className="testimonial-avatar">
            <span className="testimonial-avatar-fallback">{testimonial.parentName?.charAt(0) || 'A'}</span>
          </div>
          <div className="testimonial-info">
            <span className="testimonial-name">{testimonial.parentName || 'Anonim'}</span>
          </div>
        </div>
      </motion.div>
    </ScaleIn>
  )
})

const Testimonials = memo(function Testimonials() {
  const { language } = useLanguage()
  const [feedbacks, setFeedbacks] = useState(DEFAULT_TESTIMONIALS)
  const content = useMemo(() => TEXTS[language], [language])

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await api.get('/feedback')
        if (response.data && response.data.length > 0) {
          setFeedbacks(response.data.slice(0, 6))
        }
      } catch (error) {
        // Use default testimonials
      }
    }
    fetchFeedbacks()
  }, [])

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <FadeUp>
          <div className="testimonials-header">
            <h2 className="testimonials-title">{content.title}</h2>
            <p className="testimonials-subtitle">{content.subtitle}</p>
          </div>
        </FadeUp>
        <div className="testimonials-grid">
          {feedbacks.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
})

export default Testimonials