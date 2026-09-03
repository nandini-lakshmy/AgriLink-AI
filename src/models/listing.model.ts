import mongoose, { Document, Schema } from "mongoose";

export interface IListing extends Document {
  farmer_id: mongoose.Types.ObjectId;
  crop_name: string;
  quantity: number;
  image?: string;
  expected_price?: number;
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

    status: {
      type: String,
      enum: ["active", "sold", "closed"],
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

export const Listing = mongoose.model<IListing>("Listing", listingSchema);