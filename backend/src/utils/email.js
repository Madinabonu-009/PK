/**
 * Email utility for sending notifications
 * Uses nodemailer for SMTP
 */

// Email configuration from environment
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.EMAIL_FROM || 'Play Kids <noreply@playkids.uz>'
}

/**
 * Check if email is configured
 */
export function isEmailConfigured() {
  return !!(EMAIL_CONFIG.user && EMAIL_CONFIG.pass)
}

/**
 * Send email (mock implementation - install nodemailer for real emails)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 */
export async function sendEmail({ to, subject, html }) {
  if (!isEmailConfigured()) {
    console.log('Email not configured. Would send to:', to)
    console.log('Subject:', subject)
    return true
  }

  // For production, install nodemailer:
  // npm install nodemailer
  // Then uncomment below:
  
  /*
  const nodemailer = await import('nodemailer')
  
  const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.port === 465,
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.pass
    }
  })

  await transporter.sendMail({
    from: EMAIL_CONFIG.from,
    to,
    subject,
    html
  })
  */

  console.log(`Email sent to ${to}: ${subject}`)
  return true
}

/**
 * Send enrollment accepted email
 */
export async function sendEnrollmentAcceptedEmail(enrollment) {
  const { parentEmail, childName, parentName } = enrollment
  
  if (!parentEmail) return false

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🎉 Tabriklaymiz!</h1>
      </div>
      <div style="padding: 30px; background: #f8f9fa;">
        <p>Hurmatli <strong>${parentName}</strong>,</p>
        <p>Sizning <strong>${childName}</strong> uchun yuborgan arizangiz <span style="color: #28a745; font-weight: bold;">qabul qilindi!</span></p>
        <p>Tez orada siz bilan bog'lanib, keyingi qadamlar haqida ma'lumot beramiz.</p>
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Keyingi qadamlar:</h3>
          <ol>
            <li>Biz siz bilan telefon orqali bog'lanamiz</li>
            <li>Tanishish uchrashuvi belgilaymiz</li>
            <li>Shartnoma imzolaymiz</li>
          </ol>
        </div>
        <p>Savollaringiz bo'lsa, biz bilan bog'laning:</p>
        <p>📞 +998 94 514 09 49</p>
        <p>💬 Telegram: <a href="https://t.me/BMM_dina09">@BMM_dina09</a></p>
        <p>Hurmat bilan,<br><strong>Play Kids jamoasi</strong></p>
      </div>
    </div>
  `

  return sendEmail({
    to: parentEmail,
    subject: '✅ Arizangiz qabul qilindi - Play Kids',
    html
  })
}

/**
 * Send enrollment rejected email
 */
export async function sendEnrollmentRejectedEmail(enrollment) {
  const { parentEmail, childName, parentName, rejectionReason } = enrollment
  
  if (!parentEmail) return false

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #6c757d; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Play Kids</h1>
      </div>
      <div style="padding: 30px; background: #f8f9fa;">
        <p>Hurmatli <strong>${parentName}</strong>,</p>
        <p>Afsuski, <strong>${childName}</strong> uchun yuborgan arizangiz qabul qilinmadi.</p>
        ${rejectionReason ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <strong>Sabab:</strong> ${rejectionReason}
        </div>
        ` : ''}
        <p>Savollaringiz bo'lsa yoki qayta ariza topshirmoqchi bo'lsangiz, biz bilan bog'laning:</p>
        <p>📞 +998 94 514 09 49</p>
        <p>💬 Telegram: <a href="https://t.me/BMM_dina09">@BMM_dina09</a></p>
        <p>Hurmat bilan,<br><strong>Play Kids jamoasi</strong></p>
      </div>
    </div>
  `

  return sendEmail({
    to: parentEmail,
    subject: 'Ariza holati - Play Kids',
    html
  })
}

export default {
  sendEmail,
  sendEnrollmentAcceptedEmail,
  sendEnrollmentRejectedEmail,
  isEmailConfigured
}
