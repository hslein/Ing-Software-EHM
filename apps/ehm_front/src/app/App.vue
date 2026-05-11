<script setup lang="ts">
import { ref } from 'vue';
import ChatbotButton from '../components/ChatbotButton.vue';
import DealerFooter from '../components/DealerFooter.vue';
import NavBar from '../components/NavBar.vue';
import { CHATBOT_MESSAGE } from '../constants/dealer.constants';
import HomePage from '../pages/HomePage.vue';

const homePage = ref<InstanceType<typeof HomePage> | null>(null);

const openChatbot = () => {
  window.alert(CHATBOT_MESSAGE);
};

const goToHomeMenu = () => {
  homePage.value?.goToHomeMenu();
};
</script>

<template>
  <div class="page-shell">
    <NavBar @go-home="goToHomeMenu" />
    <HomePage ref="homePage" />
    <DealerFooter />
  </div>

  <ChatbotButton @open="openChatbot" />
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  background: radial-gradient(circle at top right, #dce9ff 0%, transparent 38%),
    radial-gradient(circle at 10% 20%, #ffe6e0 0%, transparent 35%),
    linear-gradient(180deg, #f7f9ff 0%, #f3f6ff 45%, #eef1ff 100%);
}
</style>


