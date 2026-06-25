<template>
  <div v-if="show" class="overlay">
    <div class="modal">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>

      <div class="actions">
        <button class="btn btn-secondary" @click="$emit('cancel')">
          Hủy
        </button>

        <button class="btn btn-danger" @click="$emit('confirm')">
          Xác nhận
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Xác nhận",
  },
  message: {
    type: String,
    default: "Bạn có chắc muốn thực hiện thao tác này?",
  },
});

defineEmits(["confirm", "cancel"]);
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 100;
}

.modal {
  width: min(420px, 92%);
  background: white;
  padding: 24px;
  border-radius: 14px;
}

.modal h3 {
  margin-top: 0;
}
</style>