<template>
  <div class="page login-page">
    <div class="login-card">
      <h1>Đăng nhập</h1>

      <form class="form" @submit.prevent="handleLogin">
        <input
          v-model="form.email"
          class="input"
          placeholder="Email"
        />

        <div class="password-input-container">
          <input
            v-model="form.password"
            class="input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Mật khẩu"
            required
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

        <button class="btn btn-primary">
          Đăng nhập
        </button>

        <p v-if="error" class="error">
          {{ error }}
        </p>
      </form>

      <div class="auth-links">
        <RouterLink to="/register" class="register-link">
          Chưa có tài khoản? Đăng ký ngay
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

import { login } from "../../services/authApi.js";
import { authStore } from "../../stores/authStore.js";

const router = useRouter();
const error = ref("");
const showPassword = ref(false);

const form = reactive({
  email: "",
  password: "",
});

const handleLogin = async () => {
  error.value = "";

  try {
    const res = await login(form);
    const { user, token } = res.data.data;

    authStore.setAuth(user, token);
    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  } catch (err) {
    error.value = "Đăng nhập thất bại";
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f0fdfa;
}

.login-card {
  width: min(420px, 92%);
  background: white;
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.login-card h1 {
  margin-top: 0;
}

.hint {
  color: #6b7280;
}

.error {
  color: #dc2626;
  font-weight: 600;
}

.auth-links {
  margin-top: 20px;
  text-align: center;
}

.register-link, .back-link {
  display: inline-block;
  margin-top: 8px;
  color: #0d9488;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.2s;
}

.register-link:hover, .back-link:hover {
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