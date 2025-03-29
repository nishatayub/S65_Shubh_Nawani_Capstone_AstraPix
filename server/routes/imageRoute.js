const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const creditCheck = require('../middlewares/creditCheck');
const { generateImage } = require('../controllers/imageController');

// Add both auth and credit check middleware
router.post('/generate', authMiddleware, creditCheck, generateImage);

module.exports = router;