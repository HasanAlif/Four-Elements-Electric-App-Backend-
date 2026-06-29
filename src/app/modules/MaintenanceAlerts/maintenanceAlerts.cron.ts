import cron from 'node-cron';
import config from '../../config';
import { MaintenanceAlertsService } from './maintenanceAlerts.service';

export const startMaintenanceReminderCron = (): void => {
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
