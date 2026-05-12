import './styles.css';
import { createApp } from 'vue';
import App from './app/AppRouter.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#root');
