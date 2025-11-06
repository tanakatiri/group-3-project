import mongoose from 'mongoose';
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

// Migration script
const migrateData = async () => {
  try {
    console.log('\n🔄 Starting migration...\n');

    // Approve all existing users
    const userResult = await mongoose.connection.db.collection('users').updateMany(
      { approved: { $exists: false } },
      { $set: { approved: true, approvedAt: new Date() } }
    );
    console.log(`✅ Users updated: ${userResult.modifiedCount} users approved`);

    // Approve all existing properties
    const houseResult = await mongoose.connection.db.collection('houses').updateMany(
      { approved: { $exists: false } },
      { $set: { approved: true, approvedAt: new Date() } }
    );
    console.log(`✅ Properties updated: ${houseResult.modifiedCount} properties approved`);

    // Show summary
    console.log('\n📊 Migration Summary:');
    console.log('─────────────────────────────');
    console.log(`Users approved: ${userResult.modifiedCount}`);
    console.log(`Properties approved: ${houseResult.modifiedCount}`);
    console.log('─────────────────────────────');
    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run migration
(async () => {
  await connectDB();
  await migrateData();
})();
