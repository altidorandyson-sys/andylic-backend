const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');
const { validatePayment, handleValidationErrors } = require('../middleware/validation');

router.post('/send', authMiddleware, validatePayment, handleValidationErrors, paymentController.sendPayment);
router.get('/transactions', authMiddleware, paymentController.getTransactions);
router.get('/transactions/:transactionId', authMiddleware, paymentController.getTransactionById);
router.post('/invoice/:transactionId', authMiddleware, paymentController.generateInvoice);

module.exports = router;