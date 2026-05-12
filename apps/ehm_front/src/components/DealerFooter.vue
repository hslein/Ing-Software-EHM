<script setup lang="ts">
import { DEALER_CONTACT } from '../constants/dealer.constants';
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3>Concesionario EHM</h3>
        <p>Your trusted vehicle dealership since 2024</p>
      </div>
      <div class="footer-section">
        <h4>Contact Information</h4>
        <p>Address: {{ DEALER_CONTACT.address }}</p>
        <p>Phone: {{ DEALER_CONTACT.phone }}</p>
        <p>WhatsApp: {{ DEALER_CONTACT.whatsapp }}</p>
        <p>Email: {{ DEALER_CONTACT.email }}</p>
      </div>
      <div class="footer-section">
        <h4>Business Hours</h4>
        <p>{{ DEALER_CONTACT.schedule }}</p>
        <p>{{ DEALER_CONTACT.saturdaySchedule }}</p>
        <p>Sunday: Closed</p>
      </div>
      <div class="footer-section">
        <h4>Quick Links</h4>
        <ul class="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/inventory">Inventory</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 Concesionario EHM. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 40px 20px 20px;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.footer-section h3,
.footer-section h4 {
  margin: 0 0 15px 0;
  color: #ecf0f1;
  font-size: 16px;
}

.footer-section p {
  margin: 8px 0;
  font-size: 14px;
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin: 8px 0;
}

.footer-links a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #3498db;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  text-align: center;
  color: #95a5a6;
  font-size: 12px;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
