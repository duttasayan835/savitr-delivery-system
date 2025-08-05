const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SavitrNew';

const recipientSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  email: String,
  userId: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  last_login: Date,
  is_active: { type: Boolean, default: true },
  preferences: {
    notification_method: { type: String, default: 'sms' },
    language: { type: String, default: 'en' }
  },
  otp: String,
  otpExpiry: Date,
  otpAttempts: { type: Number, default: 0 }
});

const RecipientUser = mongoose.model('RecipientUser', recipientSchema);

async function createTestRecipient() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const testRecipient = new RecipientUser({
      name: 'Test User',
      phone: '9876543210', // Replace with your test phone number
      email: 'test@example.com',
      address: 'Test Address',
      userId: 'U9876543210ABC123'
    });

    await testRecipient.save();
    console.log('Test recipient created successfully:', testRecipient);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestRecipient(); 