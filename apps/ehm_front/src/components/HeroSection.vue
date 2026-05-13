<template>
  <section class="hero">
    <p class="hero-kicker">Concesionario premium</p>
    <h1>Encuentra tu proximo auto ideal</h1>
    <p class="hero-subtitle">
      Explora nuestro catalogo con diseÃ±o deportivo, tecnologia de punta y las
      mejores marcas del mercado.
    </p>
  </section>
</template>

<style scoped>
.hero {
  text-align: center;
  margin-bottom: 2.25rem;
  padding: 2rem 1.25rem;
  min-height: 38vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(6px);
  box-shadow: 0 14px 40px rgba(42, 53, 89, 0.12);
}

.hero h1 {
  font-size: clamp(2rem, 3vw, 2.8rem);
  color: #1d2440;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-kicker {
  display: inline-block;
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, #ff7676, #ff9f6e);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.hero-subtitle {
  color: #4d5577;
  margin: 1rem auto 0;
  max-width: 700px;
  font-size: 1.05rem;
}

@media (max-width: 768px) {
  .hero {
    padding: 1.5rem 1rem;
    min-height: 72vh;
  }
}
</style>
