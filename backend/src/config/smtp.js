const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Creates Nodemailer Transporter with fallback between Port 465 (SSL) and Port 587 (STARTTLS)
 * to work seamlessly on both Cloud hosting (Render) and local networks.
 */
const createTransporter = (preferredPort = 465) => {
  const user = (process.env.SMTP_USER || '').trim();
  const passRaw = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';
  const pass = passRaw.trim().replace(/\s+/g, '');

  if (!user || !pass) {
    console.warn('⚠️ SMTP user or password environment variable is missing.');
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || preferredPort.toString(), 10);
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    requireTLS: port === 587,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

/**
 * Asynchronous SMTP Transporter verification
 */
const verifySMTP = async () => {
  const user = (process.env.SMTP_USER || '').trim();
  if (!user) return false;

  console.log(`📧 Verifying SMTP Transporter for ${user}...`);

  // 1. Try Port 465 SSL first
  try {
    const t465 = createTransporter(465);
    await t465.verify();
    console.log('✅ SMTP Transporter verified successfully via Port 465 SSL!');
    return true;
  } catch (err465) {
    console.warn(`Port 465 SSL verify attempt: ${err465.message}`);
  }

  // 2. Fallback to Port 587 STARTTLS
  try {
    const t587 = createTransporter(587);
    await t587.verify();
    console.log('✅ SMTP Transporter verified successfully via Port 587 STARTTLS!');
    return true;
  } catch (err587) {
    console.error(`🚨 SMTP Transporter verification failed: ${err587.message}`);
    return false;
  }
};

/**
 * Robust Email Dispatch with Port 465 -> Port 587 Fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const user = (process.env.SMTP_USER || '').trim();
  if (!user) {
    console.log(`[DRY RUN EMAIL] To: ${to} | Subject: ${subject}`);
    return false;
  }

  const from = process.env.SMTP_FROM || `"IUST Ecom" <${user}>`;

  // Attempt 1: Port 465 SSL (Preferred for Render Cloud)
  try {
    const t465 = createTransporter(465);
    const info = await t465.sendMail({ from, to, subject, text, html });
    console.log(`✅ Email dispatched to ${to} via Port 465 SSL: MessageID ${info.messageId}`);
    return true;
  } catch (err465) {
    console.warn(`Port 465 email dispatch attempt failed (${err465.message}), attempting Port 587 STARTTLS fallback...`);
  }

  // Attempt 2: Port 587 STARTTLS Fallback
  try {
    const t587 = createTransporter(587);
    const info = await t587.sendMail({ from, to, subject, text, html });
    console.log(`✅ Email dispatched to ${to} via Port 587 STARTTLS: MessageID ${info.messageId}`);
    return true;
  } catch (err587) {
    console.error(`❌ Email dispatch failed on all ports to ${to}:`, err587.message);
    return false;
  }
};

module.exports = { createTransporter, verifySMTP, sendEmail };
