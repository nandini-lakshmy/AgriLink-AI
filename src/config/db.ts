import mongoose from "mongoose";
import dns from "dns";

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in .env");
  }

  // Force Node.js DNS lookups to use public DNS servers.
  // This helps with MongoDB mongodb+srv:// connection strings
  // when the system DNS resolver refuses SRV queries.
  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}