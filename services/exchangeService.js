const axios = require('axios');
const ExchangeRate = require('../models/ExchangeRate');

const DEFAULT_RATES = {
  'USD/HTG': 131.50,
  'USD/DOP': 56.85,
  'HTG/USD': 0.0076,
  'HTG/DOP': 0.432,
  'DOP/USD': 0.0176,
  'DOP/HTG': 2.31
};

class ExchangeService {
  async getRate(from, to) {
    if (from === to) return 1;

    const pair = from + '/' + to;
    
    const cached = await ExchangeRate.findOne({ base: from, target: to });
    if (cached && (Date.now() - cached.updatedAt) < 3600000) {
      return cached.rate;
    }

    try {
      const response = await axios.get(
        'https://api.exchangerate-api.com/v4/latest/' + from,
        { timeout: 5000 }
      );
      
      const rate = response.data.rates[to];
      if (rate) {
        await ExchangeRate.findOneAndUpdate(
          { base: from, target: to },
          { rate, updatedAt: new Date() },
          { upsert: true }
        );
        return rate;
      }
    } catch (error) {
      console.log('API externe indisponible, utilisation taux par defaut');
    }

    return DEFAULT_RATES[pair] || 1;
  }

  async convert(amount, from, to) {
    const rate = await this.getRate(from, to);
    return {
      originalAmount: amount,
      convertedAmount: amount * rate,
      rate,
      from,
      to
    };
  }
}

module.exports = new ExchangeService();