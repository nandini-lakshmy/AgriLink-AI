import { Router } from "express";
import { getMarketPricesController } from "../controllers/market.controller";

const router = Router();

router.get("/", getMarketPricesController);

export default router;