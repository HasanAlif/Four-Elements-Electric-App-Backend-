import type { MaintenanceFieldKey } from './maintenanceAlerts.constant';

export type TToggleMaintenanceAlertsPayload = Partial<
  Record<MaintenanceFieldKey, boolean>
>;

export type TMaintenanceAlertState = {
  enabled: boolean;
  nextDueAt: Date | null;
};

export type TMaintenanceAlertStates = Record<
  MaintenanceFieldKey,
  TMaintenanceAlertState
>;
