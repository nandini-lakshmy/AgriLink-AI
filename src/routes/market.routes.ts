import { Router } from "express";
import {
  getMarketPricesController,
  getMarketPriceHistoryController,
} from "../controllers/market.controller";

const router = Router();

router.get("/", getMarketPricesController);

router.get(
  "/history",
  getMarketPriceHistoryController,
);

export default router;