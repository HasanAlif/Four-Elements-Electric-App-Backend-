import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './app/routes';
import { globalErrorHandler, notFoundHandler } from './app/utils';
import { globalLimiter, sanitizeMongo } from './app/middlewares';
import { LANDING_PAGE_TEMPLATE } from './app/utils/Template';

const app: Application = express();

app.set('trust proxy', 1);

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
      'https://dashboard.fourelementselectrical.com',
    ],
  }),
);

//parser
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(sanitizeMongo);

app.use(globalLimiter);

app.use('/api/v1', routes);

app.get('/', (req: Request, res: Response) => {
  res.send(LANDING_PAGE_TEMPLATE);
});

app.use(globalErrorHandler);

app.use(notFoundHandler);

export default app;
