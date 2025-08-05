import mongoose, { ConnectOptions } from 'mongoose';

// Track connection state
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

/**
 * Connect to MongoDB database
 * @returns Mongoose connection object or null if connection fails
 */
export default async function connectToDatabase() {
  // If already connected, just return the connection
  if (isConnected) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }

  // Get MongoDB URI from environment variables
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/SavitrNew';
  console.log('Attempting to connect to MongoDB...');
  
  try {
    // Increase connection attempts counter
    connectionAttempts++;
    
    // Set mongoose options
    const mongooseOptions: ConnectOptions = {
      dbName: 'SavitrNew',
      // Setting serverSelectionTimeoutMS to 5 seconds for faster feedback during connection issues
      serverSelectionTimeoutMS: 5000,
      // Add connection timeout
      connectTimeoutMS: 10000,
      // These settings help with new MongoDB drivers
      retryWrites: true,
      // Use IPv4
      family: 4
    };
    
    // Try to connect
    await mongoose.connect(uri, mongooseOptions);
    
    // If we get here, connection succeeded
    isConnected = true;
    connectionAttempts = 0; // Reset counter on successful connection
    
    console.log('Connected to MongoDB successfully!');
    
    if (mongoose.connection && mongoose.connection.db) {
      console.log('Database:', mongoose.connection.db.databaseName);
    }
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // If we've tried multiple times and failed, report the error clearly
    if (connectionAttempts >= MAX_RETRIES) {
      console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts. Check your credentials and network.`);
      
      // In development mode, we'll continue even with DB errors
      if (process.env.NODE_ENV === 'development') {
        console.warn('Running in development mode. Using mock data instead of database.');
        return null;
      }
      
      // In production, throw the error to halt execution
      throw error;
    }
    
    // If we haven't reached max retries, wait and try again
    console.log(`Retrying connection (attempt ${connectionAttempts} of ${MAX_RETRIES})...`);
    // Wait 2 seconds before retrying
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Recursive call to try again
    return connectToDatabase();
  }
}

/**
 * Helper function to check if connected to MongoDB
 */
export function isConnectedToDatabase() {
  return isConnected;
}

/**
 * Connect directly to MongoDB without using mongoose
 * Alternative connection method that returns the native MongoDB connection
 */
export async function connect() {
  try {
    // First connect through mongoose
    const connection = await connectToDatabase();
    
    // If mongoose connection is established, return the native db connection
    if (connection && connection.db) {
      return connection.db;
    }
    
    throw new Error('Failed to get database connection');
  } catch (error) {
    console.error('Error connecting to database:', error);
    
    // In development mode, return null instead of throwing
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    throw error;
  }
}
