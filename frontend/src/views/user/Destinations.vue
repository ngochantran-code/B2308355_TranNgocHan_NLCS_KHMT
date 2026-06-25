<template>
  <div class="page">
    <Navbar />

    <main class="container main-content">
      <h1 class="section-title">Điểm đến</h1>

      <Loading v-if="loading" />

      <EmptyState
        v-else-if="destinations.length === 0"
        title="Chưa có điểm đến"
        message="Admin chưa thêm dữ liệu điểm đến."
      />

      <div v-else class="grid destination-grid">
        <div
          v-for="item in destinations"
          :key="item._id"
          class="card"
        >
          <h3>{{ item.name }}</h3>

          <p><strong>Tỉnh/Thành:</strong> {{ item.province }}</p>
          <p>{{ item.description }}</p>

          <RouterLink
            :to="`/search?destination=${item._id}`"
            class="btn btn-primary"
          >
            Xem tour
          </RouterLink>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

import Navbar from "../../components/layout/Navbar.vue";
import Footer from "../../components/layout/Footer.vue";
import Loading from "../../components/common/Loading.vue";
import EmptyState from "../../components/common/EmptyState.vue";

import { getDestinations } from "../../services/destinationApi";

const destinations = ref([]);
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;

  try {
    const res = await getDestinations();
    destinations.value = res.data.data;
  } catch (error) {
    destinations.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<style scoped>
.main-content {
  padding: 32px 0;
}

.destination-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
</style>