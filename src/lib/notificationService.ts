import NotificationModel from "@/models/notificationModel";
import { User } from "@/models/userModel";
import mongoose from "mongoose";

type NotificationEntityType =
  | 'lead'
  | 'contact'
  | 'company'
  | 'pipeline'
  | 'followup'
  | 'product'
  | 'quotation'
  | 'form'
  | 'category'
  | 'user';

type NotificationAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'assign'
  | 'stage_change'
  | 'comment'
  | 'note'
  | 'followup'
  | 'approve'
  | 'reject'
  | 'remind'
  | 'view'
  | 'publish';

export interface CreateNotificationParams {
  orgId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId | mongoose.Types.ObjectId[]; // Can be a single user or multiple users
  actorId?: mongoose.Types.ObjectId; // The user who performed the action
  action: NotificationAction;
  entityType: NotificationEntityType;
  entityId: mongoose.Types.ObjectId;
  entityName?: string;
  message: string;
  details?: any;
  important?: boolean;
  url?: string;
}

/**
 * Creates a notification in the database
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    const {
      orgId,
      recipientId,
      actorId,
      action,
      entityType,
      entityId,
      entityName,
      message,
      details,
      important = false,
      url
    } = params;

    // If actor is present, get their name and image for better performance
    let actorData = null;
    if (actorId) {
      actorData = await User.findById(actorId).select('firstName lastName profileImage');
    }

    const actorName = actorData ? `${actorData.firstName} ${actorData.lastName}` : undefined;
    const actorImage = actorData?.profileImage;

    // Handle single recipient or multiple recipients
    const recipients = Array.isArray(recipientId) ? recipientId : [recipientId];

    // Create notification for each recipient
    const notifications = recipients.map(recipient => ({
      organization: orgId,
      recipient,
      actor: actorId,
      actorName,
      actorImage,
      action,
      entityType,
      entityId,
      entityName,
      message,
      details,
      important,
      url,
      read: false
    }));

    // Insert all notifications
    await NotificationModel.insertMany(notifications);
  } catch (error) {
    console.error('Error creating notification:', error);
    // We don't want to throw errors from the notification service
    // to avoid breaking the main functionality
  }
}

/**
 * Fetches notifications for a user
 */
export async function getNotifications(userId: mongoose.Types.ObjectId, options: {
  limit?: number;
  skip?: number;
  unreadOnly?: boolean;
  important?: boolean;
} = {}) {
  const { limit = 10, skip = 0, unreadOnly = false, important = false } = options;

  const query: any = { recipient: userId };

  if (unreadOnly) {
    query.read = false;
  }

  if (important) {
    query.important = true;
  }

  try {
    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const count = await NotificationModel.countDocuments(query);

    return { notifications, count };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], count: 0 };
  }
}

/**
 * Marks notifications as read
 */
export async function markNotificationsAsRead(
  userId: mongoose.Types.ObjectId,
  notificationIds?: mongoose.Types.ObjectId[]
): Promise<number> {
  try {
    const query: any = {
      recipient: userId,
      read: false
    };

    // If specific notification IDs are provided, only mark those as read
    if (notificationIds && notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }

    const result = await NotificationModel.updateMany(
      query,
      { $set: { read: true } }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return 0;
  }
}
