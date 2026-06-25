import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import DocumentChunk from "../models/documentChunk.model.js";
import Tour from "../models/tour.model.js";
import { askChatbotService } from "../services/chatbot.service.js";
import { splitTextIntoChunks } from "../utils/textSplitter.js";
import { createEmbedding } from "../services/embedding.service.js";

export const askChatbot = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập câu hỏi",
      });
    }

    const result = await askChatbotService(question);

    res.status(200).json({
      success: true,
      message: "Chatbot trả lời thành công",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý chatbot:", error);
    res.status(200).json({
      success: true,
      message: "Chatbot trả lời (fallback hệ thống)",
      data: {
        question,
        answer: "Xin lỗi bạn, hệ thống tư vấn tự động hiện đang bận hoặc gặp sự cố kết nối. Bạn vui lòng quay lại sau ít phút hoặc liên hệ trực tiếp hotline để được hỗ trợ nhanh nhất nhé!",
        relatedTours: [],
        relatedChunks: [],
      },
    });
  }
};

export const ingestTourDocument = async (req, res) => {
  let tempFilePath = null;
  try {
    const { tour } = req.body;
    let content = "";
    let fileName = "";

    if (!tour) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn tour",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng tải lên file tài liệu (PDF, TXT hoặc MD)",
      });
    }

    tempFilePath = req.file.path;
    fileName = req.file.originalname;
    const ext = path.extname(tempFilePath).toLowerCase();

    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(tempFilePath);
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();
      content = data.text;
    } else if (ext === ".txt" || ext === ".md") {
      content = fs.readFileSync(tempFilePath, "utf-8");
    } else {
      fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        success: false,
        message: "Định dạng file không được hỗ trợ. Chỉ cho phép file PDF, TXT hoặc MD.",
      });
    }

    if (!content || content.trim() === "") {
      fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        success: false,
        message: "Tài liệu trống hoặc không thể đọc được nội dung",
      });
    }

    const chunks = await splitTextIntoChunks(content, 500, 80);

    // Xóa các chunk cũ của tour này trước khi nạp tài liệu mới
    await DocumentChunk.deleteMany({ tour });

    const tourDoc = await Tour.findById(tour).populate("destination");
    const destName = (tourDoc && tourDoc.destination) ? tourDoc.destination.name : "";
    const nameOfTour = tourDoc ? tourDoc.name : "";

    const documents = [];
    for (let i = 0; i < chunks.length; i++) {
      let embedding = [];
      try {
        embedding = await createEmbedding(chunks[i]);
      } catch (err) {
        console.error("Lỗi khi tạo embedding:", err.message);
      }

      documents.push({
        tour,
        content: chunks[i],
        embedding,
        source: "uploaded_document",
        metadata: {
          fileName,
          chunkIndex: i,
          tourName: destName || nameOfTour,
          destinationName: destName,
        },
      });
    }

    const savedChunks = await DocumentChunk.insertMany(documents);

    // Xóa file tạm
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      console.error("Lỗi khi xóa file tạm:", cleanupError);
    }

    res.status(201).json({
      success: true,
      message: `Đã nạp thành công ${savedChunks.length} chunks tài liệu từ file ${fileName}`,
      data: savedChunks,
    });
  } catch (error) {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error("Lỗi khi xóa file tạm khi có lỗi xảy ra:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi nạp tài liệu tour",
      error: error.message,
    });
  }
};