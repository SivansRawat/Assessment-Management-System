const express = require('express');
const router = express.Router();

const { 
  register, 
  login, 
  getProfile, 
  getStats 
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.get('/stats', protect, getStats);

module.exports = router;
