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
import { IHotTub } from './HotTub.interface';
import HotTubModel from './HotTub.model';
import { DEFAULT_REQUEST_STATUS, Service_STATUSES } from '../../constants';
import { IUser } from '../User/user.interface';

const IMAGE_FIELDS: TImageFieldConfig[] = [
  { name: 'manualDocument', multiple: false },
  { name: 'panelPhotos', multiple: true },
  { name: 'hotTubPhotos', multiple: true },
  { name: 'receptaclePhotos', multiple: true },
];
const IMAGE_FIELD_NAMES = IMAGE_FIELDS.map(field => field.name);

// Required-image rules enforced on submit (skipped for drafts).
const assertRequiredImages = (data: Record<string, any>) => {
  if (!data.panelPhotos?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload photo(s) of electrical panel!',
    );
  }
  if (!data.hotTubPhotos?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload photo(s) of the hot tub!',
    );
  }
  if (data.hasDigitalManual === true && !data.manualDocument) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload the digital manual!',
    );
  }
};

const createHotTubIntoDB = async (
  user: IUser,
  payload: Partial<IHotTub>,
  files: Request['files'],
) => {
  const uploaded = await uploadServiceImages(files, IMAGE_FIELDS);
  const merged: Record<string, any> = { ...payload, ...uploaded };
  const status = merged.status ?? DEFAULT_REQUEST_STATUS;

  if (status !== Service_STATUSES.DRAFT) {
    assertRequiredImages(merged);
  }

  const newDoc = await HotTubModel.create({
    ...merged,
    createdBy: user._id.toString(),
    serviceType: 'Hot tub installation',
    status,
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllHotTubsFromDB = async () => {
  return await HotTubModel.find()
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getMyAllHotTubsFromDB = async (userId: string) => {
  return await HotTubModel.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getSingleHotTubFromDB = async (userId: string, id: string) => {
  const data = await HotTubModel.findOne({
    _id: id,
    createdBy: userId,
  }).select('-createdAt -updatedAt');

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Hot tub request not found!');
  }

  return data;
};

const updateSingleHotTubIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<IHotTub>,
  files: Request['files'],
) => {
  const existing = await HotTubModel.findOne({ _id: id, createdBy: userId });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Hot tub request not found!');
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

const deleteSingleHotTubFromDB = async (userId: string, id: string) => {
  const doc = await HotTubModel.findOne({ _id: id, createdBy: userId });

  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Hot tub request not found!');
  }

  const urls = collectImageUrls(doc.toObject(), IMAGE_FIELD_NAMES);
  await doc.deleteOne();
  if (urls.length) await deleteServiceImages(urls);

  const { createdAt, updatedAt, ...sanitizedData } = doc.toObject();
  return sanitizedData;
};

export const HotTubService = {
  createHotTubIntoDB,
  getAllHotTubsFromDB,
  getMyAllHotTubsFromDB,
  getSingleHotTubFromDB,
  updateSingleHotTubIntoDB,
  deleteSingleHotTubFromDB,
};
