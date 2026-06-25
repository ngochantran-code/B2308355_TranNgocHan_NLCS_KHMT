import Tour from "../models/tour.model.js";
import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import Destination from "../models/destination.model.js";
import Itinerary from "../models/itinerary.model.js";
import DocumentChunk from "../models/documentChunk.model.js";
import Category from "../models/category.model.js";
import Attraction from "../models/attraction.model.js";
import VisitTime from "../models/visitTime.model.js";
import { extractTourDataFromText } from "../services/pdfExtractor.service.js";
import { splitTextIntoChunks } from "../utils/textSplitter.js";
import { createEmbedding } from "../services/embedding.service.js";


const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Danh sách tiền tố địa điểm tham quan phổ biến (Việt + Anh)
const ATTRACTION_PREFIXES = [
  // Công trình tôn giáo / lịch sử
  "chùa", "đền", "miếu", "lăng", "tháp", "cung", "thành", "nhà thờ", "nhà lưu niệm",
  "dinh", "cột cờ", "tượng đài", "tượng", "đài tưởng niệm", "đài", "bia",
  // Thiên nhiên
  "hồ", "thác", "núi", "đỉnh", "đồi", "hang", "động", "suối", "sông", "vịnh",
  "bãi biển", "bãi", "đảo", "cồn", "rừng", "vườn quốc gia", "cao nguyên", "thung lũng",
  "ruộng bậc thang",
  // Văn hóa / khu vực
  "phố cổ", "làng cổ", "làng văn hóa", "làng", "bản", "khu phố", "khu di tích",
  "khu bảo tồn", "khu du lịch", "khu", "chợ", "chợ nổi",
  // Công trình hiện đại / tham quan
  "bảo tàng", "cầu", "công viên", "quảng trường", "vườn hoa", "vườn",
  "trung tâm thương mại", "trung tâm", "cổng", "cáp treo", "trại",
  "đồng chè", "vườn chè", "nhà cổ", "phố đi bộ",
  // Tiếng Anh
  "temple", "pagoda", "museum", "park", "beach", "island", "lake", "waterfall",
  "mountain", "hill", "cave", "market", "bridge", "tower", "palace", "castle",
  "sanctuary", "national park", "resort", "village",
];

// Tên địa điểm riêng biệt không có prefix nhưng được công nhận
const KNOWN_ATTRACTION_KEYWORDS = [
  "fansipan", "angkor", "mỹ sơn", "hội an", "văn miếu", "lũng cú",
  "mã pì lèng", "ma pi leng", "bà nà", "ba na", "central festival",
  "fantasy park", "sapa", "phu quoc", "hạ long", "ha long",
  "cat cat", "cát cát", "cát cụt", "tứ linh", "đồng văn",
];

