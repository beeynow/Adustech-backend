const express = require('express');
const auth = require('../middleware/authmiddleware');
const { createPost, listPosts, toggleLikePost, toggleRepostPost, addComment, listComments, toggleLikeComment, health, getPost } = require('../controllers/postsController');
const { createPostValidation, addCommentValidation, mongoIdValidation, commentIdValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/health', health);
router.get('/posts', listPosts); // Public - anyone can view posts
router.get('/posts/:id', mongoIdValidation, getPost); // Public - anyone can view a post
router.get('/posts/:id/comments', mongoIdValidation, listComments); // Public - anyone can view comments

// Protected routes (require authentication)
router.post('/posts', auth, createPostValidation, createPost);
router.post('/posts/:id/like', auth, mongoIdValidation, toggleLikePost);
router.post('/posts/:id/repost', auth, mongoIdValidation, toggleRepostPost);
router.post('/posts/:id/comments', auth, mongoIdValidation, addCommentValidation, addComment);
router.post('/posts/:id/comments/:commentId/like', auth, commentIdValidation, toggleLikeComment);

module.exports = router;
