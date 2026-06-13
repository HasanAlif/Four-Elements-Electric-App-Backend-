export const CONTACT_METHODS = {
  CALL: 'Call',
  TEXT: 'Text',
  EMAIL: 'Email',
} as const;

export type TContactMethod =
  (typeof CONTACT_METHODS)[keyof typeof CONTACT_METHODS];

export const PROPERTY_TYPES = [
  'House',
  'Condo',
  'Apartment',
  'Commercial',
] as const;
export type TPropertyType = (typeof PROPERTY_TYPES)[number];

export const OWNERSHIP_STATUSES = [
  'Owner',
  'Tenant',
  'Property Manager',
  'Other',
] as const;
export type TOwnershipStatus = (typeof OWNERSHIP_STATUSES)[number];

export const TIMELINE_URGENCIES = [
  'As soon as possible',
  'This week',
  'This month',
  'Flexible',
] as const;
export type TTimelineUrgency = (typeof TIMELINE_URGENCIES)[number];

export const Service_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  QUOTED: 'quoted',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TServiceStatus =
  (typeof Service_STATUSES)[keyof typeof Service_STATUSES];

export const DEFAULT_REQUEST_STATUS = Service_STATUSES.SUBMITTED;
