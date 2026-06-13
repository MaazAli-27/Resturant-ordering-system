const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { sendOrderConfirmation, sendStatusUpdate } = require('../utils/emailService');
const { generateInvoice } = require('../utils/invoiceGenerator');

const createOrder = async (req, res, next) => {
  try {
    const { items, customerName, customerPhone, customerEmail, tableNumber, specialInstructions } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items in order' });
    let totalAmount = 0;
    const validatedItems = [];
    for (const orderItem of items) {
      const menuItem = await MenuItem.findById(orderItem.menuItemId);
      if (!menuItem) return res.status(404).json({ success: false, message: `Menu item ${orderItem.menuItemId} not found` });
      if (!menuItem.isAvailable) return res.status(400).json({ success: false, message: `${menuItem.name} is currently unavailable` });
      const qty = orderItem.quantity || 1;
      totalAmount += menuItem.price * qty;
      validatedItems.push({ menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: qty });
    }
    const order = await Order.create({ items: validatedItems, totalAmount: parseFloat(totalAmount.toFixed(2)), customerName, customerPhone, customerEmail, tableNumber, specialInstructions });
    sendOrderConfirmation(order);
    const io = req.app.get('io');
    if (io) io.to('admin-room').emit('new-order', order);
    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, count: orders.length, total, page: Number(page), pages: Math.ceil(total / limit), data: orders });
  } catch (err) { next(err); }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem', 'name image');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status value' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    sendStatusUpdate(order, status);
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${req.params.id}`).emit('order-status-update', { orderId: req.params.id, status });
      io.to('admin-room').emit('order-updated', { orderId: req.params.id, status });
    }
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) { next(err); }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    generateInvoice(order, res);
  } catch (err) { next(err); }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, downloadInvoice };
