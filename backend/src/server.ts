import { app } from './app.js';
import { connectDB } from './config/database.js';
import { env } from './config/env.js';

await connectDB();
const server = app.listen(env.port, () => {
  console.log(`Shine Notes API running at http://localhost:${env.port}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down server...`);

  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
