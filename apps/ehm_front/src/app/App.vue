<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import ChatbotButton from '../components/ChatbotButton.vue';
import DealerFooter from '../components/DealerFooter.vue';
import NavBar from '../components/NavBar.vue';
import { CHATBOT_MESSAGE } from '../constants/dealer.constants';

const route = useRoute();
const router = useRouter();

const showChrome = computed(() => route.meta.hideChrome !== true);

const goHome = () => {
  router.push('/');
};

const openChatbot = () => {
  window.alert(CHATBOT_MESSAGE);
};
</script>

<template>
  <div class="app">
    <NavBar v-if="showChrome" @go-home="goHome" />

    <RouterView />

    <DealerFooter v-if="showChrome" />
    <ChatbotButton v-if="showChrome" @open="openChatbot" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #ecf0f1;
}
</style>
