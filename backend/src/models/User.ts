import { Schema, model, Document } from 'mongoose';
//Interface for User

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    name: {
      tpe: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlenght: [6, 'Password must be at least 6 characters'],
    },
  },
  {
    timestamps: true,
  },
);
export const User = model<IUser>('User', userSchema);
