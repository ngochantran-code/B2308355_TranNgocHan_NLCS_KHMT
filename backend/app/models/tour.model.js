import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    session: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night"],
      default: "morning",
    },

    time: {
      type: String,
      default: "",
    },

    activityName: {
      type: String,
      default: "",
    },

    attractionName: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const itinerarySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      default: 1,
    },

    title: {
      type: String,
      default: "",
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

    activities: {
      type: [activitySchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },


    departurePoint: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    transport: {
      type: String,
      enum: ["bus", "car", "plane", "train", "ship", "mixed"],
      default: "mixed",
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    adultPrice: {
      type: Number,
      default: 0,
    },

    childPriceRule: {
      type: String,
      default: "",
    },

    infantPriceRule: {
      type: String,
      default: "",
    },

    singleRoomSurcharge: {
      type: Number,
      default: 0,
    },

    hotelOption: {
      type: [String],
      default: [],
    },

    currency: {
      type: String,
      default: "VND",
    },

    description: {
      type: String,
      default: "",
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    tourCode: {
      type: String,
      trim: true,
      default: "",
    },

    destinations: [
      {
        type: String,
        trim: true,
      },
    ],

    hotelStandard: [
      {
        type: String,
        trim: true,
      },
    ],

    highlights: [
      {
        type: String,
        trim: true,
      },
    ],

    included: [
      {
        type: String,
        trim: true,
      },
    ],

    excluded: [
      {
        type: String,
        trim: true,
      },
    ],

    childrenPolicy: {
      type: String,
      default: "",
    },

    cancelPolicy: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    itinerary: {
      type: [itinerarySchema],
      default: [],
    },

    sourceFile: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Tour", tourSchema);
