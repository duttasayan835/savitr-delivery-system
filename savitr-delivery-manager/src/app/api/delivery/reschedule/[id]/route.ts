import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { ObjectId } from "mongodb";
import { mockDeliveryStore, getMockDelivery, updateMockDelivery, isDevelopmentMode } from "@/lib/mockData";
import { sendDeliveryNotification } from "@/lib/notifications";
import { verify, JsonWebTokenError } from "jsonwebtoken";

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  console.log(`Processing reschedule request for delivery ID: ${id}`);
  
  try {
    // --- AUTHENTICATION ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as { id: string; phone: string; role: string };
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    // --- END AUTHENTICATION ---
    
    // Validate the request body
    const { deliveryDate, deliveryTime, reason } = await request.json();
    
    if (!deliveryDate || !deliveryTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if we're in development mode or should fallback to mock data
    const devMode = isDevelopmentMode();
    let mockMode = devMode;
    let db;
    
    try {
      db = await connect();
      console.log("Connected to database successfully");
    } catch (error) {
      console.error("Database connection failed:", error);
      mockMode = true;
    }
    
    // Handle the reschedule operation
    if (!mockMode && db) {
      // Real database update logic
      console.log("Attempting to update delivery in database");
      
      const collection = db.collection("DeliveryHistory");
      
      // Always query by trackingId
      const query = { trackingId: id };
      const delivery = await collection.findOne(query);
      
      if (!delivery) {
        console.error(`Delivery not found for ID: ${id}`);
        return NextResponse.json(
          { error: "Delivery not found" },
          { status: 404 }
        );
      }
      
      // --- AUTHORIZATION ---
      if (decoded.role === 'admin') {
        // Admins can reschedule any delivery
        // proceed
      } else if (decoded.role === 'recipient') {
        // Recipients can only reschedule their own deliveries
        if (delivery.phone !== decoded.phone) {
          return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
      // --- END AUTHORIZATION ---
      
      // Update the delivery
      const updateResult = await collection.updateOne(
        query,
        {
          $set: {
            deliveryDate,
            deliveryTime,
            status: "rescheduled",
            updatedAt: new Date(),
            rescheduleReason: reason || "Customer requested via reschedule link",
          },
        }
      );
      
      if (updateResult.modifiedCount === 0) {
        console.error("No delivery was updated");
        return NextResponse.json(
          { error: "Failed to update delivery" },
          { status: 500 }
        );
      }
      
      // Get the updated delivery
      const updatedDelivery = await collection.findOne(query);
      
      // Send notification in production (mocked in development)
      try {
        if (!devMode) {
          // Send real notification
          const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
          await sendDeliveryNotification(
            delivery.phone,
            delivery.trackingId,
            "rescheduled",
            true,
            baseUrl
          );
          console.log("Notification sent successfully");
        } else {
          console.log("DEV: Simulating notification sending");
        }
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
      
      return NextResponse.json({
        message: "Delivery rescheduled successfully",
        delivery: updatedDelivery,
      });
    } else {
      // Handle mock data for development
      console.log("Using mock data for reschedule operation");
      
      // Check shared mock store first
      let mockDelivery = getMockDelivery(id);
      
      if (!mockDelivery) {
        // Fallback error response if no mock delivery is found
        console.error(`Mock delivery not found for ID: ${id}`);
        return NextResponse.json(
          { error: "Delivery not found" },
          { status: 404 }
        );
      }
      
      // Update the mock delivery
      const updatedDelivery = {
        ...mockDelivery,
        deliveryDate,
        deliveryTime,
        status: "rescheduled",
        updatedAt: new Date().toISOString(),
        rescheduleReason: reason || "Customer requested via reschedule link",
      };
      
      // Update the delivery in the shared mock store
      updateMockDelivery(id, updatedDelivery);
      
      console.log("DEV: Mock delivery updated:", updatedDelivery);
      
      // Attempt to send a notification for development testing
      try {
        const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
        if (process.env.SEND_MOCK_NOTIFICATIONS === 'true') {
          await sendDeliveryNotification(
            mockDelivery.phone,
            mockDelivery.trackingId,
            "rescheduled",
            true,
            baseUrl
          );
          console.log("DEV: Real notification sent for testing purposes");
        } else {
          console.log("DEV: Simulating notification sending for rescheduled delivery");
        }
      } catch (notificationError) {
        console.error("DEV: Error sending test notification:", notificationError);
      }
      
      return NextResponse.json({
        message: "Delivery rescheduled successfully",
        delivery: updatedDelivery,
      });
    }
  } catch (error: any) {
    console.error("Error rescheduling delivery:", error);
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
