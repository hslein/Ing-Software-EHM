<template>
  <div class="mazda-sidebar">
    <a 
      href="https://api.whatsapp.com/send?phone=573173250884&text=Hola!%20Estoy%20interesado%20en%20un%20vehículo%20de%20Concesionario%20EHM" 
      target="_blank" 
      class="item"
    >
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      </div>
      <span class="text">WhatsApp</span>
    </a>
    
    <a 
      href="http://googleusercontent.com/maps.google.com/search/Concesionario+EHM" 
      target="_blank" 
      class="item"
    >
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <span class="text">Ubicación</span>
    </a>

    <div class="item" @click="$emit('open-credit')">
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      </div>
      <span class="text">Crédito</span>
    </div>

    <div class="item" @click="scrollToFooter">
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      </div>
      <span class="text">Contacto</span>
    </div>

    <div class="item delivery-premium" @click="$emit('open-delivery')">
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      </div>
      <span class="text">Entrega</span>
    </div>

    <div class="item calculator-premium" @click="$emit('open-savings')">
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="8" y1="6" x2="16" y2="6"></line>
          <line x1="16" y1="14" x2="16" y2="18"></line>
          <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"></path>
        </svg>
      </div>
      <span class="text">Gastos</span>
    </div>
  </div>
</template>

<script setup>
defineEmits(['open-credit', 'open-savings', 'open-delivery']);

const scrollToFooter = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  });
};
</script>

<style scoped>
.mazda-sidebar {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10000;
}

.item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 50px; 
  height: 50px;
  cursor: pointer;
  text-decoration: none;
  color: white;
  background: #0a192f;
  border-radius: 25px 0 0 25px; 
  margin-right: -2px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-right: none;
  box-shadow: -4px 4px 10px rgba(0, 0, 0, 0.2);
}

/* EFECTO HOVER DE LOS BOTONES COMUNES (Se vuelven naranja coral) */
.item:hover {
  width: 170px; 
  background: #ff8e71; 
  border-radius: 25px; 
  margin-right: 15px; 
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.icon {
  min-width: 50px; 
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon svg {
  width: 20px;
  height: 20px;
  stroke: white;
}

.text {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding-left: 5px;
}

.item:hover .text {
  opacity: 1;
}

/* CONFIGURACIÓN PROPIA PARA BOTONES COMPLEMENTARIOS */
.delivery-premium,
.calculator-premium {
  background: #0a192f; 
}

.delivery-premium:hover,
.calculator-premium:hover {
  background: #ff8e71;
}

@media (max-width: 768px) {
  .item:hover {
    width: 50px;
    margin-right: 0;
    border-radius: 25px 0 0 25px;
  }
}
</style>