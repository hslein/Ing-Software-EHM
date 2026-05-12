<script setup lang="ts">
defineEmits<{
  open: [];
}>();
</script>

<template>
  <button class="chatbot-button" type="button" @click="$emit('open')">
    Chatbot
  </button>
</template>

<style scoped>
.chatbot-button {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  background: linear-gradient(135deg, #ff5f6d, #ff8b54);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.78rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 26px rgba(241, 93, 84, 0.5);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chatbot-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(241, 93, 84, 0.55);
}
</style>
