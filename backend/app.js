import express from "express";
import cors from "cors";

import userRoutes from "./app/routes/user.route.js";
import tourRoutes from "./app/routes/tour.route.js";
import destinationRoutes from "./app/routes/destination.route.js";
import attractionRoutes from "./app/routes/attraction.route.js";
import categoryRoutes from "./app/routes/category.route.js";
import itineraryRoutes from "./app/routes/itinerary.route.js";
import visitTimeRoutes from "./app/routes/visitTime.route.js";
import viewHistoryRoutes from "./app/routes/viewHistory.route.js";
import documentChunkRoutes from "./app/routes/documentChunk.route.js";
import chatbotRoutes from "./app/routes/chatbot.route.js";
import authRoutes from "./app/routes/auth.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TourPilot backend is running",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/attractions", attractionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/visit-times", visitTimeRoutes);
app.use("/api/view-histories", viewHistoryRoutes);
app.use("/api/document-chunks", documentChunkRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

export default app;