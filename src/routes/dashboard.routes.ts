import { Router } from "express";
import { getFarmerDashboard } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/farmer",
  authenticate,
  getFarmerDashboard,
);

export default router;