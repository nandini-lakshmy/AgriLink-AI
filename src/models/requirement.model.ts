import mongoose, { Document, Schema } from "mongoose";

export interface IRequirement extends Document {
  buyer_id: mongoose.Types.ObjectId;
  crop_name: string;
  quantity_needed: number;
  offered_price: number;
  date_posted: Date;
}

const requirementSchema = new Schema<IRequirement>(
  {
    buyer_id: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },

    crop_name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity_needed: {
      type: Number,
      required: true,
      min: 0,
    },

    offered_price: {
      type: Number,
      required: true,
      min: 0,
    },

    date_posted: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const Requirement = mongoose.model<IRequirement>(
  "Requirement",
  requirementSchema,
);