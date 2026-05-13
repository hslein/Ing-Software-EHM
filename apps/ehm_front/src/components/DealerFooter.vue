<script setup lang="ts">
import { DEALER_CONTACT } from '../constants/dealer.constants';
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <h3>Contacto del Concesionario</h3>
      <p>Direccion: {{ DEALER_CONTACT.address }}</p>
      <p>Telefono: {{ DEALER_CONTACT.phone }}</p>
      <p>Email: {{ DEALER_CONTACT.email }}</p>
      <p>Horario: {{ DEALER_CONTACT.schedule }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 1rem;
  background: linear-gradient(135deg, #1f2433 0%, #222c44 60%, #243356 100%);
  color: #fff;
  padding: 2.4rem 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 0.3rem;
}

.footer-content h3 {
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.footer-content p {
  margin: 0.3rem 0;
  color: #dce4ff;
}

@media (max-width: 768px) {
  .footer {
    padding: 2rem 1rem;
  }
}
</style>
