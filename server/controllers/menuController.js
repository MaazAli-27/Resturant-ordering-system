const MenuItem = require('../models/MenuItem');

// GET /api/menu — Get all available menu items (optionally filter by category)
const getMenuItems = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isAvailable: true };
    if (category) filter.category = category;

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

// GET /api/menu/:id — Get single menu item
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// POST /api/menu — Create a new menu item (Admin)
const createMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/menu/:id — Update a menu item (Admin)
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/menu/:id — Delete a menu item (Admin)
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    next(err);
  }
};



module.exports = { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem };
