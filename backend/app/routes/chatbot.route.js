import express from "express";
import {
  askChatbot,
  ingestTourDocument,
} from "../controllers/chatbot.controller.js";
import { uploadDocument } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/ask", askChatbot);
router.post("/ingest", uploadDocument.single("file"), ingestTourDocument);

export default router;