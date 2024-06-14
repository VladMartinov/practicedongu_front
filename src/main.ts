import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Api from "@/api";
import guid from "@/utils/GUID";
import Dictionary from '@/utils/Dictionary';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

app.use(guid);
app.use(Api);
app.use(Dictionary);

app.use(store);
app.use(router);

app.use(Antd);

app.mount('#app');