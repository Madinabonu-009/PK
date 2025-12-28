import { useLanguage } from '../../context/LanguageContext'
import Library from '../../components/library/Library'
import './LibraryPage.css'

export default function LibraryPage() {
  const { language } = useLanguage()
  
  return (
    <div className="library-page">
      <Library language={language} />
    </div>
  )
}
