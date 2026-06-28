/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import seedSuperAdmin from './app/seed';
import colors from 'colors';
import { createServer } from 'http';
import { initFirebase } from './app/lib';
import { startMaintenanceReminderCron } from './app/modules/MaintenanceAlerts/maintenanceAlerts.cron';
import 'dotenv/config';

let server: Server | null = null;

// Database connection function
async function connectToDatabase() {
  try {
    await mongoose.connect(config.db_url as string);
    console.log(colors.green('✅ Database connected successfully!  🛢').bold);
  } catch (err) {
    console.error(colors.red('Failed to connect to database:'), err);
    process.exit(1);
  }
}

// Graceful shutdown function to close the server properly
function gracefulShutdown(signal: string) {
  console.log(colors.red(`Received ${signal}. Closing server... 🤷‍♂️ `));
  if (server) {
    server.close(() => {
      console.log(colors.red('Server closed gracefully! ✅'));
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// Application bootstrap function
async function main() {
  try {
    await connectToDatabase();
    // Seed function
    await seedSuperAdmin();

    // Initialize Firebase Admin (FCM). Non-fatal: logs a warning and no-ops pushes
    // if creds are missing, so the API still boots without Firebase configured.
    try {
      initFirebase();
    } catch (err) {
      console.error(colors.red('Failed to initialize Firebase (FCM):'), err);
    }

    // Schedule the daily maintenance reminder cron. No-op on serverless (Vercel) unless
    // ENABLE_MAINTENANCE_CRON=true — there the protected HTTP endpoint + Vercel Cron is
    // used instead.
    try {
      startMaintenanceReminderCron();
    } catch (err) {
      console.error(
        colors.red('Failed to start maintenance reminder cron:'),
        err,
      );
    }

    const httpServer = createServer(app);

    server = httpServer.listen(config.port, () => {
      console.log(
        colors.green(
          `🚀 ${config.preffered_website_name} server is running on port ${config.port}! ✨  ⚡`,
        ),
      );
    });

    // Listen for OS termination signals (Ctrl+C or server stop)
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handling uncaught exceptions
    process.on('uncaughtException', error => {
      console.error(colors.red('😈 Uncaught Exception:'), error);
      gracefulShutdown('uncaughtException');
    });

    // Handling unhandled promise rejections
    process.on('unhandledRejection', error => {
      console.error(colors.red('😈 Unhandled Rejection:'), error);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    console.error(colors.red('😈 Error during bootstrap:'), error);
    process.exit(1);
  }
}

main();
