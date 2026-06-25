<template>
  <div class="page">
    <Navbar />

    <main class="container main-content">
      <h1 class="section-title">Kết quả tìm kiếm</h1>

      <p>
        Từ khóa:
        <strong>{{ keyword || "Tất cả" }}</strong>
      </p>

      <Loading v-if="loading" />

      <EmptyState
        v-else-if="tours.length === 0"
        title="Không tìm thấy tour"
        message="Bạn thử tìm từ khóa khác hoặc hỏi chatbot để được tư vấn."
      />

      <div v-else class="grid tours-grid">
        <TourCard
          v-for="tour in tours"
          :key="tour._id"
          :tour="tour"
        />
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import Navbar from "../../components/layout/Navbar.vue";
import Footer from "../../components/layout/Footer.vue";
import TourCard from "../../components/tour/TourCard.vue";
import Loading from "../../components/common/Loading.vue";
import EmptyState from "../../components/common/EmptyState.vue";

import { searchTours } from "../../services/searchApi";

const route = useRoute();

const keyword = ref("");
const tours = ref([]);
const loading = ref(false);

const fetchResults = async () => {
  keyword.value = route.query.keyword || "";
  loading.value = true;

  try {
    const res = await searchTours({
      keyword: keyword.value,
      destination: route.query.destination || "",
      category: route.query.category || "",
    });

    tours.value = res.data.data;
  } catch (error) {
    tours.value = [];
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.query,
  () => fetchResults(),
  { deep: true }
);

onMounted(fetchResults);
</script>

<style scoped>
.main-content {
  padding: 32px 0;
}

.tours-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
</style>