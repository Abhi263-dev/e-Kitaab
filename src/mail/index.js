const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dudedhan@gmail.com',
    pass: 'abhidude@29',
  },
});

module.exports = transporter;