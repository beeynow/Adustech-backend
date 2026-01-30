const express = require('express');
const auth = require('../middleware/authmiddleware');
const { listChannels, createChannel, getChannel } = require('../controllers/channelsController');
const { createChannelValidation, mongoIdValidation } = require('../middleware/validation');

const router = express.Router();

router.get('/channels', auth, listChannels);
router.post('/channels', auth, createChannelValidation, createChannel);
router.get('/channels/:id', auth, mongoIdValidation, getChannel);

module.exports = router;
