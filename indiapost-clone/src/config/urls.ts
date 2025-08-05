export const SAVITR_AI_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000'  // Local development URL
  : 'https://savitr-delivery-manager.com';  // Production URL

export const INDIA_POST_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5173'  // Local development URL
  : 'https://indiapost.gov.in';  // Production URL 