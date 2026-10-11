const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@auth.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        status: 'active',
      });
      console.log(`👑 Default admin created successfully: ${adminEmail}`);
    } else {
      let modified = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        modified = true;
      }
      if (admin.status !== 'active') {
        admin.status = 'active';
        modified = true;
      }
      if (modified) {
        await admin.save();
      }
      console.log(`👑 Default admin verified: ${adminEmail}`);
    }


  } catch (error) {
    console.error('Error checking/seeding admin user:', error.message);
  }
};

module.exports = seedAdmin;
