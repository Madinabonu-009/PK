import express from 'express';
import { 
  sendDailyMenu, 
  sendTelegramMessage,
  sendAllDebtsReminder,
  sendAttendanceReport,
  sendChildDailyReport,
  sendAnnouncement,
  sendEventReminder,
  sendAchievementNotification,
  sendWeeklyReport
} from '../services/telegramService.js';
import { authenticateToken } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ============================================
// MENYU
// ============================================

// Bugungi menyuni qo'lda yuborish
router.post('/send-menu', authenticateToken, async (req, res) => {
  try {
    const result = await sendDailyMenu();
    
    if (result) {
      res.json({ 
        success: true, 
        message: 'Menyu Telegramga muvaffaqiyatli yuborildi' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Menyu yuborishda xatolik yuz berdi' 
      });
    }
  } catch (error) {
    console.error('Telegram API xatolik:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatoligi',
      error: error.message 
    });
  }
});

// Bugungi menyuni hozir yuborish (test uchun)
router.get('/send-menu-now', async (req, res) => {
  try {
    console.log('📤 Qo\'lda menyu yuborish so\'rovi...');
    const result = await sendDailyMenu();
    
    res.json({ 
      success: result, 
      message: result ? 'Menyu yuborildi!' : 'Yuborishda xatolik (yakshanba yoki menyu topilmadi)',
      timestamp: new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
    });
  } catch (error) {
    console.error('Telegram xatolik:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// QARZDORLIK
// ============================================

// Barcha qarzdorlarga eslatma yuborish
router.post('/send-debts-reminder', authenticateToken, async (req, res) => {
  try {
    const result = await sendAllDebtsReminder();
    res.json({ 
      success: true, 
      ...result,
      message: `${result.sent}/${result.total} ta eslatma yuborildi`
    });
  } catch (error) {
    console.error('Qarzdorlik eslatmasi xatolik:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// DAVOMAT
// ============================================

// Kunlik davomat hisobotini yuborish
router.post('/send-attendance', authenticateToken, async (req, res) => {
  try {
    const { date } = req.body;
    const reportDate = date ? new Date(date) : new Date();
    const result = await sendAttendanceReport(reportDate);
    
    res.json({ 
      success: result, 
      message: result ? 'Davomat hisoboti yuborildi' : 'Yuborishda xatolik'
    });
  } catch (error) {
    console.error('Davomat hisoboti xatolik:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// BOLA KUNLIK HISOBOTI
// ============================================

// Bolaning kunlik hisobotini yuborish
router.post('/send-child-report', authenticateToken, async (req, res) => {
  try {
    const { childId, report } = req.body;
    
    if (!childId || !report) {
      return res.status(400).json({ 
        success: false, 
        message: 'childId va report talab qilinadi' 
      });
    }
    
    const result = await sendChildDailyReport(childId, report);
    
    res.json({ 
      success: result, 
      message: result ? 'Kunlik hisobot yuborildi' : 'Yuborishda xatolik'
    });
  } catch (error) {
    console.error('Kunlik hisobot xatolik:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// E'LONLAR
// ============================================

// E'lon yuborish
router.post('/send-announcement', authenticateToken, async (req, res) => {
  try {
    const { title, content, type } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'title va content talab qilinadi' 
      });
    }
    
    const result = await sendAnnouncement(title, content, type || 'info');
    
    res.json({ 
      success: result, 
      message: result ? 'E\'lon yuborildi' : 'Yuborishda xatolik'
    });
  } catch (error) {
    console.error('E\'lon yuborish xatolik:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TADBIRLAR
// ============================================

// Tadbir eslatmasi yuborish
router.post('/send-event', authenticateToken, async (req, res) => {
  try {
    const { event } = req.body;
    
    if (!event || !event.title || !event.date) {
      return res.status(400).json({ 
        success: false, 
        message: 'event (title, date) talab qilinadi' 
      });
    }
    
    const result = await sendEventReminder(event);
    
    res.json({ 
      success: result, 
      message: result ? 'Tadbir eslatmasi yuborildi' : 'Yuborishda xatolik'
    });
  } catch (error) {
    console.error('Tadbir eslatmasi xatolik:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// YUTUQLAR
// ============================================

// Yutuq xabari yuborish
router.post('/send-achievement', authenticateToken, async (req, res) => {
  try {
    const { childId, achievement } = req.body;
    
    if (!childId || !achievement) {
      return res.status(400).json({ 
        success: false, 
        message: 'childId va achievement talab qilinadi' 
      });
    }
    
    // Bolani topish
    const childrenPath = path.join(__dirname, '../../data/children.json');
    const children = JSON.parse(fs.readFileSync(childrenPath, 'utf8'));
    const child = children.find(c => c.id === childId);
    
    if (!child) {
      return res.status(404).json({ success: false, message: 'Bola topilmadi' });
    }
    
    const result = await sendAchievementNotification(child, achievement);
    
    res.json({ 
      success: result, 
      message: result ? 'Yutuq xabari yuborildi' : 'Yuborishda xatolik'
    });
  } catch (error) {
    console.error('Yutuq xabari xatolik:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// HISOBOTLAR
// ============================================

// Haftalik hisobot yuborish
router.post('/send-weekly-report', authenticateToken, async (req, res) => {
  try {
    const result = await sendWeeklyReport();
    
    res.json({ 
      success: result, 
      message: result ? 'Haftalik hisobot yuborildi' : 'Yuborishda xatolik'
    });
  } catch (error) {
    console.error('Haftalik hisobot xatolik:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// UMUMIY
// ============================================

// Maxsus xabar yuborish
router.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { message, chatId } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Xabar matni kiritilmagan' 
      });
    }

    const result = await sendTelegramMessage(message, chatId);
    
    if (result) {
      res.json({ 
        success: true, 
        message: 'Xabar Telegramga yuborildi' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Xabar yuborishda xatolik' 
      });
    }
  } catch (error) {
    console.error('Telegram API xatolik:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatoligi' 
    });
  }
});

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    const testMessage = '🧪 *Test xabar*\n\nPlay Kids bog\'cha tizimi ishlayapti!';
    const result = await sendTelegramMessage(testMessage);
    
    res.json({ 
      success: result, 
      message: result ? 'Test xabar yuborildi' : 'Xatolik yuz berdi' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Status endpoint - telegram bot holati
router.get('/status', async (req, res) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    res.json({
      configured: !!(botToken && chatId),
      botToken: botToken ? `${botToken.slice(0, 10)}...` : null,
      chatId: chatId || null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
