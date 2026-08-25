import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import * as pinoHttpModule from 'pino-http';

import { env } from './config/env.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
  }),
);
app.use(pinoHttpModule.pinoHttp());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shine Notes API is running',
    environment: env.nodeEnv,
  });
});
