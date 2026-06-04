import AddressModel from './address.model';
import { IAddress } from './address.interface';
import httpStatus from 'http-status';
import { AppError } from '../../utils';

const createAddressIntoDB = async (
  userId: string,
  payload: Partial<IAddress>,
) => {
  if (payload.isDefault) {
    await AddressModel.updateMany(
      { user: userId },
      { $set: { isDefault: false } },
    );
  }

  return await AddressModel.create({
    ...payload,
    user: userId,
    isDefault: payload.isDefault ?? false,
  });
};

const getMyAllAddressesFromDB = async (userId: string) => {
  return await AddressModel.find({ user: userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

const getSingleAddressFromDB = async (userId: string, id: string) => {
  const address = await AddressModel.findOne({ _id: id, user: userId });

  if (!address) {
    throw new AppError(httpStatus.NOT_FOUND, 'Address not found!');
  }

  return address;
};

const updateSingleAddressIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<IAddress>,
) => {
  const address = await AddressModel.findOne({ _id: id, user: userId });

  if (!address) {
    throw new AppError(httpStatus.NOT_FOUND, 'Address not found!');
  }

  if (payload.isDefault) {
    await AddressModel.updateMany(
      { user: userId, _id: { $ne: id } },
      { $set: { isDefault: false } },
    );
  }

  Object.assign(address, payload);

  if (payload.isDefault !== undefined) {
    address.isDefault = payload.isDefault;
  }

  const updatedAddress = await address.save();

  return updatedAddress;
};

export const AddressService = {
  createAddressIntoDB,
  getMyAllAddressesFromDB,
  getSingleAddressFromDB,
  updateSingleAddressIntoDB,
};
