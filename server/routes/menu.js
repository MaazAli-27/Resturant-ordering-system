const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenu,
} = require('../controllers/menuController');

router.get('/', getMenuItems);            // GET /api/menu?category=Starters
router.get('/:id', getMenuItemById);      // GET /api/menu/:id
router.post('/', createMenuItem);         // POST /api/menu (Admin)
router.put('/:id', updateMenuItem);       // PUT /api/menu/:id (Admin)
router.delete('/:id', deleteMenuItem);    // DELETE /api/menu/:id (Admin)


module.exports = router;
