import path from 'path';
import nodemailer from 'nodemailer';
import config from '../config';
import UserModel from '../modules/User/user.model';

type TDispatchInput = {
  serviceModel: string;
  serviceType: string;
  qId: string;
  status: string;
  createdBy: unknown;
  doc: Record<string, unknown>;
};

type TSubmitter = { name: string; email: string; phone: string };

type TDetailRow = { label: string; value: string };

type TPhotoAttachment = { filename: string; content: Buffer; cid: string };

type TPhotoResult = {
  attachments: TPhotoAttachment[];
  imgTags: string[];
};

const BLOCKLIST = new Set([
  '_id',
  '__v',
  'createdBy',
  'statusTimeline',
  'createdAt',
  'updatedAt',
  'qId',
  'status',
]);

const escapeHtml = (value: string): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isCloudinaryUrl = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^https?:\/\/res\.cloudinary\.com\//i.test(value);

const partitionDoc = (
  doc: Record<string, unknown>,
): { imageFieldKeys: Set<string>; photoUrls: string[] } => {
  const imageFieldKeys = new Set<string>();
  const photoUrls: string[] = [];

  for (const [key, value] of Object.entries(doc)) {
    if (isCloudinaryUrl(value)) {
      imageFieldKeys.add(key);
      photoUrls.push(value);
    } else if (Array.isArray(value) && value.some(isCloudinaryUrl)) {
      imageFieldKeys.add(key);
      for (const item of value) {
        if (isCloudinaryUrl(item)) photoUrls.push(item);
      }
    }
  }

  return { imageFieldKeys, photoUrls };
};

const toTitleCase = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, char => char.toUpperCase())
    .trim();

const isEmptyValue = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

const formatValue = (value: unknown): string => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleString();
  return String(value);
};

const buildDetailRows = (
  doc: Record<string, unknown>,
  imageFieldKeys: Set<string>,
): TDetailRow[] => {
  const rows: TDetailRow[] = [];

  for (const [key, value] of Object.entries(doc)) {
    if (BLOCKLIST.has(key) || imageFieldKeys.has(key)) continue;
    if (isEmptyValue(value)) continue;

    rows.push({
      label: toTitleCase(key),
      value: escapeHtml(formatValue(value)),
    });
  }

  return rows;
};

const resolveSubmitter = async (createdBy: unknown): Promise<TSubmitter> => {
  try {
    const user = await UserModel.findById(createdBy)
      .select('name email phone')
      .lean();

    if (!user) return { name: 'Unknown', email: 'Unknown', phone: 'Unknown' };

    return {
      name: user.name || 'Unknown',
      email: user.email || 'Unknown',
      phone: user.phone || 'Unknown',
    };
  } catch (err) {
    console.error('[admin-quote-alert] failed to resolve submitter:', err);
    return { name: 'Unknown', email: 'Unknown', phone: 'Unknown' };
  }
};

const fetchPhotoBuffer = async (url: string): Promise<Buffer | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
};

const getExtensionFromUrl = (url: string): string => {
  try {
    const match = /\.([a-zA-Z0-9]+)$/.exec(new URL(url).pathname);
    return match ? match[1] : 'jpg';
  } catch {
    return 'jpg';
  }
};

const PHOTO_IMG_STYLE =
  'max-width:260px;max-height:260px;border-radius:8px;margin:6px;border:1px solid #eee;';

const buildBudgetedPhotoAttachments = async (
  photoUrls: string[],
  maxPhotos: number,
  maxBytes: number,
): Promise<TPhotoResult> => {
  const attachments: TPhotoAttachment[] = [];
  const imgTags: string[] = [];
  let usedBytes = 0;

  for (let i = 0; i < photoUrls.length; i++) {
    const url = photoUrls[i];
    const withinCaps = attachments.length < maxPhotos && usedBytes < maxBytes;
    const buffer = withinCaps ? await fetchPhotoBuffer(url) : null;

    if (buffer && usedBytes + buffer.length <= maxBytes) {
      const cid = `quote-photo-${i}`;
      const filename = `photo-${i + 1}.${getExtensionFromUrl(url)}`;
      attachments.push({ filename, content: buffer, cid });
      imgTags.push(
        `<img src="cid:${cid}" alt="Quote photo ${i + 1}" style="${PHOTO_IMG_STYLE}" />`,
      );
      usedBytes += buffer.length;
      continue;
    }

    imgTags.push(
      `<img src="${escapeHtml(url)}" alt="Quote photo ${i + 1}" style="${PHOTO_IMG_STYLE}" />`,
    );
  }

  return { attachments, imgTags };
};

