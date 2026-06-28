import { Router } from 'express';
import { cronAuth } from '../../middlewares';
import { MaintenanceAlertsController } from './maintenanceAlerts.controller';

const router = Router();

// Protected internal trigger for the daily maintenance reminder scan. Called by an
// external scheduler — Vercel Cron sends GET (+ Authorization: Bearer); generic cloud
// schedulers can POST (+ x-cron-secret). cronAuth accepts either form of the secret.
router
  .route('/maintenance-reminders')
  .get(cronAuth, MaintenanceAlertsController.runMaintenanceReminderScan)
  .post(cronAuth, MaintenanceAlertsController.runMaintenanceReminderScan);

export const MaintenanceCronRoutes = router;
