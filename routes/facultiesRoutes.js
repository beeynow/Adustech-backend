/**
 * ============================================================================
 * FACULTIES ROUTES
 * Routes for academic structure navigation
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const { param } = require('express-validator');

const {
    getAllFaculties,
    getFaculty,
    getFacultyDepartments,
    getDepartment,
    getDepartmentLevels,
    getLevel,
    getUserAcademicContext
} = require('../controllers/facultiesController');

const { isAuthenticated } = require('../middleware/authmiddleware');

// GET /api/faculties - Get all faculties
router.get('/', isAuthenticated, getAllFaculties);

// GET /api/faculties/:facultyId - Get single faculty
router.get('/:facultyId',
    isAuthenticated,
    [param('facultyId').isString().notEmpty()],
    getFaculty
);

// GET /api/faculties/:facultyId/departments - Get faculty departments
router.get('/:facultyId/departments',
    isAuthenticated,
    [param('facultyId').isString().notEmpty()],
    getFacultyDepartments
);

// GET /api/departments/:departmentId - Get single department
router.get('/departments/:departmentId',
    isAuthenticated,
    [param('departmentId').isString().notEmpty()],
    getDepartment
);

// GET /api/departments/:departmentId/levels - Get department levels
router.get('/departments/:departmentId/levels',
    isAuthenticated,
    [param('departmentId').isString().notEmpty()],
    getDepartmentLevels
);

// GET /api/levels/:levelId - Get single level
router.get('/levels/:levelId',
    isAuthenticated,
    [param('levelId').isString().notEmpty()],
    getLevel
);

module.exports = router;
