import { initializeApp, getApps, cert } from 'firebase-admin/app';
import {
  getMessaging,
  BatchResponse,
  SendResponse,
} from 'firebase-admin/messaging';
import config from '../config';

let fcmEnabled = false;

export type TPushPayload = {
  title: string;
  body: string;
};

export type TPushData = Record<string, string>;

export type TPushResult = {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
};

const DEAD_TOKEN_ERROR_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-argument',
  'messaging/invalid-registration-token',
]);

export const initFirebase = (): void => {
  if (getApps().length) {
    fcmEnabled = true;
    return;
  }

  const { project_id, client_email, private_key } = config.firebase;

  if (!project_id || !client_email || !private_key) {
    console.warn(
      'FCM disabled: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not configured. Push notifications will be skipped.',
    );
    fcmEnabled = false;
    return;
  }

  initializeApp({
    credential: cert({
      projectId: project_id,
      clientEmail: client_email,
      privateKey: private_key.replace(/\\n/g, '\n'),
    }),
  });

  fcmEnabled = true;
  console.log('FCM initialized.');
};

export const sendPushToTokens = async (
  tokens: string[],
  notification: TPushPayload,
  data: TPushData,
): Promise<TPushResult> => {
  const empty: TPushResult = {
    successCount: 0,
    failureCount: 0,
    invalidTokens: [],
  };

  if (!fcmEnabled || tokens.length === 0) {
    return empty;
  }

  const response: BatchResponse = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title: notification.title, body: notification.body },
    data,
  });

  const invalidTokens: string[] = [];
  response.responses.forEach((res: SendResponse, index: number) => {
    if (!res.success) {
      const code = res.error?.code;
      if (code && DEAD_TOKEN_ERROR_CODES.has(code)) {
        invalidTokens.push(tokens[index]);
      }
    }
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    invalidTokens,
  };
};
