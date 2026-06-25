<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-content">
      <h1>Quản lý điểm tham quan</h1>

      <div class="card">
        <form class="form" @submit.prevent="save">
          <input
            v-model="form.name"
            class="input"
            placeholder="Tên điểm tham quan"
          />

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

          <textarea
            v-model="form.description"
            class="textarea"
            placeholder="Mô tả"
          ></textarea>

          <button class="btn btn-primary">
            {{ editingId ? "Cập nhật" : "Thêm điểm tham quan" }}
          </button>
        </form>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Địa điểm</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in attractions" :key="item._id">
              <td>{{ item.name }}</td>
              <td>{{ item.destination?.name }}</td>

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
  getAttractions,
  createAttraction,
  updateAttraction,
  deleteAttraction,
} from "../../services/attractionApi";

import { getDestinations } from "../../services/destinationApi";

const attractions = ref([]);
const destinations = ref([]);
const editingId = ref(null);

const form = reactive({
  name: "",
  description: "",
  destination: "",
  status: "active",
});

const fetchData = async () => {
  const [attrRes, desRes] = await Promise.all([
    getAttractions(),
    getDestinations(),
  ]);

  attractions.value = attrRes.data.data;
  destinations.value = desRes.data.data;
};

const reset = () => {
  editingId.value = null;

  Object.assign(form, {
    name: "",
    description: "",
    destination: "",
    status: "active",
  });
};

const save = async () => {
  if (!form.name || !form.destination) {
    alert("Vui lòng nhập tên điểm tham quan và chọn địa điểm");
    return;
  }

  if (editingId.value) {
    await updateAttraction(editingId.value, form);
  } else {
    await createAttraction(form);
  }

  reset();
  fetchData();
};

const edit = (item) => {
  editingId.value = item._id;

  Object.assign(form, {
    name: item.name,
    description: item.description,
    destination: item.destination?._id || item.destination,
    status: item.status,
  });
};

const remove = async (id) => {
  if (confirm("Xóa điểm tham quan này?")) {
    await deleteAttraction(id);
    fetchData();
  }
};

onMounted(fetchData);
</script>