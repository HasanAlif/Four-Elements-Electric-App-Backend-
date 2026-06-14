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
import { IDockPower } from './DockPower.interface';
import DockPowerModel from './DockPower.model';
import { DEFAULT_REQUEST_STATUS, Service_STATUSES } from '../../constants';
import { IUser } from '../User/user.interface';

const IMAGE_FIELDS: TImageFieldConfig[] = [
  { name: 'panelPhotos', multiple: true },
  { name: 'existingSpacePhotos', multiple: true },
  { name: 'plansDrawingsPhotos', multiple: true },
];
const IMAGE_FIELD_NAMES = IMAGE_FIELDS.map(field => field.name);

// Required-image rules enforced on submit (skipped for drafts).
const assertRequiredImages = (data: Record<string, any>) => {
  if (!data.panelPhotos?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload clear photo(s) of electrical panel!',
    );
  }
  if (!data.existingSpacePhotos?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload photo(s) of the existing space!',
    );
  }
  if (data.hasPlansDrawings === true && !data.plansDrawingsPhotos?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please upload the plans/drawings!',
    );
  }
};

const createDockPowerIntoDB = async (
  user: IUser,
  payload: Partial<IDockPower>,
  files: Request['files'],
) => {
  const uploaded = await uploadServiceImages(files, IMAGE_FIELDS);
  const merged: Record<string, any> = { ...payload, ...uploaded };
  const status = merged.status ?? DEFAULT_REQUEST_STATUS;

  if (status !== Service_STATUSES.DRAFT) {
    assertRequiredImages(merged);
  }

  const newDoc = await DockPowerModel.create({
    ...merged,
    createdBy: user._id.toString(),
    serviceType: 'Dock Power',
    status,
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllDockPowersFromDB = async () => {
  return await DockPowerModel.find()
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getMyAllDockPowersFromDB = async (userId: string) => {
  return await DockPowerModel.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getSingleDockPowerFromDB = async (userId: string, id: string) => {
  const data = await DockPowerModel.findOne({
    _id: id,
    createdBy: userId,
  }).select('-createdAt -updatedAt');

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Dock power request not found!');
  }

  return data;
};

const updateSingleDockPowerIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<IDockPower>,
  files: Request['files'],
) => {
  const existing = await DockPowerModel.findOne({ _id: id, createdBy: userId });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Dock power request not found!');
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

const deleteSingleDockPowerFromDB = async (userId: string, id: string) => {
  const doc = await DockPowerModel.findOne({ _id: id, createdBy: userId });

  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Dock power request not found!');
  }

  const urls = collectImageUrls(doc.toObject(), IMAGE_FIELD_NAMES);
  await doc.deleteOne();
  if (urls.length) await deleteServiceImages(urls);

  const { createdAt, updatedAt, ...sanitizedData } = doc.toObject();
  return sanitizedData;
};

export const DockPowerService = {
  createDockPowerIntoDB,
  getAllDockPowersFromDB,
  getMyAllDockPowersFromDB,
  getSingleDockPowerFromDB,
  updateSingleDockPowerIntoDB,
  deleteSingleDockPowerFromDB,
};
