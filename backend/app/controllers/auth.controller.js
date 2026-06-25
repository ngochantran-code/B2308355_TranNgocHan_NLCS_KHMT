import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được đăng ký",
      });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        token: generateToken(user._id),
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi đăng ký tài khoản",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email và mật khẩu",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        token: generateToken(user._id),
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi đăng nhập",
      error: error.message,
    });
  }
};
