import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import { sendTelegramMessage } from '../services/telegramService.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const dataPath = path.join(__dirname, '../../data/debts.json');
const childrenPath = path.join(__dirname, '../../data/children.json');
const groupsPath = path.join(__dirname, '../../data/groups.json');
const paymentsPath = path.join(__dirname, '../../data/payments.json');

const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
const readChildren = () => JSON.parse(fs.readFileSync(childrenPath, 'utf8'));
const readGroups = () => JSON.parse(fs.readFileSync(groupsPath, 'utf8'));
const readPayments = () => JSON.parse(fs.readFileSync(paymentsPath, 'utf8'));
const writePayments = (data) => fs.writeFileSync(paymentsPath, JSON.stringify(data, null, 2));

// Barcha qarzdorliklar
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, month, groupId } = req.query;
    const debts = readData();
    const children = readChildren();
    const groups = readGroups();
    
    let filtered = debts;
    
    if (status) {
      filtered = filtered.filter(d => d.status === status);
    }
    if (month) {
      filtered = filtered.filter(d => d.month === month);
    }
    if (groupId) {
      const groupChildIds = children.filter(c => c.groupId === groupId).map(c => c.id);
      filtered = filtered.filter(d => groupChildIds.includes(d.childId));
    }
    
    // Bola ma'lumotlarini qo'shish
    const result = filtered.map(debt => {
      const child = children.find(c => c.id === debt.childId);
      const group = child ? groups.find(g => g.id === child.groupId) : null;
      
      // Kechikish kunlarini hisoblash
      let daysOverdue = 0;
      if (debt.status !== 'paid') {
        const dueDate = new Date(debt.dueDate);
        const today = new Date();
        daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
      }
      
      return {
        ...debt,
        childName: child ? `${child.firstName} ${child.lastName}` : 'Noma\'lum',
        groupName: group?.name || '-',
        parentPhone: child?.parentPhone,
        parentTelegram: child?.parentTelegram,
        daysOverdue,
        remainingAmount: debt.amount - debt.paidAmount
      };
    });
    
    res.json(result.sort((a, b) => b.daysOverdue - a.daysOverdue));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistika
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const { month } = req.query;
    const debts = readData();
    const children = readChildren();
    
    let filtered = debts;
    if (month) {
      filtered = filtered.filter(d => d.month === month);
    }
    
    const totalAmount = filtered.reduce((sum, d) => sum + d.amount, 0);
    const paidAmount = filtered.reduce((sum, d) => sum + d.paidAmount, 0);
    const pendingAmount = totalAmount - paidAmount;
    
    const stats = {
      totalChildren: children.length,
      totalAmount,
      paidAmount,
      pendingAmount,
      paidCount: filtered.filter(d => d.status === 'paid').length,
      pendingCount: filtered.filter(d => d.status === 'pending').length,
      partialCount: filtered.filter(d => d.status === 'partial').length,
      overdueCount: filtered.filter(d => {
        if (d.status === 'paid') return false;
        const dueDate = new Date(d.dueDate);
        return new Date() > dueDate;
      }).length,
      collectionRate: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yangi oy uchun qarzdorlik yaratish
router.post('/generate', authenticateToken, (req, res) => {
  try {
    const { month, dueDate } = req.body;
    const debts = readData();
    const children = readChildren();
    const groups = readGroups();
    
    // Faol bolalar uchun qarzdorlik yaratish
    const activeChildren = children.filter(c => c.isActive !== false);
    const newDebts = [];
    
    activeChildren.forEach(child => {
      // Bu oy uchun allaqachon bormi tekshirish
      const existing = debts.find(d => d.childId === child.id && d.month === month);
      if (existing) return;
      
      const group = groups.find(g => g.id === child.groupId);
      const monthlyFee = group?.monthlyFee || 500000;
      
      newDebts.push({
        id: `debt${Date.now()}_${child.id}`,
        childId: child.id,
        amount: monthlyFee,
        month,
        dueDate: dueDate || `${month}-05`,
        status: 'pending',
        paidAt: null,
        paidAmount: 0,
        reminderSent: false,
        createdAt: new Date().toISOString()
      });
    });
    
    debts.push(...newDebts);
    writeData(debts);
    
    res.json({ 
      success: true, 
      created: newDebts.length,
      message: `${newDebts.length} ta qarzdorlik yaratildi`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// To'lov qilish
router.post('/:id/pay', authenticateToken, (req, res) => {
  try {
    const { amount } = req.body;
    const debts = readData();
    const children = readChildren();
    const index = debts.findIndex(d => d.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Qarzdorlik topilmadi' });
    }
    
    const debt = debts[index];
    const child = children.find(c => c.id === debt.childId);
    
    debt.paidAmount += amount;
    debt.paidAt = new Date().toISOString();
    
    const remaining = debt.amount - debt.paidAmount;
    if (remaining <= 0) {
      debt.status = 'paid';
    } else {
      debt.status = 'partial';
    }
    
    writeData(debts);
    
    // Payments ga ham yozish
    const payments = readPayments();
    const newPayment = {
      id: `pay_${uuidv4().slice(0, 8)}`,
      childId: debt.childId,
      childName: child ? `${child.firstName} ${child.lastName}` : 'Noma\'lum',
      amount: amount,
      currency: 'UZS',
      type: 'monthly',
      status: 'completed',
      provider: 'cash',
      transactionId: `CASH_${Date.now()}`,
      description: `${debt.month} oyi uchun to'lov`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
    payments.push(newPayment);
    writePayments(payments);
    
    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Telegram eslatma yuborish
router.post('/:id/remind', authenticateToken, async (req, res) => {
  try {
    const debts = readData();
    const children = readChildren();
    const debt = debts.find(d => d.id === req.params.id);
    
    if (!debt) {
      return res.status(404).json({ error: 'Qarzdorlik topilmadi' });
    }
    
    const child = children.find(c => c.id === debt.childId);
    if (!child) {
      return res.status(404).json({ error: 'Bola topilmadi' });
    }
    
    const remaining = debt.amount - debt.paidAmount;
    const dueDate = new Date(debt.dueDate);
    const today = new Date();
    const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
    
    const message = `⚠️ *To'lov eslatmasi*\n\n` +
      `👶 Bola: ${child.firstName} ${child.lastName}\n` +
      `📅 Oy: ${debt.month}\n` +
      `💰 Qarz: ${remaining.toLocaleString()} so'm\n` +
      `📆 Muddati: ${debt.dueDate}\n` +
      `${daysOverdue > 0 ? `⏰ Kechikish: ${daysOverdue} kun\n` : ''}` +
      `\nIltimos, to'lovni amalga oshiring.\n\n` +
      `_Play Kids Bog'cha_`;
    
    const chatId = child.parentTelegram || process.env.TELEGRAM_CHAT_ID;
    const result = await sendTelegramMessage(message, chatId);
    
    if (result) {
      const index = debts.findIndex(d => d.id === req.params.id);
      debts[index].reminderSent = true;
      debts[index].lastReminderAt = new Date().toISOString();
      writeData(debts);
      res.json({ success: true, message: 'Eslatma yuborildi' });
    } else {
      res.status(500).json({ error: 'Telegram yuborishda xatolik' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Barcha qarzdorlarga eslatma yuborish
router.post('/remind-all', authenticateToken, async (req, res) => {
  try {
    const debts = readData();
    const children = readChildren();
    
    // Barcha to'lanmagan qarzdorliklar (paid bo'lmaganlar)
    const unpaidDebts = debts.filter(d => d.status !== 'paid');
    
    let sentCount = 0;
    const errors = [];
    
    // Telegram bot chat ID
    const botChatId = process.env.TELEGRAM_CHAT_ID;
    
    for (const debt of unpaidDebts) {
      const child = children.find(c => c.id === debt.childId);
      if (!child) continue;
      
      const remaining = debt.amount - debt.paidAmount;
      if (remaining <= 0) continue;
      
      const dueDate = new Date(debt.dueDate);
      const today = new Date();
      const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
      
      const message = `⚠️ *To'lov eslatmasi*\n\n` +
        `👶 Bola: ${child.firstName} ${child.lastName}\n` +
        `📅 Oy: ${debt.month}\n` +
        `💰 Qarz: ${remaining.toLocaleString()} so'm\n` +
        `📆 Muddati: ${debt.dueDate}\n` +
        `${daysOverdue > 0 ? `⏰ Kechikish: ${daysOverdue} kun\n` : ''}` +
        `\nIltimos, to'lovni amalga oshiring.\n` +
        `💳 Karta: 8600 1234 5678 9012\n\n` +
        `_Play Kids Bog'cha_`;
      
      // Ota-ona telegram ID si bo'lsa unga, bo'lmasa admin chat ga yuborish
      const chatId = child.parentTelegram || botChatId;
      
      if (chatId) {
        try {
          const result = await sendTelegramMessage(message, chatId);
          if (result) {
            sentCount++;
            // Eslatma yuborilganini belgilash
            const index = debts.findIndex(d => d.id === debt.id);
            if (index !== -1) {
              debts[index].reminderSent = true;
              debts[index].lastReminderAt = new Date().toISOString();
            }
          }
        } catch (err) {
          errors.push(`${child.firstName}: ${err.message}`);
        }
      }
      
      // Rate limiting - Telegram API cheklovi uchun
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Ma'lumotlarni saqlash
    writeData(debts);
    
    res.json({ 
      success: true, 
      sent: sentCount, 
      total: unpaidDebts.length,
      message: `${sentCount} ta eslatma yuborildi`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
