export const cosineSimilarity = (vecA, vecB) => {
  // Kiểm tra tính hợp lệ của hai vector
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0.0; // Tích vô hướng của 2 vector (A . B)
  let normA = 0.0;      // Độ dài (chuẩn L2) bình phương của vector A (|A|^2)
  let normB = 0.0;      // Độ dài (chuẩn L2) bình phương của vector B (|B|^2)

  // Tính tích vô hướng và độ dài các vector qua vòng lặp
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  // Tránh lỗi chia cho 0 nếu một trong hai vector rỗng
  if (normA === 0 || normB === 0) {
    return 0;
  }

  // Cos(A, B) = (A . B) / (|A| * |B|)
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
