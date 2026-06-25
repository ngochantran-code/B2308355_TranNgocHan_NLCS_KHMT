import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

import { connectDB } from "../config/index.js";
import Tour from "../models/tour.model.js";
import DocumentChunk from "../models/documentChunk.model.js";
import { splitTextIntoChunks } from "../utils/textSplitter.js";
import { createEmbedding } from "../services/embedding.service.js";

dotenv.config();

const readFileContent = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === ".txt" || ext === ".md") {
    return fs.readFileSync(filePath, "utf-8");
  }

  throw new Error("Chỉ hỗ trợ file PDF, TXT, MD");
};

const ingestDocuments = async () => {
  try {
    await connectDB();

    const tourName = process.argv[2];
    const filePath = process.argv[3];

    if (!tourName || !filePath) {
      console.log("Cách dùng:");
      console.log(
        'node scripts/ingestDocuments.js "Tour Đà Lạt 3 ngày 2 đêm" "./uploads/documents/dalat.txt"'
      );
      process.exit(1);
    }

    const tour = await Tour.findOne({
      name: { $regex: tourName, $options: "i" },
    }).populate("destination");

    if (!tour) {
      throw new Error("Không tìm thấy tour");
    }

    const content = await readFileContent(filePath);
    const chunks = await splitTextIntoChunks(content, 500, 80);

    await DocumentChunk.deleteMany({ tour: tour._id });

    const documents = [];
    const destName = tour.destination ? tour.destination.name : "";

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await createEmbedding(chunks[i]);

      documents.push({
        tour: tour._id,
        content: chunks[i],
        embedding,
        source: "uploaded_document",
        metadata: {
          fileName: path.basename(filePath),
          chunkIndex: i,
          tourName: destName || tour.name,
          destinationName: destName,
        },
      });
    }

    await DocumentChunk.insertMany(documents);

    console.log(`Đã nạp ${documents.length} chunks cho tour: ${tour.name}`);
    process.exit();
  } catch (error) {
    console.error("Nạp tài liệu thất bại:", error.message);
    process.exit(1);
  }
};

ingestDocuments();