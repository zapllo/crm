// models/tradeIndiaIntegrationModel.ts

import mongoose, { Schema, model, models } from "mongoose";

const TradeIndiaIntegrationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  // The info you see in the TradeIndia panel:
  tradeIndiaUserId: {
    type: String,
    required: true,
  },
  tradeIndiaProfileId: {
    type: String,
    required: true,
  },
  tradeIndiaKey: {
    type: String,
    required: true,
  },
  // Optionally store pipeline for new leads:
  pipelineId: {
    type: Schema.Types.ObjectId,
    ref: "Pipeline",
    default: null,
  },
});

export default models.TradeIndiaIntegration ||
  model("TradeIndiaIntegration", TradeIndiaIntegrationSchema);
