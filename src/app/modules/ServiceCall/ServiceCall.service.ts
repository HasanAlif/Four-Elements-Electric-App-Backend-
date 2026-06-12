import httpStatus from 'http-status';
import { AppError } from '../../utils';
import { IServiceCall } from './ServiceCall.interface';
import ServiceCallModel from './ServiceCall.model';
import { TServiceStatus } from '../../constants';

// createServiceCallIntoDB
const createServiceCallIntoDB = async (payload: Partial<IServiceCall>) => {
  const newDoc = await ServiceCallModel.create({
    ...payload,
    status: payload.status ?? 'submitted',
  });

  const { createdAt, updatedAt, ...sanitizedData } = newDoc.toObject();
  return sanitizedData;
};

// getAllServiceCallsFromDB
const getAllServiceCallsFromDB = async () => {
  return await ServiceCallModel.find()
    .sort({ createdAt: -1 })
    .select('-createdAt -updatedAt');
};

// getMyAllServiceCallsFromDB
const getMyAllServiceCallsFromDB = async (userId: string) => {
  return await ServiceCallModel.find({ createdBy: userId })
    .sort({
      createdAt: -1,
    })
    .select('-createdAt -updatedAt');
};

// getSingleServiceCallFromDB
const getSingleServiceCallFromDB = async (id: string) => {
  const serviceCall = await ServiceCallModel.findById(id).select(
    '-createdAt -updatedAt',
  );

  if (!serviceCall) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service call not found!');
  }

  return serviceCall;
};

// updateServiceCallStatusIntoDB
const updateServiceCallIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<IServiceCall>,
) => {
  const updatedData = await ServiceCallModel.findOneAndUpdate(
    { _id: id, createdBy: userId },
    payload,
    { new: true, runValidators: true },
  ).select('-createdAt -updatedAt');

  if (!updatedData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service call not found!');
  }

  return updatedData;
};

export const ServiceCallService = {
  createServiceCallIntoDB,
  getAllServiceCallsFromDB,
  getMyAllServiceCallsFromDB,
  getSingleServiceCallFromDB,
  updateServiceCallIntoDB,
};
