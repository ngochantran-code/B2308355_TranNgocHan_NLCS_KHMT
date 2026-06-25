<template>
  <header class="navbar">
    <div class="container nav-inner">
      <RouterLink to="/" class="logo-container">
        <img src="@/assets/logo_tour.png" alt="TourPilot Logo" class="logo-img" />
        <span class="logo-text">TourPilot</span>
      </RouterLink>

      <nav>
        <RouterLink to="/">Trang chủ</RouterLink>
        <RouterLink to="/tours">Tour</RouterLink>
        <RouterLink to="/destinations">Điểm đến</RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" to="/history">Lịch sử xem</RouterLink>
        <RouterLink v-if="authStore.isAdmin" to="/admin">Admin</RouterLink>
        
        <template v-if="authStore.isAuthenticated">
          <span class="welcome-text">Xin chào, {{ authStore.user?.fullName }}</span>
          <button class="logout-btn" @click="handleLogout">Đăng xuất</button>
        </template>
        <RouterLink v-else to="/login">Đăng nhập</RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { authStore } from "../../stores/authStore";
import { useRouter } from "vue-router";

const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 20;
}

.nav-inner {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  height: 38px;
  width: auto;
  object-fit: contain;
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  color: #0d9488;
}

nav {
  display: flex;
  gap: 18px;
}

nav a {
  font-weight: 600;
  color: #374151;
}

nav a.router-link-active {
  color: #0d9488;
}

@media (max-width: 768px) {
  .nav-inner {
    height: auto;
    padding: 14px 0;
    flex-direction: column;
    gap: 12px;
  }

  nav {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.welcome-text {
  font-weight: 500;
  color: #4b5563;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.logout-btn {
  background: none;
  border: none;
  font-weight: 600;
  color: #ef4444;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  transition: color 0.2s;
}

.logout-btn:hover {
  color: #dc2626;
}
</style>