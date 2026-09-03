import { Router } from "express";
import {
  createBid,
  getBidsForListing,
  acceptBid,
  rejectBid,
} from "../controllers/bid.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", authenticate, createBid);
router.get("/listing/:listingId", authenticate, getBidsForListing);
router.post("/:bidId/accept", authenticate, acceptBid);
router.post("/:bidId/reject", authenticate, rejectBid);

export default router;