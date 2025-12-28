import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { adminTranslations } from '../../i18n/admin';
import './TelegramPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Professional SVG Icons
const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const UtensilsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const MegaphoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 13v-2z"/>
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const BeakerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 3h15"/>
    <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/>
    <path d="M6 14h12"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>
);

const TelegramPage = () => {
  const { language } = useLanguage();
  
  // i18n helper
  const t = (section, key) => adminTranslations[section]?.[language]?.[key] || adminTranslations[section]?.en?.[key] || key;
  
  const [loading, setLoading] = useState({});
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [announcement, setAnnouncement] = useState({ title: '', content: '', type: 'info' });
  const [event, setEvent] = useState({ title: '', date: '', time: '', location: '' });
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('quick');

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get('/telegram/status');
      setStatus(res.data);
    } catch (e) { console.error(e); }
  };

  const addResult = (action, success, msg) => {
    setResults(prev => [{ 
      id: Date.now(), 
      action, 
      success, 
      message: msg, 
      time: new Date().toLocaleTimeString('uz-UZ') 
    }, ...prev.slice(0, 9)]);
  };

  const sendRequest = async (endpoint, body = {}) => {
    setLoading(prev => ({ ...prev, [endpoint]: true }));
    try {
      const res = await api.post(`/telegram/${endpoint}`, body);
      addResult(endpoint, res.data.success, res.data.message);
    } catch (e) {
      addResult(endpoint, false, e.response?.data?.message || e.message);
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const handleTest = async () => {
    setLoading(prev => ({ ...prev, test: true }));
    try {
      const res = await api.get('/telegram/test');
      addResult('test', res.data.success, res.data.message);
    } catch (e) { 
      addResult('test', false, e.response?.data?.message || e.message); 
    } finally { 
      setLoading(prev => ({ ...prev, test: false })); 
    }
  };

  const quickActions = [
    { id: 'send-menu', Icon: UtensilsIcon, label: t('telegram', 'sendMenu'), desc: t('menu', 'todayMenu'), color: 'blue' },
    { id: 'send-attendance', Icon: BarChartIcon, label: t('telegram', 'sendAttendance'), desc: t('reports', 'title'), color: 'green' },
    { id: 'send-weekly-report', Icon: TrendingUpIcon, label: t('analytics', 'thisWeek'), desc: t('reports', 'title'), color: 'cyan' },
    { id: 'send-debts-reminder', Icon: DollarIcon, label: t('debts', 'title'), desc: t('debts', 'sendReminder'), color: 'orange' },
  ];

  const scheduleItems = [
    { Icon: UtensilsIcon, name: t('menu', 'todayMenu'), time: 'Har kuni 07:30', active: true },
    { Icon: BarChartIcon, name: t('attendance', 'attendanceReport'), time: 'Har kuni 18:00', active: true },
    { Icon: TrendingUpIcon, name: t('analytics', 'thisWeek'), time: 'Har juma 17:00', active: true },
    { Icon: DollarIcon, name: t('debts', 'sendReminder'), time: '5 va 15 sanasi', active: true },
  ];

  return (
    <div className="tg-page">
      {/* Header */}
      <div className="tg-header">
        <div className="tg-header-content">
          <div className="tg-header-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
            </svg>
          </div>
          <div className="tg-header-info">
            <h1>{t('telegram', 'title')}</h1>
            <p>{t('telegram', 'subtitle')}</p>
          </div>
        </div>
        <div className={`tg-status ${status?.configured ? 'active' : 'inactive'}`}>
          <span className="tg-status-dot"></span>
          <span>{status?.configured ? t('telegram', 'connected') : t('telegram', 'disconnected')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tg-tabs">
        <button className={`tg-tab ${activeTab === 'quick' ? 'active' : ''}`} onClick={() => setActiveTab('quick')}>
          <span><ZapIcon /></span> Tezkor
        </button>
        <button className={`tg-tab ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => setActiveTab('custom')}>
          <span><MailIcon /></span> Maxsus
        </button>
        <button className={`tg-tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          <span><ClockIcon /></span> Jadval
        </button>
      </div>

      <div className="tg-content">
        {/* Quick Actions Tab */}
        {activeTab === 'quick' && (
          <div className="tg-quick-section">
            <div className="tg-quick-grid">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  className={`tg-quick-btn ${action.color}`}
                  onClick={() => sendRequest(action.id)}
                  disabled={loading[action.id]}
                >
                  {loading[action.id] ? (
                    <div className="tg-spinner"></div>
                  ) : (
                    <>
                      <span className="tg-quick-icon"><action.Icon /></span>
                      <span className="tg-quick-label">{action.label}</span>
                      <span className="tg-quick-desc">{action.desc}</span>
                    </>
                  )}
                </button>
              ))}
            </div>

            <button 
              className="tg-test-btn" 
              onClick={handleTest} 
              disabled={loading.test}
            >
              {loading.test ? <div className="tg-spinner"></div> : <><BeakerIcon /> Test Xabar Yuborish</>}
            </button>

            {/* Results */}
            <div className="tg-results">
              <h3><ClipboardIcon /> So'nggi natijalar</h3>
              {results.length === 0 ? (
                <p className="tg-no-results">Hali natijalar yo'q</p>
              ) : (
                <div className="tg-results-list">
                  {results.map(r => (
                    <div key={r.id} className={`tg-result ${r.success ? 'success' : 'error'}`}>
                      <span className="tg-result-icon">{r.success ? <CheckCircleIcon /> : <XCircleIcon />}</span>
                      <span className="tg-result-action">{r.action}</span>
                      <span className="tg-result-msg">{r.message}</span>
                      <span className="tg-result-time">{r.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Messages Tab */}
        {activeTab === 'custom' && (
          <div className="tg-custom-section">
            {/* Simple Message */}
            <div className="tg-card">
              <div className="tg-card-header">
                <span className="tg-card-icon"><MailIcon /></span>
                <h3>Oddiy Xabar</h3>
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Xabar matnini kiriting..."
                rows={4}
              />
              <button
                className="tg-send-btn"
                onClick={() => { sendRequest('send-message', { message }); setMessage(''); }}
                disabled={loading['send-message'] || !message.trim()}
              >
                {loading['send-message'] ? <div className="tg-spinner"></div> : <><SendIcon /> Yuborish</>}
              </button>
            </div>

            {/* Announcement */}
            <div className="tg-card">
              <div className="tg-card-header">
                <span className="tg-card-icon"><MegaphoneIcon /></span>
                <h3>E'lon</h3>
              </div>
              <input
                type="text"
                value={announcement.title}
                onChange={e => setAnnouncement(p => ({ ...p, title: e.target.value }))}
                placeholder="E'lon sarlavhasi"
              />
              <textarea
                value={announcement.content}
                onChange={e => setAnnouncement(p => ({ ...p, content: e.target.value }))}
                placeholder="E'lon matni"
                rows={3}
              />
              <select
                value={announcement.type}
                onChange={e => setAnnouncement(p => ({ ...p, type: e.target.value }))}
              >
                <option value="info">Ma'lumot</option>
                <option value="warning">Ogohlantirish</option>
                <option value="success">Muvaffaqiyat</option>
                <option value="event">Tadbir</option>
                <option value="urgent">Shoshilinch</option>
              </select>
              <button
                className="tg-send-btn"
                onClick={() => { 
                  sendRequest('send-announcement', announcement); 
                  setAnnouncement({ title: '', content: '', type: 'info' }); 
                }}
                disabled={!announcement.title.trim() || !announcement.content.trim()}
              >
                {loading['send-announcement'] ? <div className="tg-spinner"></div> : <><SendIcon /> E'lon Yuborish</>}
              </button>
            </div>

            {/* Event */}
            <div className="tg-card">
              <div className="tg-card-header">
                <span className="tg-card-icon"><CalendarIcon /></span>
                <h3>Tadbir Eslatmasi</h3>
              </div>
              <input
                type="text"
                value={event.title}
                onChange={e => setEvent(p => ({ ...p, title: e.target.value }))}
                placeholder="Tadbir nomi"
              />
              <div className="tg-form-row">
                <input
                  type="date"
                  value={event.date}
                  onChange={e => setEvent(p => ({ ...p, date: e.target.value }))}
                />
                <input
                  type="time"
                  value={event.time}
                  onChange={e => setEvent(p => ({ ...p, time: e.target.value }))}
                />
              </div>
              <input
                type="text"
                value={event.location}
                onChange={e => setEvent(p => ({ ...p, location: e.target.value }))}
                placeholder="Joy (ixtiyoriy)"
              />
              <button
                className="tg-send-btn"
                onClick={() => { 
                  sendRequest('send-event', { event }); 
                  setEvent({ title: '', date: '', time: '', location: '' }); 
                }}
                disabled={!event.title.trim() || !event.date}
              >
                {loading['send-event'] ? <div className="tg-spinner"></div> : <><SendIcon /> Tadbir Yuborish</>}
              </button>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="tg-schedule-section">
            <div className="tg-card">
              <div className="tg-card-header">
                <span className="tg-card-icon"><ClockIcon /></span>
                <h3>Avtomatik Xabarlar Jadvali</h3>
              </div>
              <div className="tg-schedule-list">
                {scheduleItems.map((item, idx) => (
                  <div key={idx} className="tg-schedule-item">
                    <span className="tg-schedule-icon"><item.Icon /></span>
                    <div className="tg-schedule-info">
                      <span className="tg-schedule-name">{item.name}</span>
                      <span className="tg-schedule-time">{item.time}</span>
                    </div>
                    <span className={`tg-schedule-status ${item.active ? 'active' : ''}`}>
                      {item.active ? <CheckCircleIcon /> : <XCircleIcon />}
                    </span>
                  </div>
                ))}
              </div>
              <p className="tg-schedule-note">
                <LightbulbIcon /> Avtomatik xabarlar server tomonidan yuboriladi
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramPage;
