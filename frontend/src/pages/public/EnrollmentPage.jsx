import { useLanguage } from '../../context/LanguageContext'
import { Card } from '../../components/common'
import EnrollmentForm from '../../components/public/EnrollmentForm'
import EnrollmentStatus from '../../components/public/EnrollmentStatus'
import './EnrollmentPage.css'

const EnrollmentPage = () => {
  const { t, language } = useLanguage()

  const texts = {
    uz: {
      subtitle: 'Farzandingizni Play Kids bog\'chasiga ro\'yxatdan o\'tkazing',
      whyPlayKids: 'Nima uchun Play Kids?',
      modernEducation: 'Zamonaviy ta\'lim',
      modernEducationDesc: 'Montessori va STEAM metodologiyalari',
      smallGroups: 'Kichik guruhlar',
      smallGroupsDesc: 'Har bir bolaga individual yondashuv',
      healthyFood: 'Sog\'lom ovqatlanish',
      healthyFoodDesc: 'Dietolog tomonidan tuzilgan menyu',
      safeEnvironment: 'Xavfsiz muhit',
      safeEnvironmentDesc: '24/7 kuzatuv va xavfsizlik tizimlari',
      processTitle: 'Ro\'yxatdan o\'tish jarayoni',
      step1Title: 'Ariza to\'ldiring',
      step1Desc: 'Forma orqali ma\'lumotlarni kiriting',
      step2Title: 'Biz bog\'lanamiz',
      step2Desc: '24 soat ichida javob beramiz',
      step3Title: 'Tanishish uchrashuvi',
      step3Desc: 'Bog\'cha bilan tanishing',
      step4Title: 'Qabul',
      step4Desc: 'Shartnoma imzolash va boshlash',
      formTitle: 'Ariza formasi',
      formSubtitle: 'Barcha maydonlarni to\'ldiring'
    },
    ru: {
      subtitle: 'Запишите вашего ребенка в детский сад Play Kids',
      whyPlayKids: 'Почему Play Kids?',
      modernEducation: 'Современное образование',
      modernEducationDesc: 'Методологии Монтессори и STEAM',
      smallGroups: 'Маленькие группы',
      smallGroupsDesc: 'Индивидуальный подход к каждому ребенку',
      healthyFood: 'Здоровое питание',
      healthyFoodDesc: 'Меню составлено диетологом',
      safeEnvironment: 'Безопасная среда',
      safeEnvironmentDesc: 'Круглосуточное наблюдение и системы безопасности',
      processTitle: 'Процесс записи',
      step1Title: 'Заполните заявку',
      step1Desc: 'Введите данные через форму',
      step2Title: 'Мы свяжемся',
      step2Desc: 'Ответим в течение 24 часов',
      step3Title: 'Ознакомительная встреча',
      step3Desc: 'Познакомьтесь с детским садом',
      step4Title: 'Прием',
      step4Desc: 'Подписание договора и начало',
      formTitle: 'Форма заявки',
      formSubtitle: 'Заполните все поля'
    },
    en: {
      subtitle: 'Enroll your child in Play Kids kindergarten',
      whyPlayKids: 'Why Play Kids?',
      modernEducation: 'Modern Education',
      modernEducationDesc: 'Montessori and STEAM methodologies',
      smallGroups: 'Small Groups',
      smallGroupsDesc: 'Individual approach to each child',
      healthyFood: 'Healthy Food',
      healthyFoodDesc: 'Menu designed by a dietitian',
      safeEnvironment: 'Safe Environment',
      safeEnvironmentDesc: '24/7 monitoring and security systems',
      processTitle: 'Enrollment Process',
      step1Title: 'Fill out application',
      step1Desc: 'Enter information through the form',
      step2Title: 'We will contact you',
      step2Desc: 'We will respond within 24 hours',
      step3Title: 'Introduction meeting',
      step3Desc: 'Get to know the kindergarten',
      step4Title: 'Admission',
      step4Desc: 'Sign contract and start',
      formTitle: 'Application Form',
      formSubtitle: 'Fill in all fields'
    }
  }

  const txt = texts[language]

  return (
    <div className="enrollment-page">
      <section className="enrollment-hero">
        <div className="container">
          <h1>{t('enrollmentTitle')}</h1>
          <p>{txt.subtitle}</p>
        </div>
      </section>

      <section className="enrollment-content">
        <div className="container">
          <div className="enrollment-grid">
            <div className="enrollment-info">
              <Card>
                <Card.Body>
                  <h2>{txt.whyPlayKids}</h2>
                  <ul className="benefits-list">
                    <li>
                      <span className="benefit-icon">🎓</span>
                      <div>
                        <strong>{txt.modernEducation}</strong>
                        <p>{txt.modernEducationDesc}</p>
                      </div>
                    </li>
                    <li>
                      <span className="benefit-icon">👨‍👩‍👧</span>
                      <div>
                        <strong>{txt.smallGroups}</strong>
                        <p>{txt.smallGroupsDesc}</p>
                      </div>
                    </li>
                    <li>
                      <span className="benefit-icon">🍎</span>
                      <div>
                        <strong>{txt.healthyFood}</strong>
                        <p>{txt.healthyFoodDesc}</p>
                      </div>
                    </li>
                    <li>
                      <span className="benefit-icon">🏠</span>
                      <div>
                        <strong>{txt.safeEnvironment}</strong>
                        <p>{txt.safeEnvironmentDesc}</p>
                      </div>
                    </li>
                  </ul>
                </Card.Body>
              </Card>

              <Card className="process-card">
                <Card.Body>
                  <h3>{txt.processTitle}</h3>
                  <ol className="process-list">
                    <li>
                      <span className="step-number">1</span>
                      <div>
                        <strong>{txt.step1Title}</strong>
                        <p>{txt.step1Desc}</p>
                      </div>
                    </li>
                    <li>
                      <span className="step-number">2</span>
                      <div>
                        <strong>{txt.step2Title}</strong>
                        <p>{txt.step2Desc}</p>
                      </div>
                    </li>
                    <li>
                      <span className="step-number">3</span>
                      <div>
                        <strong>{txt.step3Title}</strong>
                        <p>{txt.step3Desc}</p>
                      </div>
                    </li>
                    <li>
                      <span className="step-number">4</span>
                      <div>
                        <strong>{txt.step4Title}</strong>
                        <p>{txt.step4Desc}</p>
                      </div>
                    </li>
                  </ol>
                </Card.Body>
              </Card>
            </div>

            <div className="enrollment-form-section">
              <Card>
                <Card.Header>
                  <h2>{txt.formTitle}</h2>
                  <p>{txt.formSubtitle}</p>
                </Card.Header>
                <Card.Body>
                  <EnrollmentForm />
                </Card.Body>
              </Card>
              
              <EnrollmentStatus />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EnrollmentPage
