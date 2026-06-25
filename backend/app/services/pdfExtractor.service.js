import { TourExtractionSchema } from "./tour-extraction.schema.js";
import { callGeminiExtractor } from "./gemini-tour-extractor.service.js";
import { callGroqExtractor } from "./groq-tour-extractor.service.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const MIN_TEXT_LENGTH = 50;

const VALID_TOUR_TRANSPORTS = ["bus", "car", "plane", "train", "ship", "mixed"];
const VALID_ITINERARY_TRANSPORTS = ["bus", "car", "plane", "train", "ship", "walk", "mixed"];
const VALID_SESSIONS = ["morning", "afternoon", "evening", "night"];

// ─── Text normalization ───────────────────────────────────────────────────────

/**
 * Normalize text trích xuất từ PDF:
 * - Chuẩn hóa line endings
 * - Loại bỏ ký tự control không in được
 * - Rút gọn khoảng trắng thừa trong dòng
 * - Loại bỏ dòng trống liên tiếp quá nhiều
 */
const normalizeRawText = (text = "") => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Loại bỏ ký tự control ngoại trừ \n \t
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Rút gọn khoảng trắng thừa trong mỗi dòng (giữ newline)
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    // Rút gọn 3+ dòng trống liên tiếp thành 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ─── Output normalization ─────────────────────────────────────────────────────

/**
 * Normalize một activity item cho an toàn với DB schema.
 */
const normalizeActivity = (act = {}) => ({
  session: VALID_SESSIONS.includes(act.session) ? act.session : "morning",
  time: String(act.time || "").trim() || "",
  activityName: String(act.activityName || "").trim().substring(0, 300),
  attractionName: String(act.attractionName || "").trim().substring(0, 200),
  note: String(act.note || "").trim().substring(0, 300),
});

/**
 * Normalize một ngày trong lịch trình.
 */
const normalizeItineraryDay = (item = {}, index = 0) => {
  const day = Number.isInteger(Number(item.day)) && Number(item.day) >= 1
    ? Number(item.day)
    : index + 1;

  const transport = VALID_ITINERARY_TRANSPORTS.includes(item.transport)
    ? item.transport
    : "mixed";

  const activities = Array.isArray(item.activities)
    ? item.activities.map(normalizeActivity)
    : [];

  return {
    day,
    title: String(item.title || `Ngày ${day}`).trim().substring(0, 300),
    content: String(item.content || "").trim().substring(0, 3000),
    transport,
    activities,
  };
};

/**
 * Map dữ liệu đã validate sang object tương thích với DB Tour model.
 *
 * DB fields:
 *   - price (required)   → priceAdult
 *   - adultPrice         → priceAdult
 *   - transport          → tour-level transport (không có "walk")
 *
 * @param {import("./tour-extraction.schema.js").TourExtraction} data - Validated Zod output
 * @returns {object} Object sẵn sàng lưu vào DB
 */
const mapToDbSchema = (data) => {
  const tourTransport = VALID_TOUR_TRANSPORTS.includes(data.transport)
    ? data.transport
    : "mixed";

  const itinerary = Array.isArray(data.itinerary)
    ? data.itinerary.map(normalizeItineraryDay)
    : [];

  // Sắp xếp itinerary theo ngày
  itinerary.sort((a, b) => a.day - b.day);

  return {
    // Core fields (khớp với DB)
    name: data.name.trim(),
    departurePoint: data.departurePoint.trim(),
    destinationName: data.destinationName.trim(),
    duration: data.duration.trim(),

    // Price mapping: DB dùng "price" (required) = giá người lớn
    price: data.priceAdult || 0,
    adultPrice: data.priceAdult || 0,
    // childPriceRule nếu có giá trẻ em
    ...(data.priceChild > 0 && {
      childPriceRule: `Giá trẻ em: ${data.priceChild.toLocaleString("vi-VN")}đ`,
    }),

    transport: tourTransport,
    description: data.description.trim().substring(0, 1000),
    categories: Array.isArray(data.categories) ? data.categories : [],
    itinerary,

    // Metadata không lưu vào DB chính (dùng để logging/debug ở controller)
    _confidence: data.confidence,
    _missingFields: data.missingFields,
  };
};

// ─── Zod validation ───────────────────────────────────────────────────────────

