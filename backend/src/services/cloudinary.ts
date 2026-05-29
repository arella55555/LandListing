import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  throw new Error(
    'Missing Cloudinary configuration. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file'
  );
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export const uploadBuffer = async (buffer: Buffer, mimetype?: string) => {
  const prefix = mimetype ? `data:${mimetype};base64,` : 'data:application/octet-stream;base64,';
  const dataUri = prefix + buffer.toString('base64');

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'landlisting',
  });

  return result; // contains secure_url, public_id, etc.
};

export default cloudinary;
