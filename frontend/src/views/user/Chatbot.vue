<template>
  <div class="page">
    <Navbar />

    <main class="container chatbot-page">
      <h1 class="section-title">Pilo – Trợ lý hành trình của TourPilot</h1>

      <ChatBox />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from "../../components/layout/Navbar.vue";
import Footer from "../../components/layout/Footer.vue";
import ChatBox from "../../components/chatbot/ChatBox.vue";
</script>

<style scoped>
.chatbot-page {
  padding: 32px 0;
}
</style>