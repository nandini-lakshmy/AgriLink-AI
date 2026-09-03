import mongoose, { Document, Schema } from "mongoose";

export interface IMarket extends Document {
  market_name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  market_type: string;
  active_status: boolean;
  coordinate_source: string;
  createdAt: Date;
  updatedAt: Date;
}

const marketSchema = new Schema<IMarket>(
  {
    market_name: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    market_type: {
      type: String,
      default: "AGMARKNET",
      trim: true,
    },

    active_status: {
      type: Boolean,
      default: true,
    },

    coordinate_source: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

marketSchema.index(
  {
    market_name: 1,
    district: 1,
    state: 1,
  },
  {
    unique: true,
  },
);

export const Market = mongoose.model<IMarket>(
  "Market",
  marketSchema,
);