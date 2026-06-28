/* eslint-disable no-console */
import cron from 'node-cron';
import config from '../../config';
import { MaintenanceAlertsService } from './maintenanceAlerts.service';

// In-process daily trigger for the long-lived Node server. Scheduled unconditionally
// at boot; the protected HTTP endpoint (maintenanceAlerts.routes.ts) remains available
// as a manual "run scan now" trigger for an external scheduler or admin.
export const startMaintenanceReminderCron = (): void => {
  // PM2 cluster guard: run on exactly one instance to avoid duplicate sends.
  const instance = config.maintenance.node_app_instance;
  if (instance && instance !== '0') return;

  const hour = Number(config.maintenance.cron_hour);
  const safeHour =
    Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : 14;

  cron.schedule(
    `0 ${safeHour} * * *`,
    () => {
      void MaintenanceAlertsService.runMaintenanceReminderScan();
    },
    { timezone: 'UTC', noOverlap: true },
  );

  console.log(
    `Maintenance reminder cron scheduled daily at ${safeHour}:00 UTC.`,
  );
};
