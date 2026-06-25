<template>
  <form class="search-box" @submit.prevent="handleSearch">
    <input
      v-model="keyword"
      class="input"
      placeholder="Tìm tour: Đà Lạt, biển, 3 ngày 2 đêm..."
    />

    <button class="btn btn-primary">
      Tìm kiếm
    </button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const keyword = ref("");
const router = useRouter();

const handleSearch = () => {
  router.push({
    path: "/search",
    query: {
      keyword: keyword.value,
    },
  });
};
</script>

<style scoped>
.search-box {
  display: flex;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.search-box input {
  flex: 1;
}

@media (max-width: 640px) {
  .search-box {
    flex-direction: column;
  }
}
</style>