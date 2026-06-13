const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// POST /api/payment/create-checkout-session
const createCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    // Build Stripe line items from order
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order-confirmation/${orderId}?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
      metadata: { orderId: orderId.toString() },
    });

    // Store session ID on the order
    order.stripeSessionId = session.id;
    await order.save();

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

// POST /api/payment/webhook — Stripe webhook to mark order as paid
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });
      console.log(`✅ Payment confirmed for order: ${orderId}`);
    }
  }

  res.json({ received: true });
};

// GET /api/payment/session/:sessionId — Verify payment status
const verifyPayment = async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({
      success: true,
      paymentStatus: session.payment_status,
      orderId: session.metadata?.orderId,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCheckoutSession, stripeWebhook, verifyPayment };
