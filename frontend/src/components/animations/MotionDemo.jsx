/**
 * 🎬 MOTION UX DEMO
 * Barcha ultra motion effektlarni ko'rsatish
 */

import { useState } from 'react'
import PageBreathing from './PageBreathing'
import GravityUI from './GravityUI'
import UIMorphing, { MorphButton } from './UIMorphing'
import AnticipationUI, { AnticipationList } from './AnticipationUI'
import CinematicTransition from './CinematicTransition'
import './MotionDemo.css'

function MotionDemo() {
  const [showModal, setShowModal] = useState(false)
  const [activeSection, setActiveSection] = useState('breathing')
  
  return (
    <PageBreathing intensity="gentle">
      <div className="motion-demo">
        <header className="demo-header">
          <h1>Ultra Motion UX Demo</h1>
          <p>Bolalar sahifalari uchun premium animatsiyalar</p>
        </header>
        
        {/* Navigation */}
        <nav className="demo-nav">
          {['breathing', 'gravity', 'morphing', 'anticipation', 'cinematic'].map(section => (
            <GravityUI key={section} intensity="subtle">
              <button 
                className={`nav-btn ${activeSection === section ? 'active' : ''}`}
                onClick={() => setActiveSection(section)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            </GravityUI>
          ))}
        </nav>
        
        {/* Sections */}
        <main className="demo-content">
          {/* 1. Page Breathing */}
          {activeSection === 'breathing' && (
            <section className="demo-section">
              <h2>🌌 Page Breathing</h2>
              <p>Sahifa tirikdek "nafas olayotgandek" seziladi</p>
              <div className="demo-box breathing-demo">
                <p>Bu sahifa sekin nafas olmoqda...</p>
                <p>12-15 sekund loop, scale: 1 → 1.01 → 1</p>
                <p>Harakat deyarli sezilmaydi, lekin his qilinadi</p>
              </div>
              <div className="demo-info">
                <code>{'<PageBreathing intensity="gentle">'}</code>
              </div>
            </section>
          )}
          
          {/* 2. Gravity UI */}
          {activeSection === 'gravity' && (
            <section className="demo-section">
              <h2>🧲 Gravity UI</h2>
              <p>UI elementlar sichqonchani sezadi</p>
              <div className="gravity-demo-grid">
                <GravityUI intensity="subtle">
                  <div className="gravity-card">
                    <h3>Subtle</h3>
                    <p>4px max siljish</p>
                  </div>
                </GravityUI>
                <GravityUI intensity="normal">
                  <div className="gravity-card">
                    <h3>Normal</h3>
                    <p>6px max siljish</p>
                  </div>
                </GravityUI>
                <GravityUI intensity="strong">
                  <div className="gravity-card">
                    <h3>Strong</h3>
                    <p>8px max siljish</p>
                  </div>
                </GravityUI>
              </div>
              <div className="demo-info">
                <code>{'<GravityUI intensity="normal" radius={200}>'}</code>
              </div>
            </section>
          )}
          
          {/* 3. UI Morphing */}
          {activeSection === 'morphing' && (
            <section className="demo-section">
              <h2>🪄 UI Morphing</h2>
              <p>Tugma → karta → sahifa o'tishi MORPH orqali</p>
              <div className="morph-demo">
                <MorphButton
                  expandTo={({ resetMorph }) => (
                    <div className="morph-expanded-form">
                      <h3>Ro'yxatdan o'tish</h3>
                      <input type="text" placeholder="Ismingiz" />
                      <input type="email" placeholder="Email" />
                      <div className="morph-form-actions">
                        <button className="btn-primary">Yuborish</button>
                        <button className="btn-secondary" onClick={resetMorph}>Bekor</button>
                      </div>
                    </div>
                  )}
                  duration={600}
                >
                  Boshlash
                </MorphButton>
              </div>
              <div className="demo-info">
                <code>{'<MorphButton expandTo={FormComponent}>'}</code>
              </div>
            </section>
          )}
          
          {/* 4. Anticipation UI */}
          {activeSection === 'anticipation' && (
            <section className="demo-section">
              <h2>🧠 Anticipation UI</h2>
              <p>UI foydalanuvchini oldindan sezadi</p>
              <p className="demo-hint">Sahifani scroll qiling va elementlarni kuzating</p>
              <AnticipationList stagger={50}>
                {[1, 2, 3, 4, 5].map(i => (
                  <AnticipationUI key={i} intensity="normal">
                    <div className="anticipation-card">
                      <h3>Element {i}</h3>
                      <p>Scroll qilganda oldindan sezadi</p>
                    </div>
                  </AnticipationUI>
                ))}
              </AnticipationList>
              <div className="demo-info">
                <code>{'<AnticipationUI anticipateDirection="down">'}</code>
              </div>
            </section>
          )}
          
          {/* 5. Cinematic Transition */}
          {activeSection === 'cinematic' && (
            <section className="demo-section">
              <h2>🎥 Cinematic Transition</h2>
              <p>Sahifa emas, SAHNA almashsin</p>
              <div className="cinematic-demo">
                <button 
                  className="cinematic-trigger"
                  onClick={() => setShowModal(true)}
                >
                  Sahnani ochish
                </button>
                
                <CinematicTransition isVisible={showModal} duration={800}>
                  <div className="cinematic-modal">
                    <h3>Yangi Sahna</h3>
                    <p>Fade + scale + blur kombinatsiyasi</p>
                    <p>600-900ms davomiylik</p>
                    <button onClick={() => setShowModal(false)}>Yopish</button>
                  </div>
                </CinematicTransition>
              </div>
              <div className="demo-info">
                <code>{'<CinematicTransition isVisible={show} duration={800}>'}</code>
              </div>
            </section>
          )}
        </main>
        
        {/* Footer */}
        <footer className="demo-footer">
          <p>⚠️ Bu effektlar faqat bolalar sahifalari uchun</p>
          <p>Admin panel uchun TAQIQLANGAN</p>
        </footer>
      </div>
    </PageBreathing>
  )
}

export default MotionDemo
