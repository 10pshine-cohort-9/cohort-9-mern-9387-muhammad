import { Schema, model, Document, Types } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  user: Types.ObjectId;
  color?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
    color: {
      type: String,
      default: '#ffffff',
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Note = model<INote>('Note', noteSchema);
