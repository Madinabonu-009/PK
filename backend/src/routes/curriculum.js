import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const dataPath = path.join(__dirname, '../../data/curriculum.json');

const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// O'quv dasturi (public)
router.get('/', (req, res) => {
  try {
    const curriculum = readData();
    res.json(curriculum);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yosh guruhi bo'yicha
router.get('/:ageGroupId', (req, res) => {
  try {
    const curriculum = readData();
    const ageGroup = curriculum.ageGroups.find(g => g.id === req.params.ageGroupId);
    
    if (!ageGroup) {
      return res.status(404).json({ error: 'Yosh guruhi topilmadi' });
    }
    
    res.json(ageGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
