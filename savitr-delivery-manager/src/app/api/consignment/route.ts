import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Consignment from '@/models/Consignment';
import RecipientUser from '@/models/RecipientUser';
import UserMessage from '@/models/UserMessage';
import TrackingUpdate from '@/models/TrackingUpdate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendSMS, messageTemplates } from '@/lib/twilio';
import { generateUserId, generateConsignmentId } from '@/lib/mongodb';

// Helper function to format Indian phone numbers
function formatIndianPhoneNumber(phone: string): string {
  // Remove any existing +91 or spaces
  let cleaned = phone.replace(/^\+91|\s/g, '');
  // If number starts with 0, remove it
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  // Add +91 prefix if not present
  return cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`;
}

export async function POST(req: Request) {
  try {
    // Temporarily disable authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized. Admin access required.' },
    //     { status: 401 }
    //   );
    // }

    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['sender_name', 'sender_phone', 'sender_address', 'receiver_name', 'receiver_phone', 'receiver_address', 'parcel_type'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Format phone numbers
    const formattedSenderPhone = formatIndianPhoneNumber(body.sender_phone);
    const formattedReceiverPhone = formatIndianPhoneNumber(body.receiver_phone);

    // Connect to MongoDB
    const mongoose = await connectToDatabase();

    try {
      // Check if recipient exists, if not create one
      let recipient = await RecipientUser.findOne({ phone: formattedReceiverPhone });
      if (!recipient) {
        const user_id = generateUserId(formattedReceiverPhone);
        recipient = await RecipientUser.create({
          name: body.receiver_name,
          phone: formattedReceiverPhone,
          address: body.receiver_address,
          email: body.receiver_email, // Optional
          user_id: user_id
        });
      }

      // Generate consignment ID
      const consignmentId = generateConsignmentId(formattedSenderPhone);

      // Create new consignment
      const consignment = await Consignment.create({
        ...body,
        sender_phone: formattedSenderPhone,
        receiver_phone: formattedReceiverPhone,
        consignment_id: consignmentId,
        date_of_booking: new Date(),
        delivery_status: 'Item Booked',
        created_by: 'admin' // Temporarily hardcoded for testing
      });

      // Create initial tracking update
      await TrackingUpdate.create({
        consignment_id: consignmentId,
        status: 'Item Booked',
        location: 'Origin Post Office',
        updated_by: 'admin', // Temporarily hardcoded for testing
        notes: 'Consignment booked successfully'
      });

      // Send SMS to sender
      const senderMessage = messageTemplates.consignmentBooked(consignmentId);
      let senderSMSResult;
      try {
        senderSMSResult = await sendSMS(formattedSenderPhone, senderMessage);
        console.log('Sender SMS Result:', senderSMSResult);
      } catch (error: any) {
        console.error('Failed to send SMS to sender:', error);
        senderSMSResult = { success: false, error: error.message };
      }

      // Create sender message record
      const senderMessageRecord = await UserMessage.create({
        consignment_id: consignmentId,
        recipient_type: 'sender',
        message_type: 'sms',
        message_content: senderMessage,
        message_status: senderSMSResult.success ? 'sent' : 'failed',
        sent_by: 'admin' // Temporarily hardcoded for testing
      });

      // Send SMS to receiver
      const receiverMessage = messageTemplates.consignmentReceived(consignmentId);
      let receiverSMSResult;
      try {
        receiverSMSResult = await sendSMS(formattedReceiverPhone, receiverMessage);
        console.log('Receiver SMS Result:', receiverSMSResult);
      } catch (error: any) {
        console.error('Failed to send SMS to receiver:', error);
        receiverSMSResult = { success: false, error: error.message };
      }

      // Create receiver message record
      const receiverMessageRecord = await UserMessage.create({
        consignment_id: consignmentId,
        recipient_type: 'receiver',
        message_type: 'sms',
        message_content: receiverMessage,
        message_status: receiverSMSResult.success ? 'sent' : 'failed',
        sent_by: 'admin' // Temporarily hardcoded for testing
      });

      // Update message status
      await Consignment.findByIdAndUpdate(
        consignment._id,
        { savitr_ai_message_status: true }
      );

      return NextResponse.json({
        success: true,
        consignment: consignment,
        recipient: recipient,
        messages: {
          sender: {
            ...senderMessageRecord.toObject(),
            smsResult: senderSMSResult
          },
          receiver: {
            ...receiverMessageRecord.toObject(),
            smsResult: receiverSMSResult
          }
        }
      });
    } catch (error: any) {
      console.error('Operation failed:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error creating consignment:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating consignment' },
      { status: 500 }
    );
  }
} 