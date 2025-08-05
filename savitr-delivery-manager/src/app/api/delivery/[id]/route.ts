export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Delivery, { DeliveryStatus, RescheduleEntry } from '@/models/Delivery';
import { mockDeliveryStore, getMockDelivery, addMockDelivery, updateMockDelivery, getAllMockDeliveries } from '@/lib/mockData';
import { ObjectId } from 'mongodb';
import { sendDeliveryNotification } from '@/lib/notifications';
import mongoose from 'mongoose';
import { generateTrackingId } from '@/lib/utils';

interface Params {
  params: {
    id: string;
  };
}

// Local fallback mock delivery storage for development
const LOCAL_MOCK_DELIVERIES = new Map();

// Helper function to create mock delivery data
function createMockDelivery(id: string) {
  const trackingId = id.length > 10 ? id : `SAV${Math.floor(100000000 + Math.random() * 900000000)}`;
  
  const mockDelivery = {
    _id: new ObjectId().toString(),
    trackingId: trackingId,
    name: "Mock Customer",
    phone: "+1234567890",
    email: "mock@example.com",
    address: "123 Mock Street, Mock City, MC 12345",
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: "10:00 AM - 12:00 PM",
    product: "Mock Product Package",
    status: DeliveryStatus.SCHEDULED,
    adminId: new mongoose.Types.ObjectId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rescheduleHistory: []
  };
  
  // Add to both local and shared stores
  LOCAL_MOCK_DELIVERIES.set(id, mockDelivery);
  
  // Also add to the shared store
  addMockDelivery(mockDelivery);
  console.log(`Added to shared mock delivery store: ${trackingId}`);
  
  return mockDelivery;
}

// Helper to handle mock notifications in development mode
async function sendMockNotification(phone: string, trackingId: string, status: string, wasRescheduled: boolean, baseUrl?: string) {
  console.log(`[MOCK NOTIFICATION] Would send ${wasRescheduled ? 'reschedule' : status} notification`);
  console.log(`  To: ${phone}`);
  console.log(`  Tracking ID: ${trackingId}`);
  console.log(`  Status: ${status}`);
  
  if (process.env.SEND_MOCK_NOTIFICATIONS === 'true') {
    try {
      await sendDeliveryNotification(phone, trackingId, status, wasRescheduled, baseUrl);
      console.log(`  ✓ Real notification sent in development mode`);
    } catch (error) {
      console.error(`  ✗ Failed to send real notification in development mode:`, error);
    }
  } else {
    console.log(`  ✓ Mock notification simulated (set SEND_MOCK_NOTIFICATIONS=true to send real notifications)`);
  }
}

// Get delivery by ID (accessible to both admin and public with trackingId)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`GET request for delivery with ID: ${id}`);
    
    // Connect to the database
    await connectToDatabase();
    
    // Try to determine if the ID is a MongoDB ObjectID or a tracking ID
    const isObjectId = ObjectId.isValid(id) && 
                       id.length === 24 && 
                       String(new ObjectId(id)) === id;
    
    let delivery;
    
    // Get from real database
    if (isObjectId) {
      // Search by MongoDB _id
      delivery = await Delivery.findById(id);
    } else {
      // Search by tracking ID
      delivery = await Delivery.findOne({ trackingId: id });
    }
    
    if (!delivery) {
      console.log(`Delivery not found for ID: ${id}`);
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }
    
    // Format the delivery data for the response
    const formattedDelivery = {
      trackingId: delivery.trackingId,
      name: delivery.name,
      phone: delivery.phone,
      address: delivery.address,
      deliveryDate: delivery.deliveryDate instanceof Date ? delivery.deliveryDate.toISOString() : delivery.deliveryDate,
      deliveryTime: delivery.deliveryTime,
      product: delivery.product,
      status: delivery.status,
      rescheduleHistory: delivery.rescheduleHistory || []
    };
    
    console.log(`Successfully retrieved delivery: ${delivery.trackingId}`);
    return NextResponse.json({ delivery: formattedDelivery });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch delivery details" },
      { status: 500 }
    );
  }
}

// Update delivery status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { deliveryDate, deliveryTime, reason } = await request.json();

    if (!deliveryDate || !deliveryTime) {
      return NextResponse.json(
        { error: "Delivery date and time are required" },
        { status: 400 }
      );
    }

    let delivery;
    let updated = false;

    // Try to determine if the ID is a MongoDB ObjectID or a tracking ID
    const isObjectId = ObjectId.isValid(id) && 
                      id.length === 24 && 
                      String(new ObjectId(id)) === id;
    
    // Find the delivery in the database
    if (isObjectId) {
      delivery = await Delivery.findById(id);
    } else {
      delivery = await Delivery.findOne({ trackingId: id });
    }
    
    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }
    
    // Create a reschedule entry
    const rescheduleEntry: RescheduleEntry = {
      oldDate: delivery.deliveryDate,
      oldTime: delivery.deliveryTime,
      newDate: new Date(deliveryDate),
      newTime: deliveryTime,
      timestamp: new Date(),
      reason: reason || "Customer requested reschedule"
    };
    
    // Update the delivery
    delivery.deliveryDate = new Date(deliveryDate);
    delivery.deliveryTime = deliveryTime;
    delivery.status = DeliveryStatus.RESCHEDULED;
    
    // Add to reschedule history
    if (!delivery.rescheduleHistory) {
      delivery.rescheduleHistory = [];
    }
    delivery.rescheduleHistory.push(rescheduleEntry);
    
    await delivery.save();
    updated = true;
    
    // Send notification about reschedule
    try {
      await sendDeliveryNotification(
        delivery.phone,
        delivery.trackingId,
        DeliveryStatus.RESCHEDULED,
        true
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
      // Continue even if notification fails
    }
    
    if (updated) {
      console.log(`Successfully rescheduled delivery: ${delivery.trackingId}`);
      return NextResponse.json({ 
        success: true, 
        message: "Delivery rescheduled successfully",
        delivery
      });
    } else {
      return NextResponse.json(
        { error: "Failed to reschedule delivery" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error rescheduling delivery:", error);
    
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
