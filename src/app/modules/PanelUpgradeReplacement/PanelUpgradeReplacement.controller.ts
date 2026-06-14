import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { PanelUpgradeReplacementService } from './PanelUpgradeReplacement.service';
import { IPanelUpgradeReplacement } from './PanelUpgradeReplacement.interface';

export const PanelUpgradeReplacementController = {
  createPanelUpgradeReplacement: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await PanelUpgradeReplacementService.createPanelUpgradeReplacementIntoDB(
          req.user,
          req.body,
          req.files,
        );

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Panel request created successfully!',
        data,
      });
    },
  ),

  getAllPanelUpgradeReplacements: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await PanelUpgradeReplacementService.getAllPanelUpgradeReplacementsFromDB();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'All panel requests retrieved successfully!',
        data,
      });
    },
  ),

  getMyAllPanelUpgradeReplacements: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await PanelUpgradeReplacementService.getMyAllPanelUpgradeReplacementsFromDB(
          req.user._id.toString(),
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Your panel requests retrieved successfully!',
        data,
      });
    },
  ),

  getSinglePanelUpgradeReplacement: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await PanelUpgradeReplacementService.getSinglePanelUpgradeReplacementFromDB(
          req.user._id.toString(),
          req.params.id as string,
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Panel request retrieved successfully!',
        data,
      });
    },
  ),

  updateSinglePanelUpgradeReplacement: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await PanelUpgradeReplacementService.updateSinglePanelUpgradeReplacementIntoDB(
          req.user._id.toString(),
          req.params.id as string,
          req.body as Partial<IPanelUpgradeReplacement>,
          req.files,
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Panel request updated successfully!',
        data,
      });
    },
  ),

  deleteSinglePanelUpgradeReplacement: asyncHandler(
    async (req: Request, res: Response) => {
      const data =
        await PanelUpgradeReplacementService.deleteSinglePanelUpgradeReplacementFromDB(
          req.user._id.toString(),
          req.params.id as string,
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Panel request deleted successfully!',
        data,
      });
    },
  ),
};
