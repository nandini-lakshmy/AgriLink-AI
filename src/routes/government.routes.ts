import { Router } from "express";
import {
  getGovernmentAlerts,
  getGovernmentStats,
} from "../controllers/government.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/alerts",
  authenticate,
  getGovernmentAlerts,
);

router.get(
  "/stats",
  authenticate,
  getGovernmentStats,
);

export default router;