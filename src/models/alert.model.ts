import mongoose, { Document, Schema } from "mongoose";

export interface IAlert extends Document {
  buyer_id: mongoose.Types.ObjectId;
  farmer_id: mongoose.Types.ObjectId;
  listing_id: mongoose.Types.ObjectId;
  commodity: string;
  offered_price: number;
  government_price: number;
  difference_percent: number;
  alert_status: "UNFAIR_PRICE" | "FAIR_PRICE";
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    buyer_id: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },

    farmer_id: {
      type: Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },

    listing_id: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    commodity: {
      type: String,
      required: true,
      trim: true,
    },

    offered_price: {
      type: Number,
      required: true,
      min: 0,
    },

    government_price: {
      type: Number,
      required: true,
      min: 0,
    },

    difference_percent: {
      type: Number,
      required: true,
    },

    alert_status: {
      type: String,
      enum: ["UNFAIR_PRICE", "FAIR_PRICE"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Alert = mongoose.model<IAlert>("Alert", alertSchema);