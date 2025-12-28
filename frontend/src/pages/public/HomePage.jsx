import { 
  Hero, 
  Benefits, 
  Testimonials,
  AdmissionBanner,
  DailyRoutine,
  Awards,
  FAQ
} from '../../components/public'
import { 
  WaveDivider, 
  BlobDivider,
  StoryCharacter,
  GrowingElement,
  useTimeOfDay,
  ScrollReveal,
  PandaMascot
} from '../../components/animations'
import './HomePage.css'

const HomePage = () => {
  const { mood } = useTimeOfDay()
  
  return (
    <div className={`home-page home-mood-${mood}`}>
      {/* Floating Panda Mascot */}
      <div className="floating-panda-mascot">
        <PandaMascot 
          size={80} 
          mood="happy" 
        />
      </div>
      
      {/* Floating Elements */}
      <AdmissionBanner variant="floating" />
      
      <Hero />
      
      <WaveDivider color="var(--bg-secondary)" animated />
      
      {/* Benefits */}
      <div className="story-section">
        <StoryCharacter emoji="🎨" action="wave" position="left" />
        <Benefits />
        <StoryCharacter emoji="📚" action="jump" position="right" />
      </div>
      
      <BlobDivider color="var(--bg-primary)" />
      
      {/* Daily Routine */}
      <ScrollReveal direction="up" delay={0.1}>
        <DailyRoutine />
      </ScrollReveal>
      
      <WaveDivider color="var(--bg-secondary)" animated />
      
      {/* Awards */}
      <ScrollReveal direction="up" delay={0.1}>
        <Awards />
      </ScrollReveal>
      
      <BlobDivider color="var(--bg-primary)" />
      
      {/* Testimonials */}
      <ScrollReveal direction="up" delay={0.2}>
        <GrowingElement startScale={0.85} endScale={1}>
          <div className="story-section">
            <StoryCharacter emoji="⭐" action="idle" position="right" />
            <Testimonials />
          </div>
        </GrowingElement>
      </ScrollReveal>
      
      <WaveDivider color="var(--bg-secondary)" flip />
      
      {/* FAQ */}
      <ScrollReveal direction="up" delay={0.1}>
        <FAQ />
      </ScrollReveal>
      
      {/* Admission Banner */}
      <AdmissionBanner variant="section" />
    </div>
  )
}

export default HomePage