const buildQuoteAlertEmail = (input: {
  serviceType: string;
  qId: string;
  status: string;
  submitter: TSubmitter;
  detailRows: TDetailRow[];
  imgTags: string[];
  logoCid: string;
}): { subject: string; html: string } => {
  const { serviceType, qId, status, submitter, detailRows, imgTags, logoCid } =
    input;
  const brand = config.preffered_website_name || 'Four Elements Electric App';
  const accent = config.emailColor || '#01a1ff';

  const subject = `New Quote: ${serviceType} (#${qId}) — ${submitter.name}`;

  const detailRowsHtml = detailRows
    .map(
      row => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#888888;font-size:13px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;width:200px;vertical-align:top;">${row.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#333333;font-size:14px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;vertical-align:top;">${row.value}</td>
        </tr>`,
    )
    .join('');

  const galleryHtml = imgTags.length
    ? `
          <tr>
            <td style="padding:20px 30px 8px;">
              <p style="margin:0 0 10px;font-size:14px;font-weight:bold;color:#333333;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">Submitted Photos</p>
              <div>${imgTags.join('')}</div>
            </td>
          </tr>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f9fc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fc;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:15px;box-shadow:0 10px 20px rgba(0,0,0,0.1);overflow:hidden;">
          <tr>
            <td style="padding:30px;text-align:center;border-bottom:3px solid #f0f0f0;">
              <img src="cid:${logoCid}" alt="Logo" style="max-width:180px;margin-bottom:20px;" />
              <h2 style="color:${accent};font-size:24px;margin:0 0 8px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">New Quote Submitted</h2>
              <p style="color:#888888;font-size:14px;margin:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">${escapeHtml(brand)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 30px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8E1;border-left:6px solid ${accent};border-radius:8px;">
                <tr>
                  <td style="padding:14px 18px;font-size:14px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#333333;">
                    <strong>${escapeHtml(serviceType)}</strong> &middot; Q-ID: <strong>${escapeHtml(qId)}</strong> &middot; Status: <strong>${escapeHtml(status)}</strong><br/>
                    Submitted by: <strong>${escapeHtml(submitter.name)}</strong> (${escapeHtml(submitter.email)}, ${escapeHtml(submitter.phone)})
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${detailRowsHtml}
              </table>
            </td>
          </tr>${galleryHtml}
          <tr>
            <td style="padding:24px 30px 30px;border-top:2px solid #f0f0f0;text-align:center;">
              <p style="font-size:12px;color:#888888;margin:16px 0 0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">This is an automated alert from ${escapeHtml(brand)}. Do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
};

export const dispatchQuoteAdminAlertEmail = async (
  input: TDispatchInput,
): Promise<void> => {
  try {
    if (config.adminAlerts.quote_alert_enabled === 'false') return;

    const recipients = (config.adminAlerts.quote_alert_emails ?? '')
      .split(',')
      .map(email => email.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      console.warn(
        '[admin-quote-alert] no ADMIN_QUOTE_ALERT_EMAILS configured — skipping.',
      );
      return;
    }

    const { imageFieldKeys, photoUrls } = partitionDoc(input.doc);

    const [submitter, photoResult] = await Promise.all([
      resolveSubmitter(input.createdBy),
      buildBudgetedPhotoAttachments(
        photoUrls,
        Number(config.adminAlerts.quote_alert_max_photos),
        Number(config.adminAlerts.quote_alert_max_bytes),
      ),
    ]);

    const detailRows = buildDetailRows(input.doc, imageFieldKeys);
    const logoCid = 'ashley_admin_alert_logo';

    const { subject, html } = buildQuoteAlertEmail({
      serviceType: input.serviceType,
      qId: input.qId,
      status: input.status,
      submitter,
      detailRows,
      imgTags: photoResult.imgTags,
      logoCid,
    });

    const transporter = nodemailer.createTransport({
      host: config.mailtrap.host,
      port: Number(config.mailtrap.port),
      secure: Number(config.mailtrap.port) === 465,
      auth: {
        user: config.mailtrap.user,
        pass: config.mailtrap.token,
      },
    });

    const info = await transporter.sendMail({
      from: `${config.preffered_website_name || 'Four Elements Electric App'} <${config.mailtrap.sender_email}>`,
      to: recipients.join(', '),
      subject,
      html,
      attachments: [
        ...photoResult.attachments,
        {
          filename: 'logo.png',
          path:
            config.NODE_ENV === 'production'
              ? 'https://res.cloudinary.com/dweesppci/image/upload/v1780984105/1780984105497-KHALED-SIDDIQUE.png'
              : path.join(__dirname, 'assets', 'logo.png'),
          cid: logoCid,
        },
      ],
    });

    console.log(
      `[admin-quote-alert] sent for ${input.serviceModel} qId=${input.qId}: photos attached=${photoResult.attachments.length} degraded=${photoResult.imgTags.length - photoResult.attachments.length} accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)} response=${info.response}`,
    );
  } catch (err) {
    console.error('[admin-quote-alert] failed to send admin alert email:', err);
  }
};
