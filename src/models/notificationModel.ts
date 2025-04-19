import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  organization: Types.ObjectId;
  recipient: Types.ObjectId; // User receiving the notification
  actor?: Types.ObjectId; // User who performed the action
  actorName?: string; // Store name for better performance
  actorImage?: string; // Store image URL for better performance

  // Activity information
  action: string; // e.g. 'created', 'updated', 'deleted', 'assigned', etc.
  entityType: string; // e.g. 'lead', 'contact', 'followup', 'quotation', etc.
  entityId: Types.ObjectId; // ID of the entity
  entityName?: string; // Store name for better display

  // Details
  message: string; // Formatted message for the notification
  details?: any; // Additional JSON data (changes made, etc.)

  // Status
  read: boolean;
  important: boolean;

  // Metadata
  createdAt: Date;
  url?: string; // URL to navigate to when clicked
}

const notificationSchema = new Schema<INotification>(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actorName: String,
    actorImage: String,

    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    entityName: String,

    message: {
      type: String,
      required: true,
    },
    details: mongoose.Schema.Types.Mixed,

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    important: {
      type: Boolean,
      default: false,
    },

    url: String,
  },
  {
    timestamps: true,
    // Automatically expire notifications after 30 days to manage DB size
    expires: 60 * 60 * 24 * 30
  }
);

// Create indexes for better performance
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ organization: 1, createdAt: -1 });

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default NotificationModel;
