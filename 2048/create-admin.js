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

// Create admin account
const createAdmin = async () => {
  try {
    console.log('\n🔐 Creating Admin Account...\n');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@renthub.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('\n📋 Admin Credentials:');
      console.log('─────────────────────────────');
      console.log('Email: admin@renthub.com');
      console.log('Password: admin123');
      console.log('Username:', existingAdmin.username);
      console.log('─────────────────────────────\n');
      return;
    }

    // Create new admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@renthub.com',
      password: 'admin123'
    });

    await admin.save();

    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('─────────────────────────────');
    console.log('Email: admin@renthub.com');
    console.log('Password: admin123');
    console.log('Username: admin');
    console.log('─────────────────────────────');
    console.log('\n🌐 Login at: http://localhost:5000/admin\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run
(async () => {
  await connectDB();
  await createAdmin();
})();
