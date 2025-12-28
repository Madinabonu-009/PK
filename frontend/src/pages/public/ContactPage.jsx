import { useLanguage } from '../../context/LanguageContext'
import { ContactForm } from '../../components/public'
import { PandaMascot, ScrollReveal } from '../../components/animations'
import './ContactPage.css'

const ContactPage = () => {
  const { t, language } = useLanguage()

  const texts = {
    uz: {
      heroSubtitle: 'Savollaringiz bormi? Biz bilan bog\'laning va tez orada javob oling',
      formDescription: 'Formani to\'ldiring va biz siz bilan tez orada bog\'lanamiz',
      contactInfoTitle: 'Aloqa ma\'lumotlari',
      addressText1: 'Buxoro viloyati, G\'ijduvon tumani',
      addressText2: 'Abdulla Qahhor mahallasi',
      socialTitle: 'Ijtimoiy tarmoqlar',
      workingHoursText1: 'Dushanba - Juma: 09:00 - 18:00',
      workingHoursText2: 'Shanba: 09:00 - 16:00',
      workingHoursText3: 'Yakshanba: Dam olish kuni',
      ourAddress: 'Bizning manzil',
      directions: 'Yo\'l ko\'rsatma:',
      directionsText: 'G\'ijduvon tumani markazidan Abdulla Qahhor mahallasi tomon yuring.'
    },
    ru: {
      heroSubtitle: 'Есть вопросы? Свяжитесь с нами и получите ответ в ближайшее время',
      formDescription: 'Заполните форму и мы свяжемся с вами в ближайшее время',
      contactInfoTitle: 'Контактная информация',
      addressText1: 'Бухарская область, Гиждуванский район',
      addressText2: 'Махалля Абдулла Каххор',
      socialTitle: 'Социальные сети',
      workingHoursText1: 'Понедельник - Пятница: 09:00 - 18:00',
      workingHoursText2: 'Суббота: 09:00 - 16:00',
      workingHoursText3: 'Воскресенье: Выходной',
      ourAddress: 'Наш адрес',
      directions: 'Как добраться:',
      directionsText: 'От центра Гиждуванского района идите в сторону махалли Абдулла Каххор.'
    },
    en: {
      heroSubtitle: 'Have questions? Contact us and get a response soon',
      formDescription: 'Fill out the form and we will contact you shortly',
      contactInfoTitle: 'Contact Information',
      addressText1: 'Bukhara region, Gijduvan district',
      addressText2: 'Abdulla Qahhor neighborhood',
      socialTitle: 'Social Networks',
      workingHoursText1: 'Monday - Friday: 09:00 - 18:00',
      workingHoursText2: 'Saturday: 09:00 - 16:00',
      workingHoursText3: 'Sunday: Day off',
      ourAddress: 'Our Address',
      directions: 'Directions:',
      directionsText: 'From Gijduvan district center, head towards Abdulla Qahhor neighborhood.'
    }
  }

  const txt = texts[language]

  return (
    <div className="contact-page">
      {/* Floating Panda */}
      <div className="contact-panda">
        <PandaMascot size={70} mood="wave" />
      </div>

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-container">
          <ScrollReveal>
            <h1 className="contact-title">{t('contactTitle')}</h1>
            <p className="contact-subtitle">{txt.heroSubtitle}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-content">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>{t('sendMessage')}</h2>
              <p className="form-description">{txt.formDescription}</p>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="contact-info-section">
              <h2>{txt.contactInfoTitle}</h2>
              
              <div className="contact-info-cards">
                <div className="info-card">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <h3>{t('address')}</h3>
                    <p>{txt.addressText1}</p>
                    <p>{txt.addressText2}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">📞</div>
                  <div className="info-content">
                    <h3>{t('phone')}</h3>
                    <p>
                      <a href="tel:+998945140949">+998 94 514 09 49</a>
                    </p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">✉️</div>
                  <div className="info-content">
                    <h3>{t('email')}</h3>
                    <p>
                      <a href="mailto:boymurodovamadinabonuf9@gmail.com">boymurodovamadinabonuf9@gmail.com</a>
                    </p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">💬</div>
                  <div className="info-content">
                    <h3>{txt.socialTitle}</h3>
                    <div className="social-links">
                      <a href="https://t.me/BMM_dina09" target="_blank" rel="noopener noreferrer" className="social-link telegram">
                        Telegram
                      </a>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">🕐</div>
                  <div className="info-content">
                    <h3>{t('workingHours')}</h3>
                    <p>{txt.workingHoursText1}</p>
                    <p>{txt.workingHoursText2}</p>
                    <p>{txt.workingHoursText3}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact-map-section">
        <div className="contact-container">
          <h2>{txt.ourAddress}</h2>
          <div className="map-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12244.88!2d64.6686!3d40.1036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f4d19b0b0b0b0b0%3A0x0!2sGijduvan%2C%20Bukhara%20Region!5e0!3m2!1sen!2suz!4v1703073600000!5m2!1sen!2suz"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Play Kids manzili - G'ijduvon"
            />
          </div>
          <div className="map-directions">
            <p>
              <strong>{txt.directions}</strong> {txt.directionsText}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
