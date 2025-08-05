import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Consignment from '@/models/Consignment';
import TrackingUpdate from '@/models/TrackingUpdate';
import UserMessage from '@/models/UserMessage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendSMS, messageTemplates } from '@/lib/twilio';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { status, location, notes } = await req.json();
    await connectToDatabase();

    // Find the consignment
    const consignment = await Consignment.findOne({ consignment_id: params.id });
    if (!consignment) {
      return NextResponse.json(
        { error: 'Consignment not found' },
        { status: 404 }
      );
    }

    // Create tracking update
    const trackingUpdate = await TrackingUpdate.create({
      consignment_id: params.id,
      status,
      location,
      updated_by: session.user.id,
      notes
    });

    // Update consignment status
    await Consignment.findOneAndUpdate(
      { consignment_id: params.id },
      { delivery_status: status }
    );

    // Send SMS notifications based on status
    let senderMessage = '';
    let receiverMessage = '';

    switch (status) {
      case 'Out for Delivery':
        senderMessage = messageTemplates.outForDelivery(params.id, 'within 2 hours');
        receiverMessage = messageTemplates.outForDelivery(params.id, 'within 2 hours');
        break;
      case 'Delivered':
        senderMessage = messageTemplates.delivered(params.id);
        receiverMessage = messageTemplates.delivered(params.id);
        break;
      case 'Delivery Failed':
        senderMessage = messageTemplates.deliveryFailed(params.id, notes || 'Recipient unavailable');
        receiverMessage = messageTemplates.deliveryFailed(params.id, notes || 'Recipient unavailable');
        break;
      default:
        senderMessage = messageTemplates.statusUpdate(params.id, status, location);
        receiverMessage = messageTemplates.statusUpdate(params.id, status, location);
    }

    // Send SMS to sender
    const senderSMSResult = await sendSMS(consignment.sender_phone, senderMessage);
    await UserMessage.create({
      consignment_id: params.id,
      recipient_type: 'sender',
      message_type: 'sms',
      message_content: senderMessage,
      message_status: senderSMSResult.success ? 'sent' : 'failed',
      sent_by: session.user.id
    });

    // Send SMS to receiver
    const receiverSMSResult = await sendSMS(consignment.receiver_phone, receiverMessage);
    await UserMessage.create({
      consignment_id: params.id,
      recipient_type: 'receiver',
      message_type: 'sms',
      message_content: receiverMessage,
      message_status: receiverSMSResult.success ? 'sent' : 'failed',
      sent_by: session.user.id
    });

    return NextResponse.json({
      success: true,
      trackingUpdate,
      messages: {
        sender: { status: senderSMSResult.success ? 'sent' : 'failed' },
        receiver: { status: receiverSMSResult.success ? 'sent' : 'failed' }
      }
    });
  } catch (error: any) {
    console.error('Error updating consignment status:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating consignment status' },
      { status: 500 }
    );
  }
} 