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

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

let server: Server | null = null;

async function connectToDatabase() {
  try {
    await mongoose.connect(config.db_url as string);
    console.log(colors.green('✅ Database connected successfully!  🛢').bold);
  } catch (err) {
    console.error(colors.red('Failed to connect to database:'), err);
    process.exit(1);
  }
}
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

async function main() {
  try {
    await connectToDatabase();
    await seedSuperAdmin();

    try {
      initFirebase();
    } catch (err) {
      console.error(colors.red('Failed to initialize Firebase (FCM):'), err);
    }

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

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', error => {
      console.error(colors.red('😈 Uncaught Exception:'), error);
      gracefulShutdown('uncaughtException');
    });

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
