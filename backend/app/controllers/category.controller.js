import Category from "../models/category.model.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục thành công",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách danh mục",
      error: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin danh mục thành công",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin danh mục",
      error: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo danh mục",
      error: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật danh mục",
      error: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa danh mục",
      error: error.message,
    });
  }
};