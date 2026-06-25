import { TOUR_EXTRACTION_SYSTEM_PROMPT, buildUserMessage } from "./tour-extraction.prompt.js";

// Groq context window nhỏ hơn, truncate ở 14,000 ký tự
const MAX_TEXT_LENGTH = 14000;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Gọi Groq API để extract thông tin tour từ text PDF.
 * Dùng làm fallback khi Gemini không có key hoặc bị lỗi.
 *
 * @param {string} text - Nội dung text từ PDF (đã normalize)
 * @returns {Promise<object|null>} Parsed JSON object hoặc null nếu lỗi
 */
export const callGroqExtractor = async (text) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "your_groq_api_key") {
    console.log("[Groq] GROQ_API_KEY chưa được cấu hình. Bỏ qua Groq.");
    return null;
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const truncated = text.length > MAX_TEXT_LENGTH
    ? text.substring(0, MAX_TEXT_LENGTH)
    : text;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: TOUR_EXTRACTION_SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(truncated) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`[Groq] Lỗi HTTP ${response.status}:`, errText);
      return null;
    }

    const data = await response.json();
    const jsonText = data?.choices?.[0]?.message?.content;

    if (!jsonText || jsonText.trim() === "") {
      console.warn("[Groq] Response rỗng.");
      return null;
    }

    const parsed = safeJsonParse(jsonText);

    console.log("[Groq] Extract thành công:", {
      name: parsed?.name,
      departurePoint: parsed?.departurePoint,
      destinationName: parsed?.destinationName,
      priceAdult: parsed?.priceAdult,
    });

    return parsed;
  } catch (err) {
    console.error("[Groq] Lỗi khi gọi API:", err?.message || err);
    return null;
  }
};

/**
 * Parse JSON an toàn.
 * @param {string} text
 * @returns {object}
 */
const safeJsonParse = (text) => {
  const cleaned = text.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("[Groq] Response không phải JSON hợp lệ.");
  }
};
