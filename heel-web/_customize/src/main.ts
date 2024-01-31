import { createApp } from 'vue';
import './style.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './App.vue';
import router from './router';
import utils from './utils';
import server from './server';

const app = createApp(App);
app.use(router);
app.use(utils);
app.use(server);
app.mount('#app')
