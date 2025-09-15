import mongoose, { Document, Model, Schema } from 'mongoose';
import { IOrganization } from './organizationModel';

interface IPagePermission {
  page: string; // e.g. "Leads", "Contacts"
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
}

interface IFeaturePermission {
  feature: string; // e.g. "ExportCSV", "BulkEmail"
  enabled: boolean;
}

export type LeadAccessType = 'ALL' | 'ASSIGNED' | 'TEAM' | 'NONE';

export interface IRole extends Document {
  organization: mongoose.Types.ObjectId | IOrganization;
  name: string; // e.g. "Sales Manager"
  leadAccess: LeadAccessType;
  pagePermissions: IPagePermission[];
  featurePermissions: IFeaturePermission[];
}

const pagePermissionSchema = new Schema<IPagePermission>(
  {
    page: { type: String, required: true },
    canView: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canAdd: { type: Boolean, default: false },
  },
  { _id: false }
);

const featurePermissionSchema = new Schema<IFeaturePermission>(
  {
    feature: { type: String, required: true },
    enabled: { type: Boolean, default: false },
  },
  { _id: false }
);

const roleSchema = new Schema<IRole>(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    name: { type: String, required: true },
    leadAccess: {
      type: String,
      enum: ['ALL', 'ASSIGNED', 'TEAM', 'NONE'],
      default: 'ASSIGNED',
    },
    pagePermissions: {
      type: [pagePermissionSchema],
      default: [],
    },
    featurePermissions: {
      type: [featurePermissionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const Role: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>('Role', roleSchema);
