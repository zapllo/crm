import mongoose, { Schema, Document } from 'mongoose';

export interface AnnouncementDocument extends Document {
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'promo';
  ctaText?: string;
  ctaLink?: string;
  expiresAt?: Date;
  dismissible: boolean;
  variant?: 'default' | 'highlight' | 'subtle';
  createdAt: Date;
  isActive: boolean;
}

const AnnouncementSchema = new Schema<AnnouncementDocument>({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'success', 'promo'], 
    default: 'info' 
  },
  ctaText: { 
    type: String 
  },
  ctaLink: { 
    type: String 
  },
  expiresAt: { 
    type: Date 
  },
  dismissible: { 
    type: Boolean, 
    default: true 
  },
  variant: { 
    type: String, 
    enum: ['default', 'highlight', 'subtle'], 
    default: 'default' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

// Create or get the Announcement model
const Announcement = mongoose.models.Announcement || mongoose.model<AnnouncementDocument>('Announcement', AnnouncementSchema);

export default Announcement;