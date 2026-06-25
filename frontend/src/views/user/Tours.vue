<template>
  <div class="page">
    <Navbar />

    <main class="container main-content">
      <h1 class="section-title">Danh sách tour</h1>

      <TourSearch />

      <TourFilter
        :destinations="destinations"
        :categories="categories"
        @filter="handleFilter"
      />

      <Loading v-if="loading" />

      <EmptyState
        v-else-if="tours.length === 0"
        title="Không có tour"
        message="Chưa tìm thấy tour phù hợp."
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
import { onMounted, ref } from "vue";

import Navbar from "../../components/layout/Navbar.vue";
import Footer from "../../components/layout/Footer.vue";
import TourSearch from "../../components/tour/TourSearch.vue";
import TourFilter from "../../components/tour/TourFilter.vue";
import TourCard from "../../components/tour/TourCard.vue";
import Loading from "../../components/common/Loading.vue";
import EmptyState from "../../components/common/EmptyState.vue";

import { getTours } from "../../services/tourApi";
import { getDestinations } from "../../services/destinationApi";
import { getCategories } from "../../services/categoryApi";

const tours = ref([]);
const destinations = ref([]);
const categories = ref([]);
const loading = ref(false);

const fetchTours = async (params = {}) => {
  loading.value = true;

  try {
    const res = await getTours(params);
    tours.value = res.data.data;
  } catch (error) {
    tours.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchMeta = async () => {
  try {
    const [desRes, catRes] = await Promise.all([
      getDestinations(),
      getCategories(),
    ]);

    destinations.value = desRes.data.data;
    categories.value = catRes.data.data;
  } catch (error) {
    destinations.value = [];
    categories.value = [];
  }
};

const handleFilter = (filter) => {
  fetchTours(filter);
};

onMounted(() => {
  fetchTours();
  fetchMeta();
});
</script>

<style scoped>
.main-content {
  padding: 32px 0;
}

.tours-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
</style>