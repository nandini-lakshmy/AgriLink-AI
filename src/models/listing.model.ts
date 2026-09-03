import mongoose, { Document, Schema } from "mongoose";

export type ListingUrgency =
  | "today"
  | "within_3_days"
  | "within_week";

export interface IListing extends Document {
  farmer_id: mongoose.Types.ObjectId;
  crop_name: string;
  quantity: number;
  image?: string;
  expected_price?: number;
  urgency: ListingUrgency;
  storage_available: boolean;
  status: "active" | "sold" | "closed";
  date_posted: Date;
}

const listingSchema = new Schema<IListing>(
  {
    farmer_id: {
      type: Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },

    crop_name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      trim: true,
    },

    expected_price: {
      type: Number,
      min: 0,
    },

    urgency: {
      type: String,
      enum: [
        "today",
        "within_3_days",
        "within_week",
      ],
      default: "within_week",
    },

    storage_available: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "active",
        "sold",
        "closed",
      ],
      default: "active",
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

export const Listing =
  mongoose.model<IListing>(
    "Listing",
    listingSchema,
  );