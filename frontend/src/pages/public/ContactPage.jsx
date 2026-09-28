import { useLanguage } from '../../context/LanguageContext'
import { ContactForm } from '../../components/public'
import { PandaMascot, ScrollReveal } from '../../components/animations'
import './ContactPage.css'

const ContactPage = () => {
  const { language } = useLanguage()

  const texts = {
    uz: {
      contactTitle: 'Biz bilan bog\'laning',
      heroSubtitle: 'Savollaringiz bormi? Biz bilan bog\'laning va tez orada javob oling',
      sendMessage: 'Xabar yuborish',
      formDescription: 'Formani to\'ldiring va biz siz bilan tez orada bog\'lanamiz',
      contactInfoTitle: 'Aloqa ma\'lumotlari',
      address: 'Manzil',
      addressText1: 'Buxoro viloyati, G\'ijduvon tumani',
      addressText2: 'Abdulla Qahhor mahallasi',
      phone: 'Telefon',
      email: 'Email',
      socialTitle: 'Ijtimoiy tarmoqlar',
      workingHours: 'Ish vaqti',
      workingHoursText1: 'Dushanba - Juma: 09:00 - 18:00',
      workingHoursText2: 'Shanba: 09:00 - 16:00',
      workingHoursText3: 'Yakshanba: Dam olish kuni'
    },
    ru: {
      contactTitle: 'Свяжитесь с нами',
      heroSubtitle: 'Есть вопросы? Свяжитесь с нами и получите ответ в ближайшее время',
      sendMessage: 'Отправить сообщение',
      formDescription: 'Заполните форму и мы свяжемся с вами в ближайшее время',
      contactInfoTitle: 'Контактная информация',
      address: 'Адрес',
      addressText1: 'Бухарская область, Гиждуванский район',
      addressText2: 'Махалля Абдулла Каххор',
      phone: 'Телефон',
      email: 'Эл. почта',
      socialTitle: 'Социальные сети',
      workingHours: 'Время работы',
      workingHoursText1: 'Понедельник - Пятница: 09:00 - 18:00',
      workingHoursText2: 'Суббота: 09:00 - 16:00',
      workingHoursText3: 'Воскресенье: Выходной'
    },
    en: {
      contactTitle: 'Contact Us',
      heroSubtitle: 'Have questions? Contact us and get a response soon',
      sendMessage: 'Send Message',
      formDescription: 'Fill out the form and we will contact you shortly',
      contactInfoTitle: 'Contact Information',
      address: 'Address',
      addressText1: 'Bukhara region, Gijduvan district',
      addressText2: 'Abdulla Qahhor neighborhood',
      phone: 'Phone',
      email: 'Email',
      socialTitle: 'Social Networks',
      workingHours: 'Working Hours',
      workingHoursText1: 'Monday - Friday: 09:00 - 18:00',
      workingHoursText2: 'Saturday: 09:00 - 16:00',
      workingHoursText3: 'Sunday: Day off'
    }
  }

  const txt = texts[language] || texts.uz

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
            <h1 className="contact-title">{txt.contactTitle}</h1>
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
              <h2>{txt.sendMessage}</h2>
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
                    <h3>{txt.address}</h3>
                    <p>{txt.addressText1}</p>
                    <p>{txt.addressText2}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">📞</div>
                  <div className="info-content">
                    <h3>{txt.phone}</h3>
                    <p>
                      <a href="tel:+998945140949">+998 94 514 09 49</a>
                    </p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">✉️</div>
                  <div className="info-content">
                    <h3>{txt.email}</h3>
                    <p>
                      <a href="mailto:boymurodovamadinabonu009@gmail.com">boymurodovamadinabonu009@gmail.com</a>
                    </p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">💬</div>
                  <div className="info-content">
                    <h3>{txt.socialTitle}</h3>
                    <div className="social-links">
                      <a href="https://t.me/play_kids_bot" target="_blank" rel="noopener noreferrer" className="social-link telegram">
                        Telegram Bot @play_kids_bot
                      </a>
                      <a href="https://t.me/BMM_dina09" target="_blank" rel="noopener noreferrer" className="social-link telegram">
                        Telegram (Admin)
                      </a>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">🕐</div>
                  <div className="info-content">
                    <h3>{txt.workingHours}</h3>
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

    </div>
  )
}

export default ContactPage
