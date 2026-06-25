<template>
  <div class="page not-found">
    <div class="card box">
      <h1>404</h1>

      <h2>Không tìm thấy trang</h2>

      <p>
        Trang bạn truy cập không tồn tại hoặc đã thay đổi đường dẫn.
      </p>

      <div class="actions center">
        <RouterLink to="/" class="btn btn-primary">
          Về trang chủ
        </RouterLink>

        <RouterLink to="/tours" class="btn btn-secondary">
          Xem tour
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: grid;
  place-items: center;
  background: #f5f7fb;
}

.box {
  text-align: center;
  width: min(520px, 92%);
}

h1 {
  font-size: 88px;
  color: #0d9488;
  margin: 0;
}

.center {
  justify-content: center;
}
</style>