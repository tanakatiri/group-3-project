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

// Fix admin accounts
const fixAdminAccounts = async () => {
  try {
    console.log('\n🔧 Checking admin accounts...\n');

    // Check superadmin
    const superAdmin = await Admin.findOne({ email: 'superadmin@renthub.com' });
    if (superAdmin) {
      console.log('✅ Super Admin found');
      if (superAdmin.active === undefined || superAdmin.active === null) {
        superAdmin.active = true;
        await superAdmin.save();
        console.log('   ✓ Set active status to true');
      } else if (superAdmin.active === false) {
        superAdmin.active = true;
        await superAdmin.save();
        console.log('   ✓ Activated account');
      } else {
        console.log('   ✓ Already active');
      }
    } else {
      console.log('⚠️  Super Admin not found - will be created on server start');
    }

    // Check regular admin
    const admin = await Admin.findOne({ email: 'admin@renthub.com' });
    if (admin) {
      console.log('✅ Admin found');
      if (admin.active === undefined || admin.active === null) {
        admin.active = true;
        await admin.save();
        console.log('   ✓ Set active status to true');
      } else if (admin.active === false) {
        admin.active = true;
        await admin.save();
        console.log('   ✓ Activated account');
      } else {
        console.log('   ✓ Already active');
      }
    } else {
      console.log('⚠️  Regular Admin not found - creating...');
      const newAdmin = new Admin({
        username: 'admin',
        email: 'admin@renthub.com',
        password: 'admin123',
        role: 'admin',
        permissions: {
          manageUsers: true,
          manageProperties: true,
          manageAdmins: false,
          viewLogs: true,
          systemSettings: false
        },
        active: true
      });
      await newAdmin.save();
      console.log('   ✓ Admin account created');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('─────────────────────────────');
    console.log('Super Admin:');
    console.log('  Email: superadmin@renthub.com');
    console.log('  Password: superadmin123');
    console.log('\nRegular Admin:');
    console.log('  Email: admin@renthub.com');
    console.log('  Password: admin123');
    console.log('─────────────────────────────');
    console.log('\n🌐 Login at: http://localhost:5000/admin\n');

  } catch (error) {
    console.error('❌ Error fixing admin accounts:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run
(async () => {
  await connectDB();
  await fixAdminAccounts();
})();
