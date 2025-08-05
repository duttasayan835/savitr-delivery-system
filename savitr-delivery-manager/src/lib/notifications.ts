/**
 * Notifications utility for sending SMS and other notifications
 */

/**
 * Send an SMS notification
 * 
 * @param phoneNumber The recipient's phone number
 * @param message The message content
 * @returns Promise that resolves with the response from the API
 */
export async function sendSMS(phoneNumber: string, message: string) {
  try {
    console.log(`[SMS] Preparing to send SMS to ${phoneNumber}...`);
    console.log(`[SMS] Message content: ${message}`);
    
    // Make sure phone number is in E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`[SMS] Formatted phone: ${formattedPhone}`);
    
    // Check if in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    // Check if running on server or client
    if (typeof window === 'undefined') {
      // Server-side: Use Twilio directly
      console.log('[SMS] Sending SMS from server-side using Twilio API');
      
      // In development mode, we can bypass actual SMS sending to avoid trial account limitations
      if (isDev && !process.env.SEND_REAL_SMS_IN_DEV) {
        console.log('[SMS] 🔔 DEVELOPMENT MODE: SMS would be sent with the following details:');
        console.log(`[SMS] 📱 To: ${formattedPhone}`);
        console.log(`[SMS] 💬 Message: ${message}`);
        return { 
          success: true, 
          sid: `mock-${Date.now()}`,
          mock: true,
          message: 'SMS simulated in development mode'
        };
      }
      
      try {
        // Dynamically import twilio to avoid issues with server components
        const twilio = await import('twilio').then(mod => mod.default);
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('[SMS] Twilio client initialized. Sending message...');
        const twilioResult = await client.messages.create({
          body: message,
          to: formattedPhone,
          from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log('[SMS] Twilio response:', JSON.stringify(twilioResult, null, 2));
        return { success: true, sid: twilioResult.sid, fullResponse: twilioResult };
      } catch (twilioError: any) {
        console.error('[SMS] Twilio error:', twilioError);
        // Check if this is a trial account verification error
        if (twilioError.code === 21608 || 
           (twilioError.message && twilioError.message.includes('unverified'))) {
          console.warn(`[SMS] ⚠️ Twilio trial account limitation: ${twilioError.message}`);
          
          // In development, return a mock success instead of failing
          if (isDev) {
            console.log('[SMS] 🔔 DEVELOPMENT MODE: Bypassing Twilio error and simulating success');
            return { 
              success: true, 
              sid: `mock-${Date.now()}`,
              mock: true,
              message: 'SMS simulated due to trial account limitation',
              error: twilioError
            };
          }
          
          // In production, we still throw the error
          throw twilioError;
        }
        
        // For other errors, still throw
        throw twilioError;
      }
    } else {
      // Client-side: Use the API route
      console.log('[SMS] Sending SMS from client-side using API route');
      
      const response = await fetch('/api/notify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[SMS] Error response from /api/notify-sms:', errorData);
        throw new Error(errorData.error || 'Failed to send SMS');
      }

      const data = await response.json();
      console.log('[SMS] SMS sent successfully from client:', data);
      return data;
    }
  } catch (error) {
    console.error('[SMS] Error sending SMS notification:', error);
    throw error;
  }
}

/**
 * Format a phone number to E.164 format for Twilio
 * 
 * @param phone The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle Indian numbers (10 digits)
  if (digits.length === 10 && digits.startsWith('6') || 
      digits.startsWith('7') || 
      digits.startsWith('8') || 
      digits.startsWith('9')) {
    return `+91${digits}`;
  }
  
  // If already has country code
  if (digits.length > 10 && (phone.startsWith('+') || phone.startsWith('00'))) {
    // If starts with 00, replace with +
    if (phone.startsWith('00')) {
      return `+${digits.substring(2)}`;
    }
    // If already has +, return as is but with only digits
    if (phone.startsWith('+')) {
      return `+${digits}`;
    }
    return `+${digits}`;
  }
  
  // Default: Assume it's an Indian number and add +91
  return `+91${digits}`;
}

/**
 * Send delivery notification SMS
 * 
 * @param phone Recipient's phone number
 * @param trackingId Delivery tracking ID
 * @param status Delivery status
 * @param reschedule Whether this is a reschedule notification
 * @param baseUrl Base URL of the application (optional)
 * @returns Promise that resolves with the response
 */
export async function sendDeliveryNotification(
  phone: string,
  trackingId: string,
  status: string,
  reschedule: boolean = false,
  baseUrl?: string
): Promise<any> {
  let message: string;
  
  // Ensure we have a valid base URL for the reschedule link
  // Fix the issue with 0.0.0.0 in the URL
  let rescheduleBaseUrl = baseUrl || 'http://localhost:3000';
  
  // Replace 0.0.0.0 with localhost or the server's public domain
  rescheduleBaseUrl = rescheduleBaseUrl.replace('0.0.0.0', 'localhost');
  
  const rescheduleLink = `${rescheduleBaseUrl}/reschedule/${trackingId}`;
  
  if (reschedule) {
    message = `Your delivery with tracking ID ${trackingId} has been rescheduled. Please check the app for new delivery date and time.`;
    // Add reschedule link for future changes
    message += ` Need to change again? Visit: ${rescheduleLink}`;
  } else if (status === 'scheduled') {
    // For new deliveries
    message = `Your Savitr delivery with tracking ID ${trackingId} has been scheduled.`;
    
    // Always add reschedule link
    message += ` To reschedule, visit: ${rescheduleLink}`;
  } else {
    // For status updates
    message = `Your Savitr delivery with tracking ID ${trackingId} status is now: ${status}. Track it on our app.`;
    
    // Add reschedule link for most statuses except delivered or failed
    if (status !== 'delivered' && status !== 'failed') {
      message += ` Need to reschedule? Visit: ${rescheduleLink}`;
    }
  }
  
  console.log(`Preparing to send SMS to ${phone}...`);
  console.log(`Message content: ${message}`);
  
  return sendSMS(phone, message);
} 