/**
 * ============================================================================
 * ACADEMIC POSTS ROUTES
 * Route structure for Academic Notice Board System
 * ============================================================================
 */

const express = require('express');
const router = express.Router();

// Controllers
const {
    createPost,
    getGlobalPosts,
    getFacultyPosts,
    getLevelPosts,
    getPost,
    updatePost,
    deletePost,
    toggleLikePost,
    addComment
} = require('../controllers/academicPostsController');

// Middleware
const { isAuthenticated, canCreatePost, canViewPosts, canModifyPost, canComment } = require('../middleware/rbacMiddleware');
const { body, param } = require('express-validator');

/**
 * ============================================================================
 * POST ROUTES
 * ============================================================================
 */

/**
 * GET /api/academic/posts/global
 * Fetch global posts (Home page)
 * Access: Everyone (authenticated)
 */
router.get('/posts/global', isAuthenticated, getGlobalPosts);

/**
 * GET /api/academic/posts/faculty/:facultyId
 * Fetch faculty-specific posts
 * Access: Users belonging to the faculty
 */
router.get('/posts/faculty/:facultyId', 
    isAuthenticated, 
    canViewPosts('faculty'), 
    getFacultyPosts
);

/**
 * GET /api/academic/posts/level/:levelId
 * Fetch department level posts
 * Access: Users belonging to the level or admins
 */
router.get('/posts/level/:levelId', 
    isAuthenticated, 
    canViewPosts('level'), 
    getLevelPosts
);

/**
 * GET /api/academic/posts/:postId
 * Fetch single post with full details
 * Access: Everyone (authenticated)
 */
router.get('/posts/:postId', isAuthenticated, getPost);

/**
 * POST /api/academic/posts
 * Create a new post
 * Access: Admins only (validated by middleware)
 * 
 * Body:
 * - title (required)
 * - content (required)
 * - faculty_id (optional - for faculty posts)
 * - level_id (optional - for level posts)
 * - category (optional)
 * - priority (optional)
 * - image_url (optional)
 */
router.post('/posts', 
    isAuthenticated,
    canCreatePost,
    [
        body('title')
            .trim()
            .notEmpty().withMessage('Title is required')
            .isLength({ min: 3, max: 255 }).withMessage('Title must be 3-255 characters'),
        body('content')
            .trim()
            .notEmpty().withMessage('Content is required')
            .isLength({ min: 10, max: 10000 }).withMessage('Content must be 10-10000 characters'),
        body('category')
            .optional()
            .trim()
            .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters'),
        body('priority')
            .optional()
            .isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
        body('faculty_id')
            .optional()
            .isUUID().withMessage('Invalid faculty ID'),
        body('level_id')
            .optional()
            .isUUID().withMessage('Invalid level ID'),
        body('image_url')
            .optional()
            .isURL().withMessage('Invalid image URL')
    ],
    createPost
);

/**
 * PUT /api/academic/posts/:postId
 * Update a post
 * Access: Author or admins
 */
router.put('/posts/:postId',
    isAuthenticated,
    canModifyPost,
    [
        param('postId').isUUID().withMessage('Invalid post ID'),
        body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 255 }).withMessage('Title must be 3-255 characters'),
        body('content')
            .optional()
            .trim()
            .isLength({ min: 10, max: 10000 }).withMessage('Content must be 10-10000 characters'),
        body('category')
            .optional()
            .trim()
            .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters'),
        body('priority')
            .optional()
            .isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority')
    ],
    updatePost
);

/**
 * DELETE /api/academic/posts/:postId
 * Delete a post
 * Access: Author or admins
 */
router.delete('/posts/:postId',
    isAuthenticated,
    canModifyPost,
    [
        param('postId').isUUID().withMessage('Invalid post ID')
    ],
    deletePost
);

/**
 * POST /api/academic/posts/:postId/like
 * Toggle like on a post
 * Access: All authenticated users
 */
router.post('/posts/:postId/like',
    isAuthenticated,
    [
        param('postId').isUUID().withMessage('Invalid post ID')
    ],
    toggleLikePost
);

/**
 * POST /api/academic/posts/:postId/comments
 * Add a comment to a post
 * Access: All authenticated users (optional: can be restricted)
 */
router.post('/posts/:postId/comments',
    isAuthenticated,
    canComment,
    [
        param('postId').isUUID().withMessage('Invalid post ID'),
        body('content')
            .trim()
            .notEmpty().withMessage('Comment content is required')
            .isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters'),
        body('parentId')
            .optional()
            .isUUID().withMessage('Invalid parent comment ID')
    ],
    addComment
);

module.exports = router;
