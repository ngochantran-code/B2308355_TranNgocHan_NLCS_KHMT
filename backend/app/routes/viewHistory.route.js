import express from "express";
import {
  getViewHistories,
  getViewHistoryById,
  createViewHistory,
  deleteViewHistory,
  getViewHistoriesByUser,
} from "../controllers/viewHistory.controller.js";

const router = express.Router();

router.get("/", getViewHistories);
router.get("/user/:userId", getViewHistoriesByUser);
router.get("/:id", getViewHistoryById);
router.post("/", createViewHistory);
router.delete("/:id", deleteViewHistory);

export default router;