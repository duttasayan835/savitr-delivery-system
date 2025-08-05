import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Consignment from '@/models/Consignment';
import TrackingUpdate from '@/models/TrackingUpdate';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: consignmentId } = context.params;

    // Ensure consignmentId is available
    if (!consignmentId) {
      return NextResponse.json(
        { error: 'Consignment ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Find the consignment
    const consignment = await Consignment.findOne({ consignment_id: consignmentId });
    if (!consignment) {
      return NextResponse.json(
        { error: 'Consignment not found' },
        { status: 404 }
      );
    }

    // Find all tracking updates for this consignment
    const trackingUpdates = await TrackingUpdate.find({ consignment_id: consignmentId })
      .sort({ created_at: -1 }); // Sort by most recent first

    return NextResponse.json({
      success: true,
      consignment: consignment,
      tracking_updates: trackingUpdates
    });
  } catch (error: any) {
    console.error('Error fetching consignment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 