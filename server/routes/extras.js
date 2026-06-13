// ─── routes/reviews.js ───────────────────────────────────────────────────────
const express = require('express');
const reviewRouter = express.Router();
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

reviewRouter.get('/:menuItemId', getReviews);
reviewRouter.post('/:menuItemId', protect, createReview);
reviewRouter.delete('/:id', protect, deleteReview);

// ─── routes/reservations.js ──────────────────────────────────────────────────
const reservationRouter = express.Router();
const { createReservation, getAllReservations, updateReservationStatus, deleteReservation } = require('../controllers/reservationController');

reservationRouter.post('/', createReservation);
reservationRouter.get('/', getAllReservations);
reservationRouter.patch('/:id/status', updateReservationStatus);
reservationRouter.delete('/:id', deleteReservation);

// ─── routes/promo.js ─────────────────────────────────────────────────────────
const promoRouter = express.Router();
const { validatePromo, usePromo, createPromo, getAllPromos, deletePromo, seedPromos } = require('../controllers/promoController');

promoRouter.post('/validate', validatePromo);
promoRouter.post('/use', usePromo);
promoRouter.post('/seed', seedPromos);
promoRouter.post('/', createPromo);
promoRouter.get('/', getAllPromos);
promoRouter.delete('/:id', deletePromo);

module.exports = { reviewRouter, reservationRouter, promoRouter };
