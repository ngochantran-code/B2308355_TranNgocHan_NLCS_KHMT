import VisitTime from "../models/visitTime.model.js";

export const getVisitTimes = async (req, res) => {
  try {
    const visitTimes = await VisitTime.find()
      .populate("itinerary")
      .populate("attraction")
      .sort({ day: 1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách thời điểm tham quan thành công",
      data: visitTimes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách thời điểm tham quan",
      error: error.message,
    });
  }
};

export const getVisitTimeById = async (req, res) => {
  try {
    const visitTime = await VisitTime.findById(req.params.id)
      .populate("itinerary")
      .populate("attraction");

    if (!visitTime) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thời điểm tham quan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin thời điểm tham quan thành công",
      data: visitTime,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin thời điểm tham quan",
      error: error.message,
    });
  }
};

export const getVisitTimesByItinerary = async (req, res) => {
  try {
    const visitTimes = await VisitTime.find({
      itinerary: req.params.itineraryId,
    })
      .populate("itinerary")
      .populate("attraction")
      .sort({ day: 1 });

    res.status(200).json({
      success: true,
      message: "Lấy thời điểm tham quan theo lịch trình thành công",
      data: visitTimes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thời điểm tham quan theo lịch trình",
      error: error.message,
    });
  }
};

export const createVisitTime = async (req, res) => {
  try {
    const visitTime = await VisitTime.create(req.body);

    const populatedVisitTime = await VisitTime.findById(visitTime._id)
      .populate("itinerary")
      .populate("attraction");

    res.status(201).json({
      success: true,
      message: "Tạo thời điểm tham quan thành công",
      data: populatedVisitTime,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo thời điểm tham quan",
      error: error.message,
    });
  }
};

export const updateVisitTime = async (req, res) => {
  try {
    const visitTime = await VisitTime.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("itinerary")
      .populate("attraction");

    if (!visitTime) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thời điểm tham quan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thời điểm tham quan thành công",
      data: visitTime,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật thời điểm tham quan",
      error: error.message,
    });
  }
};

export const deleteVisitTime = async (req, res) => {
  try {
    const visitTime = await VisitTime.findByIdAndDelete(req.params.id);

    if (!visitTime) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thời điểm tham quan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa thời điểm tham quan thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa thời điểm tham quan",
      error: error.message,
    });
  }
};