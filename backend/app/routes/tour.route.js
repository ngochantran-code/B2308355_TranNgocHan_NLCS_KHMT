import express from "express";
import {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  createTourFromPDF,
  deleteAllTours,
} from "../controllers/tour.controller.js";
import { uploadDocument } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", getTours);
router.get("/:id", getTourById);
router.post("/", createTour);
router.post("/upload-pdf", uploadDocument.single("file"), createTourFromPDF);
router.put("/:id", updateTour);
router.delete('/:id', deleteTour);
router.delete('/all', deleteAllTours);

export default router;