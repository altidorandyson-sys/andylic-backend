const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateUserQR } = require('../utils/generateQR');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email ou telephone deja utilise' });
    }

    const user = new User({ firstName, lastName, email, password, phone });
    user.qrCode = await generateUserQR(user._id, phone);
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Bienvenue sur AndyClic ! Compte cree avec succes',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        wallets: user.wallets,
        qrCode: user.qrCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Connexion AndyClic reussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        wallets: user.wallets,
        qrCode: user.qrCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur AndyClic', error: error.message });
  }
};