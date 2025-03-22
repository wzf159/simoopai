import { createApp } from 'vue'
import './style.css'
import './assets/css/reset.css'
import App from './App.vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { createPinia } from 'pinia';
import mitt from 'mitt';

const emitter = mitt();
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(ElementPlus)
app.config.globalProperties.$emitter = emitter;

app.mount('#app');
