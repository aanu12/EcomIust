const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Single, authoritative Nodemailer SMTP transporter.
 * Uses port 587 with secure: false and STARTTLS (requireTLS: true).
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = (process.env.SMTP_USER || '').trim();
  const passRaw = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';
  const pass = passRaw.trim().replace(/\s+/g, '');

  if (!user || !pass) {
    console.warn('⚠️ SMTP user or password environment variable is missing.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // Port 587 uses STARTTLS
    requireTLS: true,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });
};

/**
 * Asynchronous SMTP Transporter verification
 */
const verifySMTP = async () => {
  const transporter = createTransporter();
  if (!transporter) return false;

  console.log(`📧 Verifying SMTP Transporter (smtp.gmail.com:587) for ${process.env.SMTP_USER}...`);
  try {
    await transporter.verify();
    console.log('✅ SMTP Transporter verified successfully!');
    return true;
  } catch (error) {
    console.warn(`⚠️ SMTP Transporter verification result: ${error.message}`);
    if (error.message.includes('535') || error.message.includes('BadCredentials')) {
      console.error('🚨 EXACT SMTP RESPONSE: 535-5.7.8 Username and Password not accepted');
      console.error('👉 REASON: The App Password in .env was revoked or 2-Step Verification is disabled on Google Account.');
    }
    return false;
  }
};

/**
 * Helper function to send email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[DRY RUN EMAIL] To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    const from = process.env.SMTP_FROM || `"IUST Ecom" <${process.env.SMTP_USER}>`;
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`✅ Email dispatched to ${to}: MessageID ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Send email failed to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { createTransporter, verifySMTP, sendEmail };
