import mongoose, { Document, Schema } from "mongoose";

export interface IGovernmentPrice extends Document {
  commodity: string;
  district: string;
  market: string;
  arrival_date: Date;
  modal_price: number;
  min_price: number;
  max_price: number;
}

const governmentPriceSchema = new Schema<IGovernmentPrice>(
  {
    commodity: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    market: {
      type: String,
      required: true,
      trim: true,
    },

    arrival_date: {
      type: Date,
      required: true,
    },

    modal_price: {
      type: Number,
      required: true,
      min: 0,
    },

    min_price: {
      type: Number,
      required: true,
      min: 0,
    },

    max_price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const GovernmentPrice = mongoose.model<IGovernmentPrice>(
  "GovernmentPrice",
  governmentPriceSchema,
);