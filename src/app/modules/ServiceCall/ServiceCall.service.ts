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
import { IServiceCall } from './ServiceCall.interface';
import ServiceCallModel from './ServiceCall.model';
import { DEFAULT_REQUEST_STATUS } from '../../constants';
import { IUser } from '../User/user.interface';

const IMAGE_FIELDS: TImageFieldConfig[] = [
  { name: 'panelPhotos', multiple: true },
  { name: 'workAreaPhotos', multiple: true },
  { name: 'extraReferencePhotos', multiple: true },
];
const IMAGE_FIELD_NAMES = IMAGE_FIELDS.map(field => field.name);

// createServiceCallIntoDB
const createServiceCallIntoDB = async (
  user: IUser,
  payload: Partial<IServiceCall>,
  files: Request['files'],
) => {
  const safePayload = sanitizeServiceCreatePayload(payload);
  const uploaded = await uploadServiceImages(files, IMAGE_FIELDS);

  const newDoc = await ServiceCallModel.create({
    ...safePayload,
    ...uploaded,
    createdBy: user._id.toString(),
    status: safePayload.status ?? DEFAULT_REQUEST_STATUS,
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

// getAllServiceCallsFromDB
const getAllServiceCallsFromDB = async () => {
  return await ServiceCallModel.find()
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

// getMyAllServiceCallsFromDB
const getMyAllServiceCallsFromDB = async (userId: string) => {
  return await ServiceCallModel.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

// getSingleServiceCallFromDB
const getSingleServiceCallFromDB = async (userId: string, id: string) => {
  const serviceCall = await ServiceCallModel.findOne({
    _id: id,
    createdBy: userId,
  }).select('-createdAt -updatedAt');

  if (!serviceCall) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service call not found!');
  }

  return serviceCall;
};

// updateServiceCallIntoDB
const updateServiceCallIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<IServiceCall>,
  files: Request['files'],
) => {
  const existing = await ServiceCallModel.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service call not found!');
  }

  const uploaded = await uploadServiceImages(files, IMAGE_FIELDS);

  if (Object.keys(payload).length === 0 && Object.keys(uploaded).length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Nothing to update!');
  }

  // old images for the fields being replaced (deleted after a successful save)
  const oldUrls = collectImageUrls(existing.toObject(), Object.keys(uploaded));

  Object.assign(existing, payload, uploaded);
  const updated = await existing.save();

  if (oldUrls.length) await deleteServiceImages(oldUrls);

  const { createdAt, updatedAt, ...sanitizedData } = updated.toObject();
  return sanitizedData;
};

// deleteServiceCallFromDB
const deleteServiceCallFromDB = async (userId: string, id: string) => {
  const doc = await ServiceCallModel.findOne({ _id: id, createdBy: userId });

  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service call not found!');
  }

  const urls = collectImageUrls(doc.toObject(), IMAGE_FIELD_NAMES);
  await doc.deleteOne();
  if (urls.length) await deleteServiceImages(urls);

  const { createdAt, updatedAt, ...sanitizedData } = doc.toObject();
  return sanitizedData;
};

export const ServiceCallService = {
  createServiceCallIntoDB,
  getAllServiceCallsFromDB,
  getMyAllServiceCallsFromDB,
  getSingleServiceCallFromDB,
  updateServiceCallIntoDB,
  deleteServiceCallFromDB,
};
