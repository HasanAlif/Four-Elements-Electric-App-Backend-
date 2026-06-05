import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IRemodeling } from './Remodeling.interface';
import RemodelingModel from './Remodeling.model';

const createRemodelingIntoDB = async (
  userId: string,
  payload: Partial<IRemodeling>,
) => {
  return await RemodelingModel.create({
    ...payload,
    createdBy: userId,
    serviceType: 'Remodeling',
    plansDrawings: payload.plansDrawings ?? [],
    existingSpacePhotos: payload.existingSpacePhotos ?? [],
    panelPhotos: payload.panelPhotos ?? [],
    status: payload.status ?? 'submitted',
  });
};

const getMyAllRemodelingsFromDB = async (userId: string) => {
  return await RemodelingModel.find({ createdBy: userId }).sort({
    createdAt: -1,
  });
};

const getSingleRemodelingFromDB = async (userId: string, id: string) => {
  const data = await RemodelingModel.findOne({ _id: id, createdBy: userId });

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
  const data = await RemodelingModel.findOne({ _id: id, createdBy: userId });

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Remodeling request not found!');
  }

  Object.assign(data, payload);

  const updated = await data.save();
  return updated;
};

export const RemodelingService = {
  createRemodelingIntoDB,
  getMyAllRemodelingsFromDB,
  getSingleRemodelingFromDB,
  updateSingleRemodelingIntoDB,
};
