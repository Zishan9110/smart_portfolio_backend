const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary using a stream (works well with multer memoryStorage)
 * @param {Buffer} fileBuffer
 * @param {string} folder - cloudinary folder name
 * @param {string} resourceType - 'image' | 'raw' | 'auto'
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'portfolio', resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `portfolio/${folder}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * Delete an asset from Cloudinary by public_id
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary deletion error:', error.message);
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
