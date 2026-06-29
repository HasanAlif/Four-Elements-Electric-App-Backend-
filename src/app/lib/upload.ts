import { v2 as cloudinary, ConfigOptions, UploadApiResponse } from 'cloudinary';
import multer from 'multer';
import httpStatus from 'http-status';
import config from '../config';
import { Readable } from 'stream';
import AppError from '../utils/AppError';

const cloudinaryConfig: ConfigOptions = {
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
};

cloudinary.config(cloudinaryConfig);

const removeExtension = (filename: string): string => {
  return filename
    .split('.')
    .slice(0, -1)
    .join('.')
    .replace(/\s+/g, '-')
    .toLowerCase();
};

const getPublicIdFromUrl = (imageUrl: string): string => {
  const url = new URL(imageUrl);
  const parts = url.pathname.split('/');
  const filename = parts.pop() as string;
  const folderPath = parts.slice(-2).join('/');
  return `${folderPath}/${filename.split('.')[0]}`;
};

export const sendImageToCloudinary = (
  file: Express.Multer.File,
): Promise<UploadApiResponse> => {
  const uniqueImageName = `${Math.random()
    .toString(36)
    .substring(2)}-${Date.now()}-${file.fieldname}-${removeExtension(
    file.originalname,
  )}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: config.cloudinary_folder_name,
        public_id: uniqueImageName,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as UploadApiResponse);
        }
      },
    );

    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

export const deleteImageFromCloudinary = async (
  imageUrl: string,
): Promise<void> => {
  const publicId = getPublicIdFromUrl(imageUrl);

  await cloudinary.uploader.destroy(publicId);
};

const storage = multer.memoryStorage();

const ALLOWED_MIMETYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'application/pdf',
]);

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          httpStatus.BAD_REQUEST,
          'Only image or PDF files are allowed!',
        ),
      );
    }
  },
});

export default multerUpload;
