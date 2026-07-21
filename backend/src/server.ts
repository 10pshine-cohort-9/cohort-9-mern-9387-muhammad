import mongoose from 'mongoose';
import { app } from './app.js';
import { connectDB } from './config/database.js';
import { env } from './config/env.js';

await connectDB();

const server = app.listen(env.port, () => {
  console.log(`Shine Notes API running at http://localhost:${env.port}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down server...`);

  server.close(async () => {
    console.log('HTTP server closed.');

    try {
      await mongoose.connection.close();
      console.log('MongoDB disconnected');

      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown', error);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));