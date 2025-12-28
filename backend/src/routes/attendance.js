import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import { sendTelegramMessage } from '../services/telegramService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const dataPath = path.join(__dirname, '../../data/attendance.json');
const childrenPath = path.join(__dirname, '../../data/children.json');

const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
const readChildren = () => JSON.parse(fs.readFileSync(childrenPath, 'utf8'));

// Barcha davomat olish
router.get('/', authenticateToken, (req, res) => {
  try {
    const attendance = readData();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bugungi davomat olish
router.get('/today', authenticateToken, (req, res) => {
  try {
    const attendance = readData();
    const children = readChildren();
    const today = new Date().toISOString().split('T')[0];
    
    const todayAttendance = attendance.filter(a => a.date === today);
    
    // Bolalar ma'lumotlari bilan birlashtirish
    const result = children.map(child => {
      const att = todayAttendance.find(a => a.childId === child.id);
      return {
        childId: child.id,
        childName: `${child.firstName} ${child.lastName}`,
        groupId: child.groupId,
        photo: child.photo,
        attendance: att || null,
        status: att ? att.status : 'not_marked'
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guruh bo'yicha davomat
router.get('/group/:groupId', authenticateToken, (req, res) => {
  try {
    const { groupId } = req.params;
    const { date } = req.query;
    const attendance = readData();
    const children = readChildren();
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    const groupChildren = children.filter(c => c.groupId === groupId);
    
    const result = groupChildren.map(child => {
      const att = attendance.find(a => a.childId === child.id && a.date === targetDate);
      return {
        childId: child.id,
        childName: `${child.firstName} ${child.lastName}`,
        photo: child.photo,
        attendance: att || null,
        status: att ? att.status : 'not_marked'
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-in (Keldi)
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const { childId, by, notes } = req.body;
    const attendance = readData();
    const children = readChildren();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    
    const child = children.find(c => c.id === childId);
    if (!child) {
      return res.status(404).json({ error: 'Bola topilmadi' });
    }
    
    // Bugungi yozuv bormi tekshirish
    let existing = attendance.find(a => a.childId === childId && a.date === today);
    
    if (existing) {
      existing.checkIn = { time: now, by: by || '', notes: notes || '' };
      existing.status = 'present';
    } else {
      const newAttendance = {
        id: `att${Date.now()}`,
        childId,
        date: today,
        checkIn: { time: now, by: by || '', notes: notes || '' },
        checkOut: null,
        status: 'present',
        telegramNotified: false
      };
      attendance.push(newAttendance);
      existing = newAttendance;
    }
    
    writeData(attendance);
    
    // Telegram xabar yuborish
    if (child.parentTelegram) {
      const message = `✅ *Keldi!*\n\n👶 ${child.firstName} ${child.lastName}\n⏰ Vaqt: ${now}\n👤 Olib keldi: ${by || 'Belgilanmagan'}\n\n_Play Kids Bog'cha_`;
      await sendTelegramMessage(message, child.parentTelegram);
      existing.telegramNotified = true;
      writeData(attendance);
    }
    
    res.json({ success: true, attendance: existing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-out (Ketdi)
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const { childId, by, notes } = req.body;
    const attendance = readData();
    const children = readChildren();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    
    const child = children.find(c => c.id === childId);
    if (!child) {
      return res.status(404).json({ error: 'Bola topilmadi' });
    }
    
    const existing = attendance.find(a => a.childId === childId && a.date === today);
    
    if (!existing) {
      return res.status(400).json({ error: 'Avval check-in qiling' });
    }
    
    existing.checkOut = { time: now, by: by || '', notes: notes || '' };
    writeData(attendance);
    
    // Telegram xabar yuborish
    if (child.parentTelegram) {
      const duration = calculateDuration(existing.checkIn.time, now);
      const message = `👋 *Ketdi!*\n\n👶 ${child.firstName} ${child.lastName}\n⏰ Ketish vaqti: ${now}\n👤 Olib ketdi: ${by || 'Belgilanmagan'}\n⏱ Bog'chada bo'ldi: ${duration}\n\n_Play Kids Bog'cha_`;
      await sendTelegramMessage(message, child.parentTelegram);
    }
    
    res.json({ success: true, attendance: existing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kelmadi deb belgilash
router.post('/absent', authenticateToken, async (req, res) => {
  try {
    const { childId, reason } = req.body;
    const attendance = readData();
    const children = readChildren();
    const today = new Date().toISOString().split('T')[0];
    
    const child = children.find(c => c.id === childId);
    if (!child) {
      return res.status(404).json({ error: 'Bola topilmadi' });
    }
    
    let existing = attendance.find(a => a.childId === childId && a.date === today);
    
    if (existing) {
      existing.status = 'absent';
      existing.absentReason = reason || '';
    } else {
      existing = {
        id: `att${Date.now()}`,
        childId,
        date: today,
        checkIn: null,
        checkOut: null,
        status: 'absent',
        absentReason: reason || '',
        telegramNotified: false
      };
      attendance.push(existing);
    }
    
    writeData(attendance);
    res.json({ success: true, attendance: existing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistika
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const { startDate, endDate, groupId } = req.query;
    const attendance = readData();
    const children = readChildren();
    
    let filtered = attendance;
    
    if (startDate) {
      filtered = filtered.filter(a => a.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(a => a.date <= endDate);
    }
    if (groupId) {
      const groupChildIds = children.filter(c => c.groupId === groupId).map(c => c.id);
      filtered = filtered.filter(a => groupChildIds.includes(a.childId));
    }
    
    const stats = {
      total: filtered.length,
      present: filtered.filter(a => a.status === 'present').length,
      absent: filtered.filter(a => a.status === 'absent').length,
      attendanceRate: filtered.length > 0 
        ? Math.round((filtered.filter(a => a.status === 'present').length / filtered.length) * 100) 
        : 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bola davomati tarixi
router.get('/child/:childId', authenticateToken, (req, res) => {
  try {
    const { childId } = req.params;
    const { month, year } = req.query;
    const attendance = readData();
    
    let filtered = attendance.filter(a => a.childId === childId);
    
    if (month && year) {
      filtered = filtered.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() + 1 === parseInt(month) && date.getFullYear() === parseInt(year);
      });
    }
    
    res.json(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function calculateDuration(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours} soat ${minutes} daqiqa`;
}

export default router;
