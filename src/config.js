// S3 Bucket Configuration
export const S3_CONFIG = {
  // Yahan apna S3 bucket URL daalo
  // Format: https://<bucket-name>.s3.<region>.amazonaws.com/
  BASE_URL: 'https://ipl-website-images.s3.ap-south-1.amazonaws.com/',
  
  // Ya custom domain ho to:
  // BASE_URL: 'https://images.ipltickets.com/',
}

// Image URLs helper
export const getImageUrl = (filename) => {
  return `${S3_CONFIG.BASE_URL}${filename}`
}
