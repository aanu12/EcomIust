const nodemailer = require('nodemailer');

/**
 * Create Nodemailer SMTP transporter configured from environment variables.
 * NEVER hardcode SMTP credentials in code.
 */
const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || SMTP_USER.includes('your_')) {
    console.warn('⚠️ SMTP Email service is not fully configured in environment variables.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: parseInt(SMTP_PORT || '587', 10) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transporter;
};

/**
 * Send an email helper function
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[DRY RUN EMAIL] To: ${to} | Subject: ${subject}`);
    return false;
  }

  const from = process.env.SMTP_FROM || 'Campus Marketplace <noreply@campusmarketplace.edu>';
  const info = await transporter.sendMail({ from, to, subject, text, html });
  console.log(`✅ Email sent: ${info.messageId}`);
  return true;
};

module.exports = { createTransporter, sendEmail };
