import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { escapeHtml } from '../../utils/sanitize'
import api from '../../services/api'
import './SmartAssistant.css'

// AI tahlil funksiyalari
const analyzeData = (stats, alerts, children, debts, attendance) => {
  const insights = []
  const recommendations = []
  const warnings = []
  
  // 1. Davomat tahlili
  if (alerts.absentChildren?.length > 0) {
    const avgAbsent = alerts.absentChildren.reduce((sum, c) => sum + c.daysAbsent, 0) / alerts.absentChildren.length
    warnings.push({
      type: 'attendance',
      severity: avgAbsent > 5 ? 'high' : 'medium',
      message: `${alerts.absentChildren.length} ta bola uzoq vaqt kelmagan (o'rtacha ${avgAbsent.toFixed(0)} kun)`
    })
    recommendations.push('Ota-onalar bilan bog\'lanib, sababini aniqlang')
  }
  
  // 2. Moliyaviy tahlil
  if (alerts.debtors?.length > 0) {
    const totalDebt = alerts.debtors.reduce((sum, d) => sum + (d.amount || 0), 0)
    warnings.push({
      type: 'finance',
      severity: totalDebt > 5000000 ? 'high' : 'medium',
      message: `Jami qarzdorlik: ${(totalDebt / 1000000).toFixed(1)}M so'm (${alerts.debtors.length} ta oila)`
    })
    if (alerts.debtors.length > 3) {
      recommendations.push('Ommaviy eslatma yuborish tavsiya etiladi')
    }
  }
  
  // 3. Guruh to'ldirilishi
  if (stats.groupStats) {
    stats.groupStats.forEach(g => {
      const fillRate = g.capacity ? (g.childCount / g.capacity) * 100 : 0
      if (fillRate > 90) {
        insights.push(`${g.name} guruhi deyarli to'lgan (${fillRate.toFixed(0)}%)`)
      } else if (fillRate < 50 && g.capacity) {
        insights.push(`${g.name} guruhida joy ko'p (${g.childCount}/${g.capacity})`)
      }
    })
  }
  
  // 4. Arizalar tahlili
  if (stats.pendingEnrollments > 5) {
    warnings.push({
      type: 'enrollments',
      severity: 'medium',
      message: `${stats.pendingEnrollments} ta ariza kutilmoqda`
    })
    recommendations.push('Arizalarni ko\'rib chiqish vaqti keldi')
  }
  
  // 5. Hisobotlar
  if (alerts.missingReports?.length > 0) {
    const totalMissing = alerts.missingReports.reduce((sum, g) => sum + g.childrenCount, 0)
    warnings.push({
      type: 'reports',
      severity: 'low',
      message: `${totalMissing} ta bola uchun bugungi hisobot yo'q`
    })
  }
  
  return { insights, recommendations, warnings }
}

