import Tour from "../models/tour.model.js";
import { retrieveRelevantChunks } from "./rag.service.js";
import { callGroqLLM } from "./llm.service.js";
import { buildChatbotPrompt } from "../utils/promptBuilder.js";

export const askChatbotService = async (question) => {
  const keyword = question.trim();

  const tours = await Tour.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { departurePoint: { $regex: keyword, $options: "i" } },
      { duration: { $regex: keyword, $options: "i" } },
    ],
    status: "active",
  })
    .populate("destination")
    .populate("categories")
    .limit(5);

  const chunks = await retrieveRelevantChunks(question, 5);

  const prompt = buildChatbotPrompt({
    question,
    tours,
    chunks,
  });

  let answer = await callGroqLLM(prompt);

  if (!answer) {
    answer = buildFallbackAnswer(tours, chunks);
  }

  return {
    question,
    answer,
    relatedTours: tours,
    relatedChunks: chunks,
  };
};

const buildFallbackAnswer = (tours, chunks) => {
  let answer = "";

  if (tours.length > 0) {
    answer += "Mình tìm thấy một số tour phù hợp:\n\n";

    tours.forEach((tour, index) => {
      answer += `${index + 1}. ${tour.name}\n`;
      answer += `- Giá: ${tour.price?.toLocaleString("vi-VN")} VNĐ\n`;
      answer += `- Thời lượng: ${tour.duration}\n`;
      answer += `- Khởi hành: ${tour.departurePoint}\n`;
      answer += `- Phương tiện: ${tour.transport}\n\n`;
    });
  }

  if (chunks.length > 0) {
    answer += "Thông tin lịch trình liên quan:\n\n";

    chunks.forEach((chunk, index) => {
      answer += `${index + 1}. ${chunk.content.slice(0, 400)}...\n\n`;
    });
  }

  if (!answer) {
    answer = "Hiện tại mình chưa tìm thấy tour phù hợp.";
  }

  return answer;
};