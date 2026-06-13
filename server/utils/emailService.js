const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send order confirmation email
const sendOrderConfirmation = async (order) => {
  if (!order.customerEmail) return;

  const itemsList = order.items.map(item =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:'Lato',sans-serif;max-width:600px;margin:0 auto;background:#f7f4ef;padding:20px;">
      <div style="background:#1a1a2e;padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#f4c542;font-family:'Georgia',serif;margin:0;">🍽️ Savoria</h1>
        <p style="color:#aaa;margin:8px 0 0;">Your order has been placed!</p>
      </div>
      <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
        <h2 style="color:#1a1a2e;">Order Confirmation</h2>
        <p style="color:#666;">Hi <strong>${order.customerName}</strong>, thank you for your order!</p>
        <div style="background:#f7f4ef;padding:15px;border-radius:8px;margin:16px 0;">
          <p style="margin:0;color:#888;font-size:0.85rem;">Order ID</p>
          <p style="margin:4px 0 0;font-size:1.2rem;font-weight:700;color:#1a1a2e;">#${order._id.toString().slice(-6).toUpperCase()}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#f7f4ef;">
              <th style="padding:10px;text-align:left;color:#666;font-size:0.85rem;">Item</th>
              <th style="padding:10px;text-align:center;color:#666;font-size:0.85rem;">Qty</th>
              <th style="padding:10px;text-align:right;color:#666;font-size:0.85rem;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsList}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px;font-weight:700;color:#1a1a2e;">Total</td>
              <td style="padding:12px;font-weight:700;color:#f4c542;text-align:right;font-size:1.1rem;">$${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <div style="background:#1a1a2e;padding:15px;border-radius:8px;text-align:center;margin-top:20px;">
          <p style="color:#aaa;margin:0;font-size:0.85rem;">Track your order status in real-time on our website</p>
        </div>
        <p style="color:#aaa;font-size:0.8rem;text-align:center;margin-top:20px;">© 2024 Savoria Restaurant. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Savoria Restaurant" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `✅ Order Confirmed! #${order._id.toString().slice(-6).toUpperCase()}`,
      html,
    });
    console.log(`📧 Order confirmation email sent to ${order.customerEmail}`);
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
  }
};

// Send order status update email
const sendStatusUpdate = async (order, status) => {
  if (!order.customerEmail) return;

  const statusMessages = {
    confirmed: { emoji: '✅', msg: 'Your order has been confirmed!', sub: 'Our kitchen is getting ready.' },
    preparing: { emoji: '👨‍🍳', msg: 'Your order is being prepared!', sub: 'Our chef is working on your meal.' },
    ready: { emoji: '🔔', msg: 'Your order is ready!', sub: 'Your food is ready for pickup/delivery.' },
    delivered: { emoji: '🎉', msg: 'Your order has been delivered!', sub: 'Enjoy your meal! Thank you for choosing Savoria.' },
    cancelled: { emoji: '❌', msg: 'Your order has been cancelled.', sub: 'Please contact us if you have any questions.' },
  };

  const info = statusMessages[status];
  if (!info) return;

  const html = `
    <div style="font-family:'Lato',sans-serif;max-width:600px;margin:0 auto;background:#f7f4ef;padding:20px;">
      <div style="background:#1a1a2e;padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#f4c542;font-family:'Georgia',serif;margin:0;">🍽️ Savoria</h1>
      </div>
      <div style="background:white;padding:30px;border-radius:0 0 12px 12px;text-align:center;">
        <div style="font-size:4rem;">${info.emoji}</div>
        <h2 style="color:#1a1a2e;">${info.msg}</h2>
        <p style="color:#666;">${info.sub}</p>
        <div style="background:#f7f4ef;padding:15px;border-radius:8px;margin:16px 0;display:inline-block;">
          <p style="margin:0;color:#888;font-size:0.85rem;">Order ID</p>
          <p style="margin:4px 0 0;font-size:1.2rem;font-weight:700;color:#1a1a2e;">#${order._id.toString().slice(-6).toUpperCase()}</p>
        </div>
        <p style="color:#aaa;font-size:0.8rem;margin-top:20px;">© 2024 Savoria Restaurant</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Savoria Restaurant" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `${info.emoji} Order Update — #${order._id.toString().slice(-6).toUpperCase()}`,
      html,
    });
  } catch (err) {
    console.error('❌ Status email failed:', err.message);
  }
};

// Send reservation confirmation
const sendReservationConfirmation = async (reservation) => {
  if (!reservation.email) return;
  const html = `
    <div style="font-family:'Lato',sans-serif;max-width:600px;margin:0 auto;background:#f7f4ef;padding:20px;">
      <div style="background:#1a1a2e;padding:30px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#f4c542;font-family:'Georgia',serif;margin:0;">🍽️ Savoria</h1>
        <p style="color:#aaa;margin:8px 0 0;">Table Reservation Confirmed!</p>
      </div>
      <div style="background:white;padding:30px;border-radius:0 0 12px 12px;">
        <h2 style="color:#1a1a2e;">🪑 Reservation Details</h2>
        <p>Hi <strong>${reservation.name}</strong>, your table has been reserved!</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px;color:#666;">📅 Date</td><td style="padding:10px;font-weight:700;">${reservation.date}</td></tr>
          <tr style="background:#f7f4ef;"><td style="padding:10px;color:#666;">⏰ Time</td><td style="padding:10px;font-weight:700;">${reservation.time}</td></tr>
          <tr><td style="padding:10px;color:#666;">👥 Guests</td><td style="padding:10px;font-weight:700;">${reservation.guests}</td></tr>
          ${reservation.specialRequests ? `<tr style="background:#f7f4ef;"><td style="padding:10px;color:#666;">📝 Requests</td><td style="padding:10px;">${reservation.specialRequests}</td></tr>` : ''}
        </table>
        <p style="color:#aaa;font-size:0.85rem;margin-top:20px;">We look forward to seeing you! Please arrive 5 minutes early.</p>
        <p style="color:#aaa;font-size:0.8rem;">© 2024 Savoria Restaurant</p>
      </div>
    </div>
  `;
  try {
    await transporter.sendMail({
      from: `"Savoria Restaurant" <${process.env.EMAIL_USER}>`,
      to: reservation.email,
      subject: `🪑 Reservation Confirmed — ${reservation.date} at ${reservation.time}`,
      html,
    });
  } catch (err) {
    console.error('❌ Reservation email failed:', err.message);
  }
};

module.exports = { sendOrderConfirmation, sendStatusUpdate, sendReservationConfirmation };
