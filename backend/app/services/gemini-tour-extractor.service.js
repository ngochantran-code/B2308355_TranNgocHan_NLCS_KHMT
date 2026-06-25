import { GoogleGenAI } from "@google/genai";
import { TOUR_EXTRACTION_SYSTEM_PROMPT, buildUserMessage } from "./tour-extraction.prompt.js";

// Gemini có context window lớn, truncate ở 30,000 ký tự
const MAX_TEXT_LENGTH = 30000;

/**
 * Gọi Gemini API để extract thông tin tour từ text PDF.
 * @param {string} text - Nội dung text từ PDF (đã normalize)
 * @returns {Promise<object|null>} Parsed JSON object hoặc null nếu lỗi
 */
export const callGeminiExtractor = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key") {
    console.log("[Gemini] GEMINI_API_KEY chưa được cấu hình. Bỏ qua Gemini.");
    return null;
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const truncated = text.length > MAX_TEXT_LENGTH
    ? text.substring(0, MAX_TEXT_LENGTH)
    : text;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { text: TOUR_EXTRACTION_SYSTEM_PROMPT },
            { text: buildUserMessage(truncated) },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawText = response.text;

    if (!rawText || rawText.trim() === "") {
      console.warn("[Gemini] Response rỗng.");
      return null;
    }

    const parsed = safeJsonParse(rawText);

    console.log("[Gemini] Extract thành công:", {
      name: parsed?.name,
      departurePoint: parsed?.departurePoint,
      destinationName: parsed?.destinationName,
      priceAdult: parsed?.priceAdult,
    });

    return parsed;
  } catch (err) {
    console.error("[Gemini] Lỗi khi gọi API:", err?.message || err);
    return null;
  }
};

/**
 * Parse JSON an toàn, thử extract từ response nếu có text ngoài JSON.
 * @param {string} text
 * @returns {object}
 */
const safeJsonParse = (text) => {
  const cleaned = text.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Thử tìm JSON object trong response nếu LLM trả thêm text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("[Gemini] Response không phải JSON hợp lệ.");
  }
};
