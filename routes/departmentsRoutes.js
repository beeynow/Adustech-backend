const express = require('express');
const router = express.Router();
const departmentsController = require('../controllers/departmentsController');
const { isAuthenticated } = require('../middleware/authmiddleware');

// ==========================================
// DEPARTMENT CHANNEL ROUTES
// ==========================================

// Public routes (anyone can view departments)
router.get('/departments', departmentsController.getDepartments);
router.get('/departments/:id', departmentsController.getDepartmentById);
router.get('/departments/:id/levels', departmentsController.getDepartmentLevels);

// Protected routes (require authentication)
router.use(isAuthenticated);

// Power admin only routes
router.post('/departments', departmentsController.createDepartment);
router.put('/departments/:id', departmentsController.updateDepartment);
router.delete('/departments/:id', departmentsController.deleteDepartment);

// Admin routes (power, admin, d-admin)
router.get('/departments/:id/users', departmentsController.getDepartmentUsers);

module.exports = router;
