import { Service_STATUSES, DEFAULT_REQUEST_STATUS } from '../constants';

const FORBIDDEN_CREATE_FIELDS = ['internalNote', 'qId', 'createdBy'] as const;

const ALLOWED_CREATE_STATUSES: string[] = [
  Service_STATUSES.DRAFT,
  DEFAULT_REQUEST_STATUS, // 'pending'
];

export const sanitizeServiceCreatePayload = <T extends Record<string, any>>(
  payload: T,
): T => {
  const clean: Record<string, any> = { ...payload };

  for (const field of FORBIDDEN_CREATE_FIELDS) {
    delete clean[field];
  }

  if (
    clean.status !== undefined &&
    !ALLOWED_CREATE_STATUSES.includes(clean.status)
  ) {
    clean.status = DEFAULT_REQUEST_STATUS;
  }

  return clean as T;
};
