const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const marketController = require('../controllers/marketController');
const aiController = require('../controllers/aiController');
const tradeController = require('../controllers/tradeController');

// Auth Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Market Data Routes
router.get('/predict/:symbol', marketController.predict);

// AI Behavioral Route
router.post('/check-behavior', aiController.checkBehavior);

// Trade & Portfolio Routes
router.post('/trade', tradeController.trade);
router.get('/trades/:userId', tradeController.getTrades);
router.post('/watchlist/toggle', tradeController.toggleWatchlist);

module.exports = router;
