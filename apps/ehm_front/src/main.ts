import './styles.css';
import { createApp } from 'vue';
import App from './app/AppRouter.vue';
import router from './router';
import { installI18n } from './i18n';

const app = createApp(App);
app.use(router);
installI18n(app);
app.mount('#root');
