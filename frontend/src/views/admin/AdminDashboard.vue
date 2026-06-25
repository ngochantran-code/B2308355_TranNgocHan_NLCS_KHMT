<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-content">
      <h1>Dashboard</h1>
      <router-link to="/" class="back-home">
        <button class="back-button" aria-label="Quay lại trang chủ">
          <span class="icon-arrow-left">←</span>
          <span class="back-text">Quay lại trang chủ</span>
        </button>
      </router-link>

      <div class="grid stats">
        <div class="card">
          <h3>Tổng tour</h3>
          <strong>{{ tours.length }}</strong>
        </div>

        <div class="card">
          <h3>Tổng địa điểm</h3>
          <strong>{{ destinations.length }}</strong>
        </div>

        <div class="card">
          <h3>Tổng danh mục</h3>
          <strong>{{ categories.length }}</strong>
        </div>
      </div>

      <!-- Tour list -->
      <section class="tour-section">
        <h2>Danh sách tour</h2>
        <div v-if="tours.length === 0" class="empty-state">Không có tour nào.</div>
        <div v-else class="grid tours-grid">
          <TourCard v-for="tour in tours" :key="tour._id" :tour="tour" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

import AdminSidebar from "../../components/layout/AdminSidebar.vue";
import TourCard from "../../components/tour/TourCard.vue";

import { getTours } from "../../services/tourApi";
import { getDestinations } from "../../services/destinationApi";
import { getCategories } from "../../services/categoryApi";

const tours = ref([]);
const destinations = ref([]);
const categories = ref([]);

onMounted(async () => {
  try {
    const [tourRes, desRes, catRes] = await Promise.all([
      getTours(),
      getDestinations(),
      getCategories(),
    ]);

    tours.value = tourRes.data.data;
    console.log('Fetched tours:', tours.value);
    destinations.value = desRes.data.data;
    categories.value = catRes.data.data;
  } catch (error) {
    tours.value = [];
    destinations.value = [];
    categories.value = [];
  }
});
</script>

<style scoped>
.stats {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.card strong {
  font-size: 36px;
  color: #0d9488;
}
.back-button {
  background: #0d9488;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button .icon-arrow-left {
  width: 20px;
  height: 20px;
}

.tours-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-top: 24px;
}
</style>