import httpStatus from 'http-status';
import { Request } from 'express';
import {
  AppError,
  uploadServiceImages,
  collectImageUrls,
  deleteServiceImages,
  sanitizeServiceCreatePayload,
} from '../../utils';
import { TImageFieldConfig } from '../../utils/serviceImages';
import { IRemodeling } from './Remodeling.interface';
import RemodelingModel from './Remodeling.model';
import { DEFAULT_REQUEST_STATUS } from '../../constants';
import { IUser } from '../User/user.interface';

const IMAGE_FIELDS: TImageFieldConfig[] = [
  { name: 'plansDrawings', multiple: true },
  { name: 'existingSpacePhotos', multiple: true },
  { name: 'panelPhotos', multiple: true },
];
const IMAGE_FIELD_NAMES = IMAGE_FIELDS.map(field => field.name);

const createRemodelingIntoDB = async (
  user: IUser,
  payload: Partial<IRemodeling>,
  files: Request['files'],
) => {
  const safePayload = sanitizeServiceCreatePayload(payload);
  const uploaded = await uploadServiceImages(files, IMAGE_FIELDS);
  const merged: Record<string, any> = { ...safePayload, ...uploaded };
  const status = merged.status ?? DEFAULT_REQUEST_STATUS;

  const newDoc = await RemodelingModel.create({
    ...merged,
    createdBy: user._id.toString(),
    serviceType: 'Remodeling',
    status,
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllRemodelingsFromDB = async () => {
  return await RemodelingModel.find()
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getMyAllRemodelingsFromDB = async (userId: string) => {
  return await RemodelingModel.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getSingleRemodelingFromDB = async (userId: string, id: string) => {
  const data = await RemodelingModel.findOne({
    _id: id,
    createdBy: userId,
  }).select('-createdAt -updatedAt');

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Remodeling request not found!');
  }

  return data;
};

const updateSingleRemodelingIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<IRemodeling>,
  files: Request['files'],
) => {
  const existing = await RemodelingModel.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Remodeling request not found!');
  }

  const uploaded = await uploadServiceImages(files, IMAGE_FIELDS);

  if (Object.keys(payload).length === 0 && Object.keys(uploaded).length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Nothing to update!');
  }

  const oldUrls = collectImageUrls(existing.toObject(), Object.keys(uploaded));

  Object.assign(existing, payload, uploaded);
  const updated = await existing.save();

  if (oldUrls.length) await deleteServiceImages(oldUrls);

  const { createdAt, updatedAt, ...sanitizedData } = updated.toObject();
  return sanitizedData;
};

const deleteSingleRemodelingFromDB = async (userId: string, id: string) => {
  const doc = await RemodelingModel.findOne({ _id: id, createdBy: userId });

  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Remodeling request not found!');
  }

  const urls = collectImageUrls(doc.toObject(), IMAGE_FIELD_NAMES);
  await doc.deleteOne();
  if (urls.length) await deleteServiceImages(urls);

  const { createdAt, updatedAt, ...sanitizedData } = doc.toObject();
  return sanitizedData;
};

export const RemodelingService = {
  createRemodelingIntoDB,
  getAllRemodelingsFromDB,
  getMyAllRemodelingsFromDB,
  getSingleRemodelingFromDB,
  updateSingleRemodelingIntoDB,
  deleteSingleRemodelingFromDB,
};
