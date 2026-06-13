const express = require('express');
const router = express.Router();
const { register, login, getMe, createAdmin, getAllUsers, seedAdmin } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/seed-admin', seedAdmin);
router.post('/create-admin', protect, restrictTo('superadmin'), createAdmin);
router.get('/users', protect, restrictTo('admin', 'superadmin'), getAllUsers);

module.exports = router;
