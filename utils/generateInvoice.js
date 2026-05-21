const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (transaction, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);

    doc.fontSize(24).text('FACTURE ANDYCLIC', 50, 50);
    doc.fontSize(12).text('N: ' + transaction.invoiceData.invoiceNumber, 50, 90);
    doc.text('Date: ' + new Date(transaction.createdAt).toLocaleString('fr-FR'), 50, 110);

    doc.moveTo(50, 140).lineTo(550, 140).stroke();

    doc.fontSize(14).text('DETAILS DE LA TRANSACTION', 50, 160);
    doc.fontSize(12);
    doc.text('Expediteur: ' + transaction.sender.name, 50, 190);
    doc.text('Telephone: ' + transaction.sender.phone, 50, 210);
    doc.text('Destinataire: ' + transaction.receiver.name, 50, 230);
    doc.text('Telephone: ' + transaction.receiver.phone, 50, 250);

    doc.moveTo(50, 280).lineTo(550, 280).stroke();
    doc.fontSize(16).text('MONTANT', 50, 300);
    doc.fontSize(20).text(transaction.amount.toFixed(2) + ' ' + transaction.currency, 50, 330);

    if (transaction.convertedAmount) {
      doc.fontSize(12).text('Converti: ' + transaction.convertedAmount.toFixed(2) + ' ' + transaction.targetCurrency, 50, 370);
      doc.text('Taux: 1 ' + transaction.currency + ' = ' + transaction.exchangeRate + ' ' + transaction.targetCurrency, 50, 390);
    }

    doc.fontSize(14).text('Statut: ' + transaction.status.toUpperCase(), 50, 430);

    if (transaction.invoiceData.qrCodeData) {
      const qrBuffer = Buffer.from(transaction.invoiceData.qrCodeData.split(',')[1], 'base64');
      doc.image(qrBuffer, 400, 300, { width: 120 });
    }

    doc.fontSize(10).text('AndyClic - Transaction securisee', 50, 700, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

module.exports = { generateInvoicePDF };