import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  whatsappNo?: string;
  country?: string;
  isOrgAdmin: boolean;
  organization: mongoose.Types.ObjectId;
  profileImage?: string;
  // Optional references
  role?: mongoose.Types.ObjectId;     // Now optional
  manager?: mongoose.Types.ObjectId;  // Another user who is the manager

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    whatsappNo: { type: String },
    country: { type: String, default:"IN"},
    profileImage: { type: String },
    isOrgAdmin: { type: Boolean, default: false },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: false, // Now optional
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Another user
    },
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
