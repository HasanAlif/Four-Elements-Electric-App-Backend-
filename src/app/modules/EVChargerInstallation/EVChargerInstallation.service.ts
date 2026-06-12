import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IEVChargerInstallation } from './EVChargerInstallation.interface';
import EVChargerInstallationModel from './EVChargerInstallation.model';
import { DEFAULT_REQUEST_STATUS } from '../../constants';

const createEVChargerInstallationIntoDB = async (
  userId: string,
  payload: Partial<IEVChargerInstallation>,
) => {
  const newDoc = await EVChargerInstallationModel.create({
    ...payload,
    createdBy: userId,
    serviceType: 'EV Charger Installation',
    // chargerProvidedByUser: payload.chargerProvidedByUser ?? false,
    panelPhotos: payload.panelPhotos ?? [],
    status: payload.status ?? DEFAULT_REQUEST_STATUS,
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllEVChargerInstallationsFromDB = async () => {
  return await EVChargerInstallationModel.find()
    .sort({
      createdAt: -1,
    })
    .select('-createdAt -updatedAt');
};

const getMyAllEVChargerInstallationsFromDB = async (userId: string) => {
  return await EVChargerInstallationModel.find({ createdBy: userId })
    .sort({
      createdAt: -1,
    })
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
) => {
  const updatedData = await EVChargerInstallationModel.findOneAndUpdate(
    { _id: id, createdBy: userId },
    payload,
    { new: true, runValidators: true },
  ).select('-createdAt -updatedAt');

  if (!updatedData) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'EV charger installation not found!',
    );
  }

  return updatedData;
};

export const EVChargerInstallationService = {
  createEVChargerInstallationIntoDB,
  getAllEVChargerInstallationsFromDB,
  getMyAllEVChargerInstallationsFromDB,
  getSingleEVChargerInstallationFromDB,
  updateSingleEVChargerInstallationIntoDB,
};
