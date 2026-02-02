/**
 * Get the email logo URL
 * Returns the appropriate URL based on environment
 */

const getEmailLogoUrl = () => {
  // In production, use the deployed backend URL
  if (process.env.NODE_ENV === 'production') {
    // Use Railway public domain if available
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/public/email.png`;
    }
    // Otherwise use a default or environment variable
    return process.env.BACKEND_URL 
      ? `${process.env.BACKEND_URL}/public/email.png`
      : 'https://your-backend-url.railway.app/public/email.png';
  }
  
  // In development, use localhost
  return 'http://localhost:5000/public/email.png';
};

module.exports = { getEmailLogoUrl };
