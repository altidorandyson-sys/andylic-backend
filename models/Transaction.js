const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  sender: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  receiver: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['HTG', 'USD', 'DOP'], required: true },
  convertedAmount: { type: Number },
  targetCurrency: { type: String, enum: ['HTG', 'USD', 'DOP'] },
  exchangeRate: { type: Number },
  type: { type: String, enum: ['payment', 'conversion', 'invoice'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
  description: { type: String },
  invoiceData: {
    invoiceNumber: { type: String },
    pdfUrl: { type: String },
    qrCodeData: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Transaction', transactionSchema);