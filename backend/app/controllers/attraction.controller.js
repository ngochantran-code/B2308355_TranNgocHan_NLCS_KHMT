import Attraction from "../models/attraction.model.js";

export const getAttractions = async (req, res) => {
  try {
    const { destination, keyword, status } = req.query;

    const filter = {};

    if (destination) {
      filter.destination = destination;
    }

    if (status) {
      filter.status = status;
    }

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const attractions = await Attraction.find(filter)
      .populate("destination")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách địa điểm tham quan thành công",
      data: attractions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách địa điểm tham quan",
      error: error.message,
    });
  }
};

export const getAttractionById = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id).populate(
      "destination"
    );

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm tham quan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin địa điểm tham quan thành công",
      data: attraction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin địa điểm tham quan",
      error: error.message,
    });
  }
};

export const createAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.create(req.body);

    const populatedAttraction = await Attraction.findById(
      attraction._id
    ).populate("destination");

    res.status(201).json({
      success: true,
      message: "Tạo địa điểm tham quan thành công",
      data: populatedAttraction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo địa điểm tham quan",
      error: error.message,
    });
  }
};

export const updateAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("destination");

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm tham quan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật địa điểm tham quan thành công",
      data: attraction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật địa điểm tham quan",
      error: error.message,
    });
  }
};

export const deleteAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findByIdAndDelete(req.params.id);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa điểm tham quan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa địa điểm tham quan thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa địa điểm tham quan",
      error: error.message,
    });
  }
};

export const deleteAllAttractions = async (req, res) => {
  try {
    await Attraction.deleteMany({});
    res.status(200).json({
      success: true,
      message: "Xóa tất cả địa điểm tham quan thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa tất cả địa điểm tham quan",
      error: error.message,
    });
  }
};