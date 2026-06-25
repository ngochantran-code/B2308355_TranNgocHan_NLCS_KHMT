<template>
  <div class="chat-box">
    <div class="messages">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message"
        :class="msg.role"
      >
        <div class="bubble">
          {{ msg.content }}
        </div>
      </div>

      <Loading v-if="loading" />
    </div>

    <form class="input-area" @submit.prevent="sendMessage">
      <input
        v-model="question"
        class="input"
        placeholder="Hỏi Pilo về hành trình du lịch..."
      />

      <button class="btn btn-primary" :disabled="loading">
        Gửi
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Loading from "../common/Loading.vue";
import { askChatbot } from "../../services/chatbotApi";

const question = ref("");
const loading = ref(false);

const messages = ref([
  {
    role: "bot",
    content:
      "Xin chào! Mình là Pilo — trợ lý hành trình của TourPilot. Bạn muốn đi đâu, mấy ngày và ngân sách khoảng bao nhiêu?",
  },
]);

const sendMessage = async () => {
  if (!question.value.trim()) return;

  const userQuestion = question.value.trim();

  messages.value.push({
    role: "user",
    content: userQuestion,
  });

  question.value = "";
  loading.value = true;

  try {
    const res = await askChatbot(userQuestion);

    messages.value.push({
      role: "bot",
      content: res.data.data.answer,
    });
  } catch (error) {
    messages.value.push({
      role: "bot",
      content: "Xin lỗi bạn, hệ thống kết nối tư vấn hiện đang bận. Bạn vui lòng quay lại sau hoặc thử lại sau ít phút nhé!",
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.chat-box {
  background: white;
  border-radius: 16px;
  padding: 20px;
  height: 650px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.bot {
  justify-content: flex-start;
}

.bubble {
  max-width: 75%;
  padding: 12px 14px;
  border-radius: 14px;
  white-space: pre-line;
  line-height: 1.5;
}

.user .bubble {
  background: #0d9488;
  color: white;
}

.bot .bubble {
  background: #f3f4f6;
  color: #111827;
}

.input-area {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.input-area input {
  flex: 1;
}

@media (max-width: 640px) {
  .chat-box {
    height: 560px;
  }

  .input-area {
    flex-direction: column;
  }

  .bubble {
    max-width: 90%;
  }
}
</style>