import mongoose, { Schema, model, Document, Model } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agent?: string;
  attachments?: {
    name: string;
    url: string;
  }[];
}

export interface ITicket extends Document {
  ticketId: string;
  subject: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  messages: IMessage[];
  assignedTo?: mongoose.Types.ObjectId;
}

const messageSchema = new Schema<IMessage>({
  sender: { 
    type: String, 
    enum: ['user', 'agent'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  agent: { 
    type: String 
  },
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true }
  }]
});

const ticketSchema = new Schema<ITicket>(
  {
    ticketId: { 
      type: String, 

      unique: true 
    },
    subject: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['open', 'pending', 'closed'], 
      default: 'open' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'], 
      required: true 
    },
    category: { 
      type: String, 
      required: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    messages: [messageSchema],
    assignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

// Generate ticket ID before saving
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Get the current count of tickets for this organization
const TicketModel = this.constructor as Model<ITicket>;
const ticketCount = await TicketModel.countDocuments({
  organizationId: this.organizationId
});
    
    // Generate the ticket ID in format: TKT-YYYY-ORG-XXXX
    const year = new Date().getFullYear();
    // Convert organization ID to a shorter string (using last 4 chars)
    const orgIdShort = this.organizationId.toString().slice(-4);
    // Zero-pad the ticket count to 4 digits
    const count = (ticketCount + 1).toString().padStart(4, '0');
    
    this.ticketId = `TKT-${year}-${orgIdShort}-${count}`;
  }
  next();
});

export default mongoose.models.Ticket || model<ITicket>('Ticket', ticketSchema);