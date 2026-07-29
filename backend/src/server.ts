import { Server } from 'http';
import mongoose from 'mongoose';

import { app } from './app.js';
import { connectDB } from './config/database.js';
import { env } from './config/env.js';

let isShuttingDown = false;
let server: Server | null = null;

const shutdown = (signal: string) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down server...`);

  const timeoutId = setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);

  const closeDatabase = async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB disconnected');

      clearTimeout(timeoutId);
      process.exit(0);
    } catch (error) {
      console.error('Error during database disconnection:', error);

      clearTimeout(timeoutId);
      process.exit(1);
    }
  };

  if (server) {
    server.close((error) => {
      if (error) {
        console.error('Error closing HTTP server:', error);
      } else {
        console.log('HTTP server closed.');
      }

      closeDatabase();
    });
  } else {
    closeDatabase();
  }
};

// To Register shutdown handlers before database startup
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// To Start application
try {
  await connectDB();

  server = app.listen(env.port, () => {
    console.log(`Shine Notes API running at http://localhost:${env.port}`);
  });
} catch (error) {
  console.error('Server failed to start:', error);
  process.exit(1);
}
