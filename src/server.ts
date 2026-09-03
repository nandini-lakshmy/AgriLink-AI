import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import farmerRoutes from "./routes/farmer.routes";
import buyerRoutes from "./routes/buyer.routes";
import listingRoutes from "./routes/listing.routes";
import matchingRoutes from "./routes/matching.routes";
import priceComparisonRoutes from "./routes/priceComparison.routes";
import bidRoutes from "./routes/bid.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import buyerDashboardRoutes from "./routes/buyerDashboard.routes";
import marketRoutes from "./routes/market.routes";
import governmentRoutes from "./routes/government.routes";
import alertRoutes from "./routes/alert.routes";
import requirementRoutes from "./routes/requirement.routes";
import recommendationRoutes from "./routes/recommendation.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/farmer", farmerRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/price", priceComparisonRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard", buyerDashboardRoutes);
app.use("/api/market-prices", marketRoutes);
app.use("/api/government", governmentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/recommendations", recommendationRoutes);

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();