import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const dataPath = path.join(__dirname, '../../data/stories.json');

const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// Bugungi story (public)
router.get('/today', (req, res) => {
  try {
    const stories = readData();
    const today = new Date().toISOString().split('T')[0];
    const todayStory = stories.find(s => s.date === today);
    
    if (todayStory) {
      // View count oshirish
      const index = stories.findIndex(s => s.id === todayStory.id);
      stories[index].views = (stories[index].views || 0) + 1;
      writeData(stories);
    }
    
    res.json(todayStory || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Barcha storylar (admin)
router.get('/', authenticateToken, (req, res) => {
  try {
    const stories = readData();
    res.json(stories.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yangi story yaratish
router.post('/', authenticateToken, (req, res) => {
  try {
    const stories = readData();
    const { date, media, description } = req.body;
    
    // Shu kun uchun story bormi tekshirish
    const existing = stories.find(s => s.date === date);
    if (existing) {
      return res.status(400).json({ error: 'Bu kun uchun story allaqachon mavjud' });
    }
    
    const newStory = {
      id: `story${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      media: media || [],
      description: description || '',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      views: 0
    };
    
    stories.push(newStory);
    writeData(stories);
    
    res.status(201).json(newStory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Story yangilash
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const stories = readData();
    const index = stories.findIndex(s => s.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Story topilmadi' });
    }
    
    const { media, description } = req.body;
    
    if (media) stories[index].media = media;
    if (description !== undefined) stories[index].description = description;
    stories[index].updatedAt = new Date().toISOString();
    
    writeData(stories);
    res.json(stories[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Media qo'shish
router.post('/:id/media', authenticateToken, (req, res) => {
  try {
    const stories = readData();
    const index = stories.findIndex(s => s.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Story topilmadi' });
    }
    
    const { type, url, caption } = req.body;
    
    stories[index].media.push({
      type: type || 'image',
      url,
      caption: caption || ''
    });
    
    writeData(stories);
    res.json(stories[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Story o'chirish (soft delete)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const stories = readData();
    const index = stories.findIndex(s => s.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Story topilmadi' });
    }
    
    // Soft delete - mark as deleted instead of removing
    stories[index].isDeleted = true;
    stories[index].deletedAt = new Date().toISOString();
    stories[index].deletedBy = req.user?.id || 'unknown';
    
    writeData(stories);
    res.json({ success: true, message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
