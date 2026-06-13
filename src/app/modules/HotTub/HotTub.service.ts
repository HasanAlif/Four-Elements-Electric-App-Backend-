import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IHotTub } from './HotTub.interface';
import HotTubModel from './HotTub.model';
import { DEFAULT_REQUEST_STATUS } from '../../constants';

const createHotTubIntoDB = async (
  userId: string,
  payload: Partial<IHotTub>,
) => {
  const newDoc = await HotTubModel.create({
    ...payload,
    createdBy: userId,
    serviceType: 'Hot tub installation',
    panelPhotos: payload.panelPhotos ?? [],
    hotTubPhotos: payload.hotTubPhotos ?? [],
    receptaclePhotos: payload.receptaclePhotos ?? [],
    status: payload.status ?? DEFAULT_REQUEST_STATUS,
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

const getAllHotTubsFromDB = async () => {
  return await HotTubModel.find()
    .sort({
      createdAt: -1,
    })
    .select('-createdAt -updatedAt');
};

const getMyAllHotTubsFromDB = async (userId: string) => {
  return await HotTubModel.find({ createdBy: userId })
    .sort({
      createdAt: -1,
    })
    .select('-createdAt -updatedAt');
};

const getSingleHotTubFromDB = async (userId: string, id: string) => {
  const data = await HotTubModel.findOne({
    _id: id,
    createdBy: userId,
  }).select('-createdAt -updatedAt');

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
  const updatedData = await HotTubModel.findOneAndUpdate(
    { _id: id, createdBy: userId },
    payload,
    { new: true, runValidators: true },
  ).select('-createdAt -updatedAt');

  if (!updatedData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Hot tub request not found!');
  }

  return updatedData;
};

const deleteSingleHotTubFromDB = async (userId: string, id: string) => {
  const deletedData = await HotTubModel.findOneAndDelete({
    _id: id,
    createdBy: userId,
  }).select('-createdAt -updatedAt');

  if (!deletedData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Hot tub request not found!');
  }

  return deletedData;
};

export const HotTubService = {
  createHotTubIntoDB,
  getAllHotTubsFromDB,
  getMyAllHotTubsFromDB,
  getSingleHotTubFromDB,
  updateSingleHotTubIntoDB,
  deleteSingleHotTubFromDB,
};
