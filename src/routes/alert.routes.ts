import { Router } from "express";
import {
  getBuyerAlerts,
  getFarmerAlerts,
} from "../controllers/alert.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/buyer", authenticate, getBuyerAlerts);
router.get("/farmer", authenticate, getFarmerAlerts);

export default router;