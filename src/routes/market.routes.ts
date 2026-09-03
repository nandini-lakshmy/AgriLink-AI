import { Router } from "express";
import {
  getMarketPricesController,
  getMarketPriceHistoryController,
  getNearbyMarketsController,
} from "../controllers/market.controller";

const router = Router();

router.get(
  "/nearby",
  getNearbyMarketsController,
);

router.get(
  "/history",
  getMarketPriceHistoryController,
);

router.get(
  "/",
  getMarketPricesController,
);

export default router;