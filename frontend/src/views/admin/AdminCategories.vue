<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-content">
      <h1>Quản lý danh mục</h1>

      <div class="card">
        <form class="form" @submit.prevent="save">
          <input
            v-model="form.name"
            class="input"
            placeholder="Tên danh mục"
          />

          <textarea
            v-model="form.description"
            class="textarea"
            placeholder="Mô tả"
          ></textarea>

          <button class="btn btn-primary">
            {{ editingId ? "Cập nhật" : "Thêm danh mục" }}
          </button>
        </form>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in categories" :key="item._id">
              <td>{{ item.name }}</td>
              <td>{{ item.description }}</td>

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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryApi";

const categories = ref([]);
const editingId = ref(null);

const form = reactive({
  name: "",
  description: "",
  status: "active",
});

const fetchData = async () => {
  const res = await getCategories();
  categories.value = res.data.data;
};

const reset = () => {
  editingId.value = null;

  Object.assign(form, {
    name: "",
    description: "",
    status: "active",
  });
};

const save = async () => {
  if (!form.name) {
    alert("Vui lòng nhập tên danh mục");
    return;
  }

  if (editingId.value) {
    await updateCategory(editingId.value, form);
  } else {
    await createCategory(form);
  }

  reset();
  fetchData();
};

const edit = (item) => {
  editingId.value = item._id;

  Object.assign(form, {
    name: item.name,
    description: item.description,
    status: item.status,
  });
};

const remove = async (id) => {
  if (confirm("Xóa danh mục này?")) {
    await deleteCategory(id);
    fetchData();
  }
};

onMounted(fetchData);
</script>