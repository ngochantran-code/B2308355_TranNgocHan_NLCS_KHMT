import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      default: [],
    },

    source: {
      type: String,
      default: "tour_document",
    },

    metadata: {
      fileName: {
        type: String,
        default: "",
      },

      page: {
        type: Number,
        default: null,
      },

      chunkIndex: {
        type: Number,
        default: 0,
      },

      destinationName: {
        type: String,
        default: "",
      },

      tourName: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

documentChunkSchema.index({ tour: 1 });
documentChunkSchema.index({ content: "text" });

export default mongoose.model("DocumentChunk", documentChunkSchema);