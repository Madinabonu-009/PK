import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ChatPage.css';

// Professional SVG Icons
const MessageCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const CircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <circle cx="12" cy="12" r="6"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ThumbsUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const InboxIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, answered
  const messagesEndRef = useRef(null);

  // Savollarni yuklash
  useEffect(() => {
    loadConversations();
    // Har 30 sekundda yangilash
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      // Questions API dan barcha savollarni olish
      const response = await api.get('/questions/all');
      const questions = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      
      setConversations(questions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setConversations([]);
      setLoading(false);
    }
  };

  // Conversation tanlash
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    // Xabarlarni yuklash
    const initialMessages = [
      {
        id: 1,
        type: 'parent',
        text: conv.question,
        time: conv.createdAt,
        name: conv.parentName || 'Ota-ona'
      }
    ];
    
    // Agar javob berilgan bo'lsa
    if (conv.answerText) {
      initialMessages.push({
        id: 2,
        type: 'admin',
        text: conv.answerText,
        time: conv.answeredAt,
        name: conv.answeredBy || 'Admin'
      });
    }
    
    setMessages(initialMessages);
  };

  // Javob yuborish
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Backend ga saqlash - questions API
    try {
      await api.put(`/questions/${selectedConversation.id}/answer`, {
        answerText: newMessage
      });

      const message = {
        id: Date.now(),
        type: 'admin',
        text: newMessage,
        time: new Date().toISOString(),
        name: user?.name || 'Admin'
      };

      // Xabarni qo'shish
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Conversations ni yangilash
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, status: 'answered', answerText: newMessage, answeredAt: new Date().toISOString() }
          : c
      ));
      
      setSelectedConversation(prev => ({ ...prev, status: 'answered', answerText: newMessage }));
    } catch (error) {
      console.error('Error sending message:', error);
    }

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Filtrlash
  const filteredConversations = conversations.filter(c => {
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'answered') return c.status === 'answered';
    return true;
  });

  // Vaqtni formatlash
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Hozirgina';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} daqiqa oldin`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} soat oldin`;
    
    return date.toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading-state">
          <span className="loading-spinner"><LoaderIcon /></span>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Sidebar - Conversations list */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2><MessageCircleIcon /> Savollar</h2>
          <span className="pending-badge">
            {conversations.filter(c => c.status === 'pending').length} ta yangi
          </span>
        </div>

        {/* Filter */}
        <div className="chat-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Hammasi ({conversations.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <CircleIcon /> Kutilmoqda
          </button>
          <button 
            className={`filter-btn ${filter === 'answered' ? 'active' : ''}`}
            onClick={() => setFilter('answered')}
          >
            <CheckCircleIcon /> Javob berilgan
          </button>
        </div>

        {/* Conversations list */}
        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="empty-state">
              <span><InboxIcon /></span>
              <p>Savollar yo'q</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <motion.div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.status === 'pending' ? 'pending' : ''}`}
                onClick={() => handleSelectConversation(conv)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="conv-avatar">
                  {conv.parentName?.[0]?.toUpperCase() || <UserIcon />}
                </div>
                <div className="conv-info">
                  <div className="conv-header">
                    <span className="conv-name">{conv.parentName || 'Ota-ona'}</span>
                    <span className="conv-time">{formatTime(conv.createdAt)}</span>
                  </div>
                  <p className="conv-preview">
                    {conv.question?.slice(0, 50)}...
                  </p>
                  <div className="conv-meta">
                    <span className="conv-phone"><PhoneIcon /> {conv.parentPhone}</span>
                    {conv.status === 'pending' && (
                      <span className="status-badge pending">Yangi</span>
                    )}
                    {conv.status === 'answered' && (
                      <span className="status-badge answered">Javob berilgan</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="chat-main">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="user-avatar">
                  {selectedConversation.parentName?.[0]?.toUpperCase() || <UserIcon />}
                </div>
                <div>
                  <h3>{selectedConversation.parentName || 'Ota-ona'}</h3>
                  <span className="user-phone"><PhoneIcon /> {selectedConversation.parentPhone}</span>
                </div>
              </div>
              <div className="chat-actions">
                <span className={`status-indicator ${selectedConversation.status === 'answered' ? 'answered' : 'pending'}`}>
                  {selectedConversation.status === 'pending' ? <><CircleIcon /> Javob kutilmoqda</> : <><CheckCircleIcon /> Javob berilgan</>}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id || index}
                    className={`message ${msg.type}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-name">
                          {msg.type === 'parent' ? <UsersIcon /> : <UserIcon />}
                          {' '}{msg.name}
                        </span>
                        <span className="message-time">{formatTime(msg.time)}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <div className="quick-replies">
                <button onClick={() => setNewMessage('Rahmat savolingiz uchun! ')}>
                  <ThumbsUpIcon /> Rahmat
                </button>
                <button onClick={() => setNewMessage('Tez orada javob beramiz. ')}>
                  <ClockIcon /> Kutib turing
                </button>
                <button onClick={() => setNewMessage('Admin bilan bog\'laning: +998 94 514 09 49 ')}>
                  <PhoneIcon /> Qo'ng'iroq
                </button>
              </div>
              <div className="input-container">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Javob yozing..."
                  rows={2}
                />
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <SendIcon /> Yuborish
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-selection">
            <div className="no-selection-content">
              <span className="icon"><MessageCircleIcon /></span>
              <h3>Suhbatni tanlang</h3>
              <p>Chap tarafdan savolni tanlang va javob bering</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
