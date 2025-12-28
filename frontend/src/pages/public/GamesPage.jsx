import { useLanguage } from '../../context/LanguageContext'
import GamesCenter from '../../components/games/GamesCenter'
import { PandaMascot, CartoonBalloon, RainbowArc } from '../../components/animations'
import './GamesPage.css'

export default function GamesPage() {
  const { language } = useLanguage()
  
  return (
    <div className="games-page">
      {/* Decorations */}
      <div className="games-decorations">
        <RainbowArc className="games-rainbow" />
        <CartoonBalloon className="games-balloon games-balloon--1" color="#ff6b6b" />
        <CartoonBalloon className="games-balloon games-balloon--2" color="#4fc3f7" />
        <CartoonBalloon className="games-balloon games-balloon--3" color="#ffd54f" />
      </div>
      
      {/* Floating Panda */}
      <div className="games-panda">
        <PandaMascot size={80} mood="excited" />
      </div>
      
      <GamesCenter language={language} />
    </div>
  )
}
