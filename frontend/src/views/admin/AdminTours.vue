<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-content">
      <h1>Quản lý tour du lịch</h1>

      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'pdf' }"
          @click="activeTab = 'pdf'"
          type="button"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Tạo nhanh bằng PDF
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'manual' }"
          @click="activeTab = 'manual'"
          type="button"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
          </svg>
          {{ editingId ? "Chỉnh sửa tour" : "Nhập thủ công" }}
        </button>
      </div>

      <div class="card form-card">
        <!-- PDF Auto Import Tab -->
        <div v-show="activeTab === 'pdf'" class="pdf-import-tab">
          <div v-if="pdfLoading" class="pdf-loading-overlay">
            <div class="spinner"></div>
            <p class="loading-text">Hệ thống đang phân tích dữ liệu PDF và tạo tour...</p>
            <p class="loading-subtext">Quá trình này có thể mất vài giây để chiết xuất thông tin lịch trình và tạo tài liệu.</p>
          </div>

          <form v-else class="form" @submit.prevent="handlePDFUpload">
            <div class="form-group">
              <label class="label">Tải lên tài liệu Tour (PDF):</label>
              <div class="file-upload-wrapper">
                <input
                  type="file"
                  ref="pdfInput"
                  accept=".pdf"
                  @change="handlePDFChange"
                  class="file-input-hidden"
                />
                <div 
                  class="file-upload-dropzone" 
                  :class="{ 'drag-over': isDragOver }"
                  @click="triggerPDFInput"
                  @dragover.prevent="isDragOver = true"
                  @dragleave.prevent="isDragOver = false"
                  @drop.prevent="handlePDFDrop"
                >
                  <svg class="pdf-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 9V8C3 5.79086 4.79086 4 7 4H14L21 11V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div v-if="!pdfFile" class="dropzone-text">
                    <span class="highlight">Click để chọn</span> hoặc kéo thả file PDF tour vào đây
                  </div>
                  <div v-else class="dropzone-selected">
                    <span class="file-name">{{ pdfFile.name }}</span>
                    <span class="file-size">({{ formatBytes(pdfFile.size) }})</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="uploadError" class="error-box animate-fade-in">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ uploadError }}</span>
            </div>

            <button class="btn btn-primary" :disabled="!pdfFile">
              Bắt đầu tạo Tour
            </button>
          </form>
        </div>

        <!-- Manual Form Tab -->
        <div v-show="activeTab === 'manual'">
          <form class="form" @submit.prevent="save">
            <div class="form-grid">
              <input
                v-model="form.name"
                class="input"
                placeholder="Tên tour du lịch"
              />

              <input
                v-model="form.departurePoint"
                class="input"
                placeholder="Điểm khởi hành"
              />

              <input
                v-model="form.duration"
                class="input"
                placeholder="Thời gian (VD: 3 ngày 2 đêm)"
              />

              <input
                v-model.number="form.price"
                class="input"
                type="number"
                min="0"
                placeholder="Giá tour (VND)"
              />

              <select v-model="form.transport" class="select">
                <option value="mixed">Kết hợp nhiều loại</option>
                <option value="plane">Máy bay</option>
                <option value="bus">Xe buýt</option>
                <option value="car">Xe ô tô</option>
                <option value="train">Tàu hỏa</option>
                <option value="ship">Tàu thủy</option>
                <option value="walk">Đi bộ</option>
              </select>

              <select v-model="form.status" class="select">
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
                <option value="draft">Nháp</option>
              </select>

              <select v-model="form.destination" class="select">
                <option value="">Chọn địa điểm</option>
                <option
                  v-for="d in destinations"
                  :key="d._id"
                  :value="d._id"
                >
                  {{ d.name }}
                </option>
              </select>

              <input
                v-model="form.image"
                class="input"
                placeholder="Đường dẫn hình ảnh"
              />
            </div>

            <div class="form-group">
              <label class="group-title">Danh mục:</label>
              <div class="checkbox-group">
                <label
                  v-for="c in categories"
                  :key="c._id"
                  class="checkbox-label"
                >
                  <input
                    type="checkbox"
                    :value="c._id"
                    v-model="form.categories"
                  />
                  {{ c.name }}
                </label>
              </div>
            </div>

            <textarea
              v-model="form.description"
              class="textarea"
              placeholder="Mô tả chi tiết tour du lịch"
            ></textarea>

            <div class="actions">
              <button class="btn btn-primary">
                {{ editingId ? "Cập nhật" : "Thêm tour du lịch" }}
              </button>
              <button
                v-if="editingId"
                type="button"
                class="btn btn-secondary"
                @click="reset"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Tên Tour</th>
              <th>Khởi hành</th>
              <th>Thời gian</th>
              <th>Giá</th>
              <th>Địa điểm</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in tours" :key="item._id">
              <td>{{ item.name }}</td>
              <td>{{ item.departurePoint }}</td>
              <td>{{ item.duration }}</td>
              <td>{{ formatPrice(item.price) }}</td>
              <td>{{ item.destination?.name || "Chưa chọn" }}</td>

              <td class="actions">
                <button class="btn btn-secondary" @click="edit(item)">
                  Sửa
                </button>

                <button class="btn btn-danger" @click="remove(item._id)">
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";

import AdminSidebar from "../../components/layout/AdminSidebar.vue";

import {
  getTours,
  createTour,
  updateTour,
  deleteTour,
  uploadTourPDF,
} from "../../services/tourApi";

