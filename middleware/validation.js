const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('firstName').trim().notEmpty().withMessage('Prenom requis'),
  body('lastName').trim().notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe min. 6 caracteres'),
  body('phone').trim().notEmpty().withMessage('Telephone requis')
];

const validateLogin = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

const validatePayment = [
  body('receiverPhone').trim().notEmpty().withMessage('Telephone du destinataire requis'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Montant invalide'),
  body('currency').isIn(['HTG', 'USD', 'DOP']).withMessage('Devise invalide')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePayment,
  handleValidationErrors
};