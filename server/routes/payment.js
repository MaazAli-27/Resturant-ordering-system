const express = require('express');
const router = express.Router();
const { createCheckoutSession, stripeWebhook, verifyPayment } = require('../controllers/paymentController');

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/create-checkout-session', createCheckoutSession);
router.get('/session/:sessionId', verifyPayment);

module.exports = router;