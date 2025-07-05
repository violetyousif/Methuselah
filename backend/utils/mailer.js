// Syed Rabbey, 07/04/2025, Created mailer.js to
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,      //  .env value
    pass: process.env.MAIL_PASS,      // App password
  },
});

export default transporter;
