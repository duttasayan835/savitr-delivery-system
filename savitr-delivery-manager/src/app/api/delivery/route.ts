export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Delivery, { DeliveryStatus } from '@/models/Delivery';
import mongoose from 'mongoose';
import { sendDeliveryNotification } from '@/lib/notifications';
import { mockDeliveryStore, getAllMockDeliveries, isDevelopmentMode } from '@/lib/mockData';

// Enable development mode when MongoDB connection fails
const DEV_MODE = process.env.NODE_ENV === 'development';

export async function GET(req: NextRequest) {
  // Get search and filter parameters from the URL
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  
  let useMockData = DEV_MODE;
  let dbConnected = false;

  // Try to connect to the database
  try {
    const conn = await connectToDatabase();
    if (conn) {
      dbConnected = true;
      useMockData = false;
    }
  } catch (dbError) {
    console.error('MongoDB connection error:', dbError);
    useMockData = true;
  }

  try {
    // Use mock data in development mode or when DB connection fails
    if (useMockData) {
      console.log('Running in development mode. Using mock deliveries.');
      
      // Return deliveries from our mock store if available, otherwise generate new ones
      let mockDeliveries = getAllMockDeliveries();
      
      if (mockDeliveries.length === 0) {
        mockDeliveries = getMockDeliveries(search, status);
      }
      
      // Apply search and filters
      let filteredDeliveries = mockDeliveries;
      
      if (status) {
        filteredDeliveries = filteredDeliveries.filter(d => d.status === status);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredDeliveries = filteredDeliveries.filter(d => 
          d.trackingId.toLowerCase().includes(searchLower) ||
          d.name.toLowerCase().includes(searchLower) ||
          d.phone.includes(search) ||
          (d.email && d.email.toLowerCase().includes(searchLower)) ||
          d.address.toLowerCase().includes(searchLower)
        );
      }
      
      return NextResponse.json({ deliveries: filteredDeliveries });
    }

    // Only proceed with real DB operations if we're connected
    if (dbConnected) {
      // Build query based on search and filter parameters
      const query: any = {};
      
      if (status) {
        query.status = status;
      }
      
      if (search) {
        query.$or = [
          { trackingId: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ];
      }

      // Fetch deliveries from database
      const deliveries = await Delivery.find(query)
        .sort({ createdAt: -1 })
        .limit(100);

      return NextResponse.json({ deliveries });
    }
    
    // Fallback to mock data if we somehow get here
    return NextResponse.json({ 
      deliveries: getMockDeliveries(search, status),
      _note: "Using fallback mock data"
    });
    
  } catch (error: any) {
    console.error('Error fetching deliveries:', error);
    
    // Return mock data in development mode on any error
    if (DEV_MODE) {
      console.log('Error occurred, using mock data instead.');
      return NextResponse.json({ 
        deliveries: getMockDeliveries(search, status),
        _note: "Using mock data due to error"
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  console.log('🚀 Starting delivery creation process');
  
  let useMockData = false;  // Default to using real database
  let dbConnected = false;
  let connectionError = null;
  
  // Try to connect to the database
  try {
    console.log('⚙️ Attempting to connect to MongoDB...');
    const connection = await connectToDatabase();
    
    if (connection && connection.db) {
      dbConnected = true;
      console.log('✅ Successfully connected to MongoDB database');
    } else {
      connectionError = new Error("Failed to establish database connection");
      console.error('❌ Database connection returned invalid value:', connection);
      // Only use mock data in development mode
      useMockData = process.env.NODE_ENV === 'development';
    }
  } catch (dbError) {
    console.error('❌ MongoDB connection error:', dbError);
    connectionError = dbError;
    // Only use mock data in development mode
    useMockData = process.env.NODE_ENV === 'development';
  }
  
  try {
    console.log('📦 Parsing request body');
    const body = await req.json();
    const { 
      name, 
      phone, 
      email, 
      address, 
      deliveryDate, 
      deliveryTime, 
      product, 
      predictedSlot,
      latitude,
      longitude
    } = body;
    console.log('Received data with predictedSlot:', predictedSlot);
    console.log('Received coordinates:', { latitude, longitude });
    
    // Basic validation
    if (!name || !phone || !address || !deliveryDate || !deliveryTime || !product) {
      console.error('❌ Missing required fields in request');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For production, if we can't connect to the database, return an error
    if (!dbConnected && !useMockData) {
      console.error('❌ Database connection failed in production environment');
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }  // Service Unavailable
      );
    }

    // Use database in production and when connected
    if (dbConnected) {
      try {
        console.log('🔧 Creating new delivery in MongoDB');
        
        // Try to get adminId from authorization header
        let adminId;
        const authHeader = req.headers.get('Authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // If we have a valid token, we can try to extract the user ID
          try {
            // This is a simple check - in a real app, you would verify the token
            // and extract the user ID properly
            const userId = body.userId || null; // The front-end can pass the admin's ID
            
            if (userId && mongoose.Types.ObjectId.isValid(userId)) {
              adminId = new mongoose.Types.ObjectId(userId);
              console.log('✅ Using authenticated admin ID:', adminId.toString());
            } else {
              // Create a new ObjectId as placeholder
              adminId = new mongoose.Types.ObjectId();
              console.log('⚠️ No valid admin ID in token, using placeholder:', adminId.toString());
            }
          } catch (tokenError) {
            console.error('❌ Error extracting admin ID from token:', tokenError);
            adminId = new mongoose.Types.ObjectId();
          }
        } else if (body.adminId && mongoose.Types.ObjectId.isValid(body.adminId)) {
          // Use provided ID if it's valid
          adminId = new mongoose.Types.ObjectId(body.adminId);
          console.log('✅ Using provided admin ID:', adminId.toString());
        } else {
          // Create a new ObjectId as placeholder
          adminId = new mongoose.Types.ObjectId();
          console.log('⚠️ Created placeholder ObjectId for adminId:', adminId.toString());
        }
        
        // Print debugging information
        console.log('📝 Delivery details:', {
          name,
          phone,
          email: email || null,
          address,
          deliveryDate,
          deliveryTime,
          product,
          status: DeliveryStatus.SCHEDULED,
          adminId: adminId.toString() // Convert to string for logging
        });
        
        // Create new delivery in the database
        const delivery = await Delivery.create({
          name,
          phone,
          email: email || null,
          address,
          deliveryDate,
          deliveryTime,
          product,
          status: DeliveryStatus.SCHEDULED,
          adminId, // Now this is a valid ObjectId
          rescheduleHistory: [],
          predictedSlot: predictedSlot || null, // Save the predicted slot from the ML model
          latitude: latitude !== undefined ? Number(latitude) : undefined,
          longitude: longitude !== undefined ? Number(longitude) : undefined
        });
        
        console.log('✅ Delivery created with ID:', delivery._id);
        console.log('🔑 Tracking ID generated:', delivery.trackingId);
        
        // The trackingId is generated in the pre-validate hook
        
        // Get the base URL for the reschedule link
        const origin = req.headers.get('origin');
        const host = req.headers.get('host');
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        
        // Determine the most appropriate base URL
        let baseUrl = origin;
        if (!baseUrl && host) {
          // If no origin is provided but we have a host, construct the URL
          baseUrl = `${protocol}://${host}`;
        }
        if (!baseUrl) {
          // Fallback to a default URL if we couldn't determine one
          baseUrl = 'http://localhost:3000';
        }
        
        // Clean up the URL (replace 0.0.0.0 with localhost)
        baseUrl = baseUrl.replace('0.0.0.0', 'localhost');
        
        // Send notification
        try {
          console.log('📱 Sending delivery notification SMS to:', phone);
          await sendDeliveryNotification(
            phone,
            delivery.trackingId,
            DeliveryStatus.SCHEDULED,
            false,
            baseUrl
          );
          console.log('✅ Delivery notification sent successfully');
        } catch (smsError) {
          console.error('⚠️ Failed to send delivery notification:', smsError);
          // Continue with the response even if the SMS fails
        }
        
        // Return success with the delivery details
        const rescheduleLink = `${baseUrl}/reschedule/${delivery.trackingId}`;
        console.log('🔗 Reschedule link generated:', rescheduleLink);
        
        return NextResponse.json({
          success: true,
          message: 'Delivery created successfully',
          delivery: {
            _id: delivery._id,
            trackingId: delivery.trackingId,
            name: delivery.name,
            phone: delivery.phone,
            email: delivery.email,
            address: delivery.address,
            deliveryDate: delivery.deliveryDate,
            deliveryTime: delivery.deliveryTime,
            product: delivery.product,
            status: delivery.status,
            createdAt: delivery.createdAt,
            rescheduleLink: rescheduleLink,
            predictedSlot: delivery.predictedSlot, // Include in the response
            latitude: delivery.latitude,
            longitude: delivery.longitude
          }
        });
      } catch (createError) {
        console.error('❌ Error creating delivery in database:', createError);
        
        // If we're in development, fall back to mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Falling back to mock data in development environment');
          useMockData = true;
        } else {
          // In production, return a proper error
          return NextResponse.json(
            { error: 'Failed to create delivery. Please try again.' },
            { status: 500 }
          );
        }
      }
    }

    // Use mock data only in development mode as a fallback
    if (useMockData) {
      console.log('🧪 Running in development mode. Creating mock delivery.');
      
      const mockTrackingId = `SAV${Math.floor(100000000 + Math.random() * 900000000)}`;
      const mockAdminId = new mongoose.Types.ObjectId(); // Create a valid ObjectId
      
      // Generate random coordinates around Mumbai (19.076, 72.877)
      const baseLatitude = 19.076 + (Math.random() * 0.1 - 0.05);
      const baseLongitude = 72.877 + (Math.random() * 0.1 - 0.05);
      
      const mockDelivery = {
        _id: new mongoose.Types.ObjectId().toString(),
        trackingId: mockTrackingId,
        name,
        phone,
        email: email || null,
        address,
        deliveryDate,
        deliveryTime,
        product,
        status: DeliveryStatus.SCHEDULED,
        adminId: mockAdminId, // Use the valid ObjectId instead of string
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rescheduleHistory: [],
        predictedSlot: predictedSlot || null, // Add to mock delivery too
        // Use provided coordinates if they exist, otherwise use generated ones
        latitude: latitude !== undefined ? Number(latitude) : baseLatitude,
        longitude: longitude !== undefined ? Number(longitude) : baseLongitude
      };
      
      // Store in our mock database
      mockDeliveryStore.set(mockTrackingId, mockDelivery);
      console.log(`📦 Added mock delivery to shared store: ${mockTrackingId}`);
      
      // Send SMS notification for the mock delivery
      try {
        const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
        await sendDeliveryNotification(
          phone,
          mockTrackingId,
          DeliveryStatus.SCHEDULED,
          false,
          baseUrl
        );
        console.log('✅ Mock delivery notification sent successfully.');
      } catch (smsError) {
        console.error('⚠️ Failed to send mock delivery notification:', smsError);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Mock delivery created successfully',
        delivery: {
          ...mockDelivery,
          rescheduleLink: `${req.headers.get('origin') || 'http://localhost:3000'}/reschedule/${mockTrackingId}`
        },
        _note: "Using mock data (not stored in MongoDB)"
      });
    }
  } catch (error: any) {
    console.error('❌ Error creating delivery:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to create delivery' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock deliveries for development
function getMockDeliveries(search?: string | null, statusFilter?: string | null) {
  // If we already have data in our store, use it instead of generating new data
  const existingDeliveries = getAllMockDeliveries();
  
  if (existingDeliveries.length > 0) {
    // Apply filters
    let result = existingDeliveries;
    
    if (statusFilter) {
      result = result.filter(d => d.status === statusFilter);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(d => 
        d.trackingId.toLowerCase().includes(searchLower) ||
        d.name.toLowerCase().includes(searchLower) ||
        d.phone.includes(search) ||
        (d.email && d.email.toLowerCase().includes(searchLower)) ||
        d.address.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }
  
  // Generate new mock data
  const statuses = Object.values(DeliveryStatus);
  const mockDeliveries = Array(10).fill(null).map((_, i) => {
    const status = statusFilter || statuses[Math.floor(Math.random() * statuses.length)];
    const trackingId = `SAV${100000000 + i}`;
    
    // Generate random coordinates around Mumbai (19.076, 72.877)
    const baseLatitude = 19.076 + (Math.random() * 0.1 - 0.05);
    const baseLongitude = 72.877 + (Math.random() * 0.1 - 0.05);
    
    const mockDelivery = {
      _id: `mock_${i}`,
      trackingId,
      name: `Recipient ${i + 1}`,
      phone: `98765${i}${i}${i}${i}${i}`,
      email: `recipient${i + 1}@example.com`,
      address: `${123 + i} Main Street, Bangalore`,
      deliveryDate: new Date().toISOString(),
      deliveryTime: "2:00 PM - 4:00 PM",
      product: `Product ${i + 1}`,
      status,
      adminId: new mongoose.Types.ObjectId(), // Create a valid ObjectId
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rescheduleHistory: [],
      predictedSlot: null, // No predicted slot for mock deliveries
      latitude: baseLatitude,
      longitude: baseLongitude
    };
    
    // Store in our mock database
    mockDeliveryStore.set(trackingId, mockDelivery);
    
    return mockDelivery;
  });

  // Filter if search term is provided
  if (search) {
    const searchLower = search.toLowerCase();
    return mockDeliveries.filter(delivery => 
      delivery.trackingId.toLowerCase().includes(searchLower) ||
      delivery.name.toLowerCase().includes(searchLower) ||
      delivery.phone.includes(search) ||
      delivery.email?.toLowerCase().includes(searchLower) ||
      delivery.address.toLowerCase().includes(searchLower)
    );
  }

  // Filter by status if provided
  if (statusFilter) {
    return mockDeliveries.filter(delivery => delivery.status === statusFilter);
  }

  return mockDeliveries;
}
