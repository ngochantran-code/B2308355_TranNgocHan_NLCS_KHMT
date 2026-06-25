import Destination from "../models/destination.model.js";

export const getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách địa điểm thành công",
      data: destinations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách địa điểm",
      error: error.message,
    });
  }
};

export const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin địa điểm thành công",
      data: destination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin địa điểm",
      error: error.message,
    });
  }
};

export const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo địa điểm thành công",
      data: destination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo địa điểm",
      error: error.message,
    });
  }
};

export const deleteAllDestinations = async (req, res) => {
  try {
    await Destination.deleteMany({});
    res.status(200).json({
      success: true,
      message: "Xóa tất cả địa điểm thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa tất cả địa điểm",
      error: error.message,
    });
  }
};

export const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật địa điểm thành công",
      data: destination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật địa điểm",
      error: error.message,
    });
  }
};

export const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa địa điểm thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa địa điểm",
      error: error.message,
    });
  }
};