const { PromoCode } = require('../models/Extra');

// POST /api/promo/validate
const validatePromo = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

    if (!promo) return res.status(404).json({ success: false, message: 'Invalid promo code' });
    if (promo.expiresAt && new Date() > promo.expiresAt) return res.status(400).json({ success: false, message: 'Promo code has expired' });
    if (promo.usedCount >= promo.maxUses) return res.status(400).json({ success: false, message: 'Promo code has reached its usage limit' });
    if (orderAmount < promo.minOrderAmount) return res.status(400).json({ success: false, message: `Minimum order amount is $${promo.minOrderAmount}` });

    const discount = promo.discountType === 'percentage'
      ? (orderAmount * promo.discountValue) / 100
      : promo.discountValue;

    res.json({ success: true, data: { code: promo.code, discountType: promo.discountType, discountValue: promo.discountValue, discount: parseFloat(discount.toFixed(2)) } });
  } catch (err) { next(err); }
};

// POST /api/promo/use
const usePromo = async (req, res, next) => {
  try {
    const { code } = req.body;
    await PromoCode.findOneAndUpdate({ code: code.toUpperCase() }, { $inc: { usedCount: 1 } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// POST /api/promo (admin - create)
const createPromo = async (req, res, next) => {
  try {
    const promo = await PromoCode.create(req.body);
    res.status(201).json({ success: true, data: promo });
  } catch (err) { next(err); }
};

// GET /api/promo (admin)
const getAllPromos = async (req, res, next) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json({ success: true, data: promos });
  } catch (err) { next(err); }
};

// DELETE /api/promo/:id (admin)
const deletePromo = async (req, res, next) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Promo deleted' });
  } catch (err) { next(err); }
};

// POST /api/promo/seed - create demo promo codes
const seedPromos = async (req, res, next) => {
  try {
    await PromoCode.deleteMany({});
    const promos = await PromoCode.insertMany([
      { code: 'SAVE10', discountType: 'percentage', discountValue: 10, minOrderAmount: 20, maxUses: 100 },
      { code: 'SAVE20', discountType: 'percentage', discountValue: 20, minOrderAmount: 50, maxUses: 50 },
      { code: 'FLAT5', discountType: 'fixed', discountValue: 5, minOrderAmount: 15, maxUses: 200 },
      { code: 'WELCOME', discountType: 'percentage', discountValue: 15, minOrderAmount: 0, maxUses: 500 },
      { code: 'BIGSAVE', discountType: 'fixed', discountValue: 10, minOrderAmount: 40, maxUses: 100 },
    ]);
    res.status(201).json({ success: true, message: `${promos.length} promo codes seeded`, data: promos });
  } catch (err) { next(err); }
};

module.exports = { validatePromo, usePromo, createPromo, getAllPromos, deletePromo, seedPromos };
