import express from "express";
import {
  getVisitTimes,
  getVisitTimeById,
  createVisitTime,
  updateVisitTime,
  deleteVisitTime,
  getVisitTimesByItinerary,
} from "../controllers/visitTime.controller.js";

const router = express.Router();

router.get("/", getVisitTimes);
router.get("/itinerary/:itineraryId", getVisitTimesByItinerary);
router.get("/:id", getVisitTimeById);
router.post("/", createVisitTime);
router.put("/:id", updateVisitTime);
router.delete("/:id", deleteVisitTime);

export default router;