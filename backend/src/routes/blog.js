import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readData, writeData } from '../utils/db.js'
import { authenticateToken } from '../middleware/auth.js'
import { normalizeId } from '../utils/helpers.js'
import logger from '../utils/logger.js'
import BlogPost from '../models/BlogPost.js'

const router = express.Router()

// GET /api/blog
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = Math.min(parseInt(limit) || 10, 50) // Max 50 per page
    const skip = (pageNum - 1) * limitNum
    
    if (req.app.locals.useDatabase) {
      let query = { isPublished: true, isDeleted: { $ne: true } }
      if (category) query.category = category
      
      const [posts, total] = await Promise.all([
        BlogPost.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        BlogPost.countDocuments(query)
      ])
      
      return res.json({
        data: posts.map(normalizeId),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      })
    }
    
    let posts = readData('blog.json') || []
    posts = posts.filter(p => (p.published || p.isPublished) && !p.isDeleted)
    if (category) posts = posts.filter(p => p.category === category)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    const total = posts.length
    const paginated = posts.slice(skip, skip + limitNum)
    
    res.json({
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    })
  } catch (error) {
    logger.error('Blog fetch error', { error: error.message, stack: error.stack })
    res.status(500).json({ error: 'Failed to fetch blog posts' })
  }
})

// GET /api/blog/:id
router.get('/:id', async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const post = await BlogPost.findById(req.params.id)
      if (!post || !post.isPublished) return res.status(404).json({ error: 'Post not found' })
      // Increment views
      post.views += 1
      await post.save()
      return res.json(post)
    }
    
    const posts = readData('blog.json') || []
    const post = posts.find(p => p.id === req.params.id && p.published)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' })
  }
})

// POST /api/blog
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, excerpt, content, image, category } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }
    
    if (req.app.locals.useDatabase) {
      const post = new BlogPost({
        title,
        excerpt,
        content,
        image: image || '/images/gallery-1.jpg',
        category: category || 'news',
        authorName: req.user.username,
        isPublished: true
      })
      await post.save()
      return res.status(201).json(post)
    }
    
    const posts = readData('blog.json') || []
    const newPost = {
      id: uuidv4(),
      title,
      excerpt: excerpt || {},
      content,
      image: image || '/images/gallery-1.jpg',
      category: category || 'news',
      author: req.user.username,
      createdAt: new Date().toISOString(),
      published: true
    }
    posts.push(newPost)
    writeData('blog.json', posts)
    res.status(201).json(newPost)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post' })
  }
})

// PUT /api/blog/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!post) return res.status(404).json({ error: 'Post not found' })
      return res.json(post)
    }
    
    const posts = readData('blog.json') || []
    const index = posts.findIndex(p => p.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Post not found' })
    
    posts[index] = { ...posts[index], ...req.body, updatedAt: new Date().toISOString() }
    writeData('blog.json', posts)
    res.json(posts[index])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog post' })
  }
})

// DELETE /api/blog/:id (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.app.locals.useDatabase) {
      const post = await BlogPost.findByIdAndUpdate(
        req.params.id,
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id || 'unknown'
        },
        { new: true }
      )
      if (!post) return res.status(404).json({ error: 'Post not found' })
      return res.json({ message: 'Post deleted' })
    }
    
    let posts = readData('blog.json') || []
    const index = posts.findIndex(p => p.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Post not found' })
    
    // Soft delete
    posts[index].isDeleted = true
    posts[index].deletedAt = new Date().toISOString()
    posts[index].deletedBy = req.user?.id || 'unknown'
    
    writeData('blog.json', posts)
    res.json({ message: 'Post deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post' })
  }
})

export default router
