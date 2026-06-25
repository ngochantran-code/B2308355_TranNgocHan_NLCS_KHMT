import express from "express";
import {
  getAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
} from "../controllers/attraction.controller.js";

const router = express.Router();

router.get("/", getAttractions);
router.get("/:id", getAttractionById);
router.post("/", createAttraction);
router.put("/:id", updateAttraction);
router.delete("/:id", deleteAttraction);

export default router;