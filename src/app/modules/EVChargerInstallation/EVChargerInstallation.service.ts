import httpStatus from 'http-status';
import { Request } from 'express';
import {
  AppError,
  uploadServiceImages,
  collectImageUrls,
  deleteServiceImages,
} from '../../utils';
import { TImageFieldConfig } from '../../utils/serviceImages';
import { IEVChargerInstallation } from './EVChargerInstallation.interface';
import EVChargerInstallationModel from './EVChargerInstallation.model';
import { DEFAULT_REQUEST_STATUS } from '../../constants';
import { IUser } from '../User/user.interface';

// Image fields uploaded as files (form-data) and stored as Cloudinary URLs
const IMAGE_FIELDS: TImageFieldConfig[] = [
  { name: 'areaPhoto', multiple: false },
  { name: 'panelPhotos', multiple: true },
];
const IMAGE_FIELD_NAMES = IMAGE_FIELDS.map(field => field.name);

const createEVChargerInstallationIntoDB = async (
  user: IUser,
  payload: Partial<IEVChargerInstallation>,
  files: Request['files'],
) => {
  const uploaded = await uploadServiceImages(files, IMAGE_FIELDS);

  const newDoc = await EVChargerInstallationModel.create({
    ...payload,
    ...uploaded,
    createdBy: user._id.toString(),
    serviceType: 'EV Charger Installation',
    status: payload.status ?? DEFAULT_REQUEST_STATUS,
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllEVChargerInstallationsFromDB = async () => {
  return await EVChargerInstallationModel.find()
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getMyAllEVChargerInstallationsFromDB = async (userId: string) => {
  return await EVChargerInstallationModel.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getSingleEVChargerInstallationFromDB = async (
  userId: string,
  id: string,
) => {
  const data = await EVChargerInstallationModel.findOne({
    _id: id,
    createdBy: userId,
  }).select('-createdAt -updatedAt');

  if (!data) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'EV charger installation not found!',
    );
  }

  return data;
};

const updateSingleEVChargerInstallationIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<IEVChargerInstallation>,
  files: Request['files'],
) => {
  const existing = await EVChargerInstallationModel.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!existing) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'EV charger installation not found!',
    );
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

const deleteSingleEVChargerInstallationFromDB = async (
  userId: string,
  id: string,
) => {
  const doc = await EVChargerInstallationModel.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!doc) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'EV charger installation not found!',
    );
  }

  const urls = collectImageUrls(doc.toObject(), IMAGE_FIELD_NAMES);
  await doc.deleteOne();
  if (urls.length) await deleteServiceImages(urls);

  const { createdAt, updatedAt, ...sanitizedData } = doc.toObject();
  return sanitizedData;
};

export const EVChargerInstallationService = {
  createEVChargerInstallationIntoDB,
  getAllEVChargerInstallationsFromDB,
  getMyAllEVChargerInstallationsFromDB,
  getSingleEVChargerInstallationFromDB,
  updateSingleEVChargerInstallationIntoDB,
  deleteSingleEVChargerInstallationFromDB,
};
