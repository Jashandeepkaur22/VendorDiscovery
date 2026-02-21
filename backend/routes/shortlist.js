import express from "express";
import { generateShortlist } from "../controllers/shortlistController.js";

const router = express.Router();

router.post("/", generateShortlist);

export default router;
