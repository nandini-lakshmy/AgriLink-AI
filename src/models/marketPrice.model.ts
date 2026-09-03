import mongoose, { Document, Schema } from "mongoose";

export interface IMarketPrice extends Document {
  market_id: mongoose.Types.ObjectId;
  commodity: string;
  date: Date;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  grade: string;
  variety: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const marketPriceSchema = new Schema<IMarketPrice>(
  {
    market_id: {
      type: Schema.Types.ObjectId,
      ref: "Market",
      required: true,
    },

    commodity: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
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

    modal_price: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    grade: {
      type: String,
      default: "",
      trim: true,
    },

    variety: {
      type: String,
      default: "",
      trim: true,
    },

    source: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

marketPriceSchema.index(
  {
    market_id: 1,
    commodity: 1,
    date: 1,
    grade: 1,
    variety: 1,
  },
  {
    unique: true,
  },
);

export const MarketPrice = mongoose.model<IMarketPrice>(
  "MarketPrice",
  marketPriceSchema,
);