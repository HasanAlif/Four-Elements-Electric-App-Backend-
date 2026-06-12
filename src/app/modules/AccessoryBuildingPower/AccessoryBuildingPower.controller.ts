import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { IAccessoryBuildingPower } from './AccessoryBuildingPower.interface';
import { AccessoryBuildingPowerService } from './AccessoryBuildingPower.service';

export const AccessoryBuildingPowerController = {
  createAccessoryBuilding: asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as Partial<IAccessoryBuildingPower>;
    const data =
      await AccessoryBuildingPowerService.createAccessoryBuildingPowerIntoDB(
        req.user._id.toString(),
        payload,
      );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Accessory building power request created successfully!',
      data,
    });
  }),

  getAllAccessoryBuildings: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await AccessoryBuildingPowerService.getAllAccessoryBuildingPowersFromDB();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Accessory building power requests retrieved successfully!',
        data,
      });
    },
  ),

  getMyAllAccessoryBuildings: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await AccessoryBuildingPowerService.getMyAllAccessoryBuildingPowersFromDB(
          req.user._id.toString(),
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message:
          'Your accessory building power requests retrieved successfully!',
        data,
      });
    },
  ),

  getSingleAccessoryBuilding: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await AccessoryBuildingPowerService.getSingleAccessoryBuildingPowerFromDB(
          req.user._id.toString(),
          req.params.id as string,
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Accessory building power request retrieved successfully!',
        data,
      });
    },
  ),

  updateSingleAccessoryBuilding: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await AccessoryBuildingPowerService.updateSingleAccessoryBuildingPowerIntoDB(
          req.user._id.toString(),
          req.params.id as string,
          req.body as Partial<IAccessoryBuildingPower>,
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Accessory building power request updated successfully!',
        data,
      });
    },
  ),
};
