import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    //Connection Call
    await mongoose.connect(env.mongodbUri);
    console.log('MongoDB connected Successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); //Exit process if database fails
  }
};
