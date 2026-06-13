const { Review } = require('../models/Extra');

// GET /api/reviews/:menuItemId
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuItemId }).sort({ createdAt: -1 });
    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
    res.json({ success: true, count: reviews.length, avgRating, data: reviews });
  } catch (err) { next(err); }
};

// POST /api/reviews/:menuItemId
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const existing = await Review.findOne({ menuItem: req.params.menuItemId, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this item' });
    const review = await Review.create({
      menuItem: req.params.menuItemId,
      user: req.user._id,
      userName: req.user.name,
      rating,
      comment,
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

module.exports = { getReviews, createReview, deleteReview };
