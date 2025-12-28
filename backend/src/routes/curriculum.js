import express from 'express'
import mongoose from 'mongoose'

const router = express.Router()

const getCollection = (name) => mongoose.connection.collection(name)

const normalizeDoc = (doc) => {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

// O'quv dasturi (public)
router.get('/', async (req, res) => {
  try {
    const curriculum = await getCollection('curriculum').findOne({})
    
    if (!curriculum) {
      return res.json({ ageGroups: [], subjects: [], schedule: {} })
    }
    
    res.json(normalizeDoc(curriculum))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Yosh guruhi bo'yicha
router.get('/:ageGroupId', async (req, res) => {
  try {
    const curriculum = await getCollection('curriculum').findOne({})
    
    if (!curriculum || !curriculum.ageGroups) {
      return res.status(404).json({ error: 'Yosh guruhi topilmadi' })
    }
    
    const ageGroup = curriculum.ageGroups.find(g => g.id === req.params.ageGroupId)
    
    if (!ageGroup) {
      return res.status(404).json({ error: 'Yosh guruhi topilmadi' })
    }
    
    res.json(ageGroup)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
