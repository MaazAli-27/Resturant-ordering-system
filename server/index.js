const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

// ── SECURITY MIDDLEWARE ──────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API server
}));

// CORS - restrict to your domains
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3001',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ── PERFORMANCE MIDDLEWARE ───────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(mongoSanitize()); // Prevent NoSQL injection

// ── RATE LIMITING ────────────────────────────────────────

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 login attempts per 15 mins
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order creation limit
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 orders per hour
  message: { success: false, message: 'Too many orders placed, please try again later.' },
});

// Promo validation limit
const promoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many promo attempts, please try again later.' },
});

app.use('/api/', generalLimiter);

// ── ROUTES ───────────────────────────────────────────────
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const favouriteRoutes = require('./routes/favourites');
const { reviewRouter, reservationRouter, promoRouter } = require('./routes/extras');

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/reviews', reviewRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/promo/validate', promoLimiter);
app.use('/api/promo', promoRouter);

app.get('/', (req, res) => res.json({ message: '🍽️ Savoria API is running!' }));

// ── ERROR HANDLER ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message || 'Internal Server Error';
  res.status(err.status || 500).json({ success: false, message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── SOCKET.IO ────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('join-order', (orderId) => socket.join(`order-${orderId}`));
  socket.on('join-admin', () => socket.join('admin-room'));
  socket.on('disconnect', () => {});
});

// ── START SERVER ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
