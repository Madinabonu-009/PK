import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import './NotFoundPage.css'

const NotFoundPage = () => {
  const { language } = useLanguage()

  const texts = {
    uz: {
      title: '404',
      subtitle: 'Sahifa topilmadi',
      description: 'Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki ko\'chirilgan.',
      home: 'Bosh sahifaga qaytish'
    },
    ru: {
      title: '404',
      subtitle: 'Страница не найдена',
      description: 'Извините, страница, которую вы ищете, не существует или была перемещена.',
      home: 'Вернуться на главную'
    },
    en: {
      title: '404',
      subtitle: 'Page Not Found',
      description: 'Sorry, the page you are looking for does not exist or has been moved.',
      home: 'Back to Home'
    }
  }

  const txt = texts[language]

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h1 className="not-found-title">{txt.title}</h1>
        <h2 className="not-found-subtitle">{txt.subtitle}</h2>
        <p className="not-found-description">{txt.description}</p>
        <Link to="/" className="not-found-button">
          ← {txt.home}
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
