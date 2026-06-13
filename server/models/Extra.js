// ─── Review Model ───────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ menuItem: 1, user: 1 }, { unique: true });
const Review = mongoose.model('Review', reviewSchema);

// ─── Reservation Model ───────────────────────────────────────────────────────
const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true, min: 1, max: 20 },
    specialRequests: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    tableNumber: { type: String },
  },
  { timestamps: true }
);
const Reservation = mongoose.model('Reservation', reservationSchema);

// ─── PromoCode Model ─────────────────────────────────────────────────────────
const promoSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);
const PromoCode = mongoose.model('PromoCode', promoSchema);

module.exports = { Review, Reservation, PromoCode };
