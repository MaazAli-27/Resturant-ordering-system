const express = require('express');
const router = express.Router();
const Favourite = require('../models/Favourite');
const { protect } = require('../middleware/auth');

// GET /api/favourites — get user's favourites
router.get('/', protect, async (req, res, next) => {
  try {
    const favs = await Favourite.find({ user: req.user._id }).populate('menuItem');
    res.json({ success: true, data: favs.map(f => f.menuItem) });
  } catch (err) { next(err); }
});

// POST /api/favourites/:menuItemId — toggle favourite
router.post('/:menuItemId', protect, async (req, res, next) => {
  try {
    const existing = await Favourite.findOne({ user: req.user._id, menuItem: req.params.menuItemId });
    if (existing) {
      await Favourite.findByIdAndDelete(existing._id);
      return res.json({ success: true, isFavourite: false, message: 'Removed from favourites' });
    }
    await Favourite.create({ user: req.user._id, menuItem: req.params.menuItemId });
    res.json({ success: true, isFavourite: true, message: 'Added to favourites' });
  } catch (err) { next(err); }
});

// GET /api/favourites/check/:menuItemId
router.get('/check/:menuItemId', protect, async (req, res, next) => {
  try {
    const existing = await Favourite.findOne({ user: req.user._id, menuItem: req.params.menuItemId });
    res.json({ success: true, isFavourite: !!existing });
  } catch (err) { next(err); }
});

module.exports = router;
