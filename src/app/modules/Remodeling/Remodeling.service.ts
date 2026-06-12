import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IRemodeling } from './Remodeling.interface';
import RemodelingModel from './Remodeling.model';

const createRemodelingIntoDB = async (
  userId: string,
  payload: Partial<IRemodeling>,
) => {
  const newDoc = await RemodelingModel.create({
    ...payload,
    createdBy: userId,
    serviceType: 'Remodeling',
    plansDrawings: payload.plansDrawings ?? [],
    existingSpacePhotos: payload.existingSpacePhotos ?? [],
    panelPhotos: payload.panelPhotos ?? [],
    status: payload.status ?? 'submitted',
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllRemodelingsFromDB = async () => {
  return await RemodelingModel.find()
    .sort({
      createdAt: -1,
    })
    .select('-createdAt -updatedAt');
};

const getMyAllRemodelingsFromDB = async (userId: string) => {
  return await RemodelingModel.find({ createdBy: userId })
    .sort({
      createdAt: -1,
    })
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
) => {
  const updatedData = await RemodelingModel.findOneAndUpdate(
    { _id: id, createdBy: userId },
    payload,
    { new: true, runValidators: true },
  ).select('-createdAt -updatedAt');

  if (!updatedData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Remodeling request not found!');
  }

  return updatedData;
};

export const RemodelingService = {
  createRemodelingIntoDB,
  getAllRemodelingsFromDB,
  getMyAllRemodelingsFromDB,
  getSingleRemodelingFromDB,
  updateSingleRemodelingIntoDB,
};
