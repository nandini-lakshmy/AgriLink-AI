import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Farmer } from "../models/farmer.model";

export async function loginFarmer(
  phone: string,
  password: string,
) {
  const farmer = await Farmer.findOne({ phone });

  if (!farmer) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    farmer.password,
  );

  if (!passwordMatches) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in .env");
  }

  const token = jwt.sign(
    {
      id: farmer._id.toString(),
      role: "farmer",
    },
    jwtSecret,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    farmer: {
      id: farmer._id,
      name: farmer.name,
      phone: farmer.phone,
      state: farmer.state,
      district: farmer.district,
      location: farmer.location,
      latitude: farmer.latitude,
      longitude: farmer.longitude,
    },
  };
}