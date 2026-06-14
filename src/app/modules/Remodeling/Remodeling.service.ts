/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { Request } from 'express';
import {
  AppError,
  uploadServiceImages,
  collectImageUrls,
  deleteServiceImages,
} from '../../utils';
import { TImageFieldConfig } from '../../utils/serviceImages';
import { IRemodeling } from './Remodeling.interface';
import RemodelingModel from './Remodeling.model';
import { DEFAULT_REQUEST_STATUS, Service_STATUSES } from '../../constants';
import { IUser } from '../User/user.interface';

const IMAGE_FIELDS: TImageFieldConfig[] = [
  { name: 'plansDrawings', multiple: true },
  { name: 'existingSpacePhotos', multiple: true },
  { name: 'panelPhotos', multiple: true },
];
const IMAGE_FIELD_NAMES = IMAGE_FIELDS.map(field => field.name);

// Required-image rules enforced on submit (skipped for drafts).
const assertRequiredImages = (data: Record<string, any>) => {
  if (!data.existingSpacePhotos?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload photo of existing space!',
    );
  }
  if (!data.panelPhotos?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload photos of your electrical panel!',
    );
  }
  if (data.hasPlansDrawings === true && !data.plansDrawings?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload the plans/drawings!',
    );
  }
};

const createRemodelingIntoDB = async (
  user: IUser,
  payload: Partial<IRemodeling>,
  files: Request['files'],
) => {
  const uploaded = await uploadServiceImages(files, IMAGE_FIELDS);
  const merged: Record<string, any> = { ...payload, ...uploaded };
  const status = merged.status ?? DEFAULT_REQUEST_STATUS;

  if (status !== Service_STATUSES.DRAFT) {
    assertRequiredImages(merged);
  }

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
