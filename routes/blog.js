// ============================================================
// routes/blog.js — Blog Post Routes
// ============================================================
// GET    /api/blog         → public, view all published posts
// GET    /api/blog/:id     → public, view single post
// POST   /api/blog         → admin, create new post
// PUT    /api/blog/:id     → admin, update post
// DELETE /api/blog/:id     → admin, delete post
// ============================================================

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const Blog     = require('../models/Blog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// File upload setup for blog images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/'),
  filename:    (req, file, cb) => cb(null, 'blog-' + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


// -----------------------------------------------
// GET /api/blog
// PUBLIC — Get all published blog posts
// -----------------------------------------------
router.get('/', async (req, res) => {
  try {
    const posts = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// GET /api/blog/all (admin — includes unpublished)
// PROTECTED — Admin sees all posts
// -----------------------------------------------
router.get('/all', protect, async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// GET /api/blog/:id
// PUBLIC — Get a single blog post
// -----------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// POST /api/blog
// PROTECTED — Create a new blog post (admin only)
// -----------------------------------------------
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const blogData = { ...req.body };
    if (req.file) {
      blogData.image = '/images/' + req.file.filename;
    }

    const post = await Blog.create(blogData);
    res.status(201).json({ success: true, data: post, message: 'Blog post created!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// PUT /api/blog/:id
// PROTECTED — Update a blog post (admin only)
// -----------------------------------------------
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = '/images/' + req.file.filename;
    }

    const post = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({ success: true, data: post, message: 'Post updated!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// -----------------------------------------------
// DELETE /api/blog/:id
// PROTECTED — Delete a blog post (admin only)
// -----------------------------------------------
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Post deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
