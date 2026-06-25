import ViewHistory from "../models/viewHistory.model.js";

export const getViewHistories = async (req, res) => {
  try {
    const histories = await ViewHistory.find()
      .populate("user", "-password")
      .populate("tour")
      .sort({ viewedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách lịch sử xem thành công",
      data: histories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách lịch sử xem",
      error: error.message,
    });
  }
};

export const getViewHistoryById = async (req, res) => {
  try {
    const history = await ViewHistory.findById(req.params.id)
      .populate("user", "-password")
      .populate("tour");

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch sử xem",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin lịch sử xem thành công",
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin lịch sử xem",
      error: error.message,
    });
  }
};

export const getViewHistoriesByUser = async (req, res) => {
  try {
    const histories = await ViewHistory.find({
      user: req.params.userId,
    })
      .populate("user", "-password")
      .populate({
        path: "tour",
        populate: [
          { path: "destination" },
          { path: "categories" },
        ],
      })
      .sort({ viewedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy lịch sử xem theo người dùng thành công",
      data: histories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch sử xem theo người dùng",
      error: error.message,
    });
  }
};

export const createViewHistory = async (req, res) => {
  try {
    const { user, tour } = req.body;

    const history = await ViewHistory.findOneAndUpdate(
      { user, tour },
      { viewedAt: new Date() },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    )
      .populate("user", "-password")
      .populate("tour");

    res.status(201).json({
      success: true,
      message: "Lưu lịch sử xem thành công",
      data: history,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi lưu lịch sử xem",
      error: error.message,
    });
  }
};

export const deleteViewHistory = async (req, res) => {
  try {
    const history = await ViewHistory.findByIdAndDelete(req.params.id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch sử xem",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa lịch sử xem thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa lịch sử xem",
      error: error.message,
    });
  }
};