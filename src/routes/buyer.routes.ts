import { Router } from "express";
import {
  registerBuyer,
  loginBuyer,
} from "../controllers/buyer.controller";
import { createRequirement } from "../controllers/requirement.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", registerBuyer);
router.post("/login", loginBuyer);
router.post("/requirement", authenticate, createRequirement);

export default router;