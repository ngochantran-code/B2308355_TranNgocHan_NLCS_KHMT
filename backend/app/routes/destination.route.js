import express from "express";
import {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  deleteAllDestinations,
} from "../controllers/destination.controller.js";

const router = express.Router();

router.get("/", getDestinations);
router.get("/:id", getDestinationById);
router.post("/", createDestination);
router.put("/:id", updateDestination);
router.delete("/:id", deleteDestination);

export default router;