import { Router } from "express";
import { createListing } from "../controllers/listing.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", authenticate, createListing);

export default router;