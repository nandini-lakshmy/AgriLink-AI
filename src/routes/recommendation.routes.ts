import { Router } from "express";
import { getRecommendationData } from "../controllers/recommendation.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/farmer/:listingId",
  authenticate,
  getRecommendationData,
);

export default router;