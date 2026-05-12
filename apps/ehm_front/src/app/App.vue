<template>
      <NavBar />

  <RouterView />
      <DealerFooter />
    <ChatbotButton @open="openChatbot" />
</template>

<script setup lang="ts">
import { CHATBOT_MESSAGE } from '../constants/dealer.constants';
import { RouterView } from 'vue-router';
import ChatbotButton from '../components/ChatbotButton.vue';
import DealerFooter from '../components/DealerFooter.vue';
import NavBar from '../components/NavBar.vue';

const openChatbot = () => {
  window.alert(CHATBOT_MESSAGE);
};
</script>
