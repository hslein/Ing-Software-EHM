<template>
  <div class="mazda-sidebar">
    <div class="item search-special" @click="handleAction('busqueda')">
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <span class="text">Buscar</span>
    </div>

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
  </div>
</template>

<script setup>
defineEmits(['open-credit']);

const handleAction = (type) => {
  console.log(`Acción: ${type}`);
};

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
  right: 0; /* Pegados al marco inicialmente */
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
  
  /* ESTADO INICIAL: Pegado al marco (derecha recta) */
  border-radius: 25px 0 0 25px; 
  margin-right: -2px; /* Un pequeño solapamiento para que no se vea luz en el borde */
  
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-right: none;
  box-shadow: -4px 4px 10px rgba(0, 0, 0, 0.2);
}

.item:hover {
  width: 170px; 
  background: #ff8e71; 
  
  /* ESTADO ACTIVO: Se vuelve redondo y se separa del marco */
  border-radius: 25px; 
  margin-right: 15px; /* Se "aleja" del borde derecho al salir */
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

.search-special {
  background: #1c2c44;
}

.search-special svg {
  stroke: #ff8e71;
}

@media (max-width: 768px) {
  .item:hover {
    width: 50px;
    margin-right: 0;
    border-radius: 25px 0 0 25px;
  }
}
</style>