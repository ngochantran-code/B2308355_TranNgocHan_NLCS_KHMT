<template>
  <RouterView />
  <FloatingChatbot v-if="showFloatingChat" />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import FloatingChatbot from './components/chatbot/FloatingChatbot.vue';

const route = useRoute();

const showFloatingChat = computed(() => {
  // Hide the floating button on admin views and on the dedicated full chatbot view
  return route.path && !route.path.startsWith('/admin') && route.name !== 'chatbot';
});
</script>