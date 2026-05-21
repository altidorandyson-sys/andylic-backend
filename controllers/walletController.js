const User = require('../models/User');
const exchangeService = require('../services/exchangeService');

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('wallets');
    res.json({ wallets: user.wallets });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};

exports.convertCurrency = async (req, res) => {
  try {
    const { amount, from, to } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    
    if (user.wallets[from] < amount) {
      return res.status(400).json({ message: 'Solde AndyClic insuffisant' });
    }

    const conversion = await exchangeService.convert(amount, from, to);

    user.wallets[from] -= amount;
    user.wallets[to] += conversion.convertedAmount;
    await user.save();

    res.json({
      message: 'Conversion AndyClic reussie',
      conversion,
      newBalances: user.wallets
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};

exports.getExchangeRates = async (req, res) => {
  try {
    const { base } = req.query;
    const currencies = ['HTG', 'USD', 'DOP'];
    const rates = {};

    for (const curr of currencies) {
      if (curr !== base) {
        rates[curr] = await exchangeService.getRate(base, curr);
      }
    }

    res.json({ base, rates });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};