/* eslint-disable no-console */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import {
  getMessaging,
  BatchResponse,
  SendResponse,
} from 'firebase-admin/messaging';
import config from '../config';

// Firebase Cloud Messaging transport. Initialized once at boot (initFirebase).
// If creds are missing the module degrades to a no-op so the API still runs.

let fcmEnabled = false;

export type TPushPayload = {
  title: string;
  body: string;
};

// data values MUST all be strings (FCM requirement).
export type TPushData = Record<string, string>;

export type TPushResult = {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
};

// FCM error codes that mean the token is dead and should be pruned.
const DEAD_TOKEN_ERROR_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-argument',
  'messaging/invalid-registration-token',
]);

// Initialize the Admin SDK exactly once. Safe to call repeatedly (guards against
// the double-init throw). Missing creds → warn + stay disabled, never crash boot.
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
      // .env stores the key with literal "\n"; turn them into real newlines.
      privateKey: private_key.replace(/\\n/g, '\n'),
    }),
  });

  fcmEnabled = true;
  console.log('FCM initialized.');
};

export const isFcmEnabled = (): boolean => fcmEnabled;

// Send one notification to many device tokens. No-op (returns zeros) when FCM is
// disabled or there are no tokens. Returns counts + the tokens that are dead and
// should be removed from the user. Never throws on a partial/total send failure.
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
