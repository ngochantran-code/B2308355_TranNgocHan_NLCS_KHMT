<template>
  <div class="page">
    <Navbar />

    <section class="hero">
      <div class="container">
        <h1>Khám phá hành trình dành riêng cho bạn</h1>

        <p>
          Tìm kiếm tour, khám phá điểm đến và nhận những gợi ý phù hợp với sở thích của bạn.
        </p>

        <TourSearch />
      </div>
    </section>

    <section class="container content-section">
      <h2 class="section-title">Tour nổi bật</h2>

      <Loading v-if="loading" />

      <EmptyState
        v-else-if="tours.length === 0"
        title="Chưa có tour"
        message="Admin chưa thêm dữ liệu tour."
      />

      <div v-else class="grid tours-grid">
        <TourCard
          v-for="tour in tours"
          :key="tour._id"
          :tour="tour"
        />
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

import Navbar from "../../components/layout/Navbar.vue";
import Footer from "../../components/layout/Footer.vue";
import TourSearch from "../../components/tour/TourSearch.vue";
import TourCard from "../../components/tour/TourCard.vue";
import Loading from "../../components/common/Loading.vue";
import EmptyState from "../../components/common/EmptyState.vue";

import { getTours } from "../../services/tourApi";

const tours = ref([]);
const loading = ref(false);

const fetchTours = async () => {
  loading.value = true;

  try {
    const res = await getTours({ status: "active" });
    tours.value = res.data.data.slice(0, 6);
  } catch (error) {
    tours.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTours);
</script>

<style scoped>
.hero {
  padding: 80px 0;
  background: linear-gradient(135deg, #ccfbf1, #f0fdfa);
  text-align: center;
}

.hero h1 {
  font-size: 44px;
  margin: 0 0 12px;
}

.hero p {
  color: #4b5563;
  margin-bottom: 28px;
}

.content-section {
  padding: 36px 0;
}

.tours-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
</style>