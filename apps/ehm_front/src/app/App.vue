<script setup lang="ts">
import { ref } from 'vue';
import HomePage from '../pages/HomePage.vue';
import CreditPage from '../pages/Credit.vue';
import AboutPage from '../pages/About.vue'; 
import Actions from '../components/actions.vue';
import NavBar from '../components/NavBar.vue';
import DealerFooter from '../components/DealerFooter.vue';

// Control de navegación
const view = ref('home'); 

const openCredit = () => { view.value = 'credit'; window.scrollTo(0,0); };
const openHome = () => { view.value = 'home'; window.scrollTo(0,0); };
const openAbout = () => { view.value = 'about'; window.scrollTo(0,0); };
</script>

<template>
  <div class="page-shell">
    <NavBar 
      @open-home="openHome" 
      @open-about="openAbout" 
    />
    
    <main class="content-wrapper">
      <HomePage v-if="view === 'home'" />
      <CreditPage v-if="view === 'credit'" />
      <AboutPage v-if="view === 'about'" />
    </main>

    <DealerFooter />

    <Actions @open-credit="openCredit" />
  </div>
</template>

<style scoped>
.page-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}
.content-wrapper {
  flex: 1;
}
</style>