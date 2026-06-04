import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IEVChargerInstallation } from './EVChargerInstallation.interface';
import EVChargerInstallationModel from './EVChargerInstallation.model';

const createEVChargerInstallationIntoDB = async (
  userId: string,
  payload: Partial<IEVChargerInstallation>,
) => {
  return await EVChargerInstallationModel.create({
    ...payload,
    createdBy: userId,
    serviceType: 'EV Charger Installation',
    // chargerProvidedByUser: payload.chargerProvidedByUser ?? false,
    panelPhotos: payload.panelPhotos ?? [],
    status: payload.status ?? 'submitted',
  });
};

const getMyAllEVChargerInstallationsFromDB = async (userId: string) => {
  return await EVChargerInstallationModel.find({ createdBy: userId }).sort({
    createdAt: -1,
  });
};

const getSingleEVChargerInstallationFromDB = async (
  userId: string,
  id: string,
) => {
  const data = await EVChargerInstallationModel.findOne({
    _id: id,
    createdBy: userId,
  });

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
) => {
  const data = await EVChargerInstallationModel.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!data) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'EV charger installation not found!',
    );
  }

  Object.assign(data, payload);

  const updated = await data.save();
  return updated;
};

export const EVChargerInstallationService = {
  createEVChargerInstallationIntoDB,
  getMyAllEVChargerInstallationsFromDB,
  getSingleEVChargerInstallationFromDB,
  updateSingleEVChargerInstallationIntoDB,
};
