import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import secureStorage from '../../utils/secureStorage';
import './AskTeacherChat.css';

// Tez-tez so'raladigan savollar (mini AI)
const FAQ_RESPONSES = {
  'menyu': 'Haftalik menyuni /menu sahifasidan ko\'rishingiz mumkin. Har kuni nonushta (08:30), tushlik (12:30) va poldnik (15:30) beriladi.',
  'vaqt': 'Bog\'cha ish vaqti: 07:00 - 18:00 (Dushanba - Shanba). Yakshanba dam olish kuni.',
  'to\'lov': 'To\'lov har oyning 1-10 kunlari orasida qabul qilinadi. To\'lov miqdori: 500,000 so\'m/oy.',
  'kasallik': 'Bola kasal bo\'lsa, iltimos oldindan xabar bering. Shifokor ma\'lumotnomasi kerak bo\'ladi.',
  'kiyim': 'Bolaga qulay sport kiyimi va almashtirish uchun qo\'shimcha kiyim olib keling.',
  'ovqat': 'Allergiya yoki maxsus ovqatlanish talablari bo\'lsa, admin bilan bog\'laning.',
  'guruh': 'Bog\'chamizda 3 ta guruh bor: Quyoshlar (2-3 yosh), Yulduzlar (3-4 yosh), Oylar (4-5 yosh).',
  'mashg\'ulot': 'Kunlik mashg\'ulotlar: sport, musiqa, rasm, ingliz tili, matematika asoslari.',
};

const AskTeacherChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [parentInfo, setParentInfo] = useState({ name: '', phone: '' });
  const [showForm, setShowForm] = useState(false);
  const [myQuestions, setMyQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // chat, history
  const [savedPhone, setSavedPhone] = useState(() => {
    try {
      return secureStorage.getItem('parentPhone') || ''
    } catch {
      return ''
    }
  });
  const messagesEndRef = useRef(null);

  // Quick topics
  const quickTopics = [
    { emoji: '🍽️', label: 'Menyu', key: 'menyu' },
    { emoji: '⏰', label: 'Ish vaqti', key: 'vaqt' },
    { emoji: '💰', label: 'To\'lov', key: 'to\'lov' },
    { emoji: '🤒', label: 'Kasallik', key: 'kasallik' },
    { emoji: '👕', label: 'Kiyim', key: 'kiyim' },
    { emoji: '👥', label: 'Guruhlar', key: 'guruh' },
  ];

  useEffect(() => {
    if (isOpen) {
      // Boshlang'ich xabar
      if (messages.length === 0) {
        setMessages([{
          id: 1,
          type: 'bot',
          text: '👋 Assalomu alaykum! Men Play Kids yordamchisiman. Savolingizni yozing yoki tez-tez so\'raladigan mavzulardan birini tanlang.',
          time: new Date()
        }]);
      }
      // Saqlangan telefon bilan savollarni yuklash
      if (savedPhone) {
        loadMyQuestions(savedPhone);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // O'z savollarini yuklash
  const loadMyQuestions = async (phone) => {
    if (!phone) return;
    try {
      // Telefon raqamni query parametr sifatida yuborish
      const response = await api.get(`/questions?phone=${encodeURIComponent(phone)}`);
      setMyQuestions(response.data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      setMyQuestions([]);
    }
  };

  // Javoblarni ko'rilgan deb belgilash
  const markQuestionsAsSeen = async () => {
    const unseenQuestions = myQuestions.filter(q => (q.status === 'answered' || q.answerText) && !q.seen);
    
    for (const q of unseenQuestions) {
      try {
        await api.put(`/questions/${q.id}/seen`);
      } catch (error) {
        console.error('Error marking as seen:', error);
      }
    }
    
    // Local state ni yangilash
    if (unseenQuestions.length > 0) {
      setMyQuestions(prev => prev.map(q => 
        unseenQuestions.find(uq => uq.id === q.id) ? { ...q, seen: true } : q
      ));
    }
  };

  // FAQ javobini topish
  const findFAQResponse = (text) => {
    const lowerText = text.toLowerCase();
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (lowerText.includes(key)) {
        return response;
      }
    }
    return null;
  };

  // Xabar yuborish
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      time: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const faqResponse = findFAQResponse(input);

    setTimeout(() => {
      if (faqResponse) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          text: faqResponse,
          time: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          text: 'Bu savol uchun o\'qituvchi bilan bog\'lanish kerak. Ma\'lumotlaringizni qoldiring, tez orada javob beramiz.',
          time: new Date()
        }]);
        setShowForm(true);
      }
      setIsTyping(false);
    }, 1000);
  };

  // Quick topic tanlash
  const handleQuickTopic = (key) => {
    const response = FAQ_RESPONSES[key];
    if (response) {
      setMessages(prev => [...prev, 
        { id: Date.now(), type: 'user', text: quickTopics.find(t => t.key === key)?.label || key, time: new Date() },
        { id: Date.now() + 1, type: 'bot', text: response, time: new Date() }
      ]);
    }
  };

  // O'qituvchiga savol yuborish
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // Questions API ga yuborish
      await api.post('/questions', {
        parentName: parentInfo.name,
        parentPhone: parentInfo.phone,
        question: messages.filter(m => m.type === 'user').map(m => m.text).join('\n'),
        status: 'pending'
      });

      // Telefon raqamni saqlash
      try {
        secureStorage.setItem('parentPhone', parentInfo.phone);
        setSavedPhone(parentInfo.phone);
      } catch (error) {
        console.error('Error saving phone to storage:', error)
      }

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text: '✅ Savolingiz qabul qilindi! O\'qituvchi tez orada javob beradi. Javobni "Mening savollarim" bo\'limida ko\'rishingiz mumkin.',
        time: new Date()
      }]);
      
      setShowForm(false);
      setParentInfo({ name: '', phone: '' });
      
      // Savollarni yangilash
      setTimeout(() => loadMyQuestions(parentInfo.phone), 1000);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text: '❌ Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.',
        time: new Date()
      }]);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="chat-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

          <motion.div className="ask-teacher-chat" initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.9 }} transition={{ type: 'spring', damping: 25 }}>
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">👩‍🏫</div>
                <div>
                  <h3>O'qituvchiga savol</h3>
                  <span className="online-status">🟢 Online</span>
                </div>
              </div>
              <button className="chat-close" onClick={onClose} aria-label="Chatni yopish">✕</button>
            </div>

            {/* Tabs */}
            <div className="chat-tabs">
              <button className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                💬 Chat
              </button>
              <button className={`chat-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); markQuestionsAsSeen(); }}>
                📋 Mening savollarim
                {myQuestions.filter(q => (q.status === 'answered' || q.answerText) && !q.seen).length > 0 && (
                  <span className="tab-badge">{myQuestions.filter(q => (q.status === 'answered' || q.answerText) && !q.seen).length}</span>
                )}
              </button>
            </div>

            {activeTab === 'chat' ? (
              <>
                {/* Messages */}
                <div className="chat-messages">
                  {messages.map((msg) => (
                    <motion.div key={msg.id} className={`chat-message ${msg.type}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="message-content">
                        <p>{msg.text}</p>
                        <span className="message-time">{formatTime(msg.time)}</span>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <div className="chat-message bot">
                      <div className="message-content typing"><span></span><span></span><span></span></div>
                    </div>
                  )}

                  {showForm && (
                    <motion.form className="contact-form" onSubmit={handleSubmitQuestion} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <input type="text" placeholder="Ismingiz" value={parentInfo.name} onChange={(e) => setParentInfo(p => ({ ...p, name: e.target.value }))} required />
                      <input type="tel" placeholder="Telefon raqam" value={parentInfo.phone} onChange={(e) => setParentInfo(p => ({ ...p, phone: e.target.value }))} required />
                      <button type="submit">📤 Yuborish</button>
                    </motion.form>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Topics */}
                <div className="quick-topics">
                  {quickTopics.map((topic) => (
                    <button key={topic.key} className="quick-topic-btn" onClick={() => handleQuickTopic(topic.key)}>
                      {topic.emoji} {topic.label}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="chat-input-container">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Savolingizni yozing..." />
                  <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>📤</button>
                </div>
              </>
            ) : (
              /* History Tab */
              <div className="chat-history">
                {!savedPhone ? (
                  <div className="history-login">
                    <p>Savollaringizni ko'rish uchun telefon raqamingizni kiriting:</p>
                    <form onSubmit={(e) => { 
                      e.preventDefault(); 
                      loadMyQuestions(savedPhone); 
                      try {
                        secureStorage.setItem('parentPhone', savedPhone);
                      } catch (error) {
                        console.error('Error saving phone:', error);
                      }
                    }}>
                      <input type="tel" placeholder="+998901234567" value={savedPhone} onChange={(e) => setSavedPhone(e.target.value)} />
                      <button type="submit">Tekshirish</button>
                    </form>
                  </div>
                ) : myQuestions.length === 0 ? (
                  <div className="history-empty">
                    <span>📭</span>
                    <p>Hali savollar yo'q</p>
                    <button onClick={() => setActiveTab('chat')}>Savol berish</button>
                  </div>
                ) : (
                  <div className="questions-list">
                    {myQuestions.map(q => (
                      <div key={q.id} className={`question-item ${q.status === 'answered' || q.answerText ? 'answered' : 'pending'}`}>
                        <div className="question-header">
                          <span className={`status ${q.status === 'answered' || q.answerText ? 'answered' : 'pending'}`}>
                            {q.status === 'answered' || q.answerText ? '✅ Javob berildi' : '⏳ Kutilmoqda'}
                          </span>
                          <span className="date">{formatDate(q.createdAt)}</span>
                        </div>
                        <p className="question-text">❓ {q.question || q.comment}</p>
                        
                        {/* Admin javobi */}
                        {q.answerText && (
                          <div className="answer-box">
                            <div className="answer-header">
                              <span>👩‍🏫 O'qituvchi</span>
                              <span className="answer-time">{formatDate(q.answeredAt)}</span>
                            </div>
                            <p>{q.answerText}</p>
                          </div>
                        )}
                        
                        {/* Eski format uchun */}
                        {q.messages && q.messages.filter(m => m.type === 'admin').map(msg => (
                          <div key={msg.id} className="answer-box">
                            <div className="answer-header">
                              <span>👩‍🏫 {msg.name || 'O\'qituvchi'}</span>
                              <span className="answer-time">{formatDate(msg.time)}</span>
                            </div>
                            <p>{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AskTeacherChat;