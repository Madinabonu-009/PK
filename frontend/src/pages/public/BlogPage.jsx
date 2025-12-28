import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import './BlogPage.css'

const BlogPage = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { language, t } = useLanguage()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await api.get('/blog')
      // API returns { data: [...], pagination: {...} } or array
      const data = response.data?.data || response.data?.posts || 
                   (Array.isArray(response.data) ? response.data : [])
      setPosts(data)
    } catch (error) {
      // Error handled by UI state
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' } },
    { id: 'news', label: { uz: 'Yangiliklar', ru: 'Новости', en: 'News' } },
    { id: 'tips', label: { uz: 'Maslahatlar', ru: 'Советы', en: 'Tips' } },
    { id: 'events', label: { uz: 'Tadbirlar', ru: 'Мероприятия', en: 'Events' } }
  ]

  // Ensure posts is always an array
  const safePosts = Array.isArray(posts) ? posts : []
  const filteredPosts = filter === 'all' 
    ? safePosts 
    : safePosts.filter(p => p.category === filter)

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading">{t('loading')}</div>
  }

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="container">
          <h1>{t('latestNews')}</h1>
          <p>
            {language === 'uz' && 'Bog\'chamiz yangiliklari va foydali maslahatlar'}
            {language === 'ru' && 'Новости нашего детского сада и полезные советы'}
            {language === 'en' && 'Our kindergarten news and useful tips'}
          </p>
        </div>
      </section>

      <section className="blog-content">
        <div className="container">
          <div className="blog-filters">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
                onClick={() => setFilter(cat.id)}
              >
                {cat.label[language]}
              </button>
            ))}
          </div>

          <div className="blog-grid">
            {filteredPosts.map(post => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-image">
                  <img src={post.image} alt={post.title[language]} loading="lazy" />
                  <span className="blog-category">
                    {categories.find(c => c.id === post.category)?.label[language]}
                  </span>
                </div>
                <div className="blog-card-content">
                  <time className="blog-date">{formatDate(post.createdAt)}</time>
                  <h2>{post.title[language]}</h2>
                  <p>{post.excerpt[language]}</p>
                  <Link to={`/blog/${post.id}`} className="read-more">
                    {t('readMore')} →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="no-posts">
              {language === 'uz' && 'Hozircha maqolalar yo\'q'}
              {language === 'ru' && 'Пока нет статей'}
              {language === 'en' && 'No posts yet'}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default BlogPage
