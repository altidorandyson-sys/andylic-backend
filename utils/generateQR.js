const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generatePaymentQR = async (transactionData) => {
  const qrId = uuidv4();
  const qrData = JSON.stringify({
    type: 'andylic_payment',
    id: qrId,
    ...transactionData
  });
  
  const qrImage = await QRCode.toDataURL(qrData);
  return { qrId, qrImage, qrData };
};

const generateUserQR = async (userId, phone) => {
  const qrData = JSON.stringify({
    type: 'andylic_user',
    userId,
    phone
  });
  
  return await QRCode.toDataURL(qrData);
};

module.exports = { generatePaymentQR, generateUserQR };