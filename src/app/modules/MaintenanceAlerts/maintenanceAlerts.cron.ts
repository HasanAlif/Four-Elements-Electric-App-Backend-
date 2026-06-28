/* eslint-disable no-console */
import cron from 'node-cron';
import config from '../../config';
import { MaintenanceAlertsService } from './maintenanceAlerts.service';

// Long-lived (PM2/VM) trigger. Disabled by default — only runs when
// ENABLE_MAINTENANCE_CRON=true. On serverless (Vercel) the protected HTTP endpoint
// driven by Vercel Cron is used instead, so this stays off there.
export const startMaintenanceReminderCron = (): void => {
  if (config.maintenance.enable_in_process_cron !== 'true') return;

  // PM2 cluster guard: run on exactly one instance to avoid duplicate sends.
  const instance = process.env.NODE_APP_INSTANCE;
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

  console.log(`Maintenance reminder cron scheduled daily at ${safeHour}:00 UTC.`);
};
