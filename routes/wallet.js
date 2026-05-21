const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/auth');

router.get('/balance', authMiddleware, walletController.getBalance);
router.post('/convert', authMiddleware, walletController.convertCurrency);
router.get('/rates', authMiddleware, walletController.getExchangeRates);

module.exports = router;