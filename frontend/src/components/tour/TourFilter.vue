<template>
  <div class="filter-box">
    <select v-model="localFilter.destination" class="select">
      <option value="">Tất cả điểm đến</option>

      <option
        v-for="item in destinations"
        :key="item._id"
        :value="item._id"
      >
        {{ item.name }}
      </option>
    </select>

    <select v-model="localFilter.category" class="select">
      <option value="">Tất cả loại hình tour</option>

      <option
        v-for="item in categories"
        :key="item._id"
        :value="item._id"
      >
        {{ item.name }}
      </option>
    </select>

    <button class="btn btn-primary" @click="$emit('filter', localFilter)">
      Lọc
    </button>
  </div>
</template>

<script setup>
import { reactive } from "vue";

defineProps({
  destinations: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["filter"]);

const localFilter = reactive({
  destination: "",
  category: "",
});
</script>

<style scoped>
.filter-box {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  margin: 16px 0;
}

@media (max-width: 768px) {
  .filter-box {
    grid-template-columns: 1fr;
  }
}
</style>