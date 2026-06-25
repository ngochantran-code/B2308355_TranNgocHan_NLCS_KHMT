import dotenv from "dotenv";

dotenv.config();

export const createEmbedding = async (text) => {
  const provider = process.env.EMBEDDING_PROVIDER?.toLowerCase() || "none";

  if (provider === "none") {
    return [];
  }

  if (provider !== "local") {
    return [];
  }

  const localUrl = process.env.LOCAL_EMBEDDING_URL || "http://localhost:8001/embed";

  if (!text || typeof text !== "string" || !text.trim()) {
    return [];
  }

  try {
    const response = await fetch(localUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.embedding)) {
      return [];
    }

    return data.embedding;
  } catch {
    return [];
  }
};

export const cosineSimilarity = (vectorA = [], vectorB = []) => {
  if (
    !Array.isArray(vectorA) ||
    !Array.isArray(vectorB) ||
    vectorA.length === 0 ||
    vectorB.length === 0 ||
    vectorA.length !== vectorB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};