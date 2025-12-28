import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import './BlogPostPage.css'

const BlogPostPage = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const { language, t } = useLanguage()

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const response = await api.get(`/blog/${id}`)
      setPost(response.data)
    } catch (error) {
      // Error handled by UI state
    } finally {
      setLoading(false)
    }
  }

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

  if (!post) {
    return (
      <div className="not-found">
        <h1>404</h1>
        <p>
          {language === 'uz' && 'Maqola topilmadi'}
          {language === 'ru' && 'Статья не найдена'}
          {language === 'en' && 'Post not found'}
        </p>
        <Link to="/blog" className="back-btn">← {t('blog')}</Link>
      </div>
    )
  }

  return (
    <div className="blog-post-page">
      <div className="post-hero" style={{ backgroundImage: `url(${post.image})` }}>
        <div className="post-hero-overlay">
          <div className="container">
            <Link to="/blog" className="back-link">← {t('blog')}</Link>
            <h1>{post.title[language]}</h1>
            <div className="post-meta">
              <span className="post-author">✍️ {post.author}</span>
              <span className="post-date">📅 {formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="post-content">
        <div className="container">
          <div className="post-body">
            {post.content[language].split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="post-share">
            <span>
              {language === 'uz' && 'Ulashish:'}
              {language === 'ru' && 'Поделиться:'}
              {language === 'en' && 'Share:'}
            </span>
            <a 
              href={`https://t.me/share/url?url=${window.location.href}&text=${post.title[language]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn telegram"
            >
              Telegram
            </a>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn facebook"
            >
              Facebook
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}

export default BlogPostPage
