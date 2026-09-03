import { Router } from "express";
import { getMatchingBuyers } from "../controllers/matching.controller";

const router = Router();

router.get("/:listingId", getMatchingBuyers);

export default router;