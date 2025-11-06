import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/renthub');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Create super admin account
const createSuperAdmin = async () => {
  try {
    console.log('\n🔐 Creating Super Admin Account (Developer Access)...\n');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ email: 'superadmin@renthub.com' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin already exists!');
      console.log('\n📋 Super Admin Credentials:');
      console.log('═══════════════════════════════════════');
      console.log('Email: superadmin@renthub.com');
      console.log('Password: superadmin123');
      console.log('Username:', existingSuperAdmin.username);
      console.log('Role:', existingSuperAdmin.role);
      console.log('═══════════════════════════════════════\n');
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

    console.log('✅ Super Admin account created successfully!\n');
    console.log('📋 Super Admin Credentials (Developer Access):');
    console.log('═══════════════════════════════════════');
    console.log('Email: superadmin@renthub.com');
    console.log('Password: superadmin123');
    console.log('Username: superadmin');
    console.log('Role: superadmin');
    console.log('═══════════════════════════════════════');
    console.log('\n🔑 Permissions:');
    console.log('  ✅ Manage Users (tenants & landlords)');
    console.log('  ✅ Manage Properties');
    console.log('  ✅ Manage Admins (create, edit, delete)');
    console.log('  ✅ View System Logs');
    console.log('  ✅ System Settings');
    console.log('\n🌐 Login at: http://localhost:5000/admin\n');

    // Also show regular admin credentials if exists
    const regularAdmin = await Admin.findOne({ email: 'admin@renthub.com' });
    if (regularAdmin) {
      console.log('📋 Regular Admin Credentials (Limited Access):');
      console.log('═══════════════════════════════════════');
      console.log('Email: admin@renthub.com');
      console.log('Password: admin123');
      console.log('Username: admin');
      console.log('Role: admin');
      console.log('═══════════════════════════════════════');
      console.log('\n🔑 Permissions:');
      console.log('  ✅ Manage Users (tenants & landlords)');
      console.log('  ✅ Manage Properties');
      console.log('  ❌ Cannot manage other admins');
      console.log('  ✅ View System Logs');
      console.log('  ❌ No system settings access\n');
    }

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run
(async () => {
  await connectDB();
  await createSuperAdmin();
})();
