<script setup lang="ts">
import { DEALER_CONTACT } from '../constants/dealer.constants';
import {
  Calculator,
  ChevronRight,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-vue-next';
import { useI18n } from '../i18n';

const { t } = useI18n();
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h2 class="logo-text">EHM <span>{{ t('footer.premium') }}</span></h2>
          <p class="brand-description">
            {{ t('footer.brandDescription') }}
          </p>
          <div class="social-links">
            <a href="#" class="social-icon"><Facebook :size="18" /></a>
            <a href="#" class="social-icon"><Instagram :size="18" /></a>
            <a href="#" class="social-icon"><Twitter :size="18" /></a>
          </div>
        </div>

        <div class="footer-nav">
          <h4>{{ t('footer.navigation') }}</h4>
          <ul>
            <li>
              <a href="/"><ChevronRight :size="14" class="arrow" /> {{ t('nav.home') }}</a>
            </li>
            <li>
              <a href="/inventory"><ChevronRight :size="14" class="arrow" /> {{ t('nav.inventory') }}</a>
            </li>
            <li>
              <a href="/about"><ChevronRight :size="14" class="arrow" /> {{ t('footer.about') }}</a>
            </li>
            <li>
              <a href="/credit" class="highlight-link">
                <Calculator :size="14" class="icon-link" /> {{ t('footer.creditSimulator') }}
              </a>
            </li>
          </ul>
        </div>

        <div class="footer-nav">
          <h4>{{ t('footer.partnerBrands') }}</h4>
          <ul>
            <li>Toyota</li>
            <li>Mazda</li>
            <li>Ford</li>
            <li>Volkswagen</li>
          </ul>
        </div>

        <div class="footer-contact">
          <h4>{{ t('footer.officialContact') }}</h4>
          <div class="contact-item">
            <MapPin :size="18" class="contact-icon" />
            <p>{{ DEALER_CONTACT.address }}</p>
          </div>
          <div class="contact-item">
            <Phone :size="18" class="contact-icon" />
            <p>{{ DEALER_CONTACT.phone }}</p>
          </div>
          <div class="contact-item">
            <Mail :size="18" class="contact-icon" />
            <p>{{ DEALER_CONTACT.email }}</p>
          </div>
          <div class="contact-item">
            <Clock :size="18" class="contact-icon" />
            <p>{{ DEALER_CONTACT.schedule }}</p>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} {{ t('footer.bottom') }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #0a0d14;
  color: #ffffff;
  padding: 5rem 2rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.4fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

.logo-text {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 4px;
  margin-bottom: 1.5rem;
}

.logo-text span {
  color: #ff8e71;
  font-weight: 300;
}

.brand-description {
  color: #8892b0;
  font-size: 0.95rem;
  line-height: 1.7;
  max-width: 300px;
}

h4 {
  color: #ffffff;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 2rem;
  position: relative;
}

h4::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 20px;
  height: 1px;
  background: #ff8e71;
}

ul {
  list-style: none;
  padding: 0;
}

ul li {
  margin-bottom: 1rem;
}

ul li a {
  color: #8892b0;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.highlight-link {
  color: #ff8e71 !important;
  font-weight: 600;
}

.icon-link {
  margin-right: 4px;
}

ul li a:hover {
  color: #ffffff;
  transform: translateX(5px);
}

.arrow {
  color: #ff8e71;
}

.contact-item {
  display: flex;
  gap: 15px;
  margin-bottom: 1.2rem;
  align-items: flex-start;
}

.contact-icon {
  color: #ff8e71;
  flex-shrink: 0;
}

.contact-item p {
  margin: 0;
  font-size: 0.9rem;
  color: #8892b0;
  line-height: 1.4;
}

.social-links {
  display: flex;
  gap: 12px;
  margin-top: 2rem;
}

.social-icon {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.3s ease;
}

.social-icon:hover {
  border-color: #ff8e71;
  background: #ff8e71;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 2rem;
  text-align: center;
}

.footer-bottom p {
  color: #495670;
  font-size: 0.75rem;
  letter-spacing: 2px;
}

@media (max-width: 992px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}
</style>
