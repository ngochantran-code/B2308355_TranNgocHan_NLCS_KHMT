<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-content">
      <h1>Quản lý lịch trình</h1>

      <div class="card">
        <form class="form" @submit.prevent="save">
          <select v-model="form.tour" class="select">
            <option value="">Chọn tour</option>

            <option
              v-for="tour in tours"
              :key="tour._id"
              :value="tour._id"
            >
              {{ tour.name }}
            </option>
          </select>

          <input
            v-model.number="form.day"
            class="input"
            type="number"
            min="1"
            placeholder="Ngày thứ mấy"
          />

          <input
            v-model="form.title"
            class="input"
            placeholder="Tiêu đề lịch trình"
          />

          <select v-model="form.transport" class="select">
            <option value="car">Xe ô tô</option>
            <option value="plane">Máy bay</option>
            <option value="bus">Xe buýt</option>
            <option value="train">Tàu hỏa</option>
            <option value="ship">Tàu thủy</option>
            <option value="walk">Đi bộ</option>
            <option value="mixed">Kết hợp</option>
          </select>

          <textarea
            v-model="form.content"
            class="textarea"
            placeholder="Nội dung lịch trình"
          ></textarea>

          <button class="btn btn-primary">
            {{ editingId ? "Cập nhật" : "Thêm lịch trình" }}
          </button>
        </form>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Tour</th>
              <th>Ngày</th>
              <th>Tiêu đề</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in itineraries" :key="item._id">
              <td>{{ item.tour?.name }}</td>
              <td>{{ item.day }}</td>
              <td>{{ item.title }}</td>

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

import { getTours } from "../../services/tourApi";

import {
  getItineraries,
  createItinerary,
  updateItinerary,
  deleteItinerary,
} from "../../services/itineraryApi";

const tours = ref([]);
const itineraries = ref([]);
const editingId = ref(null);

const form = reactive({
  tour: "",
  day: 1,
  title: "",
  content: "",
  transport: "car",
  attractions: [],
});

const fetchData = async () => {
  try {
    const [tourRes, itineraryRes] = await Promise.all([
      getTours(),
      getItineraries(),
    ]);

    tours.value = tourRes.data.data;
    itineraries.value = itineraryRes.data.data;
    console.log('Fetched itineraries:', itineraries.value);
  } catch (err) {
    console.error('Error fetching itineraries:', err);
    alert('Không thể tải danh sách lịch trình. Vui lòng kiểm tra kết nối máy chủ.');
  }
};

const reset = () => {
  editingId.value = null;

  Object.assign(form, {
    tour: "",
    day: 1,
    title: "",
    content: "",
    transport: "car",
    attractions: [],
  });
};

const save = async () => {
  if (!form.tour || !form.title || !form.content) {
    alert("Vui lòng chọn tour, nhập tiêu đề và nội dung lịch trình");
    return;
  }

  if (editingId.value) {
    await updateItinerary(editingId.value, form);
  } else {
    await createItinerary(form);
  }

  reset();
  fetchData();
};

const edit = (item) => {
  editingId.value = item._id;

  Object.assign(form, {
    tour: item.tour?._id || item.tour,
    day: item.day,
    title: item.title,
    content: item.content,
    transport: item.transport,
    attractions: item.attractions?.map((a) => a._id) || [],
  });
};

const remove = async (id) => {
  if (confirm("Xóa lịch trình này?")) {
    await deleteItinerary(id);
    fetchData();
  }
};

onMounted(fetchData);
</script>