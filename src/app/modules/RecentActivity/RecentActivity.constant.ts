import { Service_STATUSES } from '../../constants';

export const QUOTE_RESURFACING_STATUSES: string[] = [
  Service_STATUSES.SEND,
  Service_STATUSES.CLOSED,
];

const QUOTE_ACTIVITY_VERBS: Record<string, string> = {
  [Service_STATUSES.PENDING]: 'Submitted',
  [Service_STATUSES.IN_REVIEW]: 'Submitted',
  [Service_STATUSES.SEND]: 'Sent',
  [Service_STATUSES.CLOSED]: 'Completed',
};

export const getQuoteActivityVerb = (status?: string | null): string =>
  (status && QUOTE_ACTIVITY_VERBS[status]) || 'Submitted';

export const resolveQuoteActivityAt = (
  status: string | undefined | null,
  createdAt: Date,
  statusChangedAt?: Date,
): Date => {
  const resurfaces = !!status && QUOTE_RESURFACING_STATUSES.includes(status);
  return resurfaces ? (statusChangedAt ?? new Date()) : createdAt;
};
