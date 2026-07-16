import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../utils/AppError';

const gcsClient = new Storage();

const bucketName = config.gcs?.bucket_name || 'four-elements-public-docs';
const bucket = gcsClient.bucket(bucketName);

export const sendPdfToBucket = async (
  file: Express.Multer.File,
): Promise<string> => {
  if (!file.originalname || typeof file.originalname !== 'string') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid file provided');
  }

  const uniqueId = `${Math.random().toString(36).substring(2)}-${Date.now()}`;
  const objectKey = `pdfs/${uniqueId}.pdf`;

  const blob = bucket.file(objectKey);

  return new Promise((resolve, reject) => {
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: 'application/pdf',
      },
    });

    blobStream.on('error', err => {
      reject(err);
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectKey}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

export const deletePdfFromBucket = async (pdfUrl: string): Promise<void> => {
  try {
    const url = new URL(pdfUrl);

    const pathParts = url.pathname.split(`/${bucketName}/`);
    if (pathParts.length < 2) {
      console.warn('Could not parse GCS URL for deletion:', pdfUrl);
      return;
    }

    const objectKey = pathParts[1];

    await bucket.file(objectKey).delete({ ignoreNotFound: true });
  } catch (error) {
    console.error('Failed to delete PDF from bucket:', error);
  }
};

const storage = multer.memoryStorage();

const ALLOWED_MIMETYPES = new Set(['application/pdf']);

export const multerPdfUpload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB size limit for PDFs
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(httpStatus.BAD_REQUEST, 'Only PDF files are allowed!'));
    }
  },
});

export default multerPdfUpload;
