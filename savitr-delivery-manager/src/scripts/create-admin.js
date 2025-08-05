const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'recipient'], default: 'recipient' },
  phone: String,
  address: String,
  adminSecretCode: String,
  createdAt: { type: Date, default: Date.now }
});

// Add the comparePassword method to the schema
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/SavitrNew';
    console.log('Connecting to MongoDB at:', uri);
    
    // Set mongoose options to match main application
    const mongooseOptions = {
      dbName: 'SavitrNew',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      family: 4
    };

    await mongoose.connect(uri, mongooseOptions);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      phone: '9876543210',
      address: 'Admin Address',
      adminSecretCode: 'savitr-admin-2024'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser(); 