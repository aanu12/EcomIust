const User = require('../models/User');

/**
 * Seed initial Admin user securely if not present in database.
 */
const seedAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'sahil@ecom.iust';
    const adminPassword = process.env.ADMIN_PASSWORD || 'sahil123';

    let admin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!admin) {
      admin = new User({
        name: 'System Admin',
        email: adminEmail.toLowerCase(),
        course: 'Administration',
        password: adminPassword,
        role: 'admin',
        status: 'approved'
      });
      await admin.save();
      console.log(`👑 Admin user initialized successfully (${adminEmail})`);
    } else {
      // Ensure admin privileges and approval status
      let updated = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        updated = true;
      }
      if (admin.status !== 'approved') {
        admin.status = 'approved';
        updated = true;
      }
      if (updated) {
        await admin.save();
        console.log(`👑 Admin user status/role updated (${adminEmail})`);
      }
    }
  } catch (error) {
    console.error('❌ Admin user seeding failed:', error.message);
  }
};

module.exports = seedAdminUser;
