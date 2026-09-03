import { Router } from "express";
import { compareGovernmentPrice } from "../controllers/priceComparison.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/compare", authenticate, compareGovernmentPrice);

export default router;