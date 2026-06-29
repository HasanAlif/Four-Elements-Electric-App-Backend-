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
import { IAccessoryBuildingPower } from './AccessoryBuildingPower.interface';
import AccessoryBuildingPowerModel from './AccessoryBuildingPower.model';
import { DEFAULT_REQUEST_STATUS } from '../../constants';
import { IUser } from '../User/user.interface';

const IMAGE_FIELDS: TImageFieldConfig[] = [
  { name: 'panelPhotos', multiple: true },
  { name: 'existingSpacePhotos', multiple: true },
  { name: 'plansDrawings', multiple: true },
];
const IMAGE_FIELD_NAMES = IMAGE_FIELDS.map(field => field.name);

const createAccessoryBuildingPowerIntoDB = async (
  user: IUser,
  payload: Partial<IAccessoryBuildingPower>,
  files: Request['files'],
) => {
  const safePayload = sanitizeServiceCreatePayload(payload);
  const uploaded = await uploadServiceImages(files, IMAGE_FIELDS);
  const merged: Record<string, any> = { ...safePayload, ...uploaded };
  const status = merged.status ?? DEFAULT_REQUEST_STATUS;

  const newDoc = await AccessoryBuildingPowerModel.create({
    ...merged,
    createdBy: user._id.toString(),
    serviceType: 'Accessory Building / Shed Power',
    status,
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllAccessoryBuildingPowersFromDB = async () => {
  return await AccessoryBuildingPowerModel.find()
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getMyAllAccessoryBuildingPowersFromDB = async (userId: string) => {
  return await AccessoryBuildingPowerModel.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

const getSingleAccessoryBuildingPowerFromDB = async (
  userId: string,
  id: string,
) => {
  const data = await AccessoryBuildingPowerModel.findOne({
    _id: id,
    createdBy: userId,
  }).select('-createdAt -updatedAt');

  if (!data) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Accessory building power request not found!',
    );
  }

  return data;
};

const updateSingleAccessoryBuildingPowerIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<IAccessoryBuildingPower>,
  files: Request['files'],
) => {
  const existing = await AccessoryBuildingPowerModel.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!existing) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Accessory building power request not found!',
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

const deleteSingleAccessoryBuildingPowerFromDB = async (
  userId: string,
  id: string,
) => {
  const doc = await AccessoryBuildingPowerModel.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!doc) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Accessory building power request not found!',
    );
  }

  const urls = collectImageUrls(doc.toObject(), IMAGE_FIELD_NAMES);
  await doc.deleteOne();
  if (urls.length) await deleteServiceImages(urls);

  const { createdAt, updatedAt, ...sanitizedData } = doc.toObject();
  return sanitizedData;
};

export const AccessoryBuildingPowerService = {
  createAccessoryBuildingPowerIntoDB,
  getAllAccessoryBuildingPowersFromDB,
  getMyAllAccessoryBuildingPowersFromDB,
  getSingleAccessoryBuildingPowerFromDB,
  updateSingleAccessoryBuildingPowerIntoDB,
  deleteSingleAccessoryBuildingPowerFromDB,
};
