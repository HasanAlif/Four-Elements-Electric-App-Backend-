import { Router } from 'express';
import { cronAuth } from '../../middlewares';
import { MaintenanceAlertsController } from './maintenanceAlerts.controller';

const router = Router();

router
  .route('/maintenance-reminders')
  .get(cronAuth, MaintenanceAlertsController.runMaintenanceReminderScan)
  .post(cronAuth, MaintenanceAlertsController.runMaintenanceReminderScan);

export const MaintenanceCronRoutes = router;
