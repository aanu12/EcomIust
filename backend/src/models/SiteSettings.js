const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'IUST Ecom'
    },
    siteDescription: {
      type: String,
      default: 'The official university student marketplace for buying, selling, and trading campus goods, books, electronics, and supplies safely.'
    },
    contactEmail: {
      type: String,
      default: 'officialecommercestoreiust@gmail.com'
    },
    contactPhone: {
      type: String,
      default: '+91 (1933) 247225'
    },
    address: {
      type: String,
      default: 'Islamic University of Science & Technology, Awantipora, Jammu & Kashmir 192122'
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' }
    },
    copyrightText: {
      type: String,
      default: '© 2026 IUST Ecom. All rights reserved. Islamic University of Science & Technology Student Marketplace.'
    }
  },
  {
    timestamps: true
  }
);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
module.exports = SiteSettings;
