<script setup lang="ts">
import NavBar from '../components/NavBar.vue';

type Car = {
  brand: string;
  model: string;
  image: string;
};

const cars: Car[] = [
  {
    brand: 'Mitsubishi',
    model: 'Penumbra',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mitsubishi_logo.svg/960px-Mitsubishi_logo.svg.png?utm_source=es.wikibooks.org&utm_campaign=index&utm_content=thumbnail',
  },
  {
    brand: 'Toyota',
    model: 'Sultan',
    image:
      'https://www.toyota-global.com/pages/contents/showroom/emblem/passion/images/passion_img01.jpg',
  },
  {
    brand: 'Audi',
    model: '8F Drafter',
    image:
      'https://di-uploads-pod3.dealerinspire.com/vindeversautohausofsylvania/uploads/2018/10/Audi-Logo-Banner.png',
  },
  {
    brand: 'Ford',
    model: 'Dominator',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrvZJcFSuBzTHzbCAs5Yqj3MQMi8yF6_hlWw&s',
  },
  {
    brand: 'Volkswagen',
    model: 'Gauntlet',
    image:
      'https://logowik.com/content/uploads/images/345_volkswagen_logo.jpg',
  },
];

const openChatbot = () => {
  window.alert('Chatbot coming soon. Contact us on WhatsApp: +57 300 123 4567');
};
</script>

<template>
  <div class="page-shell">
    <NavBar />

    <main class="catalog-page">
      <section class="hero">
        <p class="hero-kicker">Concesionario premium</p>
        <h1>Encuentra tu proximo auto ideal</h1>
        <p class="hero-subtitle">
          Explora nuestro catalogo con diseno deportivo, tecnologia de punta y
          las mejores marcas del mercado.
        </p>
      </section>

      <section class="catalog-grid">
        <article v-for="car in cars" :key="car.brand" class="car-card">
          <div class="image-wrapper">
            <img :src="car.image" :alt="`${car.brand} ${car.model}`" class="car-image" />
          </div>
          <div class="car-content">
            <h2>{{ car.brand }}</h2>
            <p>{{ car.model }}</p>
            <span class="car-tag">Disponible</span>
          </div>
        </article>
      </section>
    </main>
  </div>

  <footer class="footer">
    <div class="footer-content">
      <h3>Contacto del Concesionario</h3>
      <p>Direccion: Av. Principal 123, Bogota, Colombia</p>
      <p>Telefono: +57 300 123 4567</p>
      <p>Email: contacto@carsales.com</p>
      <p>Horario: Lun - Sab, 8:00 AM - 6:00 PM</p>
    </div>
  </footer>

  <button class="chatbot-button" type="button" @click="openChatbot">
    Chatbot
  </button>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, #dce9ff 0%, transparent 38%),
    radial-gradient(circle at 10% 20%, #ffe6e0 0%, transparent 35%),
    linear-gradient(180deg, #f7f9ff 0%, #f3f6ff 45%, #eef1ff 100%);
}

.catalog-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem 3.5rem;
}

.hero {
  text-align: center;
  margin-bottom: 2.25rem;
  padding: 2rem 1.25rem;
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

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.3rem;
}

.car-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e7ebff;
  box-shadow: 0 12px 30px rgba(24, 38, 76, 0.12);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.car-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 16px 38px rgba(24, 38, 76, 0.2);
}

.image-wrapper {
  overflow: hidden;
}

.car-image {
  width: 100%;
  height: 170px;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.car-card:hover .car-image {
  transform: scale(1.06);
}

.car-content {
  padding: 1rem 1rem 1.1rem;
}

.car-content h2 {
  font-size: 1.1rem;
  color: #1f2a4a;
}

.car-content p {
  color: #566086;
  margin-top: 0.35rem;
}

.car-tag {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0e7a4b;
  background-color: #d9f7e8;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
}

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

.chatbot-button {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  background: linear-gradient(135deg, #ff5f6d, #ff8b54);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.78rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 26px rgba(241, 93, 84, 0.5);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chatbot-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(241, 93, 84, 0.55);
}

@media (max-width: 768px) {
  .catalog-page {
    padding: 1.6rem 1rem 2.5rem;
  }

  .hero {
    padding: 1.5rem 1rem;
  }

  .footer {
    padding: 2rem 1rem;
  }
}
</style>
