const SiteSettings = require('../models/SiteSettings');

/**
 * @desc    Get public site & footer settings
 * @route   GET /api/settings
 * @access  Public
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'IUST Ecom',
        siteDescription: 'The official university student marketplace for buying, selling, and trading campus goods, books, electronics, and supplies safely.',
        contactEmail: 'officialecommercestoreiust@gmail.com',
        contactPhone: '+91 (1933) 247225',
        address: 'Islamic University of Science & Technology, Awantipora, Jammu & Kashmir 192122',
        socialLinks: {
          instagram: '',
          facebook: '',
          twitter: '',
          linkedin: ''
        },
        copyrightText: '© 2026 IUST Ecom. All rights reserved. Islamic University of Science & Technology Student Marketplace.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update site & footer settings
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
const updateSettings = async (req, res, next) => {
  try {
    const { siteName, siteDescription, contactEmail, contactPhone, address, socialLinks, copyrightText } = req.body;

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    if (siteName !== undefined) settings.siteName = siteName.trim();
    if (siteDescription !== undefined) settings.siteDescription = siteDescription.trim();
    if (contactEmail !== undefined) settings.contactEmail = contactEmail.trim();
    if (contactPhone !== undefined) settings.contactPhone = contactPhone.trim();
    if (address !== undefined) settings.address = address.trim();
    if (socialLinks) {
      settings.socialLinks = {
        instagram: socialLinks.instagram !== undefined ? socialLinks.instagram.trim() : (settings.socialLinks?.instagram || ''),
        facebook: socialLinks.facebook !== undefined ? socialLinks.facebook.trim() : (settings.socialLinks?.facebook || ''),
        twitter: socialLinks.twitter !== undefined ? socialLinks.twitter.trim() : (settings.socialLinks?.twitter || ''),
        linkedin: socialLinks.linkedin !== undefined ? socialLinks.linkedin.trim() : (settings.socialLinks?.linkedin || '')
      };
    }
    if (copyrightText !== undefined) settings.copyrightText = copyrightText.trim();

    await settings.save();

    return res.status(200).json({
      status: 'success',
      message: 'Footer and site settings updated successfully.',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
