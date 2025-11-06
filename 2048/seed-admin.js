import Admin from './models/Admin.js';

// Create super admin if it doesn't exist
export const seedAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ email: 'superadmin@renthub.com' });
    
    if (existingSuperAdmin) {
      console.log('✅ Super Admin already exists');
      return;
    }

    // Create new super admin with full permissions
    const superAdmin = new Admin({
      username: 'superadmin',
      email: 'superadmin@renthub.com',
      password: 'superadmin123',
      role: 'superadmin',
      permissions: {
        manageUsers: true,
        manageProperties: true,
        manageAdmins: true,
        viewLogs: true,
        systemSettings: true
      },
      active: true
    });

    await superAdmin.save();

    console.log('✅ Super Admin account created!');
    console.log('📋 Login Credentials:');
    console.log('   Email: superadmin@renthub.com');
    console.log('   Password: superadmin123');
    console.log('   URL: http://localhost:5000/admin.html');

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  }
};
