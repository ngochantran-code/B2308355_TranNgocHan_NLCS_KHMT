import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    province: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["Thành phố", "Tỉnh", "Bãi biển", "Núi", "Đảo", "Khác"],
      default: "Khác",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Destination", destinationSchema);