import { Service_STATUSES } from '../../constants';

type TContentInput = {
  serviceType?: string;
  qId?: string;
};

type TContent = { title: string; message: string };

const label = (serviceType?: string) => serviceType?.trim() || 'service';
const ref = (qId?: string) => (qId ? ` (#${qId})` : '');

const CATALOG: Record<string, (input: TContentInput) => TContent> = {
  submitted: ({ serviceType }) => ({
    title: 'Quote Submitted Successfully',
    message: `Your ${label(
      serviceType,
    )} quote has been received. We'll review and respond within 24 hours.`,
  }),

  [Service_STATUSES.PENDING]: ({ serviceType, qId }) => ({
    title: 'Quote Received',
    message: `Your ${label(serviceType)} quote${ref(
      qId,
    )} is in our queue. We'll review it shortly.`,
  }),

  [Service_STATUSES.IN_REVIEW]: ({ serviceType, qId }) => ({
    title: 'Your Quote Is Under Review',
    message: `Your ${label(serviceType)} quote${ref(
      qId,
    )} is now being reviewed by our team. We'll update you shortly.`,
  }),

  [Service_STATUSES.SEND]: ({ serviceType, qId }) => ({
    title: "We've Responded to Your Quote",
    message: `Good news — our team has reached out about your ${label(
      serviceType,
    )} quote${ref(qId)}. Please check your messages.`,
  }),

  [Service_STATUSES.CLOSED]: ({ serviceType, qId }) => ({
    title: 'Your Quote Is Now Closed',
    message: `Your ${label(serviceType)} request${ref(
      qId,
    )} has been closed. Thank you for choosing us — contact support if you need anything else.`,
  }),
};

const fallback = ({ serviceType, qId }: TContentInput): TContent => ({
  title: 'Quote Update',
  message: `There's an update on your ${label(serviceType)} quote${ref(qId)}.`,
});

export const buildNotificationContent = (
  eventOrStatus: string,
  input: TContentInput,
): TContent => {
  const builder = CATALOG[eventOrStatus];
  return builder ? builder(input) : fallback(input);
};
