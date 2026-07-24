const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/authController');
const { verifyJWT } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify
router.get('/verify', verifyJWT, verifyToken);

module.exports = router;
