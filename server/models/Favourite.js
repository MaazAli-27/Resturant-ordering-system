const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
}, { timestamps: true });

favouriteSchema.index({ user: 1, menuItem: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
