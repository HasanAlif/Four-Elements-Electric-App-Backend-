import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { EVChargerInstallationService } from './EVChargerInstallation.service';
import { IEVChargerInstallation } from './EVChargerInstallation.interface';

export const EVChargerInstallationController = {
  createEVChargerInstallation: asyncHandler(
    async (req: Request, res: Response) => {
      const payload = req.body as Partial<IEVChargerInstallation>;
      const data =
        await EVChargerInstallationService.createEVChargerInstallationIntoDB(
          req.user._id.toString(),
          payload,
        );

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'EV charger installation request created successfully!',
        data,
      });
    },
  ),

  getAllEVChargerInstallations: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await EVChargerInstallationService.getAllEVChargerInstallationsFromDB();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'All EV charger installation requests retrieved successfully!',
        data,
      });
    },
  ),

  getMyAllEVChargerInstallations: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await EVChargerInstallationService.getMyAllEVChargerInstallationsFromDB(
          req.user._id.toString(),
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message:
          'Your EV charger installation requests retrieved successfully!',
        data,
      });
    },
  ),

  getSingleEVChargerInstallation: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await EVChargerInstallationService.getSingleEVChargerInstallationFromDB(
          req.user._id.toString(),
          req.params.id as string,
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'EV charger installation request retrieved successfully!',
        data,
      });
    },
  ),

  updateSingleEVChargerInstallation: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await EVChargerInstallationService.updateSingleEVChargerInstallationIntoDB(
          req.user._id.toString(),
          req.params.id as string,
          req.body as Partial<IEVChargerInstallation>,
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'EV charger installation request updated successfully!',
        data,
      });
    },
  ),
};
