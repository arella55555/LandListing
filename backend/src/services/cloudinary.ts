import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
