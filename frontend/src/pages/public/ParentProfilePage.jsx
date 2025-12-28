// Ota-ona profil sahifasi
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './ParentProfilePage.css'

const ParentProfilePage = () => {
  const { language } = useLanguage()
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    children: []
  })
  const [editing, setEditing] = useState(false)

  const texts = {
    uz: {
      title: "Mening profilim",
      name: "Ism",
      phone: "Telefon",
      email: "Email",
      address: "Manzil",
      children: "Bolalarim",
      edit: "Tahrirlash",
      save: "Saqlash",
      cancel: "Bekor qilish",
      notifications: "Bildirishnomalar",
      notifDaily: "Kunlik hisobotlar",
      notifPayment: "To'lov eslatmalari",
      notifEvents: "Tadbirlar haqida",
      logout: "Chiqish"
    },
    ru: {
      title: "Мой профиль",
      name: "Имя",
      phone: "Телефон",
      email: "Email",
      address: "Адрес",
      children: "Мои дети",
      edit: "Редактировать",
      save: "Сохранить",
      cancel: "Отмена",
      notifications: "Уведомления",
      notifDaily: "Ежедневные отчёты",
      notifPayment: "Напоминания об оплате",
      notifEvents: "О мероприятиях",
      logout: "Выход"
    },
    en: {
      title: "My Profile",
      name: "Name",
      phone: "Phone",
      email: "Email",
      address: "Address",
      children: "My Children",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      notifications: "Notifications",
      notifDaily: "Daily reports",
      notifPayment: "Payment reminders",
      notifEvents: "About events",
      logout: "Logout"
    }
  }

  const txt = texts[language] || texts.uz

  useEffect(() => {
    // Load profile from localStorage
    const saved = localStorage.getItem('parentAuth')
    if (saved) {
      const data = JSON.parse(saved)
      setProfile(prev => ({
        ...prev,
        name: data.name || '',
        phone: data.phone || ''
      }))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('parentProfile', JSON.stringify(profile))
    setEditing(false)
  }

  return (
    <div className="parent-profile-page">
      <motion.div 
        className="profile-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="profile-header">
          <div className="avatar">
            <span>👤</span>
          </div>
          <h1>{txt.title}</h1>
        </div>

        <div className="profile-section">
          <h3>📋 {txt.name}</h3>
          {editing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
            />
          ) : (
            <p>{profile.name || '-'}</p>
          )}
        </div>

        <div className="profile-section">
          <h3>📞 {txt.phone}</h3>
          {editing ? (
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
            />
          ) : (
            <p>{profile.phone || '-'}</p>
          )}
        </div>

        <div className="profile-section">
          <h3>✉️ {txt.email}</h3>
          {editing ? (
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
            />
          ) : (
            <p>{profile.email || '-'}</p>
          )}
        </div>

        <div className="profile-section">
          <h3>📍 {txt.address}</h3>
          {editing ? (
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({...profile, address: e.target.value})}
            />
          ) : (
            <p>{profile.address || '-'}</p>
          )}
        </div>

        <div className="profile-section notifications">
          <h3>🔔 {txt.notifications}</h3>
          <label>
            <input type="checkbox" defaultChecked />
            {txt.notifDaily}
          </label>
          <label>
            <input type="checkbox" defaultChecked />
            {txt.notifPayment}
          </label>
          <label>
            <input type="checkbox" defaultChecked />
            {txt.notifEvents}
          </label>
        </div>

        <div className="profile-actions">
          {editing ? (
            <>
              <button className="save-btn" onClick={handleSave}>{txt.save}</button>
              <button className="cancel-btn" onClick={() => setEditing(false)}>{txt.cancel}</button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setEditing(true)}>{txt.edit}</button>
          )}
        </div>

        <button className="logout-btn">
          🚪 {txt.logout}
        </button>
      </motion.div>
    </div>
  )
}

export default ParentProfilePage
