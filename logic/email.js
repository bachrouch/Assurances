var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transport = nodemailer.createTransport(smtpTransport({
  host: 'smtp.orange.tn',
  secure: false,
  ignoreTLS: true
}));
exports.send = transport.sendMail.bind(transport);
