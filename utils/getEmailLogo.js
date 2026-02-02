/**
 * Get email logo as base64 data URI
 * This is more reliable for email clients than external URLs
 */

const fs = require('fs');
const path = require('path');

let logoBase64Cache = null;

const getEmailLogoBase64 = () => {
  // Return cached version if available
  if (logoBase64Cache) {
    return logoBase64Cache;
  }

  try {
    // Try to read email.png from public/ directory first
    let imagePath = path.join(__dirname, '..', 'public', 'email.png');
    
    if (!fs.existsSync(imagePath)) {
      // Fallback to root directory
      imagePath = path.join(__dirname, '..', 'email.png');
    }

    if (!fs.existsSync(imagePath)) {
      console.warn('⚠️ email.png not found, using placeholder');
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Cache the result
    logoBase64Cache = `data:image/png;base64,${base64Image}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email logo loaded:', imagePath, '(' + imageBuffer.length + ' bytes)');
    }
    
    return logoBase64Cache;
  } catch (error) {
    console.error('❌ Error loading email logo:', error.message);
    // Return a 1x1 transparent PNG as fallback
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
};

module.exports = { getEmailLogoBase64 };
