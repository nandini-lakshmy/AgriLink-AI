import mongoose, { Document, Schema } from "mongoose";

export interface IBuyer extends Document {
  name: string;
  phone: string;
  password: string;
  business_name: string;
  state: string;
  district: string;
  market_location: string;
  latitude: number;
  longitude: number;
}

const buyerSchema = new Schema<IBuyer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    business_name: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    market_location: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Buyer = mongoose.model<IBuyer>("Buyer", buyerSchema);