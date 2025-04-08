const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'TemplarHotelVerif@gmail.com',
    pass: 'ijcl guta vzhh nyht'
  }
});

module.exports = transporter;
