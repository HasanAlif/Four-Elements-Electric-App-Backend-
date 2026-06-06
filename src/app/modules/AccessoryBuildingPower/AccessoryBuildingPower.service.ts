import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IAccessoryBuildingPower } from './AccessoryBuildingPower.interface';
import AccessoryBuildingPowerModel from './AccessoryBuildingPower.model';

const createAccessoryBuildingPowerIntoDB = async (
  userId: string,
  payload: Partial<IAccessoryBuildingPower>,
) => {
  return await AccessoryBuildingPowerModel.create({
    ...payload,
    createdBy: userId,
    serviceType: 'Accessory Building / Shed Power',
    panelPhotos: payload.panelPhotos ?? [],
    existingSpacePhotos: payload.existingSpacePhotos ?? [],
    plansDrawings: payload.plansDrawings ?? [],
    status: payload.status ?? 'submitted',
  });
};

const getMyAllAccessoryBuildingPowersFromDB = async (userId: string) => {
  return await AccessoryBuildingPowerModel.find({ createdBy: userId }).sort({
    createdAt: -1,
  });
};

const getSingleAccessoryBuildingPowerFromDB = async (
  userId: string,
  id: string,
) => {
  const data = await AccessoryBuildingPowerModel.findOne({
    _id: id,
    createdBy: userId,
  });

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
  const data = await AccessoryBuildingPowerModel.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!data) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Accessory building power request not found!',
    );
  }

  Object.assign(data, payload);

  const updated = await data.save();
  return updated;
};

export const AccessoryBuildingPowerService = {
  createAccessoryBuildingPowerIntoDB,
  getMyAllAccessoryBuildingPowersFromDB,
  getSingleAccessoryBuildingPowerFromDB,
  updateSingleAccessoryBuildingPowerIntoDB,
};
