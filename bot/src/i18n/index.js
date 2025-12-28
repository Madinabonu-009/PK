import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadJSON = (filename) => {
  const filePath = path.join(__dirname, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const translations = {
  uz: loadJSON('uz.json')
};

/**
 * Tarjimani olish
 * @param {string} key - Tarjima kaliti
 * @param {Object} params - O'zgaruvchilar
 * @param {string} lang - Til (default: uz)
 */
export const t = (key, params = {}, lang = 'uz') => {
  const keys = key.split('.');
  
  let text = translations[lang] || translations.uz;
  for (const k of keys) {
    text = text?.[k];
  }
  
  if (!text) return key;
  
  // O'zgaruvchilarni almashtirish {name} -> value
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  });
  
  return text;
};

export default { t };
