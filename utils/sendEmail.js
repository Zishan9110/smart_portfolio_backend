const nodemailer = require('nodemailer');

/**
 * Sends an email. Returns silently (logging a warning) if SMTP isn't configured,
 * so the contact form still works (message is saved to DB) even without email setup.
 */
const sendEmail = async ({ to, subject, html, replyTo }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured — skipping email notification.');
    return { sent: false };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    replyTo,
  });

  return { sent: true };
};

module.exports = sendEmail;
