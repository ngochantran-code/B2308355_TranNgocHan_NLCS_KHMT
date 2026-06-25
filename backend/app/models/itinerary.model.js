import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },

    day: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    transport: {
      type: String,
      enum: ["bus", "car", "plane", "train", "ship", "walk", "mixed"],
      default: "mixed",
    },
    attractions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attraction",
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Itinerary", itinerarySchema, "itineraries");