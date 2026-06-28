import type { MaintenanceFieldKey } from './maintenanceAlerts.constant';

// Toggle request body: any subset of the 7 fieldKeys -> desired boolean.
export type TToggleMaintenanceAlertsPayload = Partial<
  Record<MaintenanceFieldKey, boolean>
>;

// Per-task state returned by the read/toggle endpoints (frontend renders the toggles).
export type TMaintenanceAlertState = {
  enabled: boolean;
  nextDueAt: Date | null;
};

export type TMaintenanceAlertStates = Record<
  MaintenanceFieldKey,
  TMaintenanceAlertState
>;
