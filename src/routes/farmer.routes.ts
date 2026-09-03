import { Router } from "express";
import {
  registerFarmer,
  loginFarmerController,
} from "../controllers/farmer.controller";

const router = Router();

router.post("/register", registerFarmer);
router.post("/login", loginFarmerController);

export default router;