<template>
  <aside class="sidebar">
    <h2>Admin</h2>

    <RouterLink to="/admin">Dashboard</RouterLink>
    <RouterLink to="/admin/tours">Quản lý tour</RouterLink>
    <RouterLink to="/admin/destinations">Địa điểm</RouterLink>
    <RouterLink to="/admin/categories">Danh mục</RouterLink>
    <RouterLink to="/admin/attractions">Điểm tham quan</RouterLink>
    <RouterLink to="/admin/itineraries">Lịch trình</RouterLink>
    <RouterLink to="/admin/users">Quản lý thành viên</RouterLink>

    <button class="logout" @click="logout">
      Đăng xuất
    </button>
  </aside>
</template>

<script setup>
import { useRouter } from "vue-router";
import { authStore } from "../../stores/authStore";

const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push("/");
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #111827;
  color: white;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100vh;
}

.sidebar h2 {
  margin: 0 0 16px;
  color: #2dd4bf;
}

.sidebar a {
  color: white;
  padding: 10px 12px;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.sidebar a.router-link-active,
.sidebar a:hover {
  background: #0d9488;
}

.logout {
  margin-top: auto;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    min-height: auto;
  }
}
</style>