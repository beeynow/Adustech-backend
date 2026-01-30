const express = require('express');
const auth = require('../middleware/authmiddleware');
const { createEvent, listEvents, getEvent } = require('../controllers/eventsController');
const { createEventValidation, mongoIdValidation } = require('../middleware/validation');

const router = express.Router();

router.get('/events', listEvents);
router.post('/events', auth, createEventValidation, createEvent);
router.get('/events/:id', mongoIdValidation, getEvent);

module.exports = router;
