import httpStatus from 'http-status';
import UserModel from '../User/user.model';
import { AppError } from '../../utils';
import { NotificationService } from '../Notification/Notification.service';
import {
  MAINTENANCE_ALERTS,
  MAINTENANCE_FIELD_KEYS,
  addMonthsUTC,
} from './maintenanceAlerts.constant';
import {
  TMaintenanceAlertStates,
  TToggleMaintenanceAlertsPayload,
} from './maintenanceAlerts.interface';
import { TMaintenanceAlerts } from '../User/user.interface';

const serializeStates = (
  alerts?: Partial<TMaintenanceAlerts>,
): TMaintenanceAlertStates =>
  MAINTENANCE_FIELD_KEYS.reduce((acc, key) => {
    const alert = alerts?.[key];
    acc[key] = {
      enabled: alert?.enabled ?? false,
      nextDueAt: alert?.nextDueAt ?? null,
    };
    return acc;
  }, {} as TMaintenanceAlertStates);

const getMyMaintenanceAlertsFromDB = async (
  userId: string,
): Promise<TMaintenanceAlertStates> => {
  const user = await UserModel.findById(userId).select('maintenanceAlerts');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  return serializeStates(user.maintenanceAlerts);
};

const toggleMaintenanceAlertsIntoDB = async (
  userId: string,
  payload: TToggleMaintenanceAlertsPayload,
): Promise<TMaintenanceAlertStates> => {
  const user = await UserModel.findById(userId).select('maintenanceAlerts');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const now = new Date();
  const update: Record<string, unknown> = {};

  for (const key of MAINTENANCE_FIELD_KEYS) {
    const desired = payload[key];
    if (desired === undefined) continue;

    const current = user.maintenanceAlerts?.[key];

    if (desired === true) {
      if (!current?.enabled) {
        update[`maintenanceAlerts.${key}.enabled`] = true;
        update[`maintenanceAlerts.${key}.enabledAt`] = now;
        update[`maintenanceAlerts.${key}.nextDueAt`] = addMonthsUTC(
          now,
          MAINTENANCE_ALERTS[key].intervalMonths,
        );
        update[`maintenanceAlerts.${key}.lastSentAt`] = null;
      }
    } else {
      update[`maintenanceAlerts.${key}.enabled`] = false;
      update[`maintenanceAlerts.${key}.nextDueAt`] = null;
    }
  }

  if (Object.keys(update).length === 0) {
    return serializeStates(user.maintenanceAlerts);
  }

  await UserModel.updateOne({ _id: userId }, { $set: update });

  const fresh = await UserModel.findById(userId).select('maintenanceAlerts');
  return serializeStates(fresh?.maintenanceAlerts);
};

const runMaintenanceReminderScan = async (): Promise<{
  scanned: number;
  sent: number;
  failures: number;
}> => {
  const now = new Date();
  let scanned = 0;
  let sent = 0;
  let failures = 0;

  try {
    const cursor = UserModel.find({
      $or: MAINTENANCE_FIELD_KEYS.map(key => ({
        [`maintenanceAlerts.${key}.enabled`]: true,
        [`maintenanceAlerts.${key}.nextDueAt`]: { $lte: now },
      })),
    })
      .select('maintenanceAlerts')
      .cursor();

    for await (const user of cursor) {
      scanned++;
      try {
        for (const key of MAINTENANCE_FIELD_KEYS) {
          const alert = user.maintenanceAlerts?.[key];
          if (!alert?.enabled || !alert.nextDueAt || alert.nextDueAt > now) {
            continue;
          }

          const { title, message, intervalMonths } = MAINTENANCE_ALERTS[key];

          const claimed = await UserModel.findOneAndUpdate(
            {
              _id: user._id,
              [`maintenanceAlerts.${key}.enabled`]: true,
              [`maintenanceAlerts.${key}.nextDueAt`]: { $lte: now },
            },
            {
              $set: {
                [`maintenanceAlerts.${key}.lastSentAt`]: now,
                [`maintenanceAlerts.${key}.nextDueAt`]: addMonthsUTC(
                  now,
                  intervalMonths,
                ),
              },
            },
          );

          if (!claimed) continue;

          await NotificationService.notifyMaintenanceReminder({
            recipientId: user._id,
            fieldKey: key,
            title,
            message,
          });
          sent++;
        }
      } catch (err) {
        failures++;
        console.error(`[maintenance] user ${String(user._id)} failed:`, err);
      }
    }
  } catch (err) {
    console.error('[maintenance] scan failed:', err);
  }

  console.log(
    `[maintenance] scan done: scanned=${scanned} sent=${sent} failures=${failures}`,
  );
  return { scanned, sent, failures };
};

export const MaintenanceAlertsService = {
  getMyMaintenanceAlertsFromDB,
  toggleMaintenanceAlertsIntoDB,
  runMaintenanceReminderScan,
};
