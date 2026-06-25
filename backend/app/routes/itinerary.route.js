import express from "express";
import {
  getItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  getItinerariesByTour,
} from "../controllers/itinerary.controller.js";

const router = express.Router();

router.get("/", getItineraries);
router.get("/tour/:tourId", getItinerariesByTour);
router.get("/:id", getItineraryById);
router.post("/", createItinerary);
router.put("/:id", updateItinerary);
router.delete("/:id", deleteItinerary);

export default router;