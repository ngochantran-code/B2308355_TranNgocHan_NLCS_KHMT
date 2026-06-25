import mongoose from "mongoose";

const visitTimeSchema = new mongoose.Schema(
  {
    itinerary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Itinerary",
      required: true,
    },

    attraction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attraction",
      required: true,
    },

    day: {
      type: Number,
      required: true,
      min: 1,
    },

    session: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night"],
      required: true,
    },

    time: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("VisitTime", visitTimeSchema);