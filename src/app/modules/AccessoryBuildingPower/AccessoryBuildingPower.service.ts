import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IAccessoryBuildingPower } from './AccessoryBuildingPower.interface';
import AccessoryBuildingPowerModel from './AccessoryBuildingPower.model';

const createAccessoryBuildingPowerIntoDB = async (
  userId: string,
  payload: Partial<IAccessoryBuildingPower>,
) => {
  const newDoc = await AccessoryBuildingPowerModel.create({
    ...payload,
    createdBy: userId,
    serviceType: 'Accessory Building / Shed Power',
    panelPhotos: payload.panelPhotos ?? [],
    existingSpacePhotos: payload.existingSpacePhotos ?? [],
    plansDrawings: payload.plansDrawings ?? [],
    status: payload.status ?? 'submitted',
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllAccessoryBuildingPowersFromDB = async () => {
  return await AccessoryBuildingPowerModel.find()
    .sort({
      createdAt: -1,
    })
    .select('-createdAt -updatedAt');
};

const getMyAllAccessoryBuildingPowersFromDB = async (userId: string) => {
  return await AccessoryBuildingPowerModel.find({ createdBy: userId })
    .sort({
      createdAt: -1,
    })
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
) => {
  const updatedData = await AccessoryBuildingPowerModel.findOneAndUpdate(
    { _id: id, createdBy: userId },
    payload,
    { new: true, runValidators: true },
  ).select('-createdAt -updatedAt');

  if (!updatedData) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Accessory building power request not found!',
    );
  }

  return updatedData;
};

export const AccessoryBuildingPowerService = {
  createAccessoryBuildingPowerIntoDB,
  getAllAccessoryBuildingPowersFromDB,
  getMyAllAccessoryBuildingPowersFromDB,
  getSingleAccessoryBuildingPowerFromDB,
  updateSingleAccessoryBuildingPowerIntoDB,
};
