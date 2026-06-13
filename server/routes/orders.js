const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, downloadInvoice } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/my-orders', protect, async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const orders = await Order.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});
router.get('/:id', getOrderById);
router.get('/:id/invoice', downloadInvoice);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

module.exports = router;


