import api from "./api.js";

export const login = async ({ email, password }) => {
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

  return api.post("/auth/login", { email, password });
};

export const register = (userData) => {
  return api.post("/auth/register", userData);
};