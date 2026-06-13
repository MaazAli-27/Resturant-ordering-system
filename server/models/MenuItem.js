const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
     enum: ['Starters', 'Burgers', 'Pizza', 'Sandwiches', 'BBQ', 'Desi', 'Sides', 'Desserts', 'Ice Cream', 'Shakes', 'Drinks'],
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/300x200?text=Food+Item',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
