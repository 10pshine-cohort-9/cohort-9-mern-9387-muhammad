import { Schema, model, Document, Types } from 'mongoose';

// Note Interface
export interface INote extends Document {
  title: string;
  content: string;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Note schema
const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note must belong to a user'],
    },
  },
  {
    timestamps: true,
  },
);

export const Note = model<INote>('Note', noteSchema);
