/**
 * ============================================================================
 * INTEGRATED CHANNELS ROUTES
 * Bulletproof channel routes with auto profile integration
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const {
    autoJoinChannels,
    getAllChannels,
    getUserChannels,
    createChannel,
    joinChannel,
    leaveChannel,
    sendMessage,
    getChannelMessages,
    getRecommendedChannels
} = require('../controllers/integratedChannelsController');

const isAuthenticated = require('../middleware/authmiddleware');

/**
 * GET /api/channels/auto-join
 * Auto-join channels based on user's profile
 */
router.post('/auto-join', isAuthenticated, autoJoinChannels);

/**
 * GET /api/channels
 * Get all available channels with membership status
 */
router.get('/', isAuthenticated, getAllChannels);

/**
 * GET /api/channels/my-channels
 * Get channels user is a member of
 */
router.get('/my-channels', isAuthenticated, getUserChannels);

/**
 * GET /api/channels/recommended
 * Get recommended channels based on profile
 */
router.get('/recommended', isAuthenticated, getRecommendedChannels);

/**
 * POST /api/channels
 * Create a new channel (auto-associated with profile)
 */
router.post('/',
    isAuthenticated,
    [
        body('name')
            .trim()
            .notEmpty().withMessage('Channel name is required')
            .isLength({ min: 3, max: 50 }).withMessage('Channel name must be 3-50 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 200 }).withMessage('Description must not exceed 200 characters'),
        body('visibility')
            .optional()
            .isIn(['public', 'private']).withMessage('Visibility must be public or private'),
        body('scope')
            .optional()
            .isIn(['global', 'faculty', 'department', 'level']).withMessage('Invalid scope')
    ],
    createChannel
);

/**
 * POST /api/channels/:channelId/join
 * Join a channel
 */
router.post('/:channelId/join',
    isAuthenticated,
    [
        param('channelId').isString().notEmpty()
    ],
    joinChannel
);

/**
 * POST /api/channels/:channelId/leave
 * Leave a channel
 */
router.post('/:channelId/leave',
    isAuthenticated,
    [
        param('channelId').isString().notEmpty()
    ],
    leaveChannel
);

/**
 * POST /api/channels/:channelId/messages
 * Send a message to channel
 */
router.post('/:channelId/messages',
    isAuthenticated,
    [
        param('channelId').isString().notEmpty(),
        body('content')
            .trim()
            .notEmpty().withMessage('Message content is required')
            .isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters')
    ],
    sendMessage
);

/**
 * GET /api/channels/:channelId/messages
 * Get messages from a channel
 */
router.get('/:channelId/messages',
    isAuthenticated,
    [
        param('channelId').isString().notEmpty()
    ],
    getChannelMessages
);

module.exports = router;
