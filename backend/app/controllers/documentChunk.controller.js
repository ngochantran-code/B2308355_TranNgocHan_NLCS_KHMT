import DocumentChunk from "../models/documentChunk.model.js";

export const getDocumentChunks = async (req, res) => {
  try {
    const chunks = await DocumentChunk.find()
      .populate("tour")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách dữ liệu vector thành công",
      data: chunks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách dữ liệu vector",
      error: error.message,
    });
  }
};

export const getDocumentChunkById = async (req, res) => {
  try {
    const chunk = await DocumentChunk.findById(req.params.id).populate("tour");

    if (!chunk) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu vector",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu vector thành công",
      data: chunk,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu vector",
      error: error.message,
    });
  }
};

export const getDocumentChunksByTour = async (req, res) => {
  try {
    const chunks = await DocumentChunk.find({
      tour: req.params.tourId,
    })
      .populate("tour")
      .sort({ "metadata.chunkIndex": 1 });

    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu vector theo tour thành công",
      data: chunks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy dữ liệu vector theo tour",
      error: error.message,
    });
  }
};

export const createDocumentChunk = async (req, res) => {
  try {
    const chunk = await DocumentChunk.create(req.body);

    const populatedChunk = await DocumentChunk.findById(chunk._id).populate(
      "tour"
    );

    res.status(201).json({
      success: true,
      message: "Tạo dữ liệu vector thành công",
      data: populatedChunk,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo dữ liệu vector",
      error: error.message,
    });
  }
};

export const updateDocumentChunk = async (req, res) => {
  try {
    const chunk = await DocumentChunk.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("tour");

    if (!chunk) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu vector",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật dữ liệu vector thành công",
      data: chunk,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật dữ liệu vector",
      error: error.message,
    });
  }
};

export const deleteDocumentChunk = async (req, res) => {
  try {
    const chunk = await DocumentChunk.findByIdAndDelete(req.params.id);

    if (!chunk) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu vector",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa dữ liệu vector thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa dữ liệu vector",
      error: error.message,
    });
  }
};