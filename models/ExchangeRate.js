const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  base: { type: String, required: true },
  target: { type: String, required: true },
  rate: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

exchangeRateSchema.index({ base: 1, target: 1 }, { unique: true });

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);