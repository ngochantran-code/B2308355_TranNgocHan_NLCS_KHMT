import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitTextIntoChunks = async (text, chunkSize = 500, overlap = 80) => {
  if (!text || typeof text !== "string") {
    return [];
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: overlap,
  });

  return await splitter.splitText(text);
};