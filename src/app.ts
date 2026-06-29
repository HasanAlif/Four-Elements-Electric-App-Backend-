import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './app/routes';
import { globalErrorHandler, notFoundHandler } from './app/utils';
import { globalLimiter, sanitizeMongo } from './app/middlewares';
import os from 'os';
import config from './app/config';

const app: Application = express();

// behind a single reverse proxy (nginx / load balancer) — needed for correct client IP
// in rate limiting
app.set('trust proxy', 1);

// app.disable('etag');

// security headers (set early, before routes)
app.use(helmet());

// CORS configuration
app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:5173',
      'http://10.10.20.30:3000',
      'http://10.10.20.30:3001',
      'http://10.10.20.30:3002',
      'http://10.10.20.30:3003',
      'http://10.10.20.30:5173',
      'http://10.10.20.30:5173',
      'https://ashely-dashboard.vercel.app',
    ],
  }),
);

//parser
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// strip MongoDB operator/dotted keys from body/params/query (NoSQL-injection guard)
app.use(sanitizeMongo);

// for static files
// app.use('/public', express.static('public'));

// broad rate limit for the whole API (auth/OTP routes add a stricter limiter)
app.use(globalLimiter);

// All main routes
app.use('/api/v1', routes);

// Testing
// app.get('/', (req: Request, res: Response) => {
//   res.send({ message: 'Server is running like a Rabit!' });
// });

app.get('/', (req: Request, res: Response) => {
  const currentDateTime = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();
  res.send({
    success: true,
    message: `Welcome to ${config.preffered_website_name} Server`,
    version: '1.0.0',
    clientDetails: {
      ipAddress: clientIp,
      accessedAt: currentDateTime,
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
        (serverUptime / 60) % 60,
      )} minutes`,
    },
  });
});

// global error handler
app.use(globalErrorHandler);

// all not found handler
app.use(notFoundHandler);

export default app;
