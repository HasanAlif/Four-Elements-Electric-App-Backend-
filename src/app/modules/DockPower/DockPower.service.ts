import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IDockPower } from './DockPower.interface';
import DockPowerModel from './DockPower.model';

const createDockPowerIntoDB = async (
  userId: string,
  payload: Partial<IDockPower>,
) => {
  const newDoc = await DockPowerModel.create({
    ...payload,
    createdBy: userId,
    serviceType: 'Dock Power',
    panelPhotos: payload.panelPhotos ?? [],
    existingSpacePhotos: payload.existingSpacePhotos ?? [],
    plansDrawingsPhotos: payload.plansDrawingsPhotos ?? [],
    status: payload.status ?? 'submitted',
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllDockPowersFromDB = async () => {
  return await DockPowerModel.find()
    .sort({
      createdAt: -1,
    })
    .select('-createdAt -updatedAt');
};

const getMyAllDockPowersFromDB = async (userId: string) => {
  return await DockPowerModel.find({ createdBy: userId })
    .sort({
      createdAt: -1,
    })
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
) => {
  const updatedData = await DockPowerModel.findOneAndUpdate(
    { _id: id, createdBy: userId },
    payload,
    { new: true, runValidators: true },
  ).select('-createdAt -updatedAt');

  if (!updatedData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Dock power request not found!');
  }

  return updatedData;
};

export const DockPowerService = {
  createDockPowerIntoDB,
  getAllDockPowersFromDB,
  getMyAllDockPowersFromDB,
  getSingleDockPowerFromDB,
  updateSingleDockPowerIntoDB,
};
