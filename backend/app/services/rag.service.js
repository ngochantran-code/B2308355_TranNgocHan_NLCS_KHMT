import DocumentChunk from "../models/documentChunk.model.js";
import { createEmbedding } from "./embedding.service.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

export const retrieveRelevantChunks = async (question, limit = 5) => {
  const query = question.trim();

  if (!query) {
    return [];
  }

  try {
    // 1. Tạo vector embedding cho câu hỏi bằng API OpenAI
    const queryEmbedding = await createEmbedding(query);

    // Nếu tạo embedding thất bại (Ví dụ: chưa cấu hình API key), chuyển sang tìm kiếm từ khóa Regex dự phòng
    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.warn("Thiếu API key hoặc tạo embedding thất bại. Chuyển sang tìm kiếm từ khóa Regex.");
      return await fallbackRegexSearch(query, limit);
    }

    // 2. Ensure MongoDB connection is ready before querying. If not connected, fallback to regex search.
  if (!DocumentChunk.db || DocumentChunk.db.readyState !== 1) {
    console.warn('MongoDB not connected. Using fallback regex search.');
    return await fallbackRegexSearch(query, limit);
  }

  // 3. Retrieve document chunks with embeddings from MongoDB.
  const chunks = await DocumentChunk.find({
    embedding: { $exists: true, $not: { $size: 0 } },
  }).populate("tour");


    if (chunks.length === 0) {
      console.warn("Không tìm thấy dữ liệu embedding nào trong DB. Chuyển sang tìm kiếm Regex.");
      return await fallbackRegexSearch(query, limit);
    }

    // 3. Tính toán độ tương đồng Cosine Similarity cho từng đoạn tài liệu
    const scoredChunks = chunks.map((chunk) => {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      return { chunk, score };
    });

    // 4. Sắp xếp giảm dần theo điểm tương đồng (từ cao xuống thấp)
    scoredChunks.sort((a, b) => b.score - a.score);

    // Log kết quả khớp nhất để phục vụ debug và demo chạy thử
    console.log("=== Kết quả khớp tìm kiếm Vector (Cosine Similarity) ===");
    scoredChunks.slice(0, limit).forEach((match, idx) => {
      console.log(`[Top ${idx + 1}] Độ tương đồng: ${match.score.toFixed(4)} | Nội dung: "${match.chunk.content.substring(0, 60)}..."`);
    });

    return scoredChunks.slice(0, limit).map((match) => match.chunk);
  } catch (error) {
    console.error("Tìm kiếm vector thất bại, chuyển sang tìm kiếm Regex dự phòng:", error.message);
    return await fallbackRegexSearch(query, limit);
  }
};

const fallbackRegexSearch = async (query, limit) => {
  return await DocumentChunk.find({
    $or: [
      { content: { $regex: query, $options: "i" } },
      { "metadata.tourName": { $regex: query, $options: "i" } },
      { "metadata.destinationName": { $regex: query, $options: "i" } },
    ],
  })
    .populate("tour")
    .limit(limit);
};