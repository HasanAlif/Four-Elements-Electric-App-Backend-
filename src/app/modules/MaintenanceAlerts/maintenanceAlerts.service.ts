/* eslint-disable no-console */
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

// Serialize the user's current per-task state for all 7 keys. Robust to users created
// before a key existed (missing -> disabled/null).
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

// GET — current toggle states for the owner (renders the settings screen).
const getMyMaintenanceAlertsFromDB = async (
  userId: string,
): Promise<TMaintenanceAlertStates> => {
  const user = await UserModel.findById(userId).select('maintenanceAlerts');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  return serializeStates(user.maintenanceAlerts);
};

// PATCH — toggle any subset of tasks. Strictly owner-scoped.
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
    if (desired === undefined) continue; // key not in body — leave untouched

    const current = user.maintenanceAlerts?.[key];

    if (desired === true) {
      // false->true (enabling): start the cycle. true->true is a NO-OP, so re-sending
      // `true` never resets or delays the already-running reminder timer.
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
      // ->false (disabling): stop tracking and clear nextDueAt so the cron skips it.
      update[`maintenanceAlerts.${key}.enabled`] = false;
      update[`maintenanceAlerts.${key}.nextDueAt`] = null;
    }
  }

  if (Object.keys(update).length === 0) {
    return serializeStates(user.maintenanceAlerts); // nothing changed (all no-ops)
  }

  await UserModel.updateOne({ _id: userId }, { $set: update });

  const fresh = await UserModel.findById(userId).select('maintenanceAlerts');
  return serializeStates(fresh?.maintenanceAlerts);
};

// --- Daily reminder scan ---

// Pure, directly callable (testable without a scheduler). Finds users with at least
// one enabled+due task, sends each due reminder through the EXISTING NotificationService
// pipeline, then advances that task to its next cadence so it recurs without spamming.
// Never throws — safe to wire to any trigger (HTTP cron endpoint or node-cron).
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
    // Indexed eligibility query — only users with >=1 enabled & due task. We never load
    // every user and filter in memory.
    const users = await UserModel.find({
      $or: MAINTENANCE_FIELD_KEYS.map(key => ({
        [`maintenanceAlerts.${key}.enabled`]: true,
        [`maintenanceAlerts.${key}.nextDueAt`]: { $lte: now },
      })),
    }).select('maintenanceAlerts');

    scanned = users.length;

    for (const user of users) {
      // Isolate each user — one user's failure must not abort the whole scan.
      try {
        for (const key of MAINTENANCE_FIELD_KEYS) {
          const alert = user.maintenanceAlerts?.[key];
          if (!alert?.enabled || !alert.nextDueAt || alert.nextDueAt > now) {
            continue;
          }

          const { title, message, intervalMonths } = MAINTENANCE_ALERTS[key];

          // Reuse the existing pipeline (persist -> FCM -> prune dead -> isolated).
          await NotificationService.notifyMaintenanceReminder({
            recipientId: user._id,
            fieldKey: key,
            title,
            message,
          });

          // ADVANCE on send — anchored to `now`, NOT the old due date, so an overdue
          // task fires ONCE then moves forward (no catch-up flood). This advancement is
          // what stops daily re-spam: the task isn't due again until its next cadence.
          // (Multi-instance hardening: make this a claim-first atomic findOneAndUpdate
          // guarded on the due condition; the recommended single daily Vercel-Cron call
          // already guarantees a single invocation.)
          await UserModel.updateOne(
            { _id: user._id },
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
          sent++;
        }
      } catch (err) {
        failures++;
        console.error(`[maintenance] user ${String(user._id)} failed:`, err);
      }
    }
  } catch (err) {
    // Top-level guard: the job must never crash the process.
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
