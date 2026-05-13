<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import Actions from '../components/actions.vue';
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

const goAbout = () => {
  router.push('/about');
};

const openCredit = () => {
  router.push('/credit');
};

const openChatbot = () => {
  window.alert(CHATBOT_MESSAGE);
};
</script>

<template>
  <div class="app">
    <NavBar v-if="showChrome" @go-about="goAbout" @go-home="goHome" />

    <RouterView />

    <DealerFooter v-if="showChrome" />
    <Actions v-if="showChrome" @open-credit="openCredit" />
    <ChatbotButton v-if="showChrome" @open="openChatbot" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #ecf0f1;
}
</style>
