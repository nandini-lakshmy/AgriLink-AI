import { Router } from "express";
import {
  createRequirement,
  getMatchingListings,
  getMatchingRequirementsForFarmer,
} from "../controllers/requirement.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  createRequirement,
);

router.get(
  "/:requirementId/matches",
  authenticate,
  getMatchingListings,
);

router.get(
  "/matching-farmer",
  authenticate,
  getMatchingRequirementsForFarmer,
);

export default router;