<template>
  <div class="empty">
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "Không có dữ liệu",
  },
  message: {
    type: String,
    default: "Hiện tại chưa có dữ liệu để hiển thị.",
  },
});
</script>

<style scoped>
.empty {
  padding: 32px;
  text-align: center;
  background: white;
  border-radius: 12px;
  color: #6b7280;
}

.empty h3 {
  margin: 0 0 8px;
  color: #111827;
}
</style>