/**
 * Validate và parse raw object từ LLM bằng Zod schema.
 * @param {unknown} raw
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
const validateWithZod = (raw) => {
  const result = TourExtractionSchema.safeParse(raw);

  if (!result.success) {
    const errorMsg = result.error?.issues
      ?.map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ") || "Zod validation failed";

    console.warn("[pdfExtractor] Zod validation lỗi:", errorMsg);
    return { success: false, error: errorMsg };
  }

  return { success: true, data: result.data };
};

// ─── Public export ────────────────────────────────────────────────────────────

/**
 * Trích xuất thông tin tour du lịch từ text PDF bằng LLM (Gemini ưu tiên, Groq fallback).
 *
 * Flow:
 *  1. Normalize text
 *  2. Validate độ dài tối thiểu
 *  3. Gọi Gemini (nếu có GEMINI_API_KEY)
 *  4. Fallback sang Groq (nếu có GROQ_API_KEY)
 *  5. Throw error nếu cả hai đều không khả dụng hoặc đều thất bại
 *  6. Validate bằng Zod schema
 *  7. Map sang DB schema
 *  8. Return object tour chuẩn hóa
 *
 * @param {string} text - Text thô từ PDF parser
 * @returns {Promise<object>} Tour data tương thích DB
 * @throws {Error} Nếu text rỗng/ngắn hoặc không có LLM nào khả dụng
 */
export const extractTourDataFromText = async (text = "") => {
  // ── 1. Normalize ─────────────────────────────────────────────────────────
  const normalized = normalizeRawText(text);

  // ── 2. Validate length ───────────────────────────────────────────────────
  if (normalized.length < MIN_TEXT_LENGTH) {
    throw new Error(
      "PDF không có đủ nội dung để trích xuất. Có thể đây là PDF scan ảnh, cần OCR."
    );
  }

  console.log(`[pdfExtractor] Bắt đầu extract, text length: ${normalized.length} ký tự`);

  // ── 3. Gọi Gemini ────────────────────────────────────────────────────────
  let rawData = null;

  try {
    rawData = await callGeminiExtractor(normalized);
  } catch (err) {
    console.error("[pdfExtractor] Gemini thất bại:", err.message);
  }

  // ── 4. Fallback sang Groq ────────────────────────────────────────────────
  if (!rawData) {
    console.log("[pdfExtractor] Fallback sang Groq...");
    try {
      rawData = await callGroqExtractor(normalized);
    } catch (err) {
      console.error("[pdfExtractor] Groq thất bại:", err.message);
    }
  }

  // ── 5. Không có LLM nào trả được dữ liệu ────────────────────────────────
  if (!rawData) {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key";
    const hasGroqKey = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "your_groq_api_key";

    if (!hasGeminiKey && !hasGroqKey) {
      throw new Error(
        "Không có API key LLM nào được cấu hình. Vui lòng thêm GEMINI_API_KEY hoặc GROQ_API_KEY vào file .env."
      );
    }

    throw new Error(
      "Không thể trích xuất thông tin tour: tất cả LLM đều thất bại. Vui lòng thử lại sau."
    );
  }

  // ── 6. Validate bằng Zod ─────────────────────────────────────────────────
  const validation = validateWithZod(rawData);

  let validatedData;
  if (validation.success) {
    validatedData = validation.data;
  } else {
    // Nếu Zod lỗi, vẫn tiếp tục với raw data (TourExtractionSchema dùng .default() nên hiếm khi fail)
    console.warn("[pdfExtractor] Bỏ qua Zod validation, dùng raw data thay thế.");
    validatedData = {
      name: rawData.name || "",
      departurePoint: rawData.departurePoint || "",
      destinationName: rawData.destinationName || "",
      duration: rawData.duration || "",
      priceAdult: Number(rawData.priceAdult) || 0,
      priceChild: Number(rawData.priceChild) || 0,
      transport: rawData.transport || "mixed",
      description: rawData.description || "",
      categories: Array.isArray(rawData.categories) ? rawData.categories : [],
      itinerary: Array.isArray(rawData.itinerary) ? rawData.itinerary : [],
      confidence: rawData.confidence || {},
      missingFields: Array.isArray(rawData.missingFields) ? rawData.missingFields : [],
    };
  }

  // ── 7. Map sang DB schema ─────────────────────────────────────────────────
  const result = mapToDbSchema(validatedData);

  console.log("[pdfExtractor] Extract hoàn tất:", {
    name: result.name,
    departurePoint: result.departurePoint,
    destinationName: result.destinationName,
    price: result.price,
    duration: result.duration,
    itineraryDays: result.itinerary.length,
    missingFields: result._missingFields,
  });

  return result;
};