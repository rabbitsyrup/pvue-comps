import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import CKEditor from '@ckeditor/ckeditor5-vue';
import SvgIcon from '@jamescoyle/vue-icon';

import './assets/main.css'
import './assets/PGrid.css'

const app = createApp(App)

app.use(router)
  .use( CKEditor )
  .component('SvgIcon', SvgIcon)

app.mount('#app')
