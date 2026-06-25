<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-content">
      <h1>Quản lý thành viên</h1>

      <div class="card">
        <h2 class="form-title">{{ editingId ? "Cập nhật thành viên" : "Thêm thành viên mới" }}</h2>
        <form class="form-grid" @submit.prevent="save">
          <div class="form-group">
            <label class="label">Họ và tên</label>
            <input
              v-model="form.fullName"
              class="input"
              placeholder="Họ và tên"
              required
            />
          </div>

          <div class="form-group">
            <label class="label">Email</label>
            <input
              v-model="form.email"
              class="input"
              type="email"
              placeholder="Email"
              required
            />
          </div>

          <div class="form-group">
            <label class="label">Số điện thoại</label>
            <input
              v-model="form.phone"
              class="input"
              placeholder="Số điện thoại"
            />
          </div>

          <div class="form-group" v-if="!editingId">
            <label class="label">Mật khẩu</label>
            <input
              v-model="form.password"
              class="input"
              type="password"
              placeholder="Mật khẩu"
              required
            />
          </div>

          <div class="form-group">
            <label class="label">Vai trò</label>
            <select v-model="form.role" class="select">
              <option value="user">User (Khách hàng)</option>
              <option value="admin">Admin (Quản trị viên)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label">Trạng thái</label>
            <select v-model="form.status" class="select">
              <option value="active">Active (Hoạt động)</option>
              <option value="inactive">Inactive (Chờ kích hoạt)</option>
              <option value="blocked">Blocked (Bị khóa)</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              {{ editingId ? "Cập nhật" : "Thêm thành viên" }}
            </button>
            <button type="button" class="btn btn-secondary" v-if="editingId" @click="reset">
              Hủy
            </button>
          </div>
        </form>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in users" :key="item._id">
              <td>{{ item.fullName }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.phone || '-' }}</td>
              <td>
                <span class="badge" :class="item.role">
                  {{ item.role === 'admin' ? 'Quản trị' : 'Thành viên' }}
                </span>
              </td>
              <td>
                <span class="badge" :class="item.status">
                  {{ item.status === 'active' ? 'Hoạt động' : item.status === 'blocked' ? 'Bị khóa' : 'Chờ kích hoạt' }}
                </span>
              </td>

              <td class="actions">
                <button class="btn btn-secondary btn-sm" @click="edit(item)">
                  Sửa
                </button>

                <button
                  class="btn btn-sm"
                  :class="item.status === 'blocked' ? 'btn-success' : 'btn-warning'"
                  @click="toggleBlock(item)"
                >
                  {{ item.status === 'blocked' ? 'Mở khóa' : 'Khóa' }}
                </button>

                <button class="btn btn-danger btn-sm" @click="remove(item._id)">
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
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/userApi.js";

const users = ref([]);
const editingId = ref(null);

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "user",
  status: "active",
});

const fetchData = async () => {
  try {
    const res = await getUsers();
    users.value = res.data.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách user:", error);
  }
};

const reset = () => {
  editingId.value = null;
  Object.assign(form, {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    status: "active",
  });
};

const save = async () => {
  if (!form.fullName || !form.email) {
    alert("Vui lòng nhập tên và email");
    return;
  }

  try {
    if (editingId.value) {
      const { password, ...updateData } = form;
      await updateUser(editingId.value, updateData);
      alert("Cập nhật thành viên thành công!");
    } else {
      if (!form.password) {
        alert("Vui lòng nhập mật khẩu");
        return;
      }
      await createUser(form);
      alert("Thêm thành viên mới thành công!");
    }
    reset();
    fetchData();
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Lỗi khi lưu thông tin");
  }
};

const edit = (item) => {
  editingId.value = item._id;
  Object.assign(form, {
    fullName: item.fullName,
    email: item.email,
    phone: item.phone || "",
    role: item.role,
    status: item.status,
    password: "",
  });
};

const toggleBlock = async (item) => {
  const newStatus = item.status === "blocked" ? "active" : "blocked";
  const actionText = item.status === "blocked" ? "mở khóa" : "khóa";

  if (confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) {
    try {
      await updateUser(item._id, { status: newStatus });
      alert("Thực hiện thành công!");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật trạng thái");
    }
  }
};

const remove = async (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
    try {
      await deleteUser(id);
      alert("Xóa thành công!");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xóa thành viên");
    }
  }
};

onMounted(fetchData);
</script>

<style scoped>
.form-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-weight: 600;
  font-size: 14px;
  color: #4b5563;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
}

.btn-success {
  background: #10b981;
  color: white;
}
.btn-success:hover {
  background: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}
.btn-warning:hover {
  background: #d97706;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  text-align: center;
}

.badge.admin {
  background: #f0fdfa;
  color: #0d9488;
}

.badge.user {
  background: #f3f4f6;
  color: #4b5563;
}

.badge.active {
  background: #ecfdf5;
  color: #10b981;
}

.badge.inactive {
  background: #fef3c7;
  color: #d97706;
}

.badge.blocked {
  background: #fef2f2;
  color: #ef4444;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
