<template>
  <div class="page register-page">
    <div class="register-card">
      <h1>Đăng ký tài khoản</h1>

      <form class="form" @submit.prevent="handleRegister">
        <div class="form-group">
          <input
            v-model="form.fullName"
            class="input"
            placeholder="Họ và tên"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <input
            v-model="form.email"
            class="input"
            type="email"
            placeholder="Email"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <input
            v-model="form.phone"
            class="input"
            type="tel"
            placeholder="Số điện thoại"
            :disabled="loading"
          />
        </div>

        <div class="form-group password-input-container">
          <input
            v-model="form.password"
            class="input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Mật khẩu"
            required
            :disabled="loading"
          />
          <button
            type="button"
            class="toggle-password-btn"
            @click="showPassword = !showPassword"
          >
            <svg v-if="!showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>

        <div class="form-group password-input-container">
          <input
            v-model="form.confirmPassword"
            class="input"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Xác nhận mật khẩu"
            required
            :disabled="loading"
          />
          <button
            type="button"
            class="toggle-password-btn"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <svg v-if="!showConfirmPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>

        <button class="btn btn-primary" :disabled="loading">
          <span v-if="loading">Đang đăng ký...</span>
          <span v-else>Đăng ký</span>
        </button>

        <p v-if="error" class="error">
          {{ error }}
        </p>
        <p v-if="success" class="success-msg">
          {{ success }}
        </p>
      </form>

      <div class="auth-links">
        <RouterLink to="/login" class="login-link">
          Đã có tài khoản? Đăng nhập ngay
        </RouterLink>
        <br />
        <RouterLink to="/" class="back-link">
          Về trang chủ
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { register } from "../../services/authApi.js";

const router = useRouter();
const error = ref("");
const success = ref("");
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const handleRegister = async () => {
  error.value = "";
  success.value = "";

  if (form.password !== form.confirmPassword) {
    error.value = "Mật khẩu xác nhận không khớp";
    return;
  }

  loading.value = true;
  try {
    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    };

    await register(payload);

    success.value = "Đăng ký tài khoản thành công! Đang chuyển hướng...";

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f0fdfa;
}

.register-card {
  width: min(450px, 92%);
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.register-card h1 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.form-group {
  margin-bottom: 12px;
}

.error {
  color: #dc2626;
  font-weight: 600;
  margin-top: 10px;
  font-size: 14px;
}

.success-msg {
  color: #16a34a;
  font-weight: 600;
  margin-top: 10px;
  font-size: 14px;
}

.auth-links {
  margin-top: 20px;
  text-align: center;
}

.login-link, .back-link {
  display: inline-block;
  margin-top: 8px;
  color: #0d9488;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.2s;
}

.login-link:hover, .back-link:hover {
  color: #0f766e;
}

.password-input-container {
  position: relative;
}

.password-input-container .input {
  padding-right: 42px;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: color 0.2s;
}

.toggle-password-btn:hover {
  color: #1e293b;
}

.eye-icon {
  width: 20px;
  height: 20px;
}
</style>
