<template>
  <div 
    class="floating-chatbot" 
    :style="{ 
      right: posX + 'px', 
      bottom: posY + 'px',
      transition: isDraggingActive ? 'none' : 'bottom 0.15s ease-out, right 0.15s ease-out'
    }"
  >
    <!-- Chat Box Card -->
    <div v-if="isOpen" class="chat-card" :class="cardClass" :style="cardStyle">
      <div class="chat-header">
        <div class="header-info">
          <div class="avatar-container">
            <svg class="ai-avatar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 0 0-10 10v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a6 6 0 0 1 12 0v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a10 10 0 0 0-10-10z"></path>
              <rect x="9" y="11" width="6" height="5" rx="1"></rect>
              <path d="M8 19a3 3 0 0 0 6 0"></path>
            </svg>
            <span class="status-pulse"></span>
          </div>
          <div class="header-text">
            <h3>Pilo</h3>
            <p>Trợ lý hành trình của TourPilot</p>
          </div>
        </div>
        <button class="close-btn" @click="toggleChat" aria-label="Đóng chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-close">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <ChatBox />
    </div>

    <!-- Floating Trigger Button -->
    <button 
      class="chat-trigger" 
      :class="{ 'is-active': isOpen, 'is-grabbing': isDraggingActive }" 
      @mousedown="onDragStart"
      @touchstart="onDragStart"
      aria-label="Mở khung chat"
    >
      <transition name="fade-rotate" mode="out-in">
        <svg v-if="!isOpen" key="chat" class="trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-7.6-4.7L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <svg v-else key="close" class="trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </transition>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import ChatBox from './ChatBox.vue';

const route = useRoute();
const isOpen = ref(false);

// Scroll and drag coordinates
const bottomOffset = ref(24); // scroll-based bottom spacing
const hasDragged = ref(false); // flag to check if user has manually moved the bubble
const posX = ref(24); // distance from right in px
const posY = ref(24); // distance from bottom in px

const isDraggingActive = ref(false);
let startMouseX = 0;
let startMouseY = 0;
let startWidgetX = 0;
let startWidgetY = 0;
let dragThresholdPassed = false;

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

// Calculate if the chatbot button needs to push up when the footer is visible in viewport
const handleScroll = () => {
  const footer = document.querySelector('.footer');
  if (!footer) {
    bottomOffset.value = 24;
    if (!hasDragged.value) {
      posY.value = 24;
    }
    return;
  }

  const footerRect = footer.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  if (footerRect.top < windowHeight) {
    const visibleFooterHeight = windowHeight - footerRect.top;
    bottomOffset.value = Math.max(24, visibleFooterHeight + 24);
  } else {
    bottomOffset.value = 24;
  }
};

// Update posY based on scroll as long as the user hasn't dragged it manually
watch(bottomOffset, (newVal) => {
  if (!hasDragged.value) {
    posY.value = newVal;
  }
});

// Recalculate scroll offset on route changes
watch(() => route.path, () => {
  setTimeout(handleScroll, 100);
});

// Drag Handlers
const onDragStart = (event) => {
  if (event.type === 'mousedown' && event.button !== 0) return;

  isDraggingActive.value = true;
  dragThresholdPassed = false;

  const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
  const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;

  startMouseX = clientX;
  startMouseY = clientY;
  startWidgetX = posX.value;
  startWidgetY = posY.value;

  if (event.type === 'touchstart') {
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd);
  } else {
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  }
};

const onDragMove = (event) => {
  if (!isDraggingActive.value) return;

  const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
  const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;

  const deltaX = clientX - startMouseX;
  const deltaY = clientY - startMouseY;

  // Distinguish between a drag and a simple click
  if (!dragThresholdPassed && Math.hypot(deltaX, deltaY) > 6) {
    dragThresholdPassed = true;
    hasDragged.value = true;
  }

  if (dragThresholdPassed) {
    if (event.cancelable) {
      event.preventDefault();
    }

    let newPosX = startWidgetX - deltaX;
    let newPosY = startWidgetY - deltaY;

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    const buttonSize = 60;
    const margin = 10;

    // Boundary constraints
    newPosX = Math.max(margin, Math.min(winWidth - buttonSize - margin, newPosX));
    newPosY = Math.max(margin, Math.min(winHeight - buttonSize - margin, newPosY));

    posX.value = newPosX;
    posY.value = newPosY;
  }
};

