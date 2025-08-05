// This script tests the MongoDB connection and database operations
// Run with: node -r dotenv/config src/scripts/test-db-connection.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables if not already loaded
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

// Test delivery data
const testDelivery = {
  name: 'Test Customer',
  phone: '9876543210',
  email: 'test@example.com',
  address: '123 Test Street, Test City',
  deliveryDate: new Date(),
  deliveryTime: '10:00 AM - 12:00 PM',
  product: 'Test Product',
  status: 'scheduled',
  adminId: new mongoose.Types.ObjectId(),
  rescheduleHistory: []
};

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  
  // Get MongoDB URI from environment variables
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ Error: Missing MONGODB_URI in .env file');
    process.exit(1);
  }

  // Only log partial URI for security
  console.log(`🔌 Attempting to connect to MongoDB using URI: ${uri.substring(0, 20)}...`);
  
  try {
    // Connect to the database
    const connection = await mongoose.connect(uri, {
      dbName: 'SavitrNew',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    console.log(`📊 Database: ${connection.connection.db.databaseName}`);
    
    // Create a simple delivery schema for testing
    const deliverySchema = new mongoose.Schema({
      trackingId: { type: String, unique: true },
      name: String,
      phone: String,
      email: String,
      address: String,
      deliveryDate: Date,
      deliveryTime: String,
      product: String,
      status: String,
      adminId: mongoose.Schema.Types.ObjectId,
      rescheduleHistory: Array,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }, { timestamps: true });
    
    // Add pre-validate hook to generate tracking ID
    deliverySchema.pre('validate', function() {
      if (this.isNew && !this.trackingId) {
        const prefix = 'SAV';
        const randomNum = Math.floor(100000000 + Math.random() * 900000000);
        this.trackingId = `${prefix}${randomNum}`;
      }
    });
    
    // Create a model
    const TestDelivery = mongoose.model('TestDelivery', deliverySchema);
    
    // Test writing to the database
    console.log('📝 Testing database write operation...');
    const delivery = new TestDelivery(testDelivery);
    await delivery.save();
    
    console.log('✅ Successfully created test document:');
    console.log(`   - ID: ${delivery._id}`);
    console.log(`   - Tracking ID: ${delivery.trackingId}`);
    
    // Test reading from the database
    console.log('📖 Testing database read operation...');
    const retrievedDelivery = await TestDelivery.findById(delivery._id);
    
    if (retrievedDelivery) {
      console.log('✅ Successfully retrieved test document:');
      console.log(`   - ID: ${retrievedDelivery._id}`);
      console.log(`   - Name: ${retrievedDelivery.name}`);
      console.log(`   - Tracking ID: ${retrievedDelivery.trackingId}`);
    } else {
      console.error('❌ Failed to retrieve test document!');
    }
    
    // Test updating the document
    console.log('🔄 Testing database update operation...');
    retrievedDelivery.status = 'rescheduled';
    await retrievedDelivery.save();
    
    const updatedDelivery = await TestDelivery.findById(delivery._id);
    console.log('✅ Successfully updated test document:');
    console.log(`   - Status before: scheduled`);
    console.log(`   - Status after: ${updatedDelivery.status}`);
    
    // Test deleting the document
    console.log('🗑️ Testing database delete operation...');
    await TestDelivery.deleteOne({ _id: delivery._id });
    
    const count = await TestDelivery.countDocuments({ _id: delivery._id });
    if (count === 0) {
      console.log('✅ Successfully deleted test document');
    } else {
      console.error('❌ Failed to delete test document!');
    }
    
    console.log('🎉 All MongoDB operations completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection or operation error:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testConnection().catch(console.error); 