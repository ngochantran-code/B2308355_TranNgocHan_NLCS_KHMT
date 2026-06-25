import express from "express";
import {
  getDocumentChunks,
  getDocumentChunkById,
  createDocumentChunk,
  updateDocumentChunk,
  deleteDocumentChunk,
  getDocumentChunksByTour,
} from "../controllers/documentChunk.controller.js";

const router = express.Router();

router.get("/", getDocumentChunks);
router.get("/tour/:tourId", getDocumentChunksByTour);
router.get("/:id", getDocumentChunkById);
router.post("/", createDocumentChunk);
router.put("/:id", updateDocumentChunk);
router.delete("/:id", deleteDocumentChunk);

export default router;