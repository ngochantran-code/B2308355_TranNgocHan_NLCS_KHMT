import dotenv from "dotenv";

import { connectDB } from "../config/index.js";
import DocumentChunk from "../models/documentChunk.model.js";
import { createEmbedding } from "../services/embedding.service.js";

dotenv.config();

const createMissingEmbeddings = async () => {
  try {
    await connectDB();

    const chunks = await DocumentChunk.find({
      $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
    });

    console.log(`Tìm thấy ${chunks.length} chunks chưa có embedding`);

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk.content);

      chunk.embedding = embedding;
      await chunk.save();

      console.log(`Đã tạo embedding cho chunk: ${chunk._id}`);
    }

    console.log("Tạo embedding hoàn tất");
    process.exit();
  } catch (error) {
    console.error("Tạo embedding thất bại:", error.message);
    process.exit(1);
  }
};

createMissingEmbeddings();