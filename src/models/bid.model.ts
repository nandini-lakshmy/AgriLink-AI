import mongoose, { Document, Schema } from "mongoose";

export interface IBid extends Document {
  listing_id: mongoose.Types.ObjectId;
  buyer_id: mongoose.Types.ObjectId;
  offered_price: number;
  status: "pending" | "accepted" | "rejected";
  timestamp: Date;
}

const bidSchema = new Schema<IBid>(
  {
    listing_id: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    buyer_id: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },

    offered_price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const Bid = mongoose.model<IBid>("Bid", bidSchema);