// Kiểm tra tên địa điểm có thực sự là địa điểm tham quan không
// Chiến lược: xác nhận TÍCH CỰC (positive filter) thay vì lọc loại (negative filter)
const isValidAttractionName = (name = "") => {
  const n = name.trim();
  if (!n || n.length < 4 || n.length > 120) return false;

  const lower = n.toLowerCase();

  // 0. Loại các compound sai TRƯỚC KHI kiểm tra prefix
  //    (vd: "cầu cung cấp" bắt đầu bằng "cầu" nhưng KHÔNG phải cầu/bridge)
  const ANTI_PATTERNS = [
    /^cầu\s+(?:cung\s+cấp|cứu|nguyện|mong|xin|thầy)/i,
    /^cung\s+(?:cấp|bậc|ứng)/i,
    /^khu\s+vực/i,
    /^bản\s+(?:thân|sắc|quyền|đồ|tính|năng)/i,
    /^cổng\s+(?:thông\s+tin|vào|ra|trường)/i,
    // Chứa từ khóa điều kiện/giá cả
    /chiều\s*cao|giá\s*vé|vé\s*vào|tuổi|miễn\s*phí|phụ\s*thu/i,
  ];
  if (ANTI_PATTERNS.some((p) => p.test(lower))) return false;

  // 1. Bắt đầu bằng tiền tố địa điểm đã biết
  if (ATTRACTION_PREFIXES.some((prefix) => lower.startsWith(prefix))) return true;

  // 2. Chứa từ khóa tên địa điểm nổi tiếng
  if (KNOWN_ATTRACTION_KEYWORDS.some((kw) => lower.includes(kw))) return true;

  // 3. Là tên viết hoa kiểu tiếng Anh (ví dụ: "Fansipan", "Tiger Cave Temple")
  //    - Không có dấu tiếng Việt, bắt đầu bằng chữ hoa
  if (/^[A-Z][a-zA-Z\s\-']{3,}$/.test(n)) return true;

  // Mặc định: từ chối nếu không khớp bất kỳ điều kiện nào
  return false;
};


// Chuẩn hoà tên địa điểm: cắt tại dấu ":", "(", "–" và loại bỏ động từ đứng trước
const cleanAttractionName = (name = "") => {
  let n = name.trim();
  // Cắt bỏ phần mô tả sau dấu ":", "(", "[", "–"
  n = n.split(/[:([\u2013]/)[0].trim();
  // Loại động từ đứng đầu: "tham quan X" → "X"
  n = n.replace(/^(?:tham\s*quan|thăm\s*quan|ghé(?:\s*thăm)?|viếng|thăm|khám\s*phá)\s+/i, "").trim();
  // Loại giới từ đứng đầu còn sót: "ở X", "tại X"
  n = n.replace(/^(?:ở|tại|đến|về)\s+/i, "").trim();
  return n;
};



// Chuẩn hoá chuỗi để so sánh tên địa điểm / tên tour
const normalizeStr = (str) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();


export const getTours = async (req, res) => {
  try {
    const { keyword, destination, category, status } = req.query;

    const filter = {};

    if (keyword) {
      const matchingDestinations = await Destination.find({
        name: { $regex: keyword, $options: "i" },
      }).select("_id");

      const destIds = matchingDestinations.map((d) => d._id);

      const orConditions = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { departurePoint: { $regex: keyword, $options: "i" } },
      ];

      if (destIds.length > 0) {
        orConditions.push({ destination: { $in: destIds } });
      }

      filter.$or = orConditions;
    }

    if (destination) {
      let destId = destination;
      if (!/^[a-fA-F0-9]{24}$/.test(destination)) {
        const destDoc = await Destination.findOne({
          name: { $regex: new RegExp(escapeRegExp(destination), "i") },
        });
        if (destDoc) destId = destDoc._id;
      }
      filter.destination = destId;
    }

    if (category) {
      filter.categories = category;
    }

    if (status) {
      filter.status = status;
    }

    const tours = await Tour.find(filter)
      .populate("destination")
      .populate("categories")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách tour thành công",
      data: tours,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách tour",
      error: error.message,
    });
  }
};

export const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate("destination")
      .populate("categories");

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    const itineraries = await Itinerary.find({
      tour: tour._id,
    })
      .sort({ day: 1 })
      .lean();

    const itineraryIds = itineraries.map((item) => item._id);

    const visitTimes = await VisitTime.find({
      itinerary: { $in: itineraryIds },
    })
      .populate("attraction")
      .sort({ day: 1, session: 1, time: 1 })
      .lean();

    const itineraryWithActivities = itineraries.map((item) => {
      const activities = visitTimes
        .filter(
          (visit) =>
            visit.itinerary.toString() === item._id.toString()
        )
        .map((visit) => ({
          _id: visit._id,
          session: visit.session,
          time: visit.time,
          activityName: visit.note || "",
          attractionName: visit.attraction?.name || "",
          attraction: visit.attraction || null,
          note: visit.note || "",
        }));

      return {
        ...item,
        activities,
      };
    });

    res.status(200).json({
      success: true,
      message: "Lấy thông tin tour thành công",
      data: {
        ...tour.toObject(),
        itinerary: itineraryWithActivities,
      },
    });
  } catch (error) {
    console.error("[getTourById]", error);

    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin tour",
      error: error.message,
    });
  }
};

export const createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);

    const populatedTour = await Tour.findById(tour._id)
      .populate("destination")
      .populate("categories");

    res.status(201).json({
      success: true,
      message: "Tạo tour thành công",
      data: populatedTour,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo tour",
      error: error.message,
    });
  }
};

export const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("destination")
      .populate("categories");

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật tour thành công",
      data: tour,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật tour",
      error: error.message,
    });
  }
};

export const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    const itineraries = await Itinerary.find({ tour: tour._id });
    const itineraryIds = itineraries.map((item) => item._id);

    await VisitTime.deleteMany({
      itinerary: { $in: itineraryIds },
    });

    await Itinerary.deleteMany({
      tour: tour._id,
    });

    await DocumentChunk.deleteMany({
      tour: tour._id,
    });

    await Tour.findByIdAndDelete(tour._id);

    res.status(200).json({
      success: true,
      message: "Xóa tour và dữ liệu liên quan thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa tour",
      error: error.message,
    });
  }
};

export const deleteAllTours = async (req, res) => {
  try {
    await Tour.deleteMany({});
    await Itinerary.deleteMany({});
    await VisitTime.deleteMany({});
    await Attraction.deleteMany({});
    await DocumentChunk.deleteMany({});

    res.status(200).json({
      success: true,
      message: "Xóa tất cả tour và dữ liệu liên quan thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa tất cả tour",
      error: error.message,
    });
  }
};

