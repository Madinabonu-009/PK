import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// GET all stories
router.get('/', async (req, res) => {
  try {
    const collection = mongoose.connection.collection('library')
    const stories = await collection.find({}).sort({ order: 1, createdAt: -1 }).toArray()
    res.json({ success: true, data: stories })
  } catch (error) {
    console.error('Library fetch error:', error)
    res.status(500).json({ success: false, error: 'Server xatosi' })
  }
})

// GET single story
router.get('/:id', async (req, res) => {
  try {
    const collection = mongoose.connection.collection('library')
    const story = await collection.findOne({ 
      _id: new mongoose.Types.ObjectId(req.params.id) 
    })
    if (!story) {
      return res.status(404).json({ success: false, error: 'Ertak topilmadi' })
    }
    res.json({ success: true, data: story })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server xatosi' })
  }
})

// POST create story (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Ruxsat yo\'q' })
    }
    
    const collection = mongoose.connection.collection('library')
    const { title, description, moral, videoUrl, emoji, color, duration, characters, order } = req.body
    
    const story = {
      title: title || { uz: '', ru: '', en: '' },
      description: description || { uz: '', ru: '', en: '' },
      moral: moral || { uz: '', ru: '', en: '' },
      videoUrl: videoUrl || '',
      emoji: emoji || '📖',
      color: color || '#667eea',
      duration: parseInt(duration) || 5,
      characters: characters || [],
      order: parseInt(order) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(story)
    res.status(201).json({ success: true, data: { ...story, _id: result.insertedId } })
  } catch (error) {
    console.error('Library create error:', error)
    res.status(500).json({ success: false, error: 'Server xatosi' })
  }
})

// PUT update story (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Ruxsat yo\'q' })
    }
    
    const collection = mongoose.connection.collection('library')
    const { title, description, moral, videoUrl, emoji, color, duration, characters, order } = req.body
    
    const updateData = { updatedAt: new Date() }
    
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (moral) updateData.moral = moral
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (emoji) updateData.emoji = emoji
    if (color) updateData.color = color
    if (duration !== undefined) updateData.duration = parseInt(duration)
    if (characters) updateData.characters = characters
    if (order !== undefined) updateData.order = parseInt(order)
    
    const result = await collection.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    if (!result) {
      return res.status(404).json({ success: false, error: 'Ertak topilmadi' })
    }
    
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Library update error:', error)
    res.status(500).json({ success: false, error: 'Server xatosi' })
  }
})

// DELETE story (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Ruxsat yo\'q' })
    }
    
    const collection = mongoose.connection.collection('library')
    const result = await collection.deleteOne({ 
      _id: new mongoose.Types.ObjectId(req.params.id) 
    })
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Ertak topilmadi' })
    }
    
    res.json({ success: true, message: 'O\'chirildi' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server xatosi' })
  }
})

