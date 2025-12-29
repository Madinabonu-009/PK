import { useLanguage } from '../../context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import Library from '../../components/library/Library'
import './LibraryPage.css'

export default function LibraryPage() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  
  const handleBack = () => {
    navigate('/')
  }
  
  return (
    <div className="library-page">
      <Library language={language} onBack={handleBack} />
    </div>
  )
}