export const createTourFromPDF = async (req, res) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng tải lên file tài liệu tour (PDF)",
      });
    }

    tempFilePath = req.file.path;
    const ext = path.extname(tempFilePath).toLowerCase();

    if (ext !== ".pdf") {
      fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        success: false,
        message: "Định dạng file không được hỗ trợ. Chỉ chấp nhận file PDF.",
      });
    }

    // 1. Phân tích cú pháp văn bản PDF
    const dataBuffer = fs.readFileSync(tempFilePath);
    const parser = new PDFParse({ data: dataBuffer });
    const parsedPdf = await parser.getText();
    const textContent = parsedPdf.text;

    if (!textContent || textContent.trim() === "") {
      fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        success: false,
        message: "Không thể đọc nội dung hoặc nội dung file PDF trống",
      });
    }

    // 2. Trích xuất dữ liệu cấu trúc bằng dịch vụ LLM
    let extractedData;
    try {
      extractedData = await extractTourDataFromText(textContent);
      console.log("[PDF IMPORT] itinerary length:", extractedData.itinerary?.length || 0);
      console.log("[PDF IMPORT] first itinerary:", extractedData.itinerary?.[0]);
    } catch (llmErr) {
      fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        success: false,
        message: llmErr.message || "Lỗi khi trích xuất dữ liệu",
      });
    }

    // 3. Tìm hoặc tạo Điểm đến
    let destination = null;
    if (extractedData.destinationName && extractedData.destinationName.trim() !== "") {
      const destName = extractedData.destinationName.trim();
      destination = await Destination.findOne({
        name: { $regex: new RegExp(`^${escapeRegExp(destName)}$`, "i") },
      });

      if (!destination) {
        destination = await Destination.create({
          name: destName,
          province: destName,
          description: `Địa điểm du lịch tự động tạo từ PDF: ${destName}`,
        });
      }
    } else {
      // Tìm điểm đến mặc định đầu tiên
      destination = await Destination.findOne();
      if (!destination) {
        destination = await Destination.create({
          name: "Mặc định",
          province: "Mặc định",
          description: "Địa điểm mặc định của hệ thống",
        });
      }
    }

    // 4. Tìm/Tạo ánh xạ Danh mục
    const categoryIds = [];
    if (extractedData.categories && Array.isArray(extractedData.categories)) {
      for (const catName of extractedData.categories) {
        const cleanedName = catName.trim();
        if (cleanedName) {
          let category = await Category.findOne({
            name: { $regex: new RegExp(`^${escapeRegExp(cleanedName)}$`, "i") },
          });

          if (!category) {
            category = await Category.create({
              name: cleanedName,
              description: `Danh mục tạo tự động cho tour: ${cleanedName}`,
            });
          }
          categoryIds.push(category._id);
        }
      }
    }

    // 5. Tạo Tour
    const validTransports = ["bus", "car", "plane", "train", "ship", "mixed"];
    const transport = validTransports.includes(extractedData.transport)
      ? extractedData.transport
      : "mixed";

    // Ensure price fields are numeric
    const sanitizeNumber = (value, fallback = 0) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
        return isNaN(num) ? fallback : num;
      }
      return fallback;
    };

    const tourData = {
      name: extractedData.name || "Tour tự động từ PDF",
      departurePoint: extractedData.departurePoint || "",
      duration: extractedData.duration || "Chưa xác định",
      price: sanitizeNumber(extractedData.price, 0),
      adultPrice: sanitizeNumber(extractedData.adultPrice, 0),
      childPriceRule: extractedData.childPriceRule || "",
      infantPriceRule: extractedData.infantPriceRule || "",
      singleRoomSurcharge: sanitizeNumber(extractedData.singleRoomSurcharge, 0),
      hotelOption: extractedData.hotelOption || [],
      currency: extractedData.currency || "VND",
      transport: transport,
      description: extractedData.description || "",
      destination: destination._id,
      status: "active",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      categories: categoryIds,

      tourCode: extractedData.tourCode || "",
      destinations: Array.isArray(extractedData.destinations) ? extractedData.destinations : [],
      hotelStandard: Array.isArray(extractedData.hotelStandard) ? extractedData.hotelStandard : [],
      highlights: Array.isArray(extractedData.highlights) ? extractedData.highlights : [],
      included: Array.isArray(extractedData.included) ? extractedData.included : [],
      excluded: Array.isArray(extractedData.excluded) ? extractedData.excluded : [],
      childrenPolicy: extractedData.childrenPolicy || "",
      cancelPolicy: extractedData.cancelPolicy || "",
      notes: extractedData.notes || "",
    };

    const createdTour = await Tour.create(tourData);

    // 6. Tạo Lịch trình và Hoạt động tham quan
    if (extractedData.itinerary && Array.isArray(extractedData.itinerary)) {
      const validItiTransports = ["bus", "car", "plane", "train", "ship", "walk", "mixed"];

      for (const item of extractedData.itinerary) {
        // Tạo Ngày lịch trình
        const createdItinerary = await Itinerary.create({
          tour: createdTour._id,
          day: item.day || 1,
          title: item.title || `Ngày ${item.day}`,
          content: item.content || item.title || `Chi tiết lịch trình ngày ${item.day || 1}`,
          transport: validItiTransports.includes(item.transport)
            ? item.transport
            : "mixed",
        });

        // Tạo Hoạt động (Thời gian tham quan + Điểm tham quan)
        if (item.activities && Array.isArray(item.activities)) {
          const validSessions = ["morning", "afternoon", "evening", "night"];

          for (const act of item.activities) {
            // Làm sạch và chuẩn hoà tên địa điểm
            let rawName = (act.attractionName || "").trim();
            // Bỏ qua nếu không có tên địa điểm
            if (!rawName) continue;

            const attName = cleanAttractionName(rawName);

            // Bỏ qua nếu tên không hợp lệ
            if (!isValidAttractionName(attName)) continue;

            // Tìm hoặc tạo Điểm tham quan
            let attraction = await Attraction.findOne({
              name: { $regex: new RegExp(`^${escapeRegExp(attName)}$`, "i") },
              destination: destination._id,
            });

            if (!attraction) {
              attraction = await Attraction.create({
                name: attName,
                description: `Điểm tham quan tự động trích xuất: ${attName}`,
                destination: destination._id,
                status: "active",
              });
            }

            // Tạo Thời gian tham quan
            const session = validSessions.includes(act.session) ? act.session : "morning";
            await VisitTime.create({
              itinerary: createdItinerary._id,
              attraction: attraction._id,
              day: item.day || 1,
              session,
              time: act.time || "08:00",
              note: act.activityName || act.note || "Hoạt động tự động",
            });
          }
        }
      }
    }

    // 7. Nạp vào các đoạn tài liệu RAG (DocumentChunks)
    try {
      const chunks = await splitTextIntoChunks(textContent, 500, 80);
      const documents = [];
      for (let i = 0; i < chunks.length; i++) {
        let embedding = [];
          try {
            embedding = await createEmbedding(chunks[i]);
          } catch (err) {
            console.error('Lỗi khi tạo embedding cho RAG:', err.message);
          }

        documents.push({
          tour: createdTour._id,
          content: chunks[i],
          embedding,
          source: "uploaded_pdf_import",
          metadata: {
            fileName: req.file.originalname,
            chunkIndex: i,
            tourName: destination ? destination.name : createdTour.name,
            destinationName: destination ? destination.name : "",
          },
        });
      }
      await DocumentChunk.insertMany(documents);
    } catch (ragError) {
      console.error("Lỗi tự động nạp RAG cho tour PDF:", ragError);
    }

    // 8. Dọn dẹp file tạm
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      console.error("Lỗi khi xóa file tạm:", cleanupError);
    }

    const populatedTour = await Tour.findById(createdTour._id)
      .populate("destination")
      .populate("categories");

    const itineraries = await Itinerary.find({
      tour: createdTour._id,
    })
      .sort({ day: 1 })
      .lean();

    const itineraryIds = itineraries.map((item) => item._id);

    const visitTimes = await VisitTime.find({
      itinerary: { $in: itineraryIds },
    })
      .populate("attraction")
      .sort({ day: 1, session: 1, time: 1 })
      .lean();

    const itineraryWithActivities = itineraries.map((item) => {
      const activities = visitTimes
        .filter(
          (visit) =>
            visit.itinerary.toString() === item._id.toString()
        )
        .map((visit) => ({
          _id: visit._id,
          session: visit.session,
          time: visit.time,
          activityName: visit.note || "",
          attractionName: visit.attraction?.name || "",
          attraction: visit.attraction || null,
          note: visit.note || "",
        }));

      return {
        ...item,
        activities,
      };
    });

    res.status(201).json({
      success: true,
      message: `Tạo tour "${createdTour.name}" từ file PDF thành công!`,
      data: {
        ...populatedTour.toObject(),
        itinerary: itineraryWithActivities,
      },
    });
  } catch (error) {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error("Lỗi xóa file tạm khi xử lý lỗi:", cleanupError);
      }
    }

    console.error("Lỗi khi tạo tour từ PDF:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo tour từ PDF",
      error: error.message,
    });
  }
};