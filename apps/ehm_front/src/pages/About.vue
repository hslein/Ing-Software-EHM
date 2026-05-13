<template>
  <div class="about-page">
    <header class="about-hero">
      <div class="hero-content">
        <span class="gold-tag">Est. 2010</span>
        <h1 class="fade-in">CONCESIONARIO EHM</h1>
        <p class="hero-subtitle">Redefiniendo la excelencia automotriz con las mejores marcas del mundo.</p>
      </div>
    </header>

    <section class="history-section">
      <div class="container">
        <div class="history-grid">
          <div class="history-text">
            <h2 class="section-label">Nuestra Herencia</h2>
            <h3>Un legado de confianza y pasión por el detalle</h3>
            <p>
              En <strong>Concesionario EHM</strong>, seleccionamos vehículos que representan la cumbre de la ingeniería y el diseño. Nos especializamos en marcas que dominan el mercado global por su confiabilidad y estatus, como <strong>Toyota, Mazda, Ford y Volkswagen</strong>.
            </p>
            <p>
              Nuestra misión es ofrecer una experiencia de adquisición sin fisuras, donde la calidad del inventario y la transparencia en la gestión sean nuestra firma personal.
            </p>
          </div>

          <div class="history-visual">
            <div class="experience-box">
              <span class="number">+15</span>
              <span class="subtext">Años de Excelencia</span>
            </div>
            <div class="image-wrapper">
              <img 
                src="https://static3.toyotabharat.com/images/showroom/lc300/lc300-360-section-image-desktop-1920x1080.webp" 
                alt="Toyota Land Cruiser 300 - EHM Premium" 
                class="luxury-car-image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-banner">
      <div class="stat-item">
        <h4>5k+</h4>
        <span>Clientes Satisfechos</span>
      </div>
      <div class="stat-item">
        <h4>12</h4>
        <span>Marcas Aliadas</span>
      </div>
      <div class="stat-item">
        <h4>100%</h4>
        <span>Garantía EHM</span>
      </div>
    </section>

    <section class="promise-section">
      <div class="container">
        <h2 class="centered-title">Por qué elegir la experiencia EHM</h2>
        <div class="promise-grid">
          <div class="promise-card">
            <div class="promise-icon">✦</div>
            <h3>Curaduría de Marcas</h3>
            <p>Desde la elegancia de Mazda hasta la robustez de Toyota, solo ofrecemos lo mejor de cada fabricante.</p>
          </div>
          <div class="promise-card">
            <div class="promise-icon">✦</div>
            <h3>EHM Direct Credit</h3>
            <p>Sistemas de financiación personalizados con las tasas más competitivas del sector automotriz.</p>
          </div>
          <div class="promise-card">
            <div class="promise-icon">✦</div>
            <h3>Servicio Post-Venta</h3>
            <p>Acompañamiento técnico especializado para asegurar que su inversión mantenga su valor en el tiempo.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="about-footer-cta">
      <h3>¿Listo para conducir su próximo Toyota o Mazda?</h3>
      <button class="btn-outline" @click="$emit('open-home')">Explorar Inventario</button>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  emits: ['open-home']
};
</script>

<style scoped>
/* ESTILOS BASE */
.about-page {
  font-family: 'Inter', -apple-system, sans-serif;
  color: #0a192f;
  background-color: #fff;
  overflow-x: hidden;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* HERO SECTION */
.about-hero {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(rgba(10, 25, 47, 0.8), rgba(10, 25, 47, 0.9)), 
              url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  color: white;
}

.gold-tag {
  color: #ff8e71;
  text-transform: uppercase;
  letter-spacing: 0.4em;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 20px;
  display: block;
}

.about-hero h1 {
  font-size: clamp(30px, 6vw, 55px);
  font-weight: 200;
  letter-spacing: 0.2em;
  margin: 0;
}

.hero-subtitle {
  font-size: 18px;
  font-weight: 300;
  color: #8892b0;
  margin-top: 20px;
}

/* HISTORY SECTION - DISTRIBUCIÓN MEJORADA */
.history-section { padding: 100px 0; }

.history-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr; /* El texto tiene un poco más de espacio */
  gap: 80px;
  align-items: center;
}

.section-label {
  color: #ff8e71;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.3em;
  margin-bottom: 20px;
}

.history-text h3 {
  font-size: 38px;
  font-weight: 400;
  margin-bottom: 30px;
  line-height: 1.2;
}

.history-text p {
  font-size: 17px;
  color: #444;
  margin-bottom: 25px;
}

/* SECCIÓN VISUAL (IMAGEN + CUADRO) */
.history-visual {
  position: relative;
  display: flex;
  justify-content: center;
}

.image-wrapper {
  width: 100%;
  height: 500px;
  background-color: #f4f4f4; /* Color de respaldo si no carga la imagen */
  overflow: hidden;
  border-left: 8px solid #ff8e71;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
}

.luxury-car-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.luxury-car-image:hover {
  transform: scale(1.05);
}

.experience-box {
  position: absolute;
  bottom: -30px;
  left: -40px;
  background: #ff8e71;
  color: white;
  padding: 35px;
  z-index: 10;
  text-align: center;
  min-width: 180px;
  box-shadow: 10px 10px 30px rgba(0,0,0,0.1);
}

.experience-box .number { 
  font-size: 48px; 
  font-weight: 800; 
  display: block; 
  line-height: 1;
}

.experience-box .subtext { 
  font-size: 11px; 
  text-transform: uppercase; 
  letter-spacing: 2px;
  font-weight: 600;
  display: block;
  margin-top: 5px;
}

/* STATS BANNER */
.stats-banner {
  background: #0a192f;
  padding: 80px 20px;
  display: flex;
  justify-content: center;
  gap: 100px;
  color: white;
  text-align: center;
}

.stat-item h4 { font-size: 45px; color: #ff8e71; margin: 0; font-weight: 200; }
.stat-item span { text-transform: uppercase; letter-spacing: 2px; font-size: 11px; color: #8892b0; }

/* PROMISE SECTION */
.promise-section { padding: 120px 0; background: #fcfcfc; }
.centered-title { text-align: center; margin-bottom: 80px; font-size: 32px; font-weight: 200; text-transform: uppercase; letter-spacing: 0.1em; }

.promise-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.promise-card {
  padding: 50px 40px;
  background: white;
  border: 1px solid #eee;
  transition: 0.4s;
}

.promise-card:hover {
  transform: translateY(-10px);
  border-color: #ff8e71;
}

.promise-icon { font-size: 28px; color: #ff8e71; margin-bottom: 25px; }
.promise-card h3 { font-size: 16px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; }
.promise-card p { font-size: 14px; color: #666; }

/* FOOTER CTA */
.about-footer-cta {
  padding: 100px 20px;
  text-align: center;
}

.btn-outline {
  padding: 18px 50px;
  background: transparent;
  border: 1px solid #0a192f;
  color: #0a192f;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.3em;
  transition: 0.3s;
}

.btn-outline:hover {
  background: #0a192f;
  color: white;
}

/* RESPONSIVE */
@media (max-width: 992px) {
  .history-grid { gap: 40px; }
  .experience-box { left: -20px; padding: 25px; }
  .stats-banner { gap: 50px; }
}

@media (max-width: 768px) {
  .history-grid, .promise-grid { grid-template-columns: 1fr; }
  .history-visual { margin-top: 50px; }
  .experience-box { 
    left: 50%; 
    transform: translateX(-50%); 
    bottom: -20px; 
  }
}
</style>