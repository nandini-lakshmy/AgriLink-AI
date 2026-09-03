import { Router } from "express";
import { getBuyerDashboard } from "../controllers/buyerDashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/buyer",
  authenticate,
  getBuyerDashboard,
);

export default router;