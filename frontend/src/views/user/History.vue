<template>
  <div class="page">
    <Navbar />

    <main class="container main-content">
      <div class="history-header animate-fade-in">
        <h1 class="section-title">Lịch sử xem</h1>
        <p class="section-subtitle">Tất cả các tour du lịch bạn đã xem gần đây</p>
      </div>

      <Loading v-slot v-if="loading" />

      <div v-else-if="histories.length === 0" class="empty-history-container animate-fade-in">
        <div class="empty-icon-wrapper">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3>Chưa có lịch sử xem</h3>
        <p>Lịch sử các tour bạn đã xem sẽ được lưu giữ tại đây. Hãy bắt đầu tìm kiếm và khám phá các tour du lịch hấp dẫn!</p>
        <RouterLink to="/tours" class="btn btn-primary explore-btn">
          Khám phá Tour ngay
        </RouterLink>
      </div>

      <div v-else class="history-list-wrapper">
        <div class="history-actions animate-fade-in">
          <span class="history-count">Đã xem {{ histories.length }} tour</span>
        </div>

        <TransitionGroup name="list" tag="div" class="history-items">
          <div
            v-for="item in histories"
            :key="item._id"
            class="history-card"
          >
            <!-- Card Image -->
            <div class="card-image-section">
              <img :src="item.tour?.image || defaultImage" alt="Tour image" class="tour-image" />
              <span v-if="item.tour?.destination?.name" class="dest-tag">
                {{ item.tour.destination.name }}
              </span>
            </div>

            <!-- Card Info -->
            <div class="card-info-section">
              <div class="info-top">
                <RouterLink :to="`/tours/${item.tour?._id}`" class="tour-name-link">
                  {{ item.tour?.name || "Tour không xác định" }}
                </RouterLink>
                <span class="viewed-time" :title="formatTime(item.viewedAt)">
                  <svg class="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {{ formatRelativeTime(item.viewedAt) }}
                </span>
              </div>

              <p class="tour-description">{{ truncateDesc(item.tour?.description) }}</p>

              <div class="info-bottom">
                <div class="meta-group">
                  <div class="meta-item">
                    <span class="meta-label">Giá từ</span>
                    <span class="meta-value price-text">{{ formatPrice(item.tour?.price) }}</span>
                  </div>
                  <div class="meta-divider"></div>
                  <div class="meta-item">
                    <span class="meta-label">Thời lượng</span>
                    <span class="meta-value">{{ item.tour?.duration || "N/A" }}</span>
                  </div>
                  <div class="meta-divider"></div>
                  <div class="meta-item">
                    <span class="meta-label">Khởi hành</span>
                    <span class="meta-value">{{ item.tour?.departurePoint || "N/A" }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Section -->
            <div class="card-action-section">
              <button
                class="delete-btn"
                @click="handleDelete(item._id)"
                title="Xóa khỏi lịch sử"
                aria-label="Xóa khỏi lịch sử"
              >
                <svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
        </TransitionGroup>
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
import { authStore } from "../../stores/authStore";
import { getViewHistoriesByUser, deleteViewHistory } from "../../services/viewHistoryApi";

const histories = ref([]);
const loading = ref(false);

const defaultImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";

const formatPrice = (price) => {
  if (!price) return "Liên hệ";
  return price.toLocaleString("vi-VN") + " đ";
};

const truncateDesc = (text) => {
  if (!text) return "";
  return text.length > 120 ? text.substring(0, 120) + "..." : text;
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) {
    if (date.getDate() === now.getDate()) {
      return `Hôm nay lúc ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.getDate() === yesterday.getDate()) {
      return `Hôm qua lúc ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
    }
  }
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const fetchHistories = async () => {
  if (!authStore.user?._id) return;
  loading.value = true;
  try {
    const res = await getViewHistoriesByUser(authStore.user._id);
    // Filter out items without a valid tour object
    histories.value = (res.data?.data || []).filter(item => item.tour != null);
  } catch (error) {
    console.error("Lỗi khi tải lịch sử xem:", error);
    histories.value = [];
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id) => {
  try {
    await deleteViewHistory(id);
    histories.value = histories.value.filter(item => item._id !== id);
  } catch (error) {
    console.error("Lỗi khi xóa lịch sử xem:", error);
    alert("Không thể xóa lịch sử xem. Vui lòng thử lại.");
  }
};

onMounted(fetchHistories);
</script>

<style scoped>
.main-content {
  padding: 40px 0;
  max-width: 900px;
  flex: 1;
}

.history-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: "";
  display: block;
  width: 50px;
  height: 4px;
  background: linear-gradient(90deg, #0d9488, #0e7490);
  border-radius: 2px;
  margin-top: 4px;
}

.section-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

/* Empty State Styling */
.empty-history-container {
  background: white;
  border-radius: 16px;
  padding: 60px 24px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: #f0fdfa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0d9488;
  margin-bottom: 24px;
}

.empty-icon {
  width: 44px;
  height: 44px;
}

.empty-history-container h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px 0;
}

.empty-history-container p {
  font-size: 15px;
  color: #64748b;
  max-width: 480px;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.explore-btn {
  padding: 12px 28px;
  font-size: 15px;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.25);
  transition: all 0.2s;
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35);
}

/* History List actions */
.history-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-count {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 20px;
}

/* History Cards */
.history-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-card {
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
  border: 1px solid #f1f5f9;
  transition: transform 0.2s, box-shadow 0.2s;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

/* Image Section */
.card-image-section {
  position: relative;
  width: 200px;
  min-width: 200px;
  height: auto;
}

.tour-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dest-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(13, 148, 136, 0.9);
  backdrop-filter: blur(4px);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

/* Info Section */
.card-info-section {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.info-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.tour-name-link {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  transition: color 0.2s;
}

.tour-name-link:hover {
  color: #0d9488;
}

.viewed-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
}

.clock-icon {
  width: 14px;
  height: 14px;
}

.tour-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px 0;
  flex: 1;
}

.info-bottom {
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.meta-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.meta-value {
  font-size: 14px;
  color: #334155;
  font-weight: 600;
}

.price-text {
  color: #0d9488;
}

.meta-divider {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
}

/* Action Section */
.card-action-section {
  display: flex;
  align-items: center;
  padding-right: 20px;
}

.delete-btn {
  background: #fef2f2;
  color: #ef4444;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  transform: scale(1.05);
}

.trash-icon {
  width: 18px;
  height: 18px;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transition Group Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Responsive Styling */
@media (max-width: 768px) {
  .history-card {
    flex-direction: column;
  }

  .card-image-section {
    width: 100%;
    height: 160px;
  }

  .tour-image {
    height: 100%;
  }

  .card-info-section {
    padding: 16px;
  }

  .info-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .viewed-time {
    align-self: flex-start;
  }

  .meta-group {
    gap: 12px;
  }

  .meta-divider {
    display: none;
  }

  .meta-item {
    flex-direction: row;
    align-items: center;
    gap: 6px;
    width: 100%;
  }

  .meta-label {
    width: 80px;
  }

  .card-action-section {
    padding: 12px 16px;
    justify-content: flex-end;
    border-top: 1px solid #f1f5f9;
  }
  
  .delete-btn {
    width: 100%;
    border-radius: 8px;
    gap: 8px;
  }

  .delete-btn::after {
    content: "Xóa khỏi lịch sử";
    font-size: 13px;
    font-weight: 600;
  }
}
</style>
