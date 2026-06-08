import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IHotTub } from './HotTub.interface';
import HotTubModel from './HotTub.model';

const createHotTubIntoDB = async (
  userId: string,
  payload: Partial<IHotTub>,
) => {
  return await HotTubModel.create({
    ...payload,
    createdBy: userId,
    serviceType: 'Hot tub installation',
    panelPhotos: payload.panelPhotos ?? [],
    hotTubPhotos: payload.hotTubPhotos ?? [],
    receptaclePhotos: payload.receptaclePhotos ?? [],
    status: payload.status ?? 'submitted',
  });
};

const getMyAllHotTubsFromDB = async (userId: string) => {
  return await HotTubModel.find({ createdBy: userId }).sort({
    createdAt: -1,
  });
};

const getSingleHotTubFromDB = async (userId: string, id: string) => {
  const data = await HotTubModel.findOne({ _id: id, createdBy: userId });

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Hot tub request not found!');
  }

  return data;
};

const updateSingleHotTubIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<IHotTub>,
) => {
  const data = await HotTubModel.findOne({ _id: id, createdBy: userId });

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Hot tub request not found!');
  }

  Object.assign(data, payload);

  const updated = await data.save();
  return updated;
};

export const HotTubService = {
  createHotTubIntoDB,
  getMyAllHotTubsFromDB,
  getSingleHotTubFromDB,
  updateSingleHotTubIntoDB,
};