// POST seed default stories
router.post('/seed', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Ruxsat yo\'q' })
    }
    
    const collection = mongoose.connection.collection('library')
    
    // Barcha ertaklar
    const allStories = [
      {
        emoji: '🐻', color: '#8b5cf6', videoUrl: 'https://www.youtube.com/embed/Pk7Syl8ZGCg', duration: 10,
        title: { uz: "Uch ayiq va Oltinsoch", ru: "Три медведя и Златовласка", en: "Three Bears and Goldilocks" },
        description: { uz: "Oltinsoch uch ayiqning uyiga kirib qoladi.", ru: "Златовласка попадает в дом трёх медведей.", en: "Goldilocks enters the house of three bears." },
        moral: { uz: "Begona uylarga ruxsatsiz kirmaslik kerak!", ru: "Нельзя заходить в чужие дома без разрешения!", en: "Never enter strangers' houses without permission!" },
        characters: ['🐻', '🐻', '🧸', '👧'], order: 1
      },
      {
        emoji: '🧒', color: '#ef4444', videoUrl: 'https://www.youtube.com/embed/JiaJkvZoY-Y', duration: 8,
        title: { uz: "Qizil qalpoqcha", ru: "Красная Шапочка", en: "Little Red Riding Hood" },
        description: { uz: "Qizil qalpoqcha buvinikiga pirojki olib boradi.", ru: "Красная Шапочка несёт пирожки бабушке.", en: "Little Red Riding Hood takes cakes to grandma." },
        moral: { uz: "Notanish odamlar bilan gaplashmaslik kerak!", ru: "Нельзя разговаривать с незнакомцами!", en: "Don't talk to strangers!" },
        characters: ['👧', '🐺', '👵', '🪓'], order: 2
      },
      {
        emoji: '🦢', color: '#06b6d4', videoUrl: 'https://www.youtube.com/embed/7L304-Crf1A', duration: 9,
        title: { uz: "Irkit o'rdakcha", ru: "Гадкий утёнок", en: "The Ugly Duckling" },
        description: { uz: "Boshqalardan farq qiluvchi o'rdakcha oqqushga aylanadi.", ru: "Утёнок превращается в прекрасного лебедя.", en: "A duckling becomes a beautiful swan." },
        moral: { uz: "Ichki go'zallik muhim!", ru: "Важна внутренняя красота!", en: "Inner beauty matters!" },
        characters: ['🐣', '🦆', '🦢', '🌸'], order: 3
      },
      {
        emoji: '🦁', color: '#f59e0b', videoUrl: 'https://www.youtube.com/embed/K7sY4cO-dgo', duration: 6,
        title: { uz: "Sher va sichqon", ru: "Лев и мышь", en: "The Lion and the Mouse" },
        description: { uz: "Kichkina sichqon kuchli sherga yordam beradi.", ru: "Маленькая мышка помогает могучему льву.", en: "A little mouse helps a mighty lion." },
        moral: { uz: "Kichkina do'stlar ham katta yordam bera oladi!", ru: "Маленькие друзья тоже могут помочь!", en: "Small friends can also give big help!" },
        characters: ['🦁', '🐭', '🪤', '🌳'], order: 4
      },
      {
        emoji: '🐢', color: '#22c55e', videoUrl: 'https://www.youtube.com/embed/7Ji1_XSTFsg', duration: 7,
        title: { uz: "Toshbaqa va quyon", ru: "Черепаха и заяц", en: "The Tortoise and the Hare" },
        description: { uz: "Sekin yuruvchi toshbaqa quyonni yengadi.", ru: "Медленная черепаха побеждает зайца.", en: "The slow tortoise beats the hare." },
        moral: { uz: "Sekin-asta g'alabaga olib keladi!", ru: "Медленно, но верно - путь к победе!", en: "Slow and steady wins the race!" },
        characters: ['🐢', '🐰', '🏁', '🌲'], order: 5
      },
      {
        emoji: '👸', color: '#ec4899', videoUrl: 'https://www.youtube.com/embed/3wTZwqFczso', duration: 12,
        title: { uz: "Zolushka", ru: "Золушка", en: "Cinderella" },
        description: { uz: "Mehribon qiz sehrgar ona yordamida shahzoda bilan uchrashadi.", ru: "Добрая девушка с помощью феи встречает принца.", en: "A kind girl meets a prince with the help of a fairy godmother." },
        moral: { uz: "Yaxshilik har doim mukofotlanadi!", ru: "Доброта всегда вознаграждается!", en: "Kindness is always rewarded!" },
        characters: ['👸', '🧚', '👠', '🎃'], order: 6
      },
      {
        emoji: '🐷', color: '#f97316', videoUrl: 'https://www.youtube.com/embed/QGlHQhj4GS0', duration: 8,
        title: { uz: "Uchta cho'chqacha", ru: "Три поросёнка", en: "Three Little Pigs" },
        description: { uz: "Uchta cho'chqacha o'z uylarini quradi va bo'ridan himoyalanadi.", ru: "Три поросёнка строят свои дома и защищаются от волка.", en: "Three little pigs build their houses and protect themselves from the wolf." },
        moral: { uz: "Ishni puxta qilish kerak!", ru: "Нужно делать работу качественно!", en: "Do your work properly!" },
        characters: ['🐷', '🐷', '🐷', '🐺'], order: 7
      },
      {
        emoji: '🥯', color: '#fbbf24', videoUrl: 'https://www.youtube.com/embed/oIwg4VLmrfw', duration: 7,
        title: { uz: "Bo'g'irsoq", ru: "Колобок", en: "The Gingerbread Man" },
        description: { uz: "Bo'g'irsoq uydan qochib ketadi va turli hayvonlar bilan uchrashadi.", ru: "Колобок убегает из дома и встречает разных животных.", en: "The Gingerbread Man runs away from home and meets various animals." },
        moral: { uz: "Ota-onangizni tinglang!", ru: "Слушайте своих родителей!", en: "Listen to your parents!" },
        characters: ['🥯', '🐰', '🐺', '🦊'], order: 8
      },
      {
        emoji: '🥕', color: '#84cc16', videoUrl: 'https://www.youtube.com/embed/TZ4V080ngoo', duration: 6,
        title: { uz: "Sholg'om ertagi", ru: "Репка", en: "The Giant Turnip" },
        description: { uz: "Katta sholg'omni surib olish uchun butun oila birlashadi.", ru: "Вся семья объединяется, чтобы вытащить большую репку.", en: "The whole family unites to pull out a giant turnip." },
        moral: { uz: "Birgalikda kuch bor!", ru: "В единстве - сила!", en: "Unity is strength!" },
        characters: ['👴', '👵', '👧', '🐕'], order: 9
      },
      {
        emoji: '🐐', color: '#14b8a6', videoUrl: 'https://www.youtube.com/embed/pUYhEcDCll0', duration: 9,
        title: { uz: "Echki va yetti uloq", ru: "Волк и семеро козлят", en: "The Wolf and Seven Kids" },
        description: { uz: "Echki onasi bolalarini bo'ridan qanday himoya qilganini ko'ring.", ru: "Посмотрите, как мама-коза защитила своих детей от волка.", en: "See how mother goat protected her kids from the wolf." },
        moral: { uz: "Eshikni notanish odamlarga ochmang!", ru: "Не открывайте дверь незнакомцам!", en: "Don't open the door to strangers!" },
        characters: ['🐐', '🐐', '🐐', '🐺'], order: 10
      },
      {
        emoji: '💎', color: '#6366f1', videoUrl: 'https://www.youtube.com/embed/TY0Zxw6ep9Q', duration: 11,
        title: { uz: "Zumrad va Qimmat", ru: "Зумрад и Киммат", en: "Zumrad and Kimmat" },
        description: { uz: "Ikki opa-singil haqidagi o'zbek xalq ertagi.", ru: "Узбекская народная сказка о двух сёстрах.", en: "Uzbek folk tale about two sisters." },
        moral: { uz: "Mehnatsevarlik va kamtarlik mukofotlanadi!", ru: "Трудолюбие и скромность вознаграждаются!", en: "Hard work and humility are rewarded!" },
        characters: ['👧', '👧', '👵', '💎'], order: 11
      },
      {
        emoji: '🐑', color: '#a855f7', videoUrl: 'https://www.youtube.com/embed/3kx5kcq6WF8', duration: 5,
        title: { uz: "Yolg'onchi cho'pon", ru: "Мальчик-пастух и волк", en: "The Boy Who Cried Wolf" },
        description: { uz: "Yolg'on gapirgan cho'pon bola haqidagi ibratli ertak.", ru: "Поучительная сказка о мальчике-пастухе, который лгал.", en: "A moral tale about a shepherd boy who lied." },
        moral: { uz: "Yolg'on gapirmaslik kerak!", ru: "Нельзя лгать!", en: "Never tell lies!" },
        characters: ['👦', '🐑', '🐺', '👨‍🌾'], order: 12
      }
    ]
    
    // Mavjud ertaklarni o'chirish va yangisini qo'shish
    await collection.deleteMany({})
    
    const storiesWithDates = allStories.map(s => ({ ...s, createdAt: new Date(), updatedAt: new Date() }))
    await collection.insertMany(storiesWithDates)
    
    res.json({ success: true, message: 'Ertaklar qo\'shildi', count: allStories.length })
  } catch (error) {
    console.error('Library seed error:', error)
    res.status(500).json({ success: false, error: 'Server xatosi' })
  }
})

export default router
