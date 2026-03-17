import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

/**
 * Signs Cloudinary upload parameters for secure uploads
 * @param paramsToSign - Parameters to sign (e.g., folder, resource_type, timestamp)
 * @returns Signed parameters including signature, api_key, cloud_name, and timestamp
 */
export function signCloudinaryParams(paramsToSign: Record<string, any>) {
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  )

  return {
    signature,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    timestamp: paramsToSign.timestamp,
  }
}
