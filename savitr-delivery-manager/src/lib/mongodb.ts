import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SavitrNew';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Function to verify database connection
async function verifyConnection(mongoose: typeof import('mongoose')) {
  try {
    if (!mongoose.connection.db) {
      return {
        connected: false,
        error: 'Database connection not established'
      };
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    const requiredCollections = [
      'ConsignmentTable',
      'trackingupdates',
      'usermessages',
      'adminusers',
      'recipientusers'
    ];

    const existingCollections = collections.map(c => c.name);
    const missingCollections = requiredCollections.filter(
      c => !existingCollections.includes(c)
    );

    if (missingCollections.length > 0) {
      console.warn('Missing collections:', missingCollections);
    }

    return {
      connected: true,
      database: mongoose.connection.db.databaseName,
      collections: existingCollections,
      missingCollections
    };
  } catch (error: any) {
    console.error('Connection verification failed:', error);
    return {
      connected: false,
      error: error.message
    };
  }
}

export async function connectToDatabase() {
  if (cached.conn) {
    // Verify existing connection
    const verification = await verifyConnection(cached.conn);
    if (verification.connected) {
      return cached.conn;
    }
    // If verification fails, clear cache and reconnect
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'SavitrNew',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(async (mongoose) => {
        // Verify connection after successful connect
        const verification = await verifyConnection(mongoose);
        if (!verification.connected) {
          throw new Error('Database connection verification failed');
        }

        console.log('Connected to MongoDB successfully!');
        console.log('Database:', verification.database);
        console.log('Available collections:', verification.collections);
        
        if (verification.missingCollections && verification.missingCollections.length > 0) {
          console.warn('Missing collections:', verification.missingCollections);
        }

        return mongoose;
      })
      .catch((error: any) => {
        console.error('MongoDB connection error:', error);
        throw new Error(`Failed to connect to MongoDB: ${error.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

// Helper function to generate a random string of specified length
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate unique IDs
export function generateUniqueId(prefix: string, phone: string): string {
  // Get last 4 digits of phone number
  const phoneSuffix = phone.slice(-4);
  // Generate 6 random characters
  const random = generateRandomString(6);
  // Combine prefix, phone suffix, and random string
  return `${prefix}${phoneSuffix}${random}`;
}

// Helper function to generate user ID
export function generateUserId(phone: string): string {
  return generateUniqueId('U', phone);
}

// Helper function to generate consignment ID
export function generateConsignmentId(phone: string): string {
  return generateUniqueId('C', phone);
}

// Function to check database health
export async function checkDatabaseHealth() {
  try {
    const mongoose = await connectToDatabase();
    const verification = await verifyConnection(mongoose);
    
    return {
      status: verification.connected ? 'healthy' : 'unhealthy',
      database: verification.database,
      collections: verification.collections,
      missingCollections: verification.missingCollections,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
} 