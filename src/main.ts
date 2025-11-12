import { createPinia } from 'pinia';
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount('#app');

// Service Worker登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Service Worker registration failed silently
    });
  });
}
