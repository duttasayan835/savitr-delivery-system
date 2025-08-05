import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, message } = await req.json();
    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'Missing phoneNumber or message' }, { status: 400 });
    }
    
    console.log('Sending SMS to:', phoneNumber);
    console.log('Message:', message);
    
    // Check if in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    // Skip actual SMS sending in development mode unless specifically enabled
    if (isDev && !process.env.SEND_REAL_SMS_IN_DEV) {
      console.log('🔔 DEVELOPMENT MODE: SMS would be sent with the following details:');
      console.log(`📱 To: ${phoneNumber}`);
      console.log(`💬 Message: ${message}`);
      
      return NextResponse.json({ 
        success: true, 
        sid: `mock-${Date.now()}`,
        mock: true,
        message: 'SMS simulated in development mode'
      });
    }
    
    console.log('Twilio credentials:', {
      sid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '...',
      auth: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
      phone: process.env.TWILIO_PHONE_NUMBER
    });
    
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const from = process.env.TWILIO_PHONE_NUMBER;
      
      const twilioResult = await client.messages.create({ 
        body: message, 
        to: phoneNumber, 
        from 
      });
      
      console.log('Twilio response:', twilioResult.sid);
      return NextResponse.json({ success: true, sid: twilioResult.sid });
    } catch (twilioError: any) {
      // Check if this is a trial account verification error
      if (twilioError.code === 21608 || 
         (twilioError.message && twilioError.message.includes('unverified'))) {
        console.warn(`⚠️ Twilio trial account limitation: ${twilioError.message}`);
        
        // In development, return a mock success instead of failing
        if (isDev) {
          console.log('🔔 DEVELOPMENT MODE: Bypassing Twilio error and simulating success');
          return NextResponse.json({ 
            success: true, 
            sid: `mock-${Date.now()}`,
            mock: true,
            message: 'SMS simulated due to trial account limitation'
          });
        }
      }
      
      // For other errors or in production, return proper error response
      console.error('SMS sending error:', twilioError);
      return NextResponse.json({ 
        error: 'Failed to send SMS', 
        detail: twilioError.message,
        code: twilioError.code
      }, { status: twilioError.status || 500 });
    }
  } catch (error: any) {
    console.error('SMS sending error:', error);
    return NextResponse.json({ 
      error: 'Failed to send SMS', 
      detail: error.message 
    }, { status: 500 });
  }
} 