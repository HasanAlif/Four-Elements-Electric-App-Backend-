import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { MaintenanceAlertsService } from './maintenanceAlerts.service';

const getMyMaintenanceAlerts = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await MaintenanceAlertsService.getMyMaintenanceAlertsFromDB(
      req.user._id.toString(),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Maintenance alerts retrieved successfully!',
      data,
    });
  },
);

const toggleMaintenanceAlerts = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await MaintenanceAlertsService.toggleMaintenanceAlertsIntoDB(
      req.user._id.toString(),
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Maintenance alerts updated successfully!',
      data,
    });
  },
);

// Internal cron trigger (protected by cronAuth). Runs the scan and returns the summary.
// Same fn the in-process node-cron path invokes directly.
const runMaintenanceReminderScan = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await MaintenanceAlertsService.runMaintenanceReminderScan();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Maintenance reminder scan completed!',
      data,
    });
  },
);

export const MaintenanceAlertsController = {
  getMyMaintenanceAlerts,
  toggleMaintenanceAlerts,
  runMaintenanceReminderScan,
};
