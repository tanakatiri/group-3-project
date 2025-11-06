import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedTestUsers = async () => {
  try {
    console.log('🌱 Seeding test users...');
    
    // Check if users already exist
    const existingTenant = await User.findOne({ email: 'tenant@test.com' });
    const existingLandlord = await User.findOne({ email: 'landlord@test.com' });
    
    if (existingTenant && existingLandlord) {
      console.log('✅ Test users already exist');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create tenant if doesn't exist
    if (!existingTenant) {
      await User.create({
        name: 'Test Tenant',
        email: 'tenant@test.com',
        password: hashedPassword,
        phone: '+263771234567',
        role: 'tenant'
      });
      console.log('✅ Created test tenant: tenant@test.com / password123');
    }
    
    // Create landlord if doesn't exist
    if (!existingLandlord) {
      await User.create({
        name: 'Test Landlord',
        email: 'landlord@test.com',
        password: hashedPassword,
        phone: '+263779876543',
        role: 'landlord'
      });
      console.log('✅ Created test landlord: landlord@test.com / password123');
    }
    
    console.log('🎉 Test users seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding test users:', error);
  }
};

export { seedTestUsers };
