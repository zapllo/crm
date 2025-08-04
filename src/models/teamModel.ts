import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './userModel';
import { IOrganization } from './organizationModel';

export interface ITeam extends Document {
  name: string;                   // e.g. "Sales Team"
  organization: mongoose.Types.ObjectId | IOrganization;
  manager?: mongoose.Types.ObjectId | IUser; // Single manager
  members: mongoose.Types.ObjectId[];        // Array of users
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, default: 'Sales Team' },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);
