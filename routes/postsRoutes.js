const express = require('express');
const auth = require('../middleware/authmiddleware');
const { createPost, listPosts, toggleLikePost, toggleRepostPost, addComment, listComments, toggleLikeComment, health, getPost } = require('../controllers/postsController');
const { createPostValidation, addCommentValidation, mongoIdValidation } = require('../middleware/validation');

const router = express.Router();

router.get('/posts', listPosts);
router.post('/posts', auth, createPostValidation, createPost);
router.post('/posts/:id/like', auth, mongoIdValidation, toggleLikePost);
router.post('/posts/:id/repost', auth, mongoIdValidation, toggleRepostPost);
router.get('/posts/:id/comments', mongoIdValidation, listComments);
router.post('/posts/:id/comments', auth, mongoIdValidation, addCommentValidation, addComment);
router.post('/posts/:id/comments/:commentId/like', auth, toggleLikeComment);
router.get('/posts/:id', mongoIdValidation, getPost);
router.get('/health', health);

module.exports = router;
