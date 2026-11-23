const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All employee management routes are strictly Admin-only
router.get('/', verifyToken, requireRole('admin'), userController.getAllEmployees);
router.get('/departments', verifyToken, requireRole('admin'), userController.getEmployeeDepartments);
router.post('/', verifyToken, requireRole('admin'), userController.createEmployee);
router.put('/:id', verifyToken, requireRole('admin'), userController.updateEmployee);
router.delete('/batch', verifyToken, requireRole('admin'), userController.deleteBatchEmployees);
router.delete('/:id', verifyToken, requireRole('admin'), userController.deleteEmployee);

module.exports = router;
