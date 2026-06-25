<template>
  <div class="tour-card card">
    <div class="card-image-wrapper">
      <img :src="tour.image || defaultImage" alt="Tour image" class="card-image" />
      <span v-if="tour.destination" class="destination-badge">
        {{ tour.destination.name }}
      </span>
    </div>
    
    <div class="card-content">
      <h3 class="tour-title">{{ tour.name }}</h3>
      
      <p class="tour-desc">{{ truncateDesc(tour.description) }}</p>
      
      <div class="tour-meta">
        <span class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ tour.duration }}
        </span>
        <span v-if="tour.departurePoint" class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon">
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {{ tour.departurePoint }}
        </span>
      </div>
      
      <div class="card-footer">
        <div class="tour-price">
          <span class="price-label">Giá từ</span>
          <span class="price-value">{{ formatPrice(tour.price) }}</span>
        </div>
        
        <RouterLink :to="'/tours/' + tour._id" class="btn btn-primary detail-btn">
          Chi tiết
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tour: {
    type: Object,
    required: true
  }
});

const defaultImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";

const formatPrice = (price) => {
  if (!price) return "Liên hệ";
  return price.toLocaleString("vi-VN") + " đ";
};

const truncateDesc = (text) => {
  if (!text) return "";
  if (text.length <= 80) return text;
  return text.substring(0, 80) + "...";
};
</script>

<style scoped>
.tour-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tour-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.tour-card:hover .card-image {
  transform: scale(1.06);
}

.destination-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(13, 148, 136, 0.9);
  backdrop-filter: blur(4px);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tour-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 50px;
}

.tour-desc {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.5;
  flex: 1;
}

.tour-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 16px;
  height: 16px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}

.tour-price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.price-value {
  font-size: 17px;
  font-weight: 700;
  color: #0d9488;
}

.detail-btn {
  padding: 8px 16px;
  font-size: 14px;
}
</style>