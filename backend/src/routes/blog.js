import express from 'express'
import mongoose from 'mongoose'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const getCollection = (name) => mongoose.connection.collection(name)

// GET /api/blog
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    let query = { isDeleted: { $ne: true } }
    if (category) query.category = category
    
    const posts = await getCollection('blog').find(query).sort({ createdAt: -1 }).toArray()
    const published = posts.filter(p => p.published !== false && p.isPublished !== false)
    const total = published.length
    const paginated = published.slice(skip, skip + parseInt(limit))
    
    res.json({
      data: paginated.map(p => ({ ...p, id: p._id || p.id })),
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

// GET /api/blog/:id
router.get('/:id', async (req, res) => {
  try {
    const posts = await getCollection('blog').find({}).toArray()
    const post = posts.find(p => (p._id?.toString() || p.id) === req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json({ ...post, id: post._id || post.id })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' })
  }
})

// POST /api/blog
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newPost = { ...req.body, author: req.user.username, published: true, createdAt: new Date() }
    const result = await getCollection('blog').insertOne(newPost)
    res.status(201).json({ ...newPost, id: result.insertedId })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post' })
  }
})

// PUT /api/blog/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const posts = await getCollection('blog').find({}).toArray()
    const post = posts.find(p => (p._id?.toString() || p.id) === req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    
    const updateData = { ...req.body, updatedAt: new Date() }
    if (post._id) {
      await getCollection('blog').updateOne({ _id: post._id }, { $set: updateData })
    } else {
      await getCollection('blog').updateOne({ id: post.id }, { $set: updateData })
    }
    res.json({ ...post, ...updateData })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog post' })
  }
})

// DELETE /api/blog/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const posts = await getCollection('blog').find({}).toArray()
    const post = posts.find(p => (p._id?.toString() || p.id) === req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    
    if (post._id) {
      await getCollection('blog').updateOne({ _id: post._id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    } else {
      await getCollection('blog').updateOne({ id: post.id }, { $set: { isDeleted: true, deletedAt: new Date() } })
    }
    res.json({ message: 'Post deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post' })
  }
})

export default router
