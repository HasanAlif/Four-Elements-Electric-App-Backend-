import {
  sendImageToCloudinary,
  deleteImageFromCloudinary,
} from '../lib/upload';

export type TImageFieldConfig = {
  name: string;
  multiple: boolean;
};

type TMulterFiles =
  | { [fieldname: string]: Express.Multer.File[] }
  | Express.Multer.File[]
  | undefined;

const asFileMap = (
  files: TMulterFiles,
): Record<string, Express.Multer.File[]> => {
  if (!files) return {};
  if (Array.isArray(files)) {
    return files.reduce<Record<string, Express.Multer.File[]>>((acc, file) => {
      (acc[file.fieldname] ||= []).push(file);
      return acc;
    }, {});
  }
  return files;
};

export const uploadServiceImages = async (
  files: TMulterFiles,
  fields: TImageFieldConfig[],
): Promise<Record<string, string | string[]>> => {
  const fileMap = asFileMap(files);
  const result: Record<string, string | string[]> = {};

  for (const { name, multiple } of fields) {
    const group = fileMap[name];
    if (!group || group.length === 0) continue;

    const uploads = await Promise.all(
      group.map(file => sendImageToCloudinary(file)),
    );
    const urls = uploads.map(upload => upload.secure_url);

    result[name] = multiple ? urls : urls[0];
  }

  return result;
};

export const collectImageUrls = (
  doc: object,
  fieldNames: string[],
): string[] => {
  const source = doc as Record<string, unknown>;
  const urls: string[] = [];

  for (const name of fieldNames) {
    const value = source[name];
    if (typeof value === 'string' && value) {
      urls.push(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item) urls.push(item);
      }
    }
  }

  return urls;
};

export const deleteServiceImages = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(async url => {
      try {
        await deleteImageFromCloudinary(url);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', url, error);
      }
    }),
  );
};
