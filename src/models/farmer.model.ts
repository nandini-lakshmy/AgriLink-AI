import mongoose, { Schema, Document } from "mongoose";

export interface IFarmer extends Document {
  name: string;
  phone: string;
  password: string;
  state: string;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  crop_name?: string;
  crop_image?: string;
  quantity?: number;
  date_posted?: Date;
}

const farmerSchema = new Schema<IFarmer>(
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

    location: {
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

    crop_name: {
      type: String,
    },

    crop_image: {
      type: String,
    },

    quantity: {
      type: Number,
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

export const Farmer = mongoose.model<IFarmer>("Farmer", farmerSchema);