import { getDestinations } from "../../services/destinationApi";
import { getCategories } from "../../services/categoryApi";

const tours = ref([]);
const destinations = ref([]);
const categories = ref([]);
const editingId = ref(null);

const activeTab = ref("pdf");
const pdfFile = ref(null);
const pdfInput = ref(null);
const isDragOver = ref(false);
const pdfLoading = ref(false);
const uploadError = ref("");

const triggerPDFInput = () => {
  if (pdfInput.value) {
    pdfInput.value.click();
  }
};

const handlePDFChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      pdfFile.value = file;
      uploadError.value = "";
    } else {
      alert("Chỉ cho phép tải lên file PDF");
      pdfFile.value = null;
    }
  }
};

const handlePDFDrop = (e) => {
  isDragOver.value = false;
  const file = e.dataTransfer.files[0];
  if (file) {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      pdfFile.value = file;
      uploadError.value = "";
    } else {
      alert("Chỉ cho phép tải lên file PDF");
    }
  }
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const handlePDFUpload = async () => {
  if (!pdfFile.value) return;
  pdfLoading.value = true;
  uploadError.value = "";
  try {
    const formData = new FormData();
    formData.append("file", pdfFile.value);
    
    await uploadTourPDF(formData);
    
    alert("Tạo tour du lịch và nhập lịch trình chi tiết bằng AI thành công!");
    pdfFile.value = null;
    if (pdfInput.value) pdfInput.value.value = "";
    fetchData();
  } catch (err) {
    console.error("Lỗi khi tải file PDF tour:", err);
    const apiMsg = err.response?.data?.message;
    const apiErr = err.response?.data?.error;
    uploadError.value = apiErr ? `${apiMsg}: ${apiErr}` : (apiMsg || "Có lỗi xảy ra trong quá trình xử lý file PDF bằng AI. Vui lòng cấu hình khóa API hoặc thử lại.");
  } finally {
    pdfLoading.value = false;
  }
};

const form = reactive({
  name: "",
  departurePoint: "",
  duration: "",
  price: "",
  transport: "mixed",
  image: "",
  status: "active",
  destination: "",
  categories: [],
  description: "",
});

const fetchData = async () => {
  try {
    const [toursRes, destsRes, catsRes] = await Promise.all([
      getTours(),
      getDestinations(),
      getCategories(),
    ]);

    tours.value = toursRes.data.data;
    destinations.value = destsRes.data.data;
    categories.value = catsRes.data.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
  }
};

const formatPrice = (val) => {
  if (!val) return "0đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const reset = () => {
  editingId.value = null;

  Object.assign(form, {
    name: "",
    departurePoint: "",
    duration: "",
    price: "",
    transport: "mixed",
    image: "",
    status: "active",
    destination: "",
    categories: [],
    description: "",
  });
};

const save = async () => {
  if (
    !form.name ||
    !form.departurePoint ||
    !form.duration ||
    !form.price ||
    !form.destination
  ) {
    alert("Vui lòng nhập đầy đủ thông tin bắt buộc (Tên, Khởi hành, Thời gian, Giá, Địa điểm)");
    return;
  }

  try {
    if (editingId.value) {
      await updateTour(editingId.value, form);
    } else {
      await createTour(form);
    }

    reset();
    fetchData();
  } catch (error) {
    alert("Có lỗi xảy ra khi lưu tour");
  }
};

const edit = (item) => {
  editingId.value = item._id;
  activeTab.value = "manual";

  Object.assign(form, {
    name: item.name,
    departurePoint: item.departurePoint,
    duration: item.duration,
    price: item.price,
    transport: item.transport || "mixed",
    image: item.image || "",
    status: item.status || "active",
    destination: item.destination?._id || item.destination,
    categories: item.categories?.map((c) => c._id || c) || [],
    description: item.description || "",
  });
};

const remove = async (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa tour du lịch này?")) {
    try {
      await deleteTour(id);
      fetchData();
    } catch (error) {
      alert("Không thể xóa tour du lịch này");
    }
  }
};

onMounted(fetchData);
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 8px 0;
}

.group-title {
  font-weight: 600;
  color: #374151;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.label {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.form-card {
  position: relative;
  overflow: hidden;
}

/* Tabs Navigation styling */
.tabs-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #0d9488;
  background-color: #f1f5f9;
}

.tab-btn.active {
  color: #0d9488;
  background-color: #f0fdfa;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* PDF Import Tab styling */
.pdf-import-tab {
  padding: 8px 0;
}

.pdf-loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #0d9488;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.loading-subtext {
  font-size: 13px;
  color: #64748b;
  max-width: 420px;
  margin: 0;
  line-height: 1.5;
}

.file-input-hidden {
  display: none;
}

.file-upload-wrapper {
  margin-bottom: 16px;
}

.file-upload-dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 36px 20px;
  text-align: center;
  background-color: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.file-upload-dropzone:hover, .file-upload-dropzone.drag-over {
  border-color: #0d9488;
  background-color: #f0fdfa;
}

.pdf-icon {
  width: 48px;
  height: 48px;
  color: #94a3b8;
  transition: color 0.2s;
}

.file-upload-dropzone:hover .pdf-icon, .file-upload-dropzone.drag-over .pdf-icon {
  color: #0d9488;
}

.dropzone-text {
  font-size: 14px;
  color: #64748b;
}

.dropzone-text .highlight {
  color: #0d9488;
  font-weight: 600;
}

.dropzone-selected {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: #64748b;
}

/* Error Box */
.error-box {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 12px 16px;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>