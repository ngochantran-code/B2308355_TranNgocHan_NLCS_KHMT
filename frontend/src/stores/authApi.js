import api from "./api.js";

export const login = async ({ email, password }) => {
  // Tài khoản demo cho admin
  if (email === "admin@gmail.com" && password === "123456") {
    return {
      data: {
        success: true,
        message: "Đăng nhập demo thành công",
        data: {
          token: "demo-admin-token",
          user: {
            fullName: "Admin",
            email,
            role: "admin",
          },
        },
      },
    };
  }

  // Nếu sau này backend có API login thật
  return api.post("/auth/login", { email, password });
};