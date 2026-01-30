const express = require('express');
const auth = require('../middleware/authmiddleware');
const { createTimetable, listTimetables, getTimetable } = require('../controllers/timetablesController');
const { createTimetableValidation, mongoIdValidation } = require('../middleware/validation');

const router = express.Router();

router.get('/timetables', listTimetables);
router.post('/timetables', auth, createTimetableValidation, createTimetable);
router.get('/timetables/:id', mongoIdValidation, getTimetable);

module.exports = router;
