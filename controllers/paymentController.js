const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const exchangeService = require('../services/exchangeService');
const { generatePaymentQR } = require('../utils/generateQR');
const { generateInvoicePDF } = require('../utils/generateInvoice');
const path = require('path');
const fs = require('fs');

exports.sendPayment = async (req, res) => {
  try {
    const { receiverPhone, amount, currency, description } = req.body;
    const senderId = req.user.userId;

    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ phone: receiverPhone });

    if (!receiver) {
      return res.status(404).json({ message: 'Destinataire AndyClic non trouve' });
    }

    if (sender.phone === receiverPhone) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer de l\'argent' });
    }

    if (sender.wallets[currency] < amount) {
      return res.status(400).json({ message: 'Solde AndyClic insuffisant' });
    }

    let targetCurrency = currency;
    if (!receiver.wallets[currency]) {
      const currencies = ['HTG', 'USD', 'DOP'];
      targetCurrency = currencies.find(c => receiver.wallets[c] !== undefined) || currency;
    }

    let convertedAmount = amount;
    let exchangeRate = 1;
    
    if (currency !== targetCurrency) {
      const conversion = await exchangeService.convert(amount, currency, targetCurrency);
      convertedAmount = conversion.convertedAmount;
      exchangeRate = conversion.rate;
    }

    const transaction = new Transaction({
      transactionId: 'TXN-' + uuidv4().slice(0, 8).toUpperCase(),
      sender: {
        userId: sender._id,
        name: sender.firstName + ' ' + sender.lastName,
        phone: sender.phone
      },
      receiver: {
        userId: receiver._id,
        name: receiver.firstName + ' ' + receiver.lastName,
        phone: receiver.phone
      },
      amount,
      currency,
      convertedAmount,
      targetCurrency,
      exchangeRate,
      type: 'payment',
      status: 'completed',
      description
    });

    sender.wallets[currency] -= amount;
    receiver.wallets[targetCurrency] += convertedAmount;

    await sender.save();
    await receiver.save();
    await transaction.save();

    res.json({
      message: 'Paiement AndyClic effectue avec succes',
      transaction: {
        id: transaction.transactionId,
        amount,
        currency,
        convertedAmount,
        targetCurrency,
        receiver: transaction.receiver.name,
        completedAt: transaction.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findOne({ transactionId });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction AndyClic non trouvee' });
    }

    const userId = req.user.userId;
    if (transaction.sender.userId.toString() !== userId && 
        transaction.receiver.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Acces non autorise' });
    }

    const { qrImage } = await generatePaymentQR({
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      currency: transaction.currency
    });

    const invoiceNumber = 'INV-' + Date.now();
    transaction.invoiceData = {
      invoiceNumber,
      qrCodeData: qrImage
    };
    await transaction.save();

    const invoicesDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const pdfPath = path.join(invoicesDir, invoiceNumber + '.pdf');
    await generateInvoicePDF(transaction, pdfPath);

    res.json({
      message: 'Facture AndyClic generee avec succes',
      invoice: {
        invoiceNumber,
        pdfUrl: '/invoices/' + invoiceNumber + '.pdf',
        qrCode: qrImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({
      $or: [
        { 'sender.userId': userId },
        { 'receiver.userId': userId }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findOne({ transactionId });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction AndyClic non trouvee' });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};