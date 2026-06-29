export const MAINTENANCE_CADENCES = {
  YEARLY: 'yearly',
  MONTHLY: 'monthly',
  SEASONAL: 'seasonal',
} as const;

export type TMaintenanceCadence =
  (typeof MAINTENANCE_CADENCES)[keyof typeof MAINTENANCE_CADENCES];

type TMaintenanceAlertConfig = {
  cadence: TMaintenanceCadence;
  intervalMonths: number;
  title: string;
  message: string;
};

export const MAINTENANCE_ALERTS = {
  smokeDetectorBatteries: {
    cadence: MAINTENANCE_CADENCES.YEARLY,
    intervalMonths: 12,
    title: 'Time to test your smoke detector batteries',
    message:
      "It's your yearly reminder to test your smoke detectors and replace the batteries if needed. Stay safe!",
  },
  carbonMonoxideDetector: {
    cadence: MAINTENANCE_CADENCES.YEARLY,
    intervalMonths: 12,
    title: 'Yearly carbon monoxide detector check',
    message:
      'Test your carbon monoxide detectors and replace the batteries if needed — a quick yearly check keeps your home safe.',
  },
  testGfciOutlets: {
    cadence: MAINTENANCE_CADENCES.MONTHLY,
    intervalMonths: 1,
    title: 'Monthly GFCI outlet check',
    message:
      'Press the TEST button on your GFCI outlets this month to make sure they trip correctly.',
  },
  septicSystemAlarm: {
    cadence: MAINTENANCE_CADENCES.MONTHLY,
    intervalMonths: 1,
    title: 'Monthly septic alarm check',
    message:
      'Give your septic system alarm a quick monthly test to confirm it sounds and warns you in time.',
  },
  testAfciBreakers: {
    cadence: MAINTENANCE_CADENCES.MONTHLY,
    intervalMonths: 1,
    title: 'Monthly AFCI breaker test',
    message:
      'Trip and reset your AFCI breakers this month to confirm this fire-safety protection is still working.',
  },
  clearDryerVent: {
    cadence: MAINTENANCE_CADENCES.SEASONAL,
    intervalMonths: 3,
    title: 'Seasonal dryer-vent cleaning',
    message:
      'Time to clear out your dryer vent — removing lint buildup helps prevent fire hazards.',
  },
  inspectElectricalCords: {
    cadence: MAINTENANCE_CADENCES.SEASONAL,
    intervalMonths: 3,
    title: 'Seasonal electrical-cord inspection',
    message:
      'Walk through your home and inspect electrical cords for fraying or damage — replace any that look worn.',
  },
} as const satisfies Record<string, TMaintenanceAlertConfig>;

export type MaintenanceFieldKey = keyof typeof MAINTENANCE_ALERTS;

export const MAINTENANCE_FIELD_KEYS = Object.keys(
  MAINTENANCE_ALERTS,
) as MaintenanceFieldKey[];

export const addMonthsUTC = (from: Date, months: number): Date => {
  const result = new Date(from.getTime());
  const day = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDayOfTargetMonth));

  return result;
};
