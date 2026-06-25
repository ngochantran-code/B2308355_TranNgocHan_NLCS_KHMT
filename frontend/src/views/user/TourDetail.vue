<template>
  <div class="page">
    <Navbar />

    <main class="container main-content">
      <Loading v-if="loading" />

      <div v-else-if="tour" class="detail">
        <img :src="tour.image || defaultImage" alt="tour" class="cover" />

        <div class="card">
          <h1>{{ tour.name }}</h1>

          <p>{{ tour.description }}</p>

          <p><strong>Giá:</strong> {{ formatPrice(tour.price) }}</p>
          <p><strong>Thời lượng:</strong> {{ tour.duration }}</p>
          <p><strong>Khởi hành:</strong> {{ tour.departurePoint }}</p>
          <p><strong>Phương tiện:</strong> {{ formatTransport(tour.transport) }}</p>
          <p><strong>Điểm đến:</strong> {{ tour.destination?.name }}</p>

          <RouterLink to="/chatbot" class="btn btn-primary">
            Hỏi Pilo về tour này
          </RouterLink>
        </div>

        <section class="card">
          <h2>Lịch trình chi tiết</h2>

          <EmptyState
            v-if="itineraries.length === 0"
            title="Chưa có lịch trình"
            message="Admin chưa nhập lịch trình cho tour này."
          />

          <div
            v-for="item in itineraries"
            :key="item._id"
            class="itinerary"
          >
            <h3>Ngày {{ item.day }}: {{ item.title }}</h3>
            <p>{{ item.content }}</p>
            <p><strong>Phương tiện:</strong> {{ formatTransport(item.transport) }}</p>
          </div>
        </section>
      </div>

      <EmptyState
        v-else
        title="Không tìm thấy tour"
        message="Tour này không tồn tại hoặc đã bị xóa."
      />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import Navbar from "../../components/layout/Navbar.vue";
import Footer from "../../components/layout/Footer.vue";
import Loading from "../../components/common/Loading.vue";
import EmptyState from "../../components/common/EmptyState.vue";

import { getTourById } from "../../services/tourApi";
import { getItinerariesByTour } from "../../services/itineraryApi";
import { createViewHistory } from "../../services/viewHistoryApi";
import { authStore } from "../../stores/authStore";

const route = useRoute();

const tour = ref(null);
const itineraries = ref([]);
const loading = ref(false);

const defaultImage =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200";

const formatPrice = (price) => {
  if (!price) return "Liên hệ";
  return price.toLocaleString("vi-VN") + " VNĐ";
};

const TRANSPORT_LABELS = {
  car: "Xe ô tô",
  bus: "Xe buýt",
  plane: "Máy bay",
  train: "Tàu hỏa",
  ship: "Tàu thủy",
  walk: "Đi bộ",
  mixed: "Kết hợp nhiều loại",
};

const formatTransport = (val) => TRANSPORT_LABELS[val] || val || "—";

const fetchDetail = async () => {
  loading.value = true;

  try {
    const [tourRes, itineraryRes] = await Promise.all([
      getTourById(route.params.id),
      getItinerariesByTour(route.params.id),
    ]);

    tour.value = tourRes.data.data;
    itineraries.value = itineraryRes.data.data;

    if (authStore.isAuthenticated && authStore.user?._id && tour.value?._id) {
      try {
        await createViewHistory({
          user: authStore.user._id,
          tour: tour.value._id,
        });
      } catch (err) {
        console.error("Lỗi khi lưu lịch sử xem:", err);
      }
    }
  } catch (error) {
    tour.value = null;
    itineraries.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDetail);
</script>

<style scoped>
.main-content {
  padding: 32px 0;
}

.detail {
  display: grid;
  gap: 20px;
}

.cover {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  border-radius: 16px;
}

.itinerary {
  padding: 14px 0;
  border-bottom: 1px solid #e5e7eb;
}

.itinerary:last-child {
  border-bottom: none;
}
</style>