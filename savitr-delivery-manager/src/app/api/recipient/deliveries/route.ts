import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Delivery from "@/models/Delivery";
import Consignment from "@/models/Consignment";
import DeliveryHistory from "@/models/DeliveryHistory";
import mongoose from "mongoose";
import { verify, JsonWebTokenError } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function normalizePhone(phone: string) {
  // Remove all non-digit characters and leading country code
  return phone.replace(/\D/g, '').replace(/^91/, '');
}

export async function GET(request: NextRequest) {
  console.log("API /api/recipient/deliveries called");
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No or invalid auth header", authHeader);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET) as { id: string; phone: string; role: string };
    } catch (err) {
      console.log("JWT verification failed", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (decoded.role !== 'recipient') {
      console.log("Forbidden: not recipient", decoded);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectToDatabase();
    const normalizedPhone = normalizePhone(decoded.phone);
    console.log('Normalized phone for query:', normalizedPhone);

    // Possible phone formats for queries
    const phoneFormats = [
      normalizedPhone,
      `+91${normalizedPhone}`,
      `91${normalizedPhone}`,
      `0${normalizedPhone}`,
      // Add regex for flexible matching if needed
    ];

    // Query Delivery using phone
    const deliveryResults = await Delivery.find({ 
      phone: { $in: phoneFormats }
    }).lean();
    console.log('Delivery results:', deliveryResults.length, deliveryResults);
    
    // Access the raw DeliveryHistory collection directly to find all delivery entries
    const db = mongoose.connection.db;
    const deliveryHistoryCollection = db.collection('DeliveryHistory');
    
    // First, query for delivery records that have trackingId and phone
    const rawDeliveryHistoryResults = await deliveryHistoryCollection.find({
      $or: phoneFormats.map(p => ({ phone: p })),
      $or: [
        { trackingId: { $exists: true } },  // Delivery records with trackingId
        { consignment_id: { $exists: true } }  // Event records with consignment_id
      ]
    }).toArray();
    
    console.log('DeliveryHistory raw results (direct query):', rawDeliveryHistoryResults.length);
    
    // Also query by phone field using partial text matching for more flexibility
    const phonePattern = normalizedPhone.substring(normalizedPhone.length - 8); // Use last 8 digits
    const fuzzyDeliveryResults = await deliveryHistoryCollection.find({
      $or: [
        { phone: { $regex: phonePattern } },
        { receiver_phone: { $regex: phonePattern } },
        { recipient_phone: { $regex: phonePattern } },
        { sender_phone: { $regex: phonePattern } }
      ]
    }).toArray();
    
    console.log('DeliveryHistory fuzzy phone results:', fuzzyDeliveryResults.length);
    
    // Combine and deduplicate by _id
    const allRawDeliveryResults = [...rawDeliveryHistoryResults, ...fuzzyDeliveryResults];
    const uniqueRawDeliveryResults = Array.from(
      new Map(allRawDeliveryResults.map(item => [item._id.toString(), item])).values()
    );
    
    console.log('Total unique DeliveryHistory records found:', uniqueRawDeliveryResults.length);
    
    // Query the DeliveryHistory model for tracking events
    const deliveryHistoryResults = await DeliveryHistory.find({}).lean();
    console.log('DeliveryHistory model results (tracking events):', deliveryHistoryResults.length);
    
    // Query ConsignmentTable using receiver_phone
    const consignmentResults = await Consignment.find({ 
      $or: [
        { receiver_phone: { $in: phoneFormats } },
        { sender_phone: { $in: phoneFormats } }
      ]
    }).lean();
    console.log('ConsignmentTable results:', consignmentResults.length);

    // Merge all results
    const allDeliveries = [
      ...deliveryResults.map(d => ({ ...d, source: 'Delivery' })),
      ...uniqueRawDeliveryResults.map(d => ({ ...d, source: 'DeliveryHistory' })),
      ...consignmentResults.map(d => ({ ...d, source: 'ConsignmentTable' })),
    ];

    // For deliveryHistoryResults, we need to find the related consignments
    if (deliveryHistoryResults.length > 0) {
      // Get all consignment IDs
      const allConsignmentIds = deliveryHistoryResults
        .filter(d => d.consignment_id)
        .map(d => d.consignment_id);
      
      // Find related consignments in Consignment collection
      const relatedConsignments = await Consignment.find({
        $or: [
          { consignment_id: { $in: allConsignmentIds } },
          { receiver_phone: { $in: phoneFormats } }
        ]
      }).lean();
      
      // Also check if any consignment_id in DeliveryHistory matches our phoneFormats
      // This helps catch cases where consignment_id might contain the phone number
      const phoneRelatedConsignmentIds = deliveryHistoryResults
        .filter(d => {
          if (!d.consignment_id) return false;
          return phoneFormats.some(p => d.consignment_id.includes(p));
        })
        .map(d => d.consignment_id);
      
      // Map delivery history events to consignments
      const historyItemsByConsignmentId = deliveryHistoryResults.reduce((acc, item) => {
        if (!item.consignment_id) return acc;
        if (!acc[item.consignment_id]) {
          acc[item.consignment_id] = [];
        }
        acc[item.consignment_id].push(item);
        return acc;
      }, {});

      // For each consignment, find the latest status and add to allDeliveries
      for (const consignment of relatedConsignments) {
        const consignmentId = consignment.consignment_id;
        const historyItems = historyItemsByConsignmentId[consignmentId] || [];
        
        if (historyItems.length > 0) {
          // Sort by timestamp desc to get the latest event
          historyItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const latestEvent = historyItems[0];
          
          allDeliveries.push({
            ...consignment,
            status: latestEvent.event,
            timestamp: latestEvent.timestamp,
            location: latestEvent.location,
            source: 'DeliveryHistory:Event',
            historyEvents: historyItems
          });
        }
      }
      
      // Add direct matches from phone-related consignment IDs
      if (phoneRelatedConsignmentIds.length > 0) {
        for (const consignmentId of phoneRelatedConsignmentIds) {
          const historyItems = historyItemsByConsignmentId[consignmentId] || [];
          if (historyItems.length > 0) {
            // Check if we already have this consignment from the previous step
            const alreadyAdded = allDeliveries.some(d => 
              d.consignment_id === consignmentId || d.trackingId === consignmentId
            );
            
            if (!alreadyAdded) {
              // Sort by timestamp desc to get the latest event
              historyItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              const latestEvent = historyItems[0];
              
              allDeliveries.push({
                consignment_id: consignmentId,
                status: latestEvent.event,
                timestamp: latestEvent.timestamp,
                location: latestEvent.location,
                source: 'DeliveryHistory:PhoneMatch',
                historyEvents: historyItems
              });
            }
          }
        }
      }
    }

    // Fallback test response if allDeliveries is empty
    if (allDeliveries.length === 0) {
      console.log("No deliveries found for phone", normalizedPhone);
      return NextResponse.json({ message: "No deliveries found", phone: normalizedPhone, test: true });
    }

    // Format for frontend
    const formatted = allDeliveries.map(d => {
      const doc = d as Record<string, any>;
      return {
        id: doc._id ?? '',
        trackingId: doc.trackingId ?? doc.tracking_id ?? doc.consignment_id ?? doc._id ?? '',
        senderName: doc.name ?? doc.senderName ?? doc.sender_name ?? doc.recipient_name ?? doc.receiver_name ?? '',
        currentSlot: {
          date: doc.deliveryDate ?? doc.delivery_date ?? doc.created_at ?? doc.timestamp ?? new Date(),
          time: doc.deliveryTime ?? doc.delivery_time ?? '9:00 AM - 5:00 PM', // Default time slot if not specified
        },
        status: doc.status ?? doc.delivery_status ?? doc.event ?? 'pending',
        source: doc.source ?? '',
        location: doc.location ?? '',
        isEligibleForReschedule: doc.source === 'DeliveryHistory:Event' || doc.source === 'DeliveryHistory:PhoneMatch'
          ? ['Item Booked', 'In Transit', 'Received at Destination MPC', 'Received at Delivery PO'].includes(doc.status)
          : (doc.status?.toLowerCase() === 'scheduled' || doc.status?.toLowerCase() === 'rescheduled' || doc.status?.toLowerCase() === 'pending'),
        historyEvents: doc.historyEvents ?? [],
        details: doc.product ?? doc.parcel_type ?? '',
      };
    });

    // Remove duplicates by trackingId while keeping most information
    const deliveriesByTrackingId = formatted.reduce((map, delivery) => {
      const key = delivery.trackingId;
      if (!key) return map;
      
      if (!map.has(key)) {
        map.set(key, delivery);
      } else {
        // Merge with existing entry to preserve most information
        const existing = map.get(key);
        map.set(key, {
          ...existing,
          source: existing.source || delivery.source,
          location: existing.location || delivery.location,
          historyEvents: [...(existing.historyEvents || []), ...(delivery.historyEvents || [])],
          isEligibleForReschedule: existing.isEligibleForReschedule || delivery.isEligibleForReschedule,
        });
      }
      return map;
    }, new Map());
    
    const uniqueDeliveries = Array.from(deliveriesByTrackingId.values());

    console.log("Formatted deliveries to return:", uniqueDeliveries.length);
    return NextResponse.json({ deliveries: uniqueDeliveries });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json({ error: "Failed to fetch deliveries", details: String(error) }, { status: 500 });
  }
} 