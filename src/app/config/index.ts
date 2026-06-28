import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// const envFile = `.env.${process.env.NODE_ENV || '.env'}`;

// dotenv.config({
//     path: path.join(process.cwd(), envFile),
// });

export default {
  NODE_ENV: process.env.NODE_ENV,
  contact_us_email: process.env.CONTACT_US_EMAIL,

  port: process.env.PORT,

  db_url: process.env.DB_URL,

  preffered_website_name: process.env.PREFFERED_WEBSITE_NAME,
  cloudinary_folder_name: process.env.CLOUDINARY_FOLDER_NAME,
  emailColor: process.env.EMAIL_COLOR,
  // buttonColor: process.env.BUTTON_COLOR,

  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  otp_expiry_minutes: process.env.OTP_EXPIRY_MINUTES,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  google_client_ids: process.env.GOOGLE_CLIENT_IDS,
  apple_client_ids: process.env.APPLE_CLIENT_IDS,
  // stripe_connect_return_url: process.env.STRIPE_CONNECT_RETURN_URL,
  // stripe_connect_refresh_url: process.env.STRIPE_CONNECT_REFRESH_URL,

  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    otp_secret: process.env.JWT_OTP_SECRET,
    otp_secret_expires_in: process.env.JWT_OTP_SECRET_EXPIRES_IN,
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  nodemailer: {
    email: process.env.EMAIL_FOR_NODEMAILER,
    password: process.env.PASSWORD_FOR_NODEMAILER,
  },

  firebase: {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    // arrives with literal "\n" sequences from .env; normalized at init time
    private_key: process.env.FIREBASE_PRIVATE_KEY,
  },

  maintenance: {
    // shared secret for the protected cron endpoint (x-cron-secret or Bearer token)
    cron_secret: process.env.MAINTENANCE_CRON_SECRET,
    // UTC hour (0-23) the daily reminder scan runs; defaults to 14 if unset/invalid
    cron_hour: process.env.MAINTENANCE_CRON_HOUR,
    // 'true' enables the in-process node-cron (PM2/VM); off by default on serverless
    enable_in_process_cron: process.env.ENABLE_MAINTENANCE_CRON,
  },

  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME,
    // address: process.env.SUPER_ADMIN_ADDRESS,
    phone: process.env.SUPER_ADMIN_PHONE,
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
    otp: process.env.SUPER_ADMIN_OTP,
    otpExpiry: process.env.SUPER_ADMIN_OTP_EXPIRY,
  },

  ssl: {
    // store_name: process.env.STORE_NAME,
    // payment_api: process.env.PAYMENT_API,
    // validation_api: process.env.VALIDATION_API,
    store_id: process.env.STORE_ID,
    store_password: process.env.STORE_PASSWORD,
    validation_url: process.env.VALIDATION_URL,
    // success_url: process.env.SUCCESS_URL,
    fail_url: process.env.FAIL_URL,
    cancel_url: process.env.CANCEL_URL,
  },

  status: {
    veriff_api_key: process.env.VERIFF_API_KEY,
    veriff_base_url: process.env.VERIFF_BASE_URL,
    veriff_shared_secret: process.env.VERIFF_SHARED_SECRET,
    veriff_callback_url: process.env.VERIFF_CALLBACK_URL,
    default_background_provider: process.env.DEFAULT_BACKGROUND_PROVIDER,
  },
};
