import { Router } from "express";
import {
  getGovernmentAlerts,
  getGovernmentStats,
} from "../controllers/government.controller";

const router = Router();

router.get("/alerts", getGovernmentAlerts);
router.get("/stats", getGovernmentStats);

export default router;