const onDragEnd = (event) => {
  isDraggingActive.value = false;

  if (event.type === 'touchend') {
    window.removeEventListener('touchmove', onDragMove);
    window.removeEventListener('touchend', onDragEnd);
  } else {
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  }

  if (!dragThresholdPassed) {
    toggleChat();
  }
};

// Determine layout orientation class (above vs below bubble)
const cardClass = computed(() => {
  const isUpperHalf = posY.value > window.innerHeight / 2;
  return isUpperHalf ? 'pos-below' : 'pos-above';
});

// Dynamic style for the chat card to position it relative to the bubble
const cardStyle = computed(() => {
  const isLeftHalf = posX.value > window.innerWidth / 2;
  const isUpperHalf = posY.value > window.innerHeight / 2;
  
  const styles = {};
  
  // Horizontal alignment
  if (isLeftHalf) {
    styles.left = '0';
    styles.right = 'auto';
  } else {
    styles.right = '0';
    styles.left = 'auto';
  }
  
  // Vertical alignment: if bubble is high up, open below (top: 80px), otherwise open above (bottom: 80px)
  if (isUpperHalf) {
    styles.top = '80px';
    styles.bottom = 'auto';
  } else {
    styles.bottom = '80px';
    styles.top = 'auto';
  }
  
  return styles;
});

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleScroll);
  setTimeout(handleScroll, 150);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleScroll);
});
</script>

<style scoped>
.floating-chatbot {
  position: fixed;
  z-index: 9999;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  touch-action: none;
}

/* Chat Card Styling */
.chat-card {
  position: absolute;
  width: 400px;
  max-width: calc(100vw - 48px);
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.16);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.chat-card.pos-above {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.chat-card.pos-below {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Chat Header */
.chat-header {
  background: linear-gradient(135deg, #0d9488, #0e7490);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-container {
  position: relative;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ai-avatar {
  width: 22px;
  height: 22px;
}

.status-pulse {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid #0d9488;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.header-text h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.header-text p {
  font-size: 11px;
  margin: 2px 0 0;
  opacity: 0.85;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 50%;
}

.close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.icon-close {
  width: 18px;
  height: 18px;
}

/* Floating Trigger Button */
.chat-trigger {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d9488, #0e7490);
  border: none;
  color: white;
  cursor: grab;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;
  user-select: none;
}

.chat-trigger:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.45);
}

.chat-trigger:active,
.chat-trigger.is-grabbing {
  cursor: grabbing;
  transform: scale(0.95);
}

.chat-trigger.is-active {
  background: #1e293b;
  box-shadow: 0 4px 16px rgba(30, 41, 59, 0.35);
}

.trigger-icon {
  width: 26px;
  height: 26px;
  pointer-events: none;
}

/* Transition animations */
.fade-rotate-enter-active,
.fade-rotate-leave-active {
  transition: all 0.2s ease;
}

.fade-rotate-enter-from,
.fade-rotate-leave-to {
  transform: rotate(45deg) scale(0.8);
  opacity: 0;
}

/* Scoped override for the nested ChatBox component */
:deep(.chat-box) {
  height: 500px;
  border-radius: 0 0 16px 16px;
  box-shadow: none;
  padding: 16px;
}

:deep(.messages) {
  padding-right: 4px;
}

:deep(.bubble) {
  font-size: 14px;
  padding: 10px 12px;
}

/* Responsive adjustment */
@media (max-width: 480px) {
  .chat-card {
    position: fixed;
    right: 16px;
    left: 16px;
    width: auto;
    max-width: none;
  }

  .chat-card.pos-above {
    bottom: 96px;
    top: auto;
  }

  .chat-card.pos-below {
    top: 96px;
    bottom: auto;
  }
}
</style>
