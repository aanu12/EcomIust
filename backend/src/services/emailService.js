const { sendEmail } = require('../config/smtp');

/**
 * Send Product Approved Email to Seller
 */
const sendProductApprovedEmail = async ({ sellerEmail, sellerName, productName, productId }) => {
  const subject = `🎉 Your Product "${productName}" Has Been Approved - IUST Ecom`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0;">IUST Ecom Marketplace</h2>
        <span style="color: #16a34a; font-weight: 700; font-size: 14px;">Product Listing Approved ✅</span>
      </div>
      <p style="color: #334155; font-size: 16px;">Hello <strong>${sellerName}</strong>,</p>
      <p style="color: #475569; line-height: 1.6;">
        Great news! Your product listing <strong>"${productName}"</strong> has been reviewed and approved by the IUST Ecom Admin team.
      </p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 15px; margin: 20px 0; color: #15803d;">
        <strong>Status:</strong> Live & Publicly Visible on Campus Marketplace
      </div>
      <p style="color: #475569; line-height: 1.6;">
        Interested students can now view your listing, add it to their cart, and arrange campus meetpoint pickup.
      </p>
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8;">
        Islamic University of Science & Technology (IUST) Campus E-Commerce
      </div>
    </div>
  `;

  try {
    await sendEmail({ to: sellerEmail, subject, html });
  } catch (err) {
    console.error('Failed to send product approval email:', err.message);
  }
};

/**
 * Send Product Rejected Email to Seller
 */
const sendProductRejectedEmail = async ({ sellerEmail, sellerName, productName, reason }) => {
  const subject = `Notice Regarding Your Product Listing "${productName}" - IUST Ecom`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0;">IUST Ecom Marketplace</h2>
        <span style="color: #dc2626; font-weight: 700; font-size: 14px;">Product Listing Status Update</span>
      </div>
      <p style="color: #334155; font-size: 16px;">Hello <strong>${sellerName}</strong>,</p>
      <p style="color: #475569; line-height: 1.6;">
        Your product listing <strong>"${productName}"</strong> was reviewed by the admin team but was not approved for the marketplace.
      </p>
      ${reason ? `<div style="background-color: #fff5f5; border: 1px solid #feb2b2; border-radius: 12px; padding: 15px; margin: 20px 0; color: #c53030;"><strong>Reason:</strong> ${reason}</div>` : ''}
      <p style="color: #475569; line-height: 1.6;">
        You can edit your listing from <strong>My Listings</strong> to update details or upload clearer images for re-review.
      </p>
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8;">
        Islamic University of Science & Technology (IUST) Campus E-Commerce
      </div>
    </div>
  `;

  try {
    await sendEmail({ to: sellerEmail, subject, html });
  } catch (err) {
    console.error('Failed to send product rejection email:', err.message);
  }
};

/**
 * Send Order Confirmation Email to Buyer
 */
const sendOrderConfirmationEmail = async ({ buyerEmail, buyerName, orderNumber, items = [], totalAmount, meetpoint }) => {
  const subject = `📦 Order Confirmation #${orderNumber} - IUST Ecom`;
  const itemsHtml = items.map((item) => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 10px; font-weight: 600; color: #0f172a;">${item.productName}</td>
      <td style="padding: 10px; color: #475569;">Qty: ${item.quantity}</td>
      <td style="padding: 10px; font-weight: 700; color: #0f172a; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0;">IUST Ecom Marketplace</h2>
        <span style="color: #16a34a; font-weight: 700; font-size: 14px;">Order Confirmed ✅</span>
      </div>
      <p style="color: #334155; font-size: 16px;">Hello <strong>${buyerName}</strong>,</p>
      <p style="color: #475569; line-height: 1.6;">
        Thank you for your order! Your purchase <strong>#${orderNumber}</strong> has been successfully placed.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a;">📍 Campus Meetpoint Location</h4>
        <div style="font-size: 15px; font-weight: 700; color: #2563eb;">${meetpoint?.name || 'Selected Meetpoint'}</div>
        <div style="font-size: 13px; color: #64748b;">Landmark: ${meetpoint?.landmark || 'Campus'}</div>
        ${meetpoint?.instructions ? `<div style="font-size: 12px; color: #475569; margin-top: 4px;">Instructions: ${meetpoint.instructions}</div>` : ''}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <thead>
          <tr style="background-color: #f8fafc; color: #64748b; text-align: left;">
            <th style="padding: 8px 10px;">Item</th>
            <th style="padding: 8px 10px;">Qty</th>
            <th style="padding: 8px 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 10px;">
        <span>Total Paid:</span>
        <span>₹${totalAmount.toLocaleString('en-IN')}</span>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8;">
        Islamic University of Science & Technology (IUST) Campus E-Commerce
      </div>
    </div>
  `;

  try {
    await sendEmail({ to: buyerEmail, subject, html });
  } catch (err) {
    console.error('Failed to send order confirmation email:', err.message);
  }
};

/**
 * Send Settlement Transferred Email to Seller
 */
const sendSettlementTransferredEmail = async ({ sellerEmail, sellerName, amount, orderNumber }) => {
  const subject = `💰 Seller Payout Transferred (₹${amount.toLocaleString('en-IN')}) - IUST Ecom`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0;">IUST Ecom Marketplace</h2>
        <span style="color: #16a34a; font-weight: 700; font-size: 14px;">Payout Transferred 💰</span>
      </div>
      <p style="color: #334155; font-size: 16px;">Hello <strong>${sellerName}</strong>,</p>
      <p style="color: #475569; line-height: 1.6;">
        Your seller payout for Order <strong>#${orderNumber}</strong> has been processed and transferred!
      </p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 13px; color: #15803d; font-weight: 600; text-transform: uppercase;">Amount Credited to Wallet</span>
        <div style="font-size: 28px; font-weight: 800; color: #15803d; margin-top: 4px;">₹${amount.toLocaleString('en-IN')}</div>
      </div>
      <p style="color: #475569; line-height: 1.6;">
        You can view your updated wallet balance and transaction ledger on your IUST Ecom Profile page.
      </p>
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8;">
        Islamic University of Science & Technology (IUST) Campus E-Commerce
      </div>
    </div>
  `;

  try {
    await sendEmail({ to: sellerEmail, subject, html });
  } catch (err) {
    console.error('Failed to send settlement email:', err.message);
  }
};

module.exports = {
  sendProductApprovedEmail,
  sendProductRejectedEmail,
  sendOrderConfirmationEmail,
  sendSettlementTransferredEmail
};
