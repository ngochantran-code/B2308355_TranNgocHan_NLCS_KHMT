<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-content">
      <h1>Quản lý địa điểm</h1>

      <div class="card">
        <form class="form" @submit.prevent="save">
          <input v-model="form.name" class="input" placeholder="Tên địa điểm" />

          <input
            v-model="form.province"
            class="input"
            placeholder="Tỉnh/Thành"
          />

          <select v-model="form.type" class="select">
            <option value="city">Thành phố</option>
            <option value="province">Tỉnh</option>
            <option value="beach">Biển</option>
            <option value="mountain">Núi</option>
            <option value="island">Đảo</option>
            <option value="other">Khác</option>
          </select>

          <textarea
            v-model="form.description"
            class="textarea"
            placeholder="Mô tả"
          ></textarea>

          <button class="btn btn-primary">
            {{ editingId ? "Cập nhật" : "Thêm địa điểm" }}
          </button>
        </form>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Tỉnh/Thành</th>
              <th>Loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in destinations" :key="item._id">
              <td>{{ item.name }}</td>
              <td>{{ item.province }}</td>
              <td>{{ item.type }}</td>

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
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../../services/destinationApi";

const destinations = ref([]);
const editingId = ref(null);

const form = reactive({
  name: "",
  province: "",
  type: "other",
  description: "",
  status: "active",
});

const fetchData = async () => {
  const res = await getDestinations();
  destinations.value = res.data.data;
};

const reset = () => {
  editingId.value = null;

  Object.assign(form, {
    name: "",
    province: "",
    type: "other",
    description: "",
    status: "active",
  });
};

const save = async () => {
  if (!form.name || !form.province) {
    alert("Vui lòng nhập tên địa điểm và tỉnh/thành");
    return;
  }

  if (editingId.value) {
    await updateDestination(editingId.value, form);
  } else {
    await createDestination(form);
  }

  reset();
  fetchData();
};

const edit = (item) => {
  editingId.value = item._id;

  Object.assign(form, {
    name: item.name,
    province: item.province,
    type: item.type,
    description: item.description,
    status: item.status,
  });
};

const remove = async (id) => {
  if (confirm("Xóa địa điểm này?")) {
    await deleteDestination(id);
    fetchData();
  }
};

onMounted(fetchData);
</script>