function SmartAssistant({ stats, alerts }) {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [activeMode, setActiveMode] = useState('chat') // chat, analysis, actions
  const messagesEndRef = useRef(null)

  const txt = {
    uz: {
      title: '🤖 AI Yordamchi',
      subtitle: 'Aqlli tahlil va tavsiyalar',
      placeholder: 'Savol yozing yoki buyruq bering...',
      send: '📤',
      greeting: 'Assalomu alaykum! Men sizning aqlli yordamchingizman. Bog\'cha haqida savol bering yoki tahlil so\'rang.',
      modes: { chat: '💬 Chat', analysis: '📊 Tahlil', actions: '⚡ Tezkor' },
      analyzing: 'Tahlil qilinmoqda...',
      noIssues: '✅ Hozircha muammo yo\'q!',
      warnings: '⚠️ Ogohlantirishlar',
      insights: '💡 Tushunchalar',
      recommendations: '📋 Tavsiyalar',
      quickActions: 'Tezkor amallar',
      suggestions: [
        '📊 Bugungi tahlil',
        '⚠️ Muammolarni ko\'rsat',
        '💰 Moliyaviy holat',
        '📈 Haftalik hisobot',
        '🎯 Nima qilishim kerak?'
      ]
    },
    ru: {
      title: '🤖 AI Помощник',
      subtitle: 'Умный анализ и рекомендации',
      placeholder: 'Напишите вопрос или команду...',
      send: '📤',
      greeting: 'Здравствуйте! Я ваш умный помощник. Задайте вопрос о детском саде или запросите анализ.',
      modes: { chat: '💬 Чат', analysis: '📊 Анализ', actions: '⚡ Быстрые' },
      analyzing: 'Анализирую...',
      noIssues: '✅ Пока проблем нет!',
      warnings: '⚠️ Предупреждения',
      insights: '💡 Выводы',
      recommendations: '📋 Рекомендации',
      quickActions: 'Быстрые действия',
      suggestions: [
        '📊 Анализ за сегодня',
        '⚠️ Показать проблемы',
        '💰 Финансовое состояние',
        '📈 Недельный отчет',
        '🎯 Что мне делать?'
      ]
    },
    en: {
      title: '🤖 AI Assistant',
      subtitle: 'Smart analysis and recommendations',
      placeholder: 'Type a question or command...',
      send: '📤',
      greeting: 'Hello! I am your smart assistant. Ask about the kindergarten or request analysis.',
      modes: { chat: '💬 Chat', analysis: '📊 Analysis', actions: '⚡ Quick' },
      analyzing: 'Analyzing...',
      noIssues: '✅ No issues at the moment!',
      warnings: '⚠️ Warnings',
      insights: '💡 Insights',
      recommendations: '📋 Recommendations',
      quickActions: 'Quick actions',
      suggestions: [
        '📊 Today\'s analysis',
        '⚠️ Show problems',
        '💰 Financial status',
        '📈 Weekly report',
        '🎯 What should I do?'
      ]
    }
  }[language] || {}

  useEffect(() => {
    if (isOpen && !analysis) {
      const result = analyzeData(stats, alerts)
      setAnalysis(result)
    }
  }, [isOpen, stats, alerts])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const quickActions = [
    { icon: '📋', label: 'Arizalar', action: () => navigate('/admin/enrollments'), count: stats.pendingEnrollments },
    { icon: '💰', label: 'Qarzdorlar', action: () => navigate('/admin/debts'), count: alerts.debtors?.length },
    { icon: '✅', label: 'Davomat', action: () => navigate('/admin/attendance') },
    { icon: '📊', label: 'Hisobotlar', action: () => navigate('/admin/daily-reports') },
    { icon: '👶', label: 'Bolalar', action: () => navigate('/admin/children'), count: stats.totalChildren },
    { icon: '📱', label: 'Eslatma', action: () => handleSend('Barcha qarzdorlarga eslatma yuborish') }
  ]

  const generateResponse = (question) => {
    const q = question.toLowerCase()
    
    // Tahlil so'rovi
    if (q.includes('tahlil') || q.includes('анализ') || q.includes('analysis') || q.includes('bugun')) {
      const result = analyzeData(stats, alerts)
      let response = '📊 **Bugungi tahlil:**\n\n'
      
      if (result.warnings.length > 0) {
        response += '⚠️ **Ogohlantirishlar:**\n'
        result.warnings.forEach(w => {
          const icon = w.severity === 'high' ? '🔴' : w.severity === 'medium' ? '🟡' : '🟢'
          response += `${icon} ${w.message}\n`
        })
        response += '\n'
      }
      
      if (result.insights.length > 0) {
        response += '💡 **Tushunchalar:**\n'
        result.insights.forEach(i => response += `• ${i}\n`)
        response += '\n'
      }
      
      if (result.recommendations.length > 0) {
        response += '📋 **Tavsiyalar:**\n'
        result.recommendations.forEach(r => response += `✓ ${r}\n`)
      }
      
      if (result.warnings.length === 0 && result.insights.length === 0) {
        response = '✅ Hammasi yaxshi! Hozircha muammo yo\'q.\n\n📈 Statistika:\n'
        response += `• Bolalar: ${stats.totalChildren}\n`
        response += `• Guruhlar: ${stats.totalGroups}\n`
        response += `• Arizalar: ${stats.pendingEnrollments} ta kutilmoqda`
      }
      
      return response
    }

    // Muammolar
    if (q.includes('muammo') || q.includes('проблем') || q.includes('problem') || q.includes('issue')) {
      const issues = []
      if (alerts.absentChildren?.length > 0) {
        issues.push(`😟 **Davomat:** ${alerts.absentChildren.length} ta bola 3+ kun kelmagan`)
        alerts.absentChildren.slice(0, 3).forEach(c => {
          issues.push(`   • ${c.firstName} ${c.lastName} - ${c.daysAbsent} kun`)
        })
      }
      if (alerts.debtors?.length > 0) {
        const total = alerts.debtors.reduce((s, d) => s + (d.amount || 0), 0)
        issues.push(`💰 **Qarzdorlik:** ${alerts.debtors.length} ta oila, jami ${(total/1000000).toFixed(1)}M`)
      }
      if (alerts.missingReports?.length > 0) {
        const total = alerts.missingReports.reduce((s, g) => s + g.childrenCount, 0)
        issues.push(`📋 **Hisobotlar:** ${total} ta bola uchun bugungi hisobot yo'q`)
      }
      if (stats.pendingEnrollments > 0) {
        issues.push(`📝 **Arizalar:** ${stats.pendingEnrollments} ta ariza kutilmoqda`)
      }
      
      return issues.length > 0 
        ? '⚠️ **Topilgan muammolar:**\n\n' + issues.join('\n\n')
        : '✅ Ajoyib! Hozircha hech qanday muammo yo\'q.'
    }

    // Moliyaviy holat
    if (q.includes('moliya') || q.includes('финанс') || q.includes('financ') || q.includes('qarz') || q.includes('долг') || q.includes('debt') || q.includes('to\'lov') || q.includes('pul')) {
      if (!alerts.debtors || alerts.debtors.length === 0) {
        return '✅ **Moliyaviy holat yaxshi!**\n\nBarcha ota-onalar to\'lovlarni amalga oshirgan.'
      }
      
      const total = alerts.debtors.reduce((s, d) => s + (d.amount || 0), 0)
      let response = `💰 **Moliyaviy tahlil:**\n\n`
      response += `📊 Jami qarzdorlik: **${(total/1000000).toFixed(1)}M so'm**\n`
      response += `👥 Qarzdor oilalar: **${alerts.debtors.length} ta**\n\n`
      response += `📋 **Ro'yxat:**\n`
      alerts.debtors.slice(0, 5).forEach(d => {
        response += `• ${d.childName}: ${(d.amount/1000).toFixed(0)}K so'm\n`
      })
      if (alerts.debtors.length > 5) {
        response += `\n... va yana ${alerts.debtors.length - 5} ta`
      }
      response += `\n\n💡 **Tavsiya:** "Qarzdorlar" bo'limiga o'ting va eslatma yuboring.`
      return response
    }

    // Nima qilish kerak
    if (q.includes('nima qil') || q.includes('что делать') || q.includes('what should') || q.includes('tavsiya') || q.includes('рекоменд') || q.includes('recommend')) {
      const tasks = []
      
      if (stats.pendingEnrollments > 0) {
        tasks.push({ priority: 1, task: `📝 ${stats.pendingEnrollments} ta arizani ko'rib chiqing`, action: '/admin/enrollments' })
      }
      if (alerts.debtors?.length > 3) {
        tasks.push({ priority: 2, task: `💰 Qarzdorlarga eslatma yuboring (${alerts.debtors.length} ta)`, action: '/admin/debts' })
      }
      if (alerts.absentChildren?.length > 0) {
        tasks.push({ priority: 2, task: `📞 Kelmagan bolalar ota-onalariga qo'ng'iroq qiling`, action: '/admin/attendance' })
      }
      if (alerts.missingReports?.length > 0) {
        tasks.push({ priority: 3, task: `📋 Bugungi hisobotlarni to'ldiring`, action: '/admin/daily-reports' })
      }
      
      if (tasks.length === 0) {
        return '🎉 **Ajoyib!** Hozircha shoshilinch vazifalar yo\'q.\n\n💡 Vaqtingiz bo\'lsa:\n• Bolalar rivojlanishini baholang\n• Galereya yangilang\n• Tadbirlar rejasini tekshiring'
      }
      
      let response = '🎯 **Bugun qilish kerak bo\'lgan ishlar:**\n\n'
      tasks.sort((a, b) => a.priority - b.priority).forEach((t, i) => {
        response += `${i + 1}. ${t.task}\n`
      })
      return response
    }

    // Haftalik hisobot
    if (q.includes('hafta') || q.includes('недел') || q.includes('week') || q.includes('hisobot') || q.includes('отчет') || q.includes('report')) {
      let response = '📈 **Haftalik umumiy korinish:**\n\n'
      response += `👶 Jami bolalar: ${stats.totalChildren}\n`
      response += `👥 Guruhlar: ${stats.totalGroups}\n`
      response += `✅ Qabul qilingan: ${stats.acceptedEnrollments}\n`
      response += `⏳ Kutilmoqda: ${stats.pendingEnrollments}\n\n`
      
      if (stats.groupStats?.length > 0) {
        response += '📊 **Guruhlar bo\'yicha:**\n'
        stats.groupStats.forEach(g => {
          const fill = g.capacity ? Math.round((g.childCount / g.capacity) * 100) : 0
          const bar = '█'.repeat(Math.round(fill / 10)) + '░'.repeat(10 - Math.round(fill / 10))
          response += `${g.name}: ${bar} ${fill}%\n`
        })
      }
      return response
    }

    // Guruhlar
    if (q.includes('guruh') || q.includes('групп') || q.includes('group')) {
      if (!stats.groupStats || stats.groupStats.length === 0) {
        return '📭 Guruhlar haqida ma\'lumot yo\'q'
      }
      let response = `👥 **Guruhlar (${stats.totalGroups} ta):**\n\n`
      stats.groupStats.forEach(g => {
        const fill = g.capacity ? Math.round((g.childCount / g.capacity) * 100) : 0
        const status = fill > 90 ? '🔴' : fill > 70 ? '🟡' : '🟢'
        response += `${status} **${g.name}**\n`
        response += `   Bolalar: ${g.childCount}/${g.capacity || '?'} (${fill}%)\n\n`
      })
      return response
    }

    // Davomat
    if (q.includes('davomat') || q.includes('посещ') || q.includes('attend') || q.includes('kelma') || q.includes('absent')) {
      if (!alerts.absentChildren || alerts.absentChildren.length === 0) {
        return '✅ **Davomat yaxshi!**\n\nBarcha bolalar muntazam kelmoqda.'
      }
      let response = `😟 **Uzoq vaqt kelmagan bolalar:**\n\n`
      alerts.absentChildren.forEach(c => {
        const severity = c.daysAbsent > 7 ? '🔴' : c.daysAbsent > 4 ? '🟡' : '🟢'
        response += `${severity} ${c.firstName} ${c.lastName}\n`
        response += `   ${c.daysAbsent} kun kelmagan\n\n`
      })
      response += `💡 **Tavsiya:** Ota-onalar bilan bog'laning`
      return response
    }

    // Salomlashish
    if (q.includes('salom') || q.includes('привет') || q.includes('hello') || q.includes('hi')) {
      return '👋 Salom! Men sizga qanday yordam bera olaman?\n\n💡 Masalan:\n• "Bugungi tahlil"\n• "Muammolarni ko\'rsat"\n• "Nima qilishim kerak?"'
    }

    // Default
    return '🤔 Tushunmadim. Quyidagilarni so\'rashingiz mumkin:\n\n• 📊 Tahlil\n• ⚠️ Muammolar\n• 💰 Moliyaviy holat\n• 🎯 Nima qilish kerak\n• 📈 Haftalik hisobot\n• 👥 Guruhlar\n• ✅ Davomat'
  }

  const handleSend = async (text = input) => {
    if (!text.trim()) return
    
    const userMessage = { type: 'user', text: text.trim(), time: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    const response = generateResponse(text)
    const botMessage = { type: 'bot', text: response, time: new Date() }
    
    setMessages(prev => [...prev, botMessage])
    setIsTyping(false)
  }

  const renderAnalysisTab = () => {
    if (!analysis) return <div className="loading-analysis">{txt.analyzing}</div>
    
    const { warnings, insights, recommendations } = analysis
    const hasContent = warnings.length > 0 || insights.length > 0 || recommendations.length > 0
    
    if (!hasContent) {
      return (
        <div className="analysis-empty">
          <span className="big-icon">✅</span>
          <p>{txt.noIssues}</p>
        </div>
      )
    }
    
    return (
      <div className="analysis-content">
        {warnings.length > 0 && (
          <div className="analysis-section warnings">
            <h4>{txt.warnings}</h4>
            {warnings.map((w, i) => (
              <div key={i} className={`warning-item ${w.severity}`}>
                <span className="severity-dot" />
                <span>{w.message}</span>
              </div>
            ))}
          </div>
        )}
        
        {insights.length > 0 && (
          <div className="analysis-section insights">
            <h4>{txt.insights}</h4>
            {insights.map((ins, i) => (
              <div key={i} className="insight-item">💡 {ins}</div>
            ))}
          </div>
        )}
        
        {recommendations.length > 0 && (
          <div className="analysis-section recommendations">
            <h4>{txt.recommendations}</h4>
            {recommendations.map((rec, i) => (
              <div key={i} className="recommendation-item">✓ {rec}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderActionsTab = () => (
    <div className="actions-content">
      <h4>{txt.quickActions}</h4>
      <div className="quick-actions-grid">
        {quickActions.map((action, i) => (
          <button key={i} className="quick-action-btn" onClick={action.action}>
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
            {action.count > 0 && <span className="action-badge">{action.count}</span>}
          </button>
        ))}
      </div>
    </div>
  )

  const formatMessage = (text) => {
    // Xavfsiz formatlash - XSS himoyasi
    return text.split('\n').map((line, i) => {
      // Bold text uchun xavfsiz almashtirish
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <p key={i}>
          {parts.map((part, j) => 
            j % 2 === 1 ? <strong key={j}>{escapeHtml(part)}</strong> : escapeHtml(part)
          )}
          {line === '' && '\u00A0'}
        </p>
      )
    })
  }

  return (
    <>
      {/* Floating Button with pulse animation when there are warnings */}
      <motion.button 
        className={`assistant-fab ${isOpen ? 'open' : ''} ${analysis?.warnings?.length > 0 ? 'has-warnings' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? '✕' : '🤖'}
        {!isOpen && analysis?.warnings?.length > 0 && (
          <span className="fab-badge">{analysis.warnings.length}</span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="assistant-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            <div className="assistant-header">
              <div className="header-info">
                <span className="assistant-avatar">🤖</span>
                <div>
                  <h3>{txt.title}</h3>
                  <span className="subtitle">{txt.subtitle}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            {/* Mode Tabs */}
            <div className="assistant-tabs">
              {Object.entries(txt.modes).map(([key, label]) => (
                <button
                  key={key}
                  className={`tab-btn ${activeMode === key ? 'active' : ''}`}
                  onClick={() => setActiveMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="assistant-body">
              {activeMode === 'chat' && (
                <>
                  <div className="assistant-messages">
                    {messages.length === 0 && (
                      <div className="assistant-greeting">
                        <div className="greeting-icon">🤖</div>
                        <p>{txt.greeting}</p>
                        <div className="suggestions">
                          {txt.suggestions.map((s, i) => (
                            <button key={i} onClick={() => handleSend(s)}>{s}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {messages.map((msg, i) => (
                      <motion.div 
                        key={i} 
                        className={`message ${msg.type}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {msg.type === 'bot' && <span className="bot-avatar">🤖</span>}
                        <div className="message-content">
                          {formatMessage(msg.text)}
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <div className="message bot">
                        <span className="bot-avatar">🤖</span>
                        <div className="message-content typing">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="assistant-input">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={txt.placeholder}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={() => handleSend()} disabled={!input.trim()}>
                      {txt.send}
                    </button>
                  </div>
                </>
              )}

              {activeMode === 'analysis' && renderAnalysisTab()}
              {activeMode === 'actions' && renderActionsTab()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default SmartAssistant
