import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ConfigProvider } from 'vant';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './views/App.vue'
import router from './router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
app.use(ConfigProvider);
app.use(ElementPlus, { size: 'small', zIndex: 